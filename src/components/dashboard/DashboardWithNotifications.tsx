import React from 'react';
import { UnitNotificationsPanel } from '@/components/notifications/UnitNotificationsPanel';
import { UnitNotification } from '@/hooks/useUnitNotifications';

interface DashboardWithNotificationsProps {
  unit: 'registry' | 'compliance' | 'revenue' | 'finance' | 'directorate';
  title: string;
  children: React.ReactNode;
}

export const DashboardWithNotifications: React.FC<DashboardWithNotificationsProps> = ({
  unit,
  title,
  children
}) => {
  const handleNotificationClick = (notification: UnitNotification) => {
    console.log('Notification clicked:', notification);
    // Handle notification click - could navigate to related item
    if (notification.metadata?.permit_id) {
      // Navigate to permit details
      console.log('Navigate to permit:', notification.metadata.permit_id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6">{title}</h1>
            {children}
          </div>
          
          {/* Notifications sidebar */}
          <div className="lg:w-96">
            <UnitNotificationsPanel 
              unit={unit} 
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage components for different departments
export const ComplianceDashboardWithNotifications: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardWithNotifications unit="compliance" title="Compliance Dashboard">
    {children}
  </DashboardWithNotifications>
);

export const RegistryDashboardWithNotifications: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardWithNotifications unit="registry" title="Registry Dashboard">
    {children}
  </DashboardWithNotifications>
);

export const RevenueDashboardWithNotifications: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardWithNotifications unit="revenue" title="Revenue Dashboard">
    {children}
  </DashboardWithNotifications>
);

export const FinanceDashboardWithNotifications: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardWithNotifications unit="finance" title="Finance Dashboard">
    {children}
  </DashboardWithNotifications>
);

export const DirectorateDashboardWithNotifications: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardWithNotifications unit="directorate" title="Directorate Dashboard">
    {children}
  </DashboardWithNotifications>
);