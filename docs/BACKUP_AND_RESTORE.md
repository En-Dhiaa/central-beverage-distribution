# BACKUP AND DISASTER RECOVERY POLICY
## Central Water & Beverage Distribution Management System

---

## 1. Automated Backup Strategy

The system enforces automated backups to safeguard critical operational, financial, and inventory data:
1. **Daily Backup:** Triggered at end-of-day closing.
2. **Manual On-Demand Backup:** Available from the Settings view.
3. **Storage Location:** `backups/` directory (isolated from public static web roots).
4. **Encryption:** Backups are packaged with cryptographic verification hashes.

---

## 2. Restoration Procedure

1. Shut down any active writers to the database.
2. Verify backup checksum.
3. Replace active database (`beverage_system.db` or PostgreSQL restore) with verified snapshot.
4. Restart Backend API service.
5. Log the restore action in `audit_logs` with the responsible administrator's user ID.

