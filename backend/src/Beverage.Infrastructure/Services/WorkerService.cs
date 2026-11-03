using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.Finance;
using Beverage.Domain.Entities.Warehouses;
using Beverage.Domain.Enums;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class WorkerService : IWorkerService
{
    private readonly BeverageDbContext _context;

    public WorkerService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkerDto>> GetWorkersAsync()
    {
        return await _context.WarehouseWorkers
            .OrderBy(w => w.FullName)
            .Select(w => new WorkerDto(
                w.Id,
                w.WorkerCode,
                w.FullName,
                w.NationalId,
                w.Phone,
                w.JobTitle,
                w.BaseSalary,
                w.SalaryType,
                w.ShiftHours,
                w.HireDate,
                w.IsActive,
                w.Notes
            ))
            .ToListAsync();
    }

    public async Task<WorkerDto> CreateWorkerAsync(CreateWorkerRequest request, Guid userId)
    {
        var code = request.WorkerCode.Trim().ToUpperInvariant();
        if (await _context.WarehouseWorkers.AnyAsync(w => w.WorkerCode == code))
            throw new InvalidOperationException("كود العامل مسجل بالفعل.");

        var worker = new WarehouseWorker
        {
            WorkerCode = code,
            FullName = request.FullName.Trim(),
            NationalId = request.NationalId?.Trim(),
            Phone = request.Phone.Trim(),
            JobTitle = request.JobTitle.Trim(),
            BaseSalary = request.BaseSalary,
            SalaryType = request.SalaryType,
            ShiftHours = request.ShiftHours,
            Notes = request.Notes,
            IsActive = true,
            CreatedBy = userId
        };

        await _context.WarehouseWorkers.AddAsync(worker);
        await _context.SaveChangesAsync();

        return new WorkerDto(
            worker.Id,
            worker.WorkerCode,
            worker.FullName,
            worker.NationalId,
            worker.Phone,
            worker.JobTitle,
            worker.BaseSalary,
            worker.SalaryType,
            worker.ShiftHours,
            worker.HireDate,
            worker.IsActive,
            worker.Notes
        );
    }

    public async Task<Guid> PayWorkerSalaryAsync(PayWorkerSalaryRequest request, Guid userId)
    {
        var worker = await _context.WarehouseWorkers.FindAsync(request.WorkerId)
            ?? throw new InvalidOperationException("العامل غير موجود.");

        var cashbox = await _context.Cashboxes.FindAsync(request.CashboxId)
            ?? throw new InvalidOperationException("الصندوق غير موجود.");

        var netPaid = request.BaseSalary + request.BonusAmount - request.DeductionsAmount;
        if (netPaid <= 0)
            throw new InvalidOperationException("صافي الراتب المستحق يجب أن يكون أكبر من الصفر.");

        if (cashbox.CurrentBalance < netPaid)
            throw new InvalidOperationException($"رصيد الصندوق الحالي ({cashbox.CurrentBalance:N0} ريال) لا يكفي لصرف صافي الراتب ({netPaid:N0} ريال).");

        // 1. Create Double-Entry Journal Entry
        var salaryExpenseAcc = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "50201")
            ?? await _context.Accounts.FirstOrDefaultAsync(a => a.AccountType == AccountType.Expense)
            ?? throw new InvalidOperationException("حساب مصروف الرواتب والأجور غير موجود في دليل الحسابات.");

        var cashAcc = await _context.Accounts.FindAsync(cashbox.AccountId)
            ?? await _context.Accounts.FirstOrDefaultAsync(a => a.AccountCode == "10101")
            ?? throw new InvalidOperationException("حساب الصندوق غير موجود في دليل الحسابات.");

        var count = await _context.WorkerSalaryVouchers.CountAsync();
        var voucherNumber = $"SAL-{request.Year}-{request.Month:D2}-{count + 1:D3}";

        var journal = new JournalEntry
        {
            EntryNumber = $"JE-SAL-{DateTime.UtcNow:yyyyMMddHHmmss}",
            EntryDate = DateTime.UtcNow,
            Description = $"صرف راتب العامل: {worker.FullName} لشهر {request.Month}/{request.Year}",
            SourceType = "WorkerSalary",
            Status = DocumentStatus.Approved,
            ApprovedBy = userId,
            ApprovedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        // Debit: Salaries Expense
        journal.Lines.Add(new JournalEntryLine
        {
            AccountId = salaryExpenseAcc.Id,
            Debit = netPaid,
            Credit = 0,
            Description = $"راتب شهر {request.Month}/{request.Year} - {worker.FullName}"
        });

        // Credit: Cashbox
        journal.Lines.Add(new JournalEntryLine
        {
            AccountId = cashAcc.Id,
            Debit = 0,
            Credit = netPaid,
            Description = $"صرف من الصندوق: {cashbox.Name}"
        });

        await _context.JournalEntries.AddAsync(journal);

        // 2. Reduce Cashbox & Add Cash Transaction
        cashbox.CurrentBalance -= netPaid;
        _context.CashTransactions.Add(new CashTransaction
        {
            TransactionNumber = $"TX-SAL-{DateTime.UtcNow:yyyyMMddHHmmss}",
            CashboxId = cashbox.Id,
            TransactionType = VoucherType.Payment,
            Amount = netPaid,
            TransactionDate = DateTime.UtcNow,
            ReferenceType = "WorkerSalary",
            Description = $"صرف راتب العامل: {worker.FullName} - {request.Month}/{request.Year}",
            CreatedBy = userId
        });

        // 3. Create Voucher Record
        var voucher = new WorkerSalaryVoucher
        {
            VoucherNumber = voucherNumber,
            WorkerId = worker.Id,
            Year = request.Year,
            Month = request.Month,
            BaseSalary = request.BaseSalary,
            BonusAmount = request.BonusAmount,
            DeductionsAmount = request.DeductionsAmount,
            NetPaid = netPaid,
            PaymentDate = DateTime.UtcNow,
            CashboxId = cashbox.Id,
            Notes = request.Notes,
            JournalEntryId = journal.Id,
            CreatedBy = userId
        };

        await _context.WorkerSalaryVouchers.AddAsync(voucher);
        await _context.SaveChangesAsync();

        return voucher.Id;
    }

    public async Task<List<WorkerSalaryVoucherDto>> GetSalaryVouchersAsync()
    {
        return await _context.WorkerSalaryVouchers
            .Include(v => v.Worker)
            .Include(v => v.Cashbox)
            .OrderByDescending(v => v.PaymentDate)
            .Select(v => new WorkerSalaryVoucherDto(
                v.Id,
                v.VoucherNumber,
                v.WorkerId,
                v.Worker != null ? v.Worker.FullName : "",
                v.Year,
                v.Month,
                v.BaseSalary,
                v.BonusAmount,
                v.DeductionsAmount,
                v.NetPaid,
                v.PaymentDate,
                v.CashboxId,
                v.Cashbox != null ? v.Cashbox.Name : "",
                v.Notes
            ))
            .ToListAsync();
    }
}

