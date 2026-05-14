import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle2, TrendingUp, History, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analysisService, userService, settingsService } from '../services/api';
import apiClient from '../services/apiClient';
import { PassportWidget } from '../components/admin/PassportWidget';
import { useCompanySettings } from '../hooks/useCompanySettings';

interface HistoryItem {
  id: number;
  content: string;
  confidence: number;
  is_phishing: boolean;
  date: string;
  rawDate: Date;
}

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await analysisService.getHistory();
        setHistory(data.map((h: any) => ({
          id: h.id,
          content: h.content,
          confidence: h.confidence,
          is_phishing: h.is_phishing,
          date: new Date(h.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          rawDate: new Date(h.created_at)
        })));
      } catch (err) {
        console.error("Erreur historique:", err);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await userService.getMe();
        setDbUser(u);
      } catch (err) {
        console.error("Erreur user:", err);
      }
    };
    fetchUser();
    const interval = setInterval(fetchUser, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ nom: '', prenoms: '', mot_de_passe: '' });

  const handleOpenProfile = () => {
    setProfileForm({ nom: dbUser?.nom || '', prenoms: dbUser?.prenoms || '', mot_de_passe: '' });
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {};
      if (profileForm.nom) payload.nom = profileForm.nom;
      if (profileForm.prenoms) payload.prenoms = profileForm.prenoms;
      if (profileForm.mot_de_passe) payload.mot_de_passe = profileForm.mot_de_passe;

      const response = await apiClient.patch('/users/me', payload);
      if (response.status === 200) {
        setDbUser(response.data);
        setShowProfileModal(false);
      }
    } catch (e) {
      console.error("Error updating profile", e);
    }
  };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : '?';

  // Stats calculées depuis l'historique réel
  const total = history.length;
  const threats = history.filter(h => h.is_phishing).length;
  const safe = total - threats;
  const vigilanceScore = total === 0 ? 100 : Math.round((safe / total) * 100);

  // Graphique : analyses par jour (7 derniers jours)
  const chartData = (() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const result: { name: string; dateStr: string; value: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      result.push({
        name: days[d.getDay()],
        dateStr: d.toDateString(),
        value: 0
      });
    }

    history.forEach(h => {
      if (h.rawDate) {
        const dStr = new Date(h.rawDate).toDateString();
        const entry = result.find(r => r.dateStr === dStr);
        if (entry) {
          entry.value += 1;
        }
      }
    });

    return result.map(({ name, value }) => ({ name, value }));
  })();

  // 3 dernières alertes (phishing détecté)
  const recentThreats = history.filter(h => h.is_phishing).slice(0, 3);


  const { settings } = useCompanySettings();

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'stats':
        return (
          <div key="stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {[
              { label: 'Analyses', value: String(total), icon: <History size={24} />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
              { label: 'Menaces', value: String(threats), icon: <AlertTriangle size={24} />, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Sains', value: String(safe), icon: <CheckCircle2 size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Vigilance', value: `${vigilanceScore}%`, icon: <Zap size={24} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-6"
              >
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{stat.label}</h3>
                  <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'passport':
        return (
          <div key="passport" className="w-full">
            <PassportWidget xp={dbUser?.xp || user?.xp || 0} level={dbUser?.level || user?.level || 'Novice'} />
          </div>
        );
      case 'charts':
        return (
          <div key="charts" className="w-full lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 h-full">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Activité d'Analyse</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400">
                <TrendingUp size={16} />
                {total} analyse{total > 1 ? 's' : ''} au total
              </div>
            </div>
            {total === 0 ? (
              <div className="h-[350px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <History size={48} className="mb-4" />
                <p className="font-bold">Aucune analyse effectuée</p>
                <p className="text-sm mt-1">Utilisez l'Analyseur pour voir votre activité ici.</p>
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dx={-15} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '20px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorVal)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      case 'threats':
        return (
          <div key="threats" className="w-full lg:col-span-1 bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full min-h-[400px]">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Dernières Menaces</h3>
            <div className="flex-1 space-y-4">
              {recentThreats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 py-8">
                  <CheckCircle2 size={40} className="mb-3" />
                  <p className="font-bold text-sm text-center">Aucune menace détectée</p>
                </div>
              ) : (
                recentThreats.map((item, i) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[180px]">{item.content}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  let layoutKeys = ['stats', 'passport', 'charts', 'threats'];
  if (settings?.dashboard_layout) {
    try {
      layoutKeys = JSON.parse(settings.dashboard_layout);
    } catch (e) { }
  }

  const renderedLayout = layoutKeys.map((k, i) => {
    if (k === 'charts' || k === 'threats') {
      const nextK = layoutKeys[i + 1];
      const prevK = layoutKeys[i - 1];
      
      // Si adjacent à l'autre widget de graphique, on garde la grille
      if ((k === 'charts' && nextK === 'threats') || (k === 'threats' && nextK === 'charts')) {
        return (
          <div key={`grid-${i}`} className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {k === 'charts' ? renderWidget('charts') : renderWidget('threats')}
            {k === 'charts' ? renderWidget('threats') : renderWidget('charts')}
          </div>
        );
      }
      
      // Si on a déjà rendu ce widget dans le cadre d'un groupe, on l'ignore ici
      if ((k === 'charts' && prevK === 'threats') || (k === 'threats' && prevK === 'charts')) {
        return null;
      }
    }
    
    return (
      <div key={`layout-${k}-${i}`} className="w-full">
        {renderWidget(k)}
      </div>
    );
  });

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          {settings?.logo_url && (
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 p-2">
              <img src={settings.logo_url} alt="Logo Entreprise" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {settings?.name ? `Espace ${settings.name}` : 'Mon Dashboard'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Votre bouclier personnel contre les cyber-menaces.</p>
          </div>
        </div>
        <div className="flex items-center gap-5 p-4 bg-white dark:bg-slate-900 rounded-[32px] shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="text-right">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
            </div>
            <div className="flex items-center justify-end gap-2 text-xs font-bold text-brand-600 dark:text-brand-400">
              <Zap size={12} fill="currentColor" />
              Vigilance : {vigilanceScore}%
            </div>
          </div>
          <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-brand-200/50 cursor-pointer hover:bg-brand-700 transition" onClick={handleOpenProfile} title="Modifier le profil">
            {initials}
          </div>
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-black p-8 border-b border-slate-100 dark:border-slate-800 dark:text-white">Profil Utilisateur</h2>
            <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom</label>
                <input type="text" value={profileForm.nom} onChange={e => setProfileForm({ ...profileForm, nom: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prénoms</label>
                <input type="text" value={profileForm.prenoms} onChange={e => setProfileForm({ ...profileForm, prenoms: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                <input type="password" value={profileForm.mot_de_passe} onChange={e => setProfileForm({ ...profileForm, mot_de_passe: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all" placeholder="••••••••" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-brand-600 rounded-2xl font-black text-white shadow-xl shadow-brand-200/50 hover:bg-brand-700 transition-all">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {renderedLayout}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">AI Guardian v1.0 • Développé par Team BinaryOps</p>
      </div>
    </div>
  );
};
