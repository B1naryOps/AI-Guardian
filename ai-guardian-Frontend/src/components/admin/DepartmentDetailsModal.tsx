import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Play, Trash2, User } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  staffCount: number;
  avgVigilance: number;
  priority?: 'normal' | 'high' | 'critical';
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  vigilanceScore: number;
}

interface DepartmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  staff: StaffMember[];
  onAddDept: () => void;
  onLaunchPhishing: (deptName: string) => void;
  onDeleteDept: (id: string) => void;
  onSelectMember: (member: any) => void;
}

export const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  isOpen, onClose, departments, staff, onAddDept, onLaunchPhishing, onDeleteDept, onSelectMember
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Détails des Départements</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Vue d'ensemble de la vigilance par équipe</p>
                </div>
                <button 
                  onClick={onAddDept}
                  className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl hover:bg-brand-100 transition-all border border-brand-100 dark:border-brand-800 flex items-center gap-2 text-sm font-bold"
                >
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dept.staffCount} membres</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Vigilance</p>
                          <p className={`text-2xl font-black ${dept.avgVigilance < 70 ? 'text-red-500' : 'text-emerald-500'}`}>{dept.avgVigilance}%</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => onLaunchPhishing(dept.name)}
                            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all flex items-center gap-2"
                          >
                            <Play size={14} fill="currentColor" />
                            Simuler Phishing
                          </button>
                          <button 
                            onClick={() => onDeleteDept(dept.id)}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center gap-2 border border-red-100 dark:border-red-800"
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Membres clés</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {staff.filter(s => s.department === dept.name).map(member => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                                <User size={16} />
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{member.firstName} {member.lastName}</span>
                            </div>
                            <span className={`text-xs font-black ${member.vigilanceScore < 60 ? 'text-red-500' : 'text-emerald-500'}`}>{member.vigilanceScore}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
