import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '../stores/uiStore';
import { DashboardView } from '../features/dashboard/DashboardView';
import { ProductsView } from '../features/products/ProductsView';
import { PurchasingView } from '../features/purchasing/PurchasingView';
import { WarehousesView } from '../features/warehouses/WarehousesView';
import { DistributorsView } from '../features/distributors/DistributorsView';
import { CustomersView } from '../features/customers/CustomersView';
import { SalesView } from '../features/sales/SalesView';
import { FinanceView } from '../features/finance/FinanceView';
import { ReportsView } from '../features/reports/ReportsView';
import { SettingsView } from '../features/settings/SettingsView';

export const MainLayout: React.FC = () => {
  const { activeNav } = useUIStore();

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'purchasing':
        return <PurchasingView />;
      case 'warehouses':
        return <WarehousesView />;
      case 'distributors':
        return <DistributorsView />;
      case 'customers':
        return <CustomersView />;
      case 'sales':
        return <SalesView />;
      case 'finance':
        return <FinanceView />;
      case 'reports':
        return <ReportsView />;
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
    </div>
  );
};

