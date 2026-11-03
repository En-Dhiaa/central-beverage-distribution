import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../components/notifications/ToastContainer';
import { OnboardingWizardModal } from '../components/modals/OnboardingWizardModal';
import { useUIStore } from '../stores/uiStore';
import { DashboardView } from '../features/dashboard/DashboardView';
import { QuickPOSView } from '../features/sales/QuickPOSView';
import { ProductsView } from '../features/products/ProductsView';
import { PurchasingView } from '../features/purchasing/PurchasingView';
import { WarehousesView } from '../features/warehouses/WarehousesView';
import { WorkersView } from '../features/warehouses/WorkersView';
import { DistributorsView } from '../features/distributors/DistributorsView';
import { CustomersView } from '../features/customers/CustomersView';
import { DebtManagementView } from '../features/finance/DebtManagementView';
import { QuotationsView } from '../features/sales/QuotationsView';
import { SalesView } from '../features/sales/SalesView';
import { SalesReturnsView } from '../features/sales/SalesReturnsView';
import { FinanceView } from '../features/finance/FinanceView';
import { ClosingsView } from '../features/finance/ClosingsView';
import { ReportsView } from '../features/reports/ReportsView';
import { ActivityLogView } from '../features/reports/ActivityLogView';
import { UsersView } from '../features/settings/UsersView';
import { DatabaseView } from '../features/settings/DatabaseView';
import { SettingsView } from '../features/settings/SettingsView';

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

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            {renderContent()}
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
