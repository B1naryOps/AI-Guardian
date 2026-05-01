import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { authService, userService } from '../services/api';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get('mode') as 'login' | 'register') || 'login';

  const setMode = (m: 'login' | 'register') => {
    setSearchParams({ mode: m });
  };
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'enterprise'>('personal');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        setIsLoading(false);
        return;
      }

      try {
        // nom = lastName, prenoms = firstName (mapping backend)
        await authService.register({
          email,
          mot_de_passe: password,
          nom: lastName,
          prenoms: firstName,
          role: 'EMPLOYEE',
          invite_code: accountType === 'enterprise' ? inviteCode : undefined,
        });
        setRegistrationSuccess(true);
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'inscription.");
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        // 1) Login → récupère le token JWT
        const tokenData = await authService.login(email, password);
        const token: string = tokenData.access_token;

        // Stockage immédiat pour que l'intercepteur Axios le trouve
        localStorage.setItem('token', token);

        // 2) Récupère le profil utilisateur (sans argument grâce à l'intercepteur)
        const backendUser = await userService.getMe();

        // 3) Mappe vers le type User du frontend
        const role: UserRole =
          backendUser.role === 'ADMIN' || backendUser.role === 'admin'
            ? 'admin'
            : backendUser.role === 'SUPERADMIN' || backendUser.role === 'superadmin'
              ? 'superadmin'
              : 'user';

        const user = {
          id: String(backendUser.id),
          email: backendUser.email,
          firstName: backendUser.prenoms,
          lastName: backendUser.nom,
          role,
          vigilance_score: 85,
          created_at: new Date().toISOString(),
        };

        login(token, user);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || "Identifiants invalides.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[40px] shadow-2xl shadow-emerald-100 dark:shadow-none border border-emerald-50 dark:border-emerald-900/20">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Inscription Réussie !</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 text-lg">
              Bienvenue {firstName}. Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <button
              onClick={() => { setRegistrationSuccess(false); setMode('login'); }}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200/50 flex items-center justify-center gap-3"
            >
              Aller à la connexion
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-brand-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-200 rotate-3 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {mode === 'login' ? 'Accédez à votre espace de sécurité intelligent' : 'Rejoignez-nous pour protéger vos données professionnelles'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Prénom</label>
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium dark:text-white"
                        placeholder="Koffi"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Nom</label>
                    <div className="relative group">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium dark:text-white"
                        placeholder="Akue"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Type de compte</label>
                    <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setAccountType('personal')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${accountType === 'personal' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                      >
                        Personnel
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccountType('enterprise')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${accountType === 'enterprise' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                      >
                        Entreprise
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {accountType === 'enterprise' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:col-span-2"
                      >
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Code d'Invitation (Département)</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                          <input
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-brand-50/50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-brand-700 dark:text-brand-300 uppercase tracking-widest placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                            placeholder="Ex: MKT-9921"
                          />
                        </div>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-2 ml-1">
                          Demandez ce code à votre administrateur pour rejoindre votre équipe.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">E-mail Professionnel</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium dark:text-white"
                    placeholder="nom@entreprise.com"
                  />
                </div>
              </div>

              <div className={mode === 'register' ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Confirmation</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 shadow-lg shadow-brand-200/50 neo-button"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Se connecter' : "S'inscrire maintenant"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium mb-6">
              {mode === 'login' ? "Nouveau sur AI Guardian ?" : "Déjà un compte ?"}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="ml-2 text-brand-600 font-bold hover:text-brand-700 transition-colors"
              >
                {mode === 'login' ? "S'enregistrer gratuitement" : "Se connecter"}
              </button>
            </p>
            <div className="pt-6 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Développé par Team BinaryOps</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
