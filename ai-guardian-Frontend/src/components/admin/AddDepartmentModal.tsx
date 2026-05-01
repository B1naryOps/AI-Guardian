import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  newDept: {
    name: string;
    staffCount: number;
    description: string;
    priority: 'normal' | 'high' | 'critical';
  };
  setNewDept: (dept: any) => void;
  onAdd: (e: React.FormEvent) => void;
}

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen, onClose, newDept, setNewDept, onAdd
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
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
            className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Ajouter un Département</h2>
            <form onSubmit={onAdd} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom du Département</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  value={newDept.name}
                  onChange={(e) => setNewDept({...newDept, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                  placeholder="Ex: Logistique"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre d'employés (optionnel)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newDept.staffCount || ''}
                    onChange={(e) => setNewDept({...newDept, staffCount: parseInt(e.target.value) || 0})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                    placeholder="Ex: 25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Priorité</label>
                  <select 
                    value={newDept.priority}
                    onChange={(e) => setNewDept({...newDept, priority: e.target.value as any})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                  >
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description / Notes</label>
                <textarea 
                  value={newDept.description}
                  onChange={(e) => setNewDept({...newDept, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all h-24 resize-none"
                  placeholder="Informations utiles sur le département..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
