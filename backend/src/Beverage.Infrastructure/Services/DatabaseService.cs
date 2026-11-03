using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Beverage.Infrastructure.Services;

public class DatabaseService : IDatabaseService
{
    private readonly BeverageDbContext _context;

    public DatabaseService(BeverageDbContext context)
    {
        _context = context;
    }

    private string GetDbPath()
    {
        var connStr = _context.Database.GetConnectionString() ?? "Data Source=Data/beverage_system.db";
        var raw = connStr.Replace("Data Source=", "").Trim();
        if (!Path.IsPathRooted(raw))
        {
            raw = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, raw);
        }
        return raw;
    }

    public async Task<DatabaseStatusDto> GetStatusAsync()
    {
        var dbPath = GetDbPath();
        var dataDir = Path.GetDirectoryName(dbPath) ?? AppDomain.CurrentDomain.BaseDirectory;
        var backupsDir = Path.Combine(dataDir, "backups");
        Directory.CreateDirectory(backupsDir);

        double sizeBytes = 0;
        if (File.Exists(dbPath))
        {
            sizeBytes = new FileInfo(dbPath).Length;
        }

        // List backups
        var backupFiles = Directory.GetFiles(backupsDir, "*.db")
            .Select(f => new FileInfo(f))
            .OrderByDescending(f => f.CreationTimeUtc)
            .Select(f => new BackupFileInfoDto(
                f.Name,
                f.FullName,
                Math.Round((double)f.Length / (1024 * 1024), 2),
                f.CreationTimeUtc
            ))
            .ToList();

        var lastBackup = backupFiles.FirstOrDefault()?.CreatedAt ?? DateTime.MinValue;

        // Count approximate records
        long totalRecords = 0;
        try
        {
            totalRecords += await _context.Products.CountAsync();
            totalRecords += await _context.Customers.CountAsync();
            totalRecords += await _context.Distributors.CountAsync();
            totalRecords += await _context.SalesInvoices.CountAsync();
            totalRecords += await _context.PurchaseInvoices.CountAsync();
            totalRecords += await _context.JournalEntries.CountAsync();
            totalRecords += await _context.InventoryTransactions.CountAsync();
        }
        catch { }

        return new DatabaseStatusDto(
            "SQLite (Embedded Native)",
            dbPath,
            sizeBytes,
            Math.Round(sizeBytes / (1024 * 1024), 2),
            32, // number of enterprise tables
            totalRecords,
            lastBackup,
            backupFiles
        );
    }

    public async Task<string> CreateBackupAsync()
    {
        var dbPath = GetDbPath();
        if (!File.Exists(dbPath))
            throw new FileNotFoundException("ملف قاعدة البيانات غير موجود.");

        var dataDir = Path.GetDirectoryName(dbPath) ?? AppDomain.CurrentDomain.BaseDirectory;
        var backupsDir = Path.Combine(dataDir, "backups");
        Directory.CreateDirectory(backupsDir);

        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var backupFileName = $"beverage_backup_{timestamp}.db";
        var destPath = Path.Combine(backupsDir, backupFileName);

        // Checkpoint WAL first to flush all commits into main db file
        try
        {
            await _context.Database.ExecuteSqlRawAsync("PRAGMA wal_checkpoint(FULL);");
        }
        catch { }

        File.Copy(dbPath, destPath, overwrite: true);

        return backupFileName;
    }

    public async Task<bool> RestoreBackupAsync(string backupFileName)
    {
        var dbPath = GetDbPath();
        var dataDir = Path.GetDirectoryName(dbPath) ?? AppDomain.CurrentDomain.BaseDirectory;
        var backupsDir = Path.Combine(dataDir, "backups");
        var sourceBackup = Path.Combine(backupsDir, backupFileName);

        if (!File.Exists(sourceBackup))
            throw new FileNotFoundException("ملف النسخة الاحتياطية المحدد غير موجود.");

        // First backup current state before restoring
        await CreateBackupAsync();

        File.Copy(sourceBackup, dbPath, overwrite: true);
        return true;
    }

    public async Task<bool> VacuumDatabaseAsync()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync("VACUUM;");
            await _context.Database.ExecuteSqlRawAsync("PRAGMA optimize;");
            return true;
        }
        catch
        {
            return false;
        }
    }
}

