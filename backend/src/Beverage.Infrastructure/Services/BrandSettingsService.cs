using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Beverage.Application.DTOs;
using Beverage.Application.Interfaces;
using Beverage.Domain.Entities.System;
using Beverage.Infrastructure.Data;

namespace Beverage.Infrastructure.Services;

public class BrandSettingsService : IBrandSettingsService
{
    private readonly BeverageDbContext _context;

    public BrandSettingsService(BeverageDbContext context)
    {
        _context = context;
    }

    public async Task<CompanyProfileDto> GetCompanyProfileAsync()
    {
        var settings = await _context.SystemSettings
            .Where(s => s.SettingGroup == "Branding" || s.SettingGroup == "Company")
            .ToDictionaryAsync(s => s.SettingKey, s => s.SettingValue);

        string Get(string key, string fallback) => settings.TryGetValue(key, out var val) && !string.IsNullOrWhiteSpace(val) ? val : fallback;
        bool GetBool(string key, bool fallback) => settings.TryGetValue(key, out var val) && bool.TryParse(val, out var b) ? b : fallback;

        return new CompanyProfileDto(
            CompanyNameAr: Get("CompanyNameAr", "مؤسسة توزيع المياه والعصائر المركزية"),
            CompanyNameEn: Get("CompanyNameEn", "Central Beverage & Water Distribution Co."),
            Slogan: Get("Slogan", "تبريد فائق، توزيع موثوق، وتوريد ميداني دقيق"),
            CommercialRegistration: Get("CommercialRegistration", "1010-998877"),
            TaxNumber: Get("TaxNumber", "300123456700003"),
            Phone: Get("Phone", "01-234567"),
            Mobile: Get("Mobile", "777000111"),
            WhatsApp: Get("WhatsApp", "967777000111"),
            Email: Get("Email", "info@centralbeverage.local"),
            Website: Get("Website", "www.centralbeverage.local"),
            Address: Get("Address", "صنعاء - شارع الستين الجنوبي - جوار جولة المصباحي"),
            City: Get("City", "صنعاء"),
            LogoBase64: settings.TryGetValue("LogoBase64", out var logo) ? logo : null,
            BankAccounts: Get("BankAccounts", "بنك الكريمي: 123456789 | بنك التضامن: 987654321"),
            InvoiceTerms: Get("InvoiceTerms", "البضاعة المباعة لا ترد بعد 3 أيام إلا بحالتها السليمة. الأسعار تشمل ضريبة المبيعات."),
            ActiveTemplate: Get("ActiveTemplate", "modern"),
            PrimaryColor: Get("PrimaryColor", "#2563eb"),
            AccentColor: Get("AccentColor", "#0284c7"),
            ShowLogo: GetBool("ShowLogo", true),
            ShowTaxNumber: GetBool("ShowTaxNumber", true),
            ShowBankDetails: GetBool("ShowBankDetails", true),
            DefaultPrintSize: Get("DefaultPrintSize", "80mm")
        );
    }

    public async Task<CompanyProfileDto> UpdateCompanyProfileAsync(UpdateCompanyProfileRequest req, Guid userId)
    {
        var existingSettings = await _context.SystemSettings
            .Where(s => s.SettingGroup == "Branding" || s.SettingGroup == "Company")
            .ToListAsync();

        void Upsert(string key, string? value)
        {
            if (value == null) return;
            var setting = existingSettings.FirstOrDefault(s => s.SettingKey == key);
            if (setting == null)
            {
                setting = new SystemSetting
                {
                    Id = Guid.NewGuid(),
                    SettingKey = key,
                    SettingValue = value,
                    SettingGroup = "Branding",
                    UpdatedBy = userId
                };
                _context.SystemSettings.Add(setting);
                existingSettings.Add(setting);
            }
            else
            {
                setting.SettingValue = value;
                setting.UpdatedBy = userId;
            }
        }

        Upsert("CompanyNameAr", req.CompanyNameAr);
        Upsert("CompanyNameEn", req.CompanyNameEn);
        Upsert("Slogan", req.Slogan);
        Upsert("CommercialRegistration", req.CommercialRegistration);
        Upsert("TaxNumber", req.TaxNumber);
        Upsert("Phone", req.Phone);
        Upsert("Mobile", req.Mobile);
        Upsert("WhatsApp", req.WhatsApp);
        Upsert("Email", req.Email);
        Upsert("Website", req.Website);
        Upsert("Address", req.Address);
        Upsert("City", req.City);
        Upsert("LogoBase64", req.LogoBase64);
        Upsert("BankAccounts", req.BankAccounts);
        Upsert("InvoiceTerms", req.InvoiceTerms);
        Upsert("ActiveTemplate", req.ActiveTemplate);
        Upsert("PrimaryColor", req.PrimaryColor);
        Upsert("AccentColor", req.AccentColor);
        if (req.ShowLogo.HasValue) Upsert("ShowLogo", req.ShowLogo.Value.ToString().ToLower());
        if (req.ShowTaxNumber.HasValue) Upsert("ShowTaxNumber", req.ShowTaxNumber.Value.ToString().ToLower());
        if (req.ShowBankDetails.HasValue) Upsert("ShowBankDetails", req.ShowBankDetails.Value.ToString().ToLower());
        Upsert("DefaultPrintSize", req.DefaultPrintSize);

        await _context.SaveChangesAsync();
        return await GetCompanyProfileAsync();
    }
}
