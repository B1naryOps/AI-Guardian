import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen, onClose, onConfirm
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4">Action Irréversible</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center font-medium mb-10">
              Êtes-vous sûr de vouloir effacer toutes les données ? Cette action supprimera la configuration de l'entreprise et tous les départements.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={onConfirm}
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-200/50"
              >
                Oui, tout effacer
              </button>
              <button 
                onClick={onClose}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
