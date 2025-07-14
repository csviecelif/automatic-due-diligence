import React from 'react';
import AppSidebar from './AppSidebar';
import { NavItem, ViewId, SidebarStats, WebEditorTheme } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  currentViewId: ViewId;
  onNavigate: (viewId: ViewId) => void;
  stats: SidebarStats;
  userName: string;
  userRole: string;
  userAvatarUrl?: string;
  activeTheme: WebEditorTheme;
  setActiveTheme: (theme: WebEditorTheme) => void;
  themes: WebEditorTheme[];
  onAddPerson: () => void;
  onAddRelationship: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  navItems, 
  currentViewId, 
  onNavigate,
  stats,
  userName,
  userRole,
  userAvatarUrl,
  activeTheme,
  setActiveTheme,
  themes,
  onAddPerson,
  onAddRelationship
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
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
        themes={themes}
        onAddPerson={onAddPerson}
        onAddRelationship={onAddRelationship}
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
