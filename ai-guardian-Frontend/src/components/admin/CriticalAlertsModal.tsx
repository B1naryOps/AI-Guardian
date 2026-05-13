import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Send, User } from 'lucide-react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  vigilanceScore: number;
  lastTest: string;
  status: 'active' | 'warning' | 'critical';
}

interface CriticalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  onSendWarning: (member: StaffMember) => void;
}

export const CriticalAlertsModal: React.FC<CriticalAlertsModalProps> = ({
  isOpen, onClose, staff, onSendWarning
}) => {
  const criticalStaff = staff.filter(s => s.status === 'critical');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Alertes Critiques</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{criticalStaff.length} utilisateurs à risque élevé</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {criticalStaff.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-bold text-slate-400">Aucune alerte critique pour le moment. Félicitations !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {criticalStaff.map((member) => (
                    <div key={member.id} className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between group hover:border-red-200 dark:hover:border-red-900/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{member.firstName} {member.lastName}</h4>
                          <p className="text-xs font-semibold text-slate-500">{member.department} • {member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Score</div>
                          <div className="text-lg font-black text-red-500">{member.vigilanceScore}%</div>
                        </div>
                        <button 
                          onClick={() => onSendWarning(member)}
                          className="p-4 bg-white dark:bg-slate-800 text-red-600 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Envoyer un avertissement"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                <span className="font-bold text-red-500">Note :</span> Les utilisateurs affichés ici ont un score de vigilance inférieur à 60%. Il est recommandé de leur envoyer une formation de rappel ou de planifier une simulation dédiée.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
