import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onClick?: () => void;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, bg, onClick, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 ${onClick ? 'cursor-pointer hover:border-brand-300 transition-all' : ''}`}
  >
    <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-6`}>
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</h3>
    <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{value}</p>
  </motion.div>
);

interface AdminStatsCardsProps {
  deptCount: number;
  staffCount: number;
  avgScore: string;
  alertCount: string;
  onShowDepts: () => void;
  onShowStaff: () => void;
  onShowAlerts: () => void;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  deptCount, staffCount, avgScore, alertCount,
  onShowDepts, onShowStaff, onShowAlerts
}) => {
  const stats = [
    { 
      label: 'Départements', 
      value: deptCount, 
      icon: <Briefcase className="text-brand-600" />, 
      bg: 'bg-brand-50 dark:bg-brand-900/20',
      onClick: onShowDepts
    },
    { 
      label: 'Personnel Total', 
      value: staffCount, 
      icon: <Users className="text-indigo-600" />, 
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      onClick: onShowStaff
    },
    { 
      label: 'Score Moyen', 
      value: avgScore, 
      icon: <TrendingUp className="text-emerald-600" />, 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
    },
    { 
      label: 'Alertes Critiques', 
      value: alertCount, 
      icon: <AlertCircle className="text-red-600" />, 
      bg: 'bg-red-50 dark:bg-red-900/20',
      onClick: onShowAlerts
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} index={i} color="" />
      ))}
    </div>
  );
};
