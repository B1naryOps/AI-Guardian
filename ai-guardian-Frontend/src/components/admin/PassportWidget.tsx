import React from 'react';
import { Shield, Medal, Star, Target, TrendingUp, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface PassportWidgetProps {
  xp: number;
  level: string;
}

export const PassportWidget: React.FC<PassportWidgetProps> = ({ xp, level }) => {
  const getLevelConfig = () => {
    if (xp >= 500) return { current: 500, max: 1000, color: 'text-indigo-600', bg: 'bg-indigo-500', name: 'Expert', icon: <Award className="text-indigo-600" size={32} /> };
    if (xp >= 300) return { current: xp - 300, max: 200, color: 'text-purple-600', bg: 'bg-purple-500', name: 'Sentinelle', icon: <Star className="text-purple-600" size={32} /> };
    if (xp >= 100) return { current: xp - 100, max: 200, color: 'text-emerald-600', bg: 'bg-emerald-500', name: 'Gardien', icon: <Shield className="text-emerald-600" size={32} /> };
    return { current: xp, max: 100, color: 'text-brand-600', bg: 'bg-brand-500', name: 'Novice', icon: <Target className="text-brand-600" size={32} /> };
  };

  const config = getLevelConfig();
  const progressPercent = Math.min(100, Math.max(0, (config.current / config.max) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Medal className="text-amber-500" size={20} /> Passeport de Vigilance
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{xp} XP Total</span>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-opacity-10 shadow-inner ${config.color.replace('text-', 'bg-')}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Niveau Actuel</span>
              <h4 className={`text-2xl font-black ${config.color}`}>{config.name}</h4>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {config.current} / {config.max} XP
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${config.bg}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Badges Débloqués</h5>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" title="Badge: Premier Signalement (Bloqué)">
            <Shield size={18} className="text-emerald-500" />
          </div>
          {xp >= 100 && (
             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 cursor-pointer" title="Badge: Lanceur d'Alerte">
               <Shield size={18} className="text-emerald-600 dark:text-emerald-400" />
             </div>
          )}
          {xp >= 300 && (
             <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center border border-purple-200 dark:border-purple-800 cursor-pointer" title="Badge: Oeil de Lynx">
               <Star size={18} className="text-purple-600 dark:text-purple-400" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
