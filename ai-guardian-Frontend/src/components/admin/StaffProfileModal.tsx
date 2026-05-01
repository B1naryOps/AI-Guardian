import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail } from 'lucide-react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  email: string;
  vigilanceScore: number;
  lastTest: string;
}

interface StaffProfileModalProps {
  selectedStaff: StaffMember | null;
  onClose: () => void;
  onSendWarning: (member: StaffMember) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  selectedStaff, onClose, onSendWarning
}) => {
  return (
    <AnimatePresence>
      {selectedStaff && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-200/20">
                <User size={48} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{selectedStaff.firstName} {selectedStaff.lastName}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">{selectedStaff.department}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vigilance</p>
                  <p className={`text-3xl font-black ${selectedStaff.vigilanceScore < 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {selectedStaff.vigilanceScore}%
                  </p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dernier Test</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{selectedStaff.lastTest}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedStaff.vigilanceScore < 70 && (
                  <button 
                    onClick={() => onSendWarning(selectedStaff)}
                    className="w-full py-5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-200/50"
                  >
                    <Mail size={20} />
                    Envoyer un avertissement
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Fermer le profil
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
