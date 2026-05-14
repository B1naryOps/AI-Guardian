import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ isOpen, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation states
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.patch('/users/me', { mot_de_passe: password });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold ${met ? 'text-emerald-500' : 'text-slate-400'}`}>
      {met ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />}
      {text}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center">
                <ShieldAlert size={32} />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-center text-slate-900 dark:text-white mb-2">Sécurité Requise</h2>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
              Pour votre sécurité, vous devez définir un nouveau mot de passe fort avant d'accéder à la plateforme.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 font-bold dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 font-bold dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                <RequirementItem met={hasMinLength} text="Au moins 8 caractères" />
                <RequirementItem met={hasUpper} text="Au moins une majuscule" />
                <RequirementItem met={hasLower} text="Au moins une minuscule" />
                <RequirementItem met={hasNumber} text="Au moins un chiffre" />
                <RequirementItem met={hasSpecial} text="Au moins un caractère spécial" />
                <RequirementItem met={passwordsMatch} text="Les mots de passe correspondent" />
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-200/50 hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Mise à jour...' : 'Sécuriser mon compte'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
