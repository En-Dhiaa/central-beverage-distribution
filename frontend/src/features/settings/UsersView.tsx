import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { UserAccount, Role } from '../../types';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  User,
  KeyRound
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');

  const loadData = async () => {
    try {
      const [u, r] = await Promise.all([api.getUsers(), api.getRoles()]);
      setUsers(u);
      setRoles(r);
      if (r.length > 0) setRoleId(r[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: UserAccount) => {
    setStatusMsg(null);
    try {
      const res = await api.toggleUserStatus(user.id);
      setStatusMsg({ type: 'success', text: res.message });
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل تحديث حالة المستخدم' });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      await api.createUser({
        username,
        password,
        fullName,
        email: email || null,
        phone: phone || null,
        roleId,
      });
      setStatusMsg({ type: 'success', text: `تم إنشاء حساب المستخدم [${username}] بنجاح وتعيين الصلاحيات.` });
      setIsAddUserOpen(false);
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      setPhone('');
      loadData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'فشل إنشاء المستخدم' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            مستخدمي النظام وإدارة الصلاحيات
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة حسابات المشرفين، المحاسبين، أمناء الثلاجة، كاشيرات البيع، والتحكم بحالات التفعيل
          </p>
        </div>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مستخدم جديد للنظام</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`rounded-2xl border p-4 text-xs font-bold flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
              : 'border-destructive/20 bg-destructive/10 text-destructive'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
            <tr>
              <th className="p-3.5">اسم المستخدم</th>
              <th className="p-3.5">الاسم الكامل</th>
              <th className="p-3.5">الدور الوظيفي والصلاحية</th>
              <th className="p-3.5">الهاتف</th>
              <th className="p-3.5">البريد الإلكتروني</th>
              <th className="p-3.5">تاريخ الإنشاء</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3.5 font-mono font-black text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span>{u.username}</span>
                  </div>
                </td>
                <td className="p-3.5 font-bold text-foreground">{u.fullName}</td>
                <td className="p-3.5">
                  <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-[11px] font-black text-blue-600">
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5 font-mono">{u.phone || '-'}</td>
                <td className="p-3.5 font-mono text-muted-foreground">{u.email || '-'}</td>
                <td className="p-3.5 font-mono text-muted-foreground text-[11px]">
                  {new Date(u.createdAt).toLocaleDateString('ar-YE')}
                </td>
                <td className="p-3.5">
                  {u.isActive ? (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      مفعل ونشط
                    </span>
                  ) : (
                    <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                      معطل
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  {u.username.toLowerCase() !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition-all ${
                        u.isActive
                          ? 'border-rose-500/30 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              إضافة مستخدم جديد لمنظومة العمل
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">اسم المستخدم (Login)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cashier1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الاسم الكامل للموظف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد عبد الله الصالح"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">الدور والصلاحية</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="777000444"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="user@local.domain"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-bold text-muted-foreground hover:bg-muted"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-bold hover:bg-primary/90 shadow-sm"
                >
                  إنشاء الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

