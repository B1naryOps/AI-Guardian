import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Play, Copy } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  staffCount: number;
  avgVigilance: number;
  priority?: 'normal' | 'high' | 'critical';
  inviteCode?: string;
}

interface DepartmentCardProps {
  dept: Department;
  onDelete: (id: string) => void;
  onLaunch: (name: string) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ dept, onDelete, onLaunch }) => {
  return (
    <div className={`p-5 rounded-3xl border transition-all group ${
      dept.priority === 'critical' || dept.priority === 'high'
      ? 'bg-brand-50/50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-800 scale-105 shadow-md' 
      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 dark:text-white">{dept.name}</span>
          {(dept.priority === 'critical' || dept.priority === 'high') && (
            <span className={`px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-tighter rounded-md ${
              dept.priority === 'critical' ? 'bg-red-600' : 'bg-brand-600'
            }`}>
              {dept.priority === 'critical' ? 'Critique' : 'Priorité'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${dept.avgVigilance < 70 ? 'text-red-500' : 'text-emerald-500'}`}>
            {dept.avgVigilance}%
          </span>
          <button 
            onClick={() => onDelete(dept.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${dept.avgVigilance}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            dept.avgVigilance < 70 ? 'bg-red-500' : 'bg-emerald-500'
          }`}
        />
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dept.staffCount} employés</p>
        {dept.inviteCode && (
          <div className="flex items-center gap-1 bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded text-[10px] font-bold text-brand-600 dark:text-brand-400">
            <span>Code: {dept.inviteCode}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(dept.inviteCode!)}
              className="hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
              title="Copier"
            >
              <Copy size={14} />
            </button>
          </div>
        )}
        <button 
          onClick={() => onLaunch(dept.name)}
          className="flex items-center gap-1 text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-tighter"
        >
          <Play size={10} fill="currentColor" />
          Lancer Phishing
        </button>
      </div>
    </div>
  );
};
