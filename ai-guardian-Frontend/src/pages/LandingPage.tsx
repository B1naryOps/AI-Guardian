import React, { useRef } from 'react';
import { Lock, FileText, BarChart3, ChevronRight, CheckCircle2, AlertTriangle, Zap, Globe, Search, Github, Linkedin, Twitter, Mail, Code2 } from 'lucide-react';
import { motion } from 'motion/react';


import lapuneImg from './lapune.jpeg'; 
import nicaImg from './nica.jpeg';
import pinoImg from './pino.jpeg';

const teamMembers = [
  {
    name: "ABAKTA Haana Camille",
    role: "Développeur Lead / Architecte",
    bio: "Passionné par la cybersécurité et le développement d'outils innovants pour protéger les utilisateurs contre les menaces numériques.",
    image: lapuneImg,
    links: { github: "#", linkedin: "#", twitter: "#" }
  },
  {
    name: "MALOU Essozimna Wilfried",
    role: "Designer UI/UX / Front-end",
    bio: "Dédié à la création d'interfaces intuitives et sécurisées qui rendent la cybersécurité accessible à tous.",
    image: nicaImg,
    links: { github: "#", linkedin: "#", twitter: "#" }
  },
  {
     name: "BARIKI Yendouparou Wilson",
    role: "Expert en IA / Data Scientist",
    bio: "Spécialiste de l'intelligence artificielle appliquée à la détection de phishing et à l'analyse comportementale des menaces.",
    image: pinoImg,
    links: { github: "#", linkedin: "#", twitter: "#" }
  }
];

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  onDocs: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin, onDocs }) => {
  const aboutRef = useRef<HTMLElement>(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-brand-50/50 dark:from-brand-900/10 to-transparent -z-10" />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-56">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-brand-600 dark:text-brand-400 text-sm font-bold mb-8">
                <Zap size={16} fill="currentColor" />
                <span className="uppercase tracking-widest">IA de Détection Nouvelle Génération</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[0.95]">
                Anticipez les <span className="text-brand-600 dark:text-brand-400">Cyberattaques</span> avant qu'elles n'arrivent.
              </h1>
              <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                AI Guardian est l'assistant intelligent qui analyse vos communications et forme vos équipes pour transformer chaque employé en un rempart contre le phishing.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={onStart}
                  className="w-full sm:w-auto px-10 py-5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200/50 flex items-center justify-center gap-3 group neo-button"
                >
                  Démarrer gratuitement
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onLogin}
                  className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Espace Client
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Propulsé par les meilleures technologies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale dark:invert">
            <div className="flex items-center gap-2 font-bold text-2xl">FAST API</div>
            <div className="flex items-center gap-2 font-bold text-2xl"><Globe size={24} /> REACT</div>
            <div className="flex items-center gap-2 font-bold text-2xl"><Zap size={24} /> GOPHISH</div>
            <div className="flex items-center gap-2 font-bold text-2xl">PYDANTIC</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">Une plateforme, une protection <span className="text-brand-600 dark:text-brand-400">totale</span>.</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Nous avons conçu AI Guardian pour être à la fois un outil de détection passif et une plateforme d'apprentissage active.
              </p>
            </div>
            <button onClick={onDocs} className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold hover:gap-4 transition-all">
              Explorer la documentation <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: <Search className="text-brand-600" />, 
                title: "Analyse Sémantique IA", 
                desc: "Notre modèle NLP identifie les patterns de manipulation psychologique, l'urgence feinte et les incohérences techniques.",
                color: "bg-blue-50 dark:bg-blue-900/20"
              },
              { 
                icon: <Zap className="text-amber-600" />, 
                title: "Simulations Gophish", 
                desc: "Lancez des campagnes de phishing réalistes pour tester la vigilance de vos collaborateurs en environnement contrôlé.",
                color: "bg-amber-50 dark:bg-amber-900/20"
              },
              { 
                icon: <BarChart3 className="text-emerald-600" />, 
                title: "Reporting Avancé", 
                desc: "Visualisez les vulnérabilités de votre organisation par département et suivez l'efficacité de vos formations.",
                color: "bg-emerald-50 dark:bg-emerald-900/20"
              }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all"
              >
                <div className={`w-16 h-16 ${f.color} rounded-3xl flex items-center justify-center mb-8`}>
                  {React.cloneElement(f.icon as React.ReactElement, { size: 32 })}
                </div>
                <h3 className="text-2xl font-extrabold mb-4 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-[60px] p-8 lg:p-20 overflow-hidden relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-8">L'interface que vos équipes vont <span className="text-brand-400">adorer</span>.</h2>
                <div className="space-y-6">
                  {[
                    "Tableau de bord intuitif pour les employés",
                    "Console d'administration SuperAdmin puissante",
                    "Intégration transparente avec Gophish",
                    "Rapports PDF automatisés pour la direction"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-slate-300 font-medium">
                      <div className="w-6 h-6 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <button onClick={onStart} className="mt-12 px-10 py-5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all">
                  Essayer l'interface
                </button>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded-full w-3/4" />
                    <div className="h-4 bg-white/10 rounded-full w-1/2" />
                    <div className="h-32 bg-brand-500/20 rounded-2xl border border-brand-500/30 flex items-center justify-center">
                      <BarChart3 className="text-brand-400" size={48} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-12 bg-white/5 rounded-xl" />
                      <div className="h-12 bg-white/5 rounded-xl" />
                      <div className="h-12 bg-white/5 rounded-xl" />
                    </div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/30 rounded-full blur-[100px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6">À propos de <span className="text-brand-600">Team BinaryOps</span></h2>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
              Nous sommes une équipe passionnée de développeurs et d'experts en cybersécurité unis par une mission : 
              rendre le web plus sûr grâce à l'intelligence artificielle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="flex gap-4">
                      <a href={member.links.github} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-600 transition-all">
                        <Github size={20} />
                      </a>
                      <a href={member.links.linkedin} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-600 transition-all">
                        <Linkedin size={20} />
                      </a>
                      <a href={member.links.twitter} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-brand-600 transition-all">
                        <Twitter size={20} />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-brand-600 font-bold text-sm mb-4 uppercase tracking-wider">{member.role}</p>
                  <p className="text-slate-500 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Values Section */}
          <div className="bg-slate-900 rounded-[60px] p-8 lg:p-20 overflow-hidden relative text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">Pourquoi nous faisons ce que nous faisons</h2>
                <div className="space-y-8">
                  {[
                    { icon: <Lock className="text-brand-400" />, title: "Sécurité d'abord", desc: "Nous croyons que la sécurité ne devrait pas être un luxe, mais un droit fondamental pour chaque utilisateur." },
                    { icon: <Zap className="text-amber-400" />, title: "Innovation constante", desc: "Le paysage des menaces évolue chaque jour, c'est pourquoi nous innovons sans cesse pour garder une longueur d'avance." },
                    { icon: <Code2 className="text-emerald-400" />, title: "Transparence", desc: "Nous construisons des solutions ouvertes et honnêtes pour instaurer une confiance durable avec nos utilisateurs." }
                  ].map((value, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        {value.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                        <p className="text-slate-400 leading-relaxed">{value.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  {/* REMPLACEZ L'URL CI-DESSOUS PAR LE CHEMIN DE VOTRE IMAGE (ex: /images/votre-image.jpg) */}
                  <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=800" 
                    alt="Team BinaryOps" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-brand-600 p-8 rounded-3xl shadow-xl max-w-xs">
                  <p className="text-2xl font-bold italic">"La cybersécurité est un sport d'équipe."</p>
                  <p className="mt-4 text-blue-200 font-bold">— Team BinaryOps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-10 leading-tight">Prêt à renforcer votre <br /><span className="text-brand-600">Cyber-Résilience</span> ?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={onStart} className="w-full sm:w-auto px-12 py-6 bg-brand-600 text-white rounded-2xl font-bold text-xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200/50 neo-button">
              Créer un compte gratuit
            </button>
            <button onClick={onDocs} className="w-full sm:w-auto px-12 py-6 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold text-xl hover:bg-slate-100 transition-all flex items-center gap-3">
              <FileText size={24} />
              Documentation
            </button>
          </div>
          <p className="mt-10 text-slate-400 font-medium">Aucune carte de crédit requise • Installation en 5 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="./logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-slate-900">AI Guardian</span>
            </div>
            <p className="text-xs font-bold text-brand-600 tracking-widest uppercase">Développé par Team BinaryOps</p>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2026 AI Guardian. Tous droits réservés.</p>
          <div className="flex items-center gap-8">
            <button onClick={scrollToAbout} className="text-slate-400 hover:text-brand-600 font-bold text-sm transition-colors">À propos</button>
            <a href="#" className="text-slate-400 hover:text-brand-600 font-bold text-sm transition-colors">Confidentialité</a>
            <a href="#" className="text-slate-400 hover:text-brand-600 font-bold text-sm transition-colors">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
