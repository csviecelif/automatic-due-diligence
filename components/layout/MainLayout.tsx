import React from 'react';
import AppSidebar from './AppSidebar';
import { NavItem, ViewId, SidebarStats } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  currentViewId: ViewId;
  onNavigate: (viewId: ViewId) => void;
  stats: SidebarStats;
  userName: string;
  userRole: string;
  userAvatarUrl?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  navItems, 
  currentViewId, 
  onNavigate,
  stats,
  userName,
  userRole,
  userAvatarUrl
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AppSidebar 
        navItems={navItems} 
        currentViewId={currentViewId} 
        onNavigate={onNavigate}
        stats={stats}
        userName={userName}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
