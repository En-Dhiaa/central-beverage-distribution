import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Truck,
  Store,
  Receipt,
  Wallet,
  FileBarChart,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Snowflake,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { activeNav, setActiveNav, isSidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const isRtl = i18n.language === 'ar';

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'products', label: t('products'), icon: Package },
    { id: 'warehouses', label: t('warehouses'), icon: Warehouse, badge: 'تبريد' },
    { id: 'purchasing', label: t('purchases'), icon: ShoppingCart },
    { id: 'distributors', label: t('distributors'), icon: Truck },
    { id: 'customers', label: t('customers'), icon: Store },
    { id: 'sales', label: t('sales'), icon: Receipt },
    { id: 'finance', label: t('finance'), icon: Wallet },
    { id: 'reports', label: t('reports'), icon: FileBarChart },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 z-30 select-none ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Snowflake className="h-5 w-5 animate-pulse" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-foreground truncate">
                {t('appName')}
              </span>
              <span className="text-[10px] text-muted-foreground truncate font-medium">
                الثلاجة المركزية والتوزيع
              </span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted transition-colors"
          title={isSidebarOpen ? 'طي القائمة' : 'توسيع القائمة'}
        >
          {isSidebarOpen ? (
            isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          ) : (
            isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${!isSidebarOpen && 'justify-center px-0'}`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {isSidebarOpen && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
              {user?.username?.[0] || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-foreground truncate">
                  {user?.fullName || user?.username}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user?.role}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title={t('logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

