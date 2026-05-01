import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, MousePointer2, AlertTriangle, CheckCircle2, Download, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { simulationService } from '../../services/api';

interface SimulationResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationId: number;
  simulationName: string;
}

interface TargetStatus {
  id: number;
  user_id: number;
  has_opened: boolean;
  has_clicked: boolean;
  has_reported: boolean;
  clicked_at: string | null;
}

export const SimulationResultsModal: React.FC<SimulationResultsModalProps> = ({ isOpen, onClose, simulationId, simulationName }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && simulationId) {
      fetchStats();
    }
  }, [isOpen, simulationId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await simulationService.getStats(simulationId);
      setStats(data);
    } catch (err) {
      console.error("Erreur stats simulation:", err);
    } finally {
      setLoading(false);
    }
  };

  const total = stats.length;
  const clicked = stats.filter(s => s.has_clicked).length;
  const safe = total - clicked;
  
  const handleExportCSV = () => {
    const header = "ID Utilisateur,A Cliqué,Heure du Clic\n";
    const rows = stats.map(s => `${s.user_id},${s.has_clicked ? 'Oui' : 'Non'},${s.has_clicked && s.clicked_at ? new Date(s.clicked_at).toLocaleString() : ''}`).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `rapport_simulation_${simulationId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };
  
  const chartData = [
    { name: 'Vigilants', value: safe, color: '#10b981' },
    { name: 'Piégés', value: clicked, color: '#ef4444' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 print:hidden">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Rapport de Campagne</h2>
              <p className="text-sm font-bold text-brand-600 uppercase tracking-widest">{simulationName}</p>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-600 hover:text-brand-600 transition-colors text-sm">
                <FileText size={16} /> CSV
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors text-sm">
                <Download size={16} /> PDF
              </button>
              <button onClick={onClose} className="ml-2 p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-10 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-12">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-brand-50 dark:bg-brand-900/20 rounded-3xl border border-brand-100 dark:border-brand-800">
                    <div className="flex items-center gap-4 mb-3">
                        <Users className="text-brand-600" size={20} />
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Total Cibles</span>
                    </div>
                    <p className="text-3xl font-black text-brand-900 dark:text-white">{total}</p>
                  </div>
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-800">
                    <div className="flex items-center gap-4 mb-3">
                        <MousePointer2 className="text-red-600" size={20} />
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Taux de Clic</span>
                    </div>
                    <p className="text-3xl font-black text-red-900 dark:text-white">{total > 0 ? Math.round((clicked / total) * 100) : 0}%</p>
                  </div>
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-4 mb-3">
                        <CheckCircle2 className="text-emerald-600" size={20} />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Réussite</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-900 dark:text-white">{total > 0 ? Math.round((safe / total) * 100) : 0}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        {chartData.map(d => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-xs font-bold text-slate-500">{d.name}</span>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* List of "Victims" */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Détails des Actions</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {stats.filter(s => s.has_clicked).length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                                <p className="text-sm font-bold text-slate-400">Personne n'a cliqué. Bravo !</p>
                            </div>
                        ) : (
                            stats.filter(s => s.has_clicked).map((target, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
                                            {target.user_name ? target.user_name.charAt(0) : target.user_id}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                              {target.user_name || `Utilisateur #${target.user_id}`}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                              {target.clicked_at ? `A cliqué à ${new Date(target.clicked_at).toLocaleTimeString()}` : 'A cliqué'}
                                            </div>
                                        </div>
                                    </div>
                                    <AlertTriangle className="text-red-500" size={18} />
                                </div>
                            ))
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button 
                onClick={onClose}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold shadow-sm border border-slate-200 dark:border-slate-700"
            >
                Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
