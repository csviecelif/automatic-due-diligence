import React from 'react';
import { NavItem, ViewId, SidebarStats, WebEditorTheme } from '../../types';
import { UserIcon as DefaultUserIcon, AddIcon, PeopleIcon, RelationshipIcon } from '../../constants';

interface AppSidebarProps {
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

const AppSidebar: React.FC<AppSidebarProps> = ({ 
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
  const isWebEditorActive = currentViewId === 'web-editor';

  return (
    <div className="flex flex-col w-64 bg-slate-800 text-slate-100">
      {/* Logo/App Name */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM10.7408 15.2038L15.9185 10.0261L14.7825 8.89013L10.7408 12.9318L9.21749 11.4085L8.08152 12.5445L10.7408 15.2038Z"/></svg>
            <h1 className="text-xl font-semibold">ForenseNet</h1>
        </div>
      </div>
      <p className="px-4 py-2 text-xs text-slate-400 text-center">Due Diligence Profissional</p>

      {/* Navigation */}
      <nav className="flex-grow px-2 py-4 space-y-1">
        <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Navegação</h3>
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              if (!item.disabled) onNavigate(item.viewId);
            }}
            className={`
              flex items-center px-3 py-2.5 rounded-md text-sm font-medium
              transition-colors duration-150 ease-in-out
              ${item.viewId === currentViewId 
                ? 'bg-sky-500 text-white' 
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-current={item.viewId === currentViewId ? 'page' : undefined}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {item.name}
          </a>
        ))}
        {isWebEditorActive && (
          <div className="pt-4 mt-4 border-t border-slate-700">
            <h3 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações do Caso</h3>
            <div className="space-y-1 mt-2">
              <button onClick={onAddPerson} className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-150 ease-in-out">
                <PeopleIcon className="mr-3 h-5 w-5" />
                Adicionar Pessoa
              </button>
              <button onClick={onAddRelationship} className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-150 ease-in-out">
                <RelationshipIcon className="mr-3 h-5 w-5" />
                Adicionar Relacionamento
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Theme Selector */}
      <div className="px-4 py-4 border-t border-slate-700">
        <label htmlFor="theme-selector" className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tema do Editor</label>
        <select
          id="theme-selector"
          value={activeTheme.name}
          onChange={(e) => {
            const theme = themes.find(t => t.name === e.target.value);
            if (theme) setActiveTheme(theme);
          }}
          className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 bg-slate-700 text-white border-slate-600 focus:ring-sky-500 focus:border-sky-500 text-sm"
        >
          {themes.map(theme => <option key={theme.name} value={theme.name}>{theme.name}</option>)}
        </select>
      </div>

      {/* Statistics */}
      <div className="px-4 py-4 border-t border-slate-700">
        <h3 className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estatísticas</h3>
        <ul className="space-y-1 text-sm">
          <li className="flex justify-between text-slate-300">
            <span>Casos Ativos:</span>
            <span className="font-medium">{stats.activeCases}</span>
          </li>
          <li className="flex justify-between text-slate-300">
            <span>Total Pessoas:</span>
            <span className="font-medium">{stats.totalPeople}</span>
          </li>
          <li className="flex justify-between text-slate-300">
            <span>Relacionamentos:</span>
            <span className="font-medium">{stats.totalRelationships}</span>
          </li>
        </ul>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          {userAvatarUrl ? (
            <img className="h-10 w-10 rounded-full object-cover" src={userAvatarUrl} alt={userName} />
          ) : (
            <span className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-slate-300">
              <DefaultUserIcon className="h-6 w-6" />
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-slate-400">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
