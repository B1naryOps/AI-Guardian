import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  ExternalLink, 
  MousePointerClick, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TrainingPage: React.FC = () => {
  const navigate = useNavigate();

  const phishingClues = [
    {
      id: 1,
      title: "L'expéditeur",
      desc: "Vérifiez toujours l'adresse email réelle, pas seulement le nom affiché. 'IT Support <no-reply@microsoft-update.xyz>' est suspect.",
      icon: <Eye className="text-amber-500" />
    },
    {
      id: 2,
      title: "L'Urgence Artificielle",
      desc: "Les attaquants utilisent la peur ou l'urgence ('Action requise immédiatement !') pour vous faire agir sans réfléchir.",
      icon: <AlertTriangle className="text-amber-500" />
    },
    {
      id: 3,
      title: "Les Liens Suspects",
      desc: "Survolez les boutons avec votre souris pour voir l'URL de destination. Si elle ne correspond pas au site officiel, ne cliquez pas.",
      icon: <MousePointerClick className="text-amber-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section - Impactful alert */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20"
          >
            <ShieldAlert size={48} strokeWidth={2.5} />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Oups ! Vous avez été <span className="text-amber-600">simulé</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Pas d'inquiétude, c'était une simulation de sécurité organisée par votre entreprise. 
            Aucune donnée n'a été compromise, mais c'est le moment idéal pour apprendre !
          </motion.p>
        </div>
        
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </section>

      {/* Educational Content */}
      <div className="container mx-auto max-w-5xl px-6 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {phishingClues.map((clue, index) => (
            <motion.div
              key={clue.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
            >
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                {clue.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{clue.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">
                {clue.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Email Simulation Breakdown */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 mb-16 overflow-hidden relative"
        >
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl flex items-center justify-center">
                    <Info size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black dark:text-white leading-none">Anatomie d'un piège</h2>
                   <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Exemple interactif</p>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-6 md:p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 relative">
                <div className="space-y-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex gap-4 items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase w-16">De:</span>
                        <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/30 text-slate-900 dark:text-white text-sm font-bold flex items-center gap-2">
                           Service Securité <span className="text-red-500">{"<admin@it-security-portal.net>"}</span>
                           <AlertTriangle size={14} className="text-red-500" />
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase w-16">Objet:</span>
                        <span className="text-sm font-black dark:text-white">[URGENT] Votre compte va être suspendu</span>
                    </div>
                </div>

                <div className="space-y-6 text-slate-600 dark:text-slate-300">
                    <p className="font-medium italic">Cher collaborateur,</p>
                    <p className="font-medium">Nous avons détecté une connexion inhabituelle sur votre compte. Veuillez cliquer sur le bouton ci-dessous pour confirmer votre identité sous 24h, sinon votre accès sera suspendu.</p>
                    
                    <div className="py-4">
                        <div className="relative inline-block group">
                            <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-500/30 flex items-center gap-2 cursor-help">
                                Confirmer mon identité
                                <ExternalLink size={18} />
                            </button>
                            {/* Hover Tooltip */}
                            <div className="absolute top-full left-0 mt-4 px-4 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-100 font-mono shadow-xl z-20 border border-slate-700">
                                Link: https://evil-phishing-login.com/login?id=4821
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-400">Cordialement,<br/>L'équipe IT Corporate</p>
                </div>

                <div className="absolute top-10 right-10 hidden md:block">
                    <motion.div 
                        initial={{ rotate: 10, scale: 0.9 }}
                        animate={{ rotate: 5, scale: 1 }}
                        repeatCount={Infinity}
                        className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 rounded-2xl max-w-[200px] text-xs font-bold shadow-xl"
                    >
                        Notez l'adresse email inhabituelle et le ton alarmiste !
                    </motion.div>
                </div>
            </div>
        </motion.div>

        {/* Final CTA */}
        <div className="bg-brand-600 rounded-[50px] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-500/20">
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-black mb-4">Bravo pour votre attention !</h2>
                <p className="text-brand-100 mb-10 max-w-xl text-lg font-medium">
                    La prochaine fois que vous avez un doute, n'hésitez pas à signaler l'email suspect à votre administrateur ou via le bouton dédié.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-10 py-5 bg-white text-brand-600 rounded-3xl font-black hover:bg-brand-50 transition-all flex items-center gap-2 shadow-xl"
                    >
                        Retour sur AI Guardian
                        <ArrowRight size={20} />
                    </button>
                    <button 
                         onClick={() => navigate('/docs')}
                        className="px-10 py-5 bg-brand-700 text-white rounded-3xl font-black hover:bg-brand-800 transition-all flex items-center gap-2"
                    >
                        Voir la Documentation complète
                    </button>
                </div>
            </div>
            
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};
