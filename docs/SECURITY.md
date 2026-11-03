# SECURITY POLICY & ACCESS CONTROL
## Central Water & Beverage Distribution Management System

---

## 1. Authentication & Password Security
- Passwords are encrypted using BCrypt work factor 11 (`BCrypt.Net-Next`).
- Passwords in plain text are strictly forbidden in databases, logs, or network payloads.
- JWT tokens with 24-hour expiration signed with HMAC-SHA256.

## 2. Authorization & Least Privilege
- Server-side validation: Client-side UI element hiding is never treated as a security boundary.
- All sensitive operations require specific permissions.
- Critical operations (e.g. stock adjustments, settlements) require approval timestamps.

## 3. Financial & Inventory Immutability
- Approved sales invoices, purchase invoices, and journal entries cannot be directly mutated.
- Reversals and corrections are executed via documented credit notes, return vouchers, or reversing journal entries.
- Unbalanced accounting entries ($\text{Debit} \neq \text{Credit}$) are rejected by domain constraints.

