import React from 'react';
import { LayoutDashboard, Search, History, LogOut, Menu, X, FileText, User, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCompanySettings } from '../hooks/useCompanySettings';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onLogout }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings } = useCompanySettings();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' ||
                  user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  const handleLogout = () => { logout(); onLogout(); };

  const navItems = isAuthenticated
    ? [
        { id: 'dashboard', label: isAdmin ? 'Admin' : 'Dashboard', icon: isAdmin ? <ShieldCheck size={18} /> : <LayoutDashboard size={18} /> },
        ...(!isAdmin ? [{ id: 'analysis', label: 'Analyseur', icon: <Search size={18} /> }] : []),
        ...(!isAdmin ? [{ id: 'history', label: 'Historique', icon: <History size={18} /> }] : []),
        { id: 'docs', label: 'Documentation', icon: <FileText size={18} /> },
      ]
    : [
        { id: 'landing', label: 'Accueil', icon: <LayoutDashboard size={18} /> },
        { id: 'docs', label: 'Documentation', icon: <FileText size={18} /> },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
        >
          <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-lg shadow-brand-200/50 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-none">AI Guardian</span>
            <span className="text-[10px] font-bold text-brand-600 tracking-widest uppercase mt-1">by Team BinaryOps</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentPage === item.id
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}{item.label}
            </button>
          ))}

          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all ml-2"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'}`}>
                  {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {isAdmin ? 'Admin' : 'Utilisateur'}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email?.split('@')[0]}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 space-y-2 shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl text-left font-bold transition-all ${
                currentPage === item.id ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon}{item.label}
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-4 rounded-2xl text-left font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />Déconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
