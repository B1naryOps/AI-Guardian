import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ShieldCheck, Mail, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

interface Threat {
  id: int;
  sender: string;
  subject: string;
  risk_score: number;
  threat_type: string;
  detected_at: string;
  status: string;
}

export const RealTimeProtection: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/threats/`);
      if (response.ok) {
        const data = await response.json();
        setThreats(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des menaces réelles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 30000); // Rafraîchissement toutes les 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200/50">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">Bouclier Temps Réel</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Surveillance IMAP Active</p>
          </div>
        </div>
        <button 
          onClick={fetchThreats} 
          className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-600 rounded-xl transition-all"
          title="Rafraîchir"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-4">
        {threats.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
            <p className="text-slate-500 font-bold">Aucune menace réelle détectée pour le moment.</p>
            <p className="text-xs text-slate-400 mt-1">Votre infrastructure est sécurisée.</p>
          </div>
        ) : (
          threats.map((threat, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={threat.id}
              className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-rose-200 dark:hover:border-rose-900 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  threat.risk_score > 0.8 ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{threat.subject}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail size={14} /> {threat.sender}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 text-slate-400">
                      {new Date(threat.detected_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Score de Risque</div>
                  <div className={`text-xl font-black ${
                    threat.risk_score > 0.8 ? 'text-rose-600' : 'text-orange-600'
                  }`}>
                    {(threat.risk_score * 100).toFixed(0)}%
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${
                  threat.status === 'blocked' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {threat.status}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
