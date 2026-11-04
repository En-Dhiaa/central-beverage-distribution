import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../components/notifications/ToastContainer';
import { OnboardingWizardModal } from '../components/modals/OnboardingWizardModal';
import { useUIStore } from '../stores/uiStore';

// Lazy-loaded Views for High-Performance Code-Splitting
const DashboardView = React.lazy(() => import('../features/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const QuickPOSView = React.lazy(() => import('../features/sales/QuickPOSView').then(m => ({ default: m.QuickPOSView })));
const ProductsView = React.lazy(() => import('../features/products/ProductsView').then(m => ({ default: m.ProductsView })));
const WarehousesView = React.lazy(() => import('../features/warehouses/WarehousesView').then(m => ({ default: m.WarehousesView })));
const WorkersView = React.lazy(() => import('../features/warehouses/WorkersView').then(m => ({ default: m.WorkersView })));
const PurchasingView = React.lazy(() => import('../features/purchasing/PurchasingView').then(m => ({ default: m.PurchasingView })));
const DistributorsView = React.lazy(() => import('../features/distributors/DistributorsView').then(m => ({ default: m.DistributorsView })));
const CustomersView = React.lazy(() => import('../features/customers/CustomersView').then(m => ({ default: m.CustomersView })));
const DebtManagementView = React.lazy(() => import('../features/finance/DebtManagementView').then(m => ({ default: m.DebtManagementView })));
const QuotationsView = React.lazy(() => import('../features/sales/QuotationsView').then(m => ({ default: m.QuotationsView })));
const SalesView = React.lazy(() => import('../features/sales/SalesView').then(m => ({ default: m.SalesView })));
const SalesReturnsView = React.lazy(() => import('../features/sales/SalesReturnsView').then(m => ({ default: m.SalesReturnsView })));
const FinanceView = React.lazy(() => import('../features/finance/FinanceView').then(m => ({ default: m.FinanceView })));
const ClosingsView = React.lazy(() => import('../features/finance/ClosingsView').then(m => ({ default: m.ClosingsView })));
const ReportsView = React.lazy(() => import('../features/reports/ReportsView').then(m => ({ default: m.ReportsView })));
const ActivityLogView = React.lazy(() => import('../features/reports/ActivityLogView').then(m => ({ default: m.ActivityLogView })));
const UsersView = React.lazy(() => import('../features/settings/UsersView').then(m => ({ default: m.UsersView })));
const DatabaseView = React.lazy(() => import('../features/settings/DatabaseView').then(m => ({ default: m.DatabaseView })));
const SettingsView = React.lazy(() => import('../features/settings/SettingsView').then(m => ({ default: m.SettingsView })));

const ViewLoadingFallback = () => (
  <div className="flex h-96 w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <span className="text-xs font-bold text-muted-foreground">جاري تحميل الشاشة...</span>
    </div>
  </div>
);

export const MainLayout: React.FC = () => {
  const { activeNav } = useUIStore();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('beverage_onboarding_completed');
    if (!completed) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <QuickPOSView />;
      case 'products':
        return <ProductsView />;
      case 'warehouses':
        return <WarehousesView />;
      case 'workers':
        return <WorkersView />;
      case 'purchasing':
        return <PurchasingView />;
      case 'distributors':
        return <DistributorsView />;
      case 'customers':
        return <CustomersView />;
      case 'debt':
        return <DebtManagementView />;
      case 'quotations':
        return <QuotationsView />;
      case 'sales':
        return <SalesView />;
      case 'returns':
        return <SalesReturnsView />;
      case 'finance':
        return <FinanceView />;
      case 'closings':
        return <ClosingsView />;
      case 'reports':
        return <ReportsView />;
      case 'activity':
        return <ActivityLogView />;
      case 'users':
        return <UsersView />;
      case 'database':
        return <DatabaseView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Dynamic Page Content with Suspense */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            <Suspense fallback={<ViewLoadingFallback />}>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Floating Notifications (Toasts) */}
      <ToastContainer />

      {/* First-Run Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingWizardModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}
    </div>
  );
};
