import React, { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Search,
  Plus,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';
import type { BRDListItem } from './SearchBRDPopup';

interface NavItemProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
  className?: string;
}

const NavItem = ({
  isActive,
  onClick,
  disabled,
  icon: Icon,
  label,
  className = '',
}: NavItemProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f172a]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${isActive
        ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
      }
      ${className}
    `}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="truncate">{label}</span>
  </button>
);

interface LibraryDropdownProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  isLoggedIn: boolean;
  brds: BRDListItem[];
}

const LibraryDropdown = ({
  activeTab,
  setActiveTab,
  isLoggedIn,
  brds,
}: LibraryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const isActive = activeTab === 'projects';

  return (
    <div className="space-y-0.5">
      <div
        className={`
          flex items-center gap-2 rounded-lg
          ${isActive ? 'bg-slate-700/80' : ''}
        `}
      >
        <button
          type="button"
          onClick={() => isLoggedIn && setActiveTab('projects')}
          disabled={!isLoggedIn}
          className={`
            flex-1 flex items-center gap-3 min-w-0 px-3 py-2.5 rounded-lg text-left text-sm font-medium
            transition-colors duration-150 ease-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]
            ${isActive ? 'text-white' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <LayoutGrid className="w-4 h-4 shrink-0 opacity-90" />
          <span className="truncate">Dashboard</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((o) => !o);
          }}
          className={`
            shrink-0 p-2 rounded-md transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]
            ${isActive ? 'text-white hover:bg-slate-600/80' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}
          `}
          aria-label={isOpen ? 'Collapse list' : 'Expand list'}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {isOpen && (
        <div className="ml-3 pl-3 py-1 border-l-2 border-slate-800 space-y-1">
          {brds.map((brd) => {
            const active = activeTab === brd.id;
            return (
              <button
                key={brd.id}
                type="button"
                onClick={() => isLoggedIn && setActiveTab(brd.id)}
                disabled={!isLoggedIn}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px]
                  transition-all duration-200 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${active
                    ? 'bg-indigo-600/10 text-indigo-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }
                `}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`} />
                <span className="truncate flex-1">{brd.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

import type { User } from 'firebase/auth';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  onNewProject: () => void;
  isLoggedIn: boolean;
  user: User | null;
  onLoginClick: () => void;
  onOpenSearch: () => void;
  onLogout: () => void;
  brds: BRDListItem[];
}

export function Sidebar({
  activeTab,
  setActiveTab,
  onNewProject,
  isLoggedIn,
  user,
  onLoginClick,
  onOpenSearch,
  onLogout,
  brds,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <aside className="w-64 flex flex-col h-screen bg-[#0f172a] border-r border-slate-800/90 shrink-0 select-none">
      {/* Logo */}
      <div className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-slate-800/90">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="font-semibold text-lg text-white tracking-tight">
          Samvad<span className="text-indigo-400">.ai</span>
        </span>
      </div>

      {!isLoggedIn && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/80">
          <p className="text-xs text-slate-400 mb-2">
            You're in <span className="text-slate-200 font-medium">Guest Mode</span>. Work isn't saved.
          </p>
          <button
            type="button"
            onClick={onLoginClick}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Log in to save
          </button>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <div className="pt-0">
          <LibraryDropdown
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLoggedIn={isLoggedIn}
            brds={brds}
          />
        </div>
        <NavItem
          isActive={false}
          onClick={() => isLoggedIn && onOpenSearch()}
          disabled={!isLoggedIn}
          icon={Search}
          label="Search BRDs"
        />
        <NavItem
          isActive={activeTab === 'new_project'}
          onClick={onNewProject}
          icon={Plus}
          label="New Project"
        />
      </nav>

      {/* Bottom: Settings + Profile */}
      <div className="shrink-0 border-t border-slate-800/90">
        <div className="p-2">
          <NavItem
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={SettingsIcon}
            label="Settings"
          />
        </div>
        <div className="p-3 pt-0">
          {isLoggedIn && user ? (
            <div className="relative">
              {/* Profile card — click to reveal logout */}
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/60 transition-all duration-150 text-left group"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email || 'User'}
                    className="w-9 h-9 rounded-full shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500/40 transition-all"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500/40 transition-all">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white truncate">
                    {user.displayName || user.email || 'User'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {user.email || 'Signed in'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-20">
                  <div className="p-2 border-b border-slate-700/60">
                    <p className="text-xs text-slate-500 px-2 py-1 truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 text-sm font-medium shrink-0">
                ?
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-400 truncate">Guest</div>
                <div className="text-xs text-slate-500 truncate">Limited access</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

