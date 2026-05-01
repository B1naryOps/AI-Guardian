import React from 'react';
import { motion } from 'motion/react';
import { Book, Search, BarChart3, Settings, HelpCircle, FileText, ChevronRight } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const sections = [
    {
      title: "Introduction",
      icon: <FileText className="text-blue-600" />,
      content: "AI Guardian est une plateforme de cybersécurité conçue pour protéger les entreprises contre les attaques de phishing. Elle combine détection en temps réel par IA et formation par simulation."
    },
    {
      title: "Analyse de Contenu",
      icon: <Search className="text-blue-600" />,
      content: "Notre moteur NLP analyse la structure, le ton et les liens contenus dans vos messages. Il attribue un score de risque de 0 à 100% et fournit une explication détaillée des menaces potentielles."
    },
    {
      title: "Simulations Gophish",
      icon: <Settings className="text-blue-600" />,
      content: "Les administrateurs peuvent lancer des campagnes de phishing contrôlées. Le système déploie automatiquement un serveur Gophish pour tester la vigilance de vos employés sans risque réel."
    },
    {
      title: "Rôles et Permissions",
      icon: <HelpCircle className="text-blue-600" />,
      content: "SuperAdmin : Gère toutes les entreprises et campagnes. Administrateur Entreprise : Gère le personnel de son entreprise. Utilisateur : Accède aux outils d'analyse et à son historique."
    }
  ];

  return (
    <div className="container mx-auto px-6 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
          <Book size={16} />
          <span>Centre d'aide & Documentation</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Comment utiliser AI Guardian ?</h1>
        <p className="text-slate-500 text-lg">Tout ce qu'il faut savoir pour maîtriser votre sécurité numérique.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {sections.map((section, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              {section.icon}
            </div>
            <h3 className="text-xl font-bold mb-4">{section.title}</h3>
            <p className="text-slate-600 leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Besoin d'une assistance personnalisée ?</h2>
          <p className="text-blue-100 mb-8 max-w-xl">Nos experts en cybersécurité sont disponibles pour vous accompagner dans le déploiement de vos campagnes de simulation.</p>
          <a 
            href="mailto:teambinaryops@gmail.com"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 w-fit"
          >
            Contacter le support
            <ChevronRight size={20} />
          </a>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
};
