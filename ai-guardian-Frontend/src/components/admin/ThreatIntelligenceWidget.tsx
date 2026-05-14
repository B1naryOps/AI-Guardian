import React, { useState, useEffect } from 'react';
import { ShieldAlert, ChevronRight, Activity, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import apiClient from '../../services/apiClient';

export interface ThreatAlert {
  id: string;
  title: string;
  description: string;
  type: 'sms' | 'email';
  severity: 'high' | 'critical' | 'medium';
  templateName: string;
  date: string;
}

// Mock threats removed as we now fetch from API

interface ThreatIntelligenceWidgetProps {
  onSimulateThreat: (threat: ThreatAlert) => void;
}

export const ThreatIntelligenceWidget: React.FC<ThreatIntelligenceWidgetProps> = ({ onSimulateThreat }) => {
  const [threats, setThreats] = useState<ThreatAlert[]>([]);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const response = await apiClient.get('/threats/intelligence');
        setThreats(response.data);
      } catch (err) {
        console.error("Erreur de récupération des menaces", err);
      }
    };
    
    fetchThreats();
    const interval = setInterval(fetchThreats, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default: return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Threat Intelligence <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Flux mondial en temps réel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {threats.map((threat, index) => (
          <motion.div 
            key={threat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/20 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getSeverityColor(threat.severity)}`}>
                {threat.severity}
              </span>
              <span className="text-xs text-slate-400 font-medium">{threat.date}</span>
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">{threat.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{threat.description}</p>
            
            <button 
              onClick={() => onSimulateThreat(threat)}
              className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center gap-2 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-all"
            >
              <ShieldAlert size={14} />
              Simuler cette attaque
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
