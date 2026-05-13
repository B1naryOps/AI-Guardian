import React, { useEffect, useState } from 'react';
import { Activity, Clock, User, Globe, AlertCircle } from 'lucide-react';
import { auditService } from '../../services/api';
import { motion } from 'motion/react';

interface AuditLog {
  id: number;
  user_name?: string;
  user_email?: string;
  action: string;
  endpoint: string;
  method: string;
  ip_address: string;
  user_agent: string;
  status_code: number;
  created_at: string;
}

export const AuditLogsSection: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await auditService.list();
        setLogs(data);
      } catch (err) {
        setError("Erreur lors de la récupération des journaux d'audit.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const currentLogs = logs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
          <Activity size={24} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-extrabold dark:text-white">Journal d'activité (Audit Logs)</h2>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-bold">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
            <Activity size={40} />
          </div>
          <p className="font-bold text-slate-400">Aucun journal d'activité disponible.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-widest text-slate-400">
                <th className="pb-4 font-bold"><Clock size={14} className="inline mr-2" /> Date et Heure</th>
                <th className="pb-4 font-bold"><User size={14} className="inline mr-2" /> Utilisateur</th>
                <th className="pb-4 font-bold"><Activity size={14} className="inline mr-2" /> Action</th>
                <th className="pb-4 font-bold"><Globe size={14} className="inline mr-2" /> Adresse IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {currentLogs.map((log, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="py-4 pr-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {new Date(log.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {log.user_name || 'Système'}
                    </div>
                    {log.user_email && (
                      <div className="text-xs text-slate-400">{log.user_email}</div>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${
                        log.method === 'GET' ? 'bg-blue-500' :
                        log.method === 'POST' ? 'bg-green-500' :
                        log.method === 'DELETE' ? 'bg-red-500' :
                        log.method === 'PUT' ? 'bg-amber-500' : 'bg-slate-500'
                      }`}></span>
                      {log.action}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 ml-1 truncate max-w-[200px]" title={log.endpoint}>
                      {log.endpoint}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                    {log.ip_address}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-500">
                Page {currentPage} sur {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
