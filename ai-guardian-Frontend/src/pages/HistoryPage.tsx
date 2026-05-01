import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, AlertTriangle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analysisService } from '../services/api';

interface HistoryItem {
  id: number;
  content: string;
  confidence: number;
  is_phishing: boolean;
  date: string;
}

export const HistoryPage: React.FC = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await analysisService.getHistory();
        setHistory(data.map((h: any) => ({
           id: h.id,
           content: h.content,
           confidence: h.confidence,
           is_phishing: h.is_phishing,
           date: new Date(h.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        })));
      } catch (err) {
        console.error("Erreur historique:", err);
      }
    }
    fetchHistory();
  }, [token]);

  const classification = (item: HistoryItem) => {
    if (item.confidence >= 70) return item.is_phishing ? 'Dangerous' : 'Safe';
    if (item.is_phishing) return 'Suspicious';
    return 'Safe';
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <History className="text-brand-600 dark:text-brand-400" />
          Historique des Analyses
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Retrouvez tous vos contenus analysés depuis votre connexion.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-600">
            <History size={48} className="mb-4 opacity-30" />
            <p className="font-bold text-lg">Aucune analyse effectuée</p>
            <p className="text-sm mt-1">Vos analyses apparaîtront ici après utilisation de l'Analyseur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contenu</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Classification</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map((item, i) => {
                  const cls = classification(item);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">{item.content}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          cls === 'Safe' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                          cls === 'Dangerous' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                          'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {cls === 'Safe' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {cls === 'Safe' ? 'Sain' : cls === 'Dangerous' ? 'Dangereux' : 'Suspect'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[100px] bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.confidence > 70 ? (item.is_phishing ? 'bg-red-500' : 'bg-emerald-500') : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">{item.confidence.toFixed(1)}%</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
