import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Image as ImageIcon, Save, GripVertical } from 'lucide-react';
import { settingsService } from '../../services/api';
import apiClient from '../../services/apiClient';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: any;
  onSave: (logo_url: string, layout: string[]) => void;
}

const AVAILABLE_WIDGETS = [
  { id: 'stats', label: 'Statistiques Rapides' },
  { id: 'passport', label: 'Passeport de Sécurité' },
  { id: 'charts', label: 'Activité d\'Analyse' },
  { id: 'threats', label: 'Dernières Menaces' }
];

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen, onClose, companyInfo, onSave
}) => {
  const [logoUrl, setLogoUrl] = useState(companyInfo?.logo_url || '');
  const [uploading, setUploading] = useState(false);
  
  // Parse existing layout or use default
  let initialLayout = ['stats', 'passport', 'charts', 'threats'];
  if (companyInfo?.dashboard_layout) {
    try {
      initialLayout = JSON.parse(companyInfo.dashboard_layout);
    } catch(e) {}
  }
  const [layout, setLayout] = useState<string[]>(initialLayout);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLayout = [...layout];
    const temp = newLayout[index - 1];
    newLayout[index - 1] = newLayout[index];
    newLayout[index] = temp;
    setLayout(newLayout);
  };

  const handleMoveDown = (index: number) => {
    if (index === layout.length - 1) return;
    const newLayout = [...layout];
    const temp = newLayout[index + 1];
    newLayout[index + 1] = newLayout[index];
    newLayout[index] = temp;
    setLayout(newLayout);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const data = await settingsService.uploadLogo(file);
        if (data.logo_url) {
          setLogoUrl((apiClient.defaults.baseURL || '') + data.logo_url);
        }
      } catch (err) {
        console.error("Erreur d'upload du logo:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(logoUrl, layout);
  };

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
            className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Personnalisation de la plateforme</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* LOGO */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="text-brand-600" />
                  <h3 className="text-lg font-bold dark:text-white">Logo de l'entreprise</h3>
                </div>
                
                <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 p-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo de l'entreprise" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.src = '/logo.png?v=2')} />
                    ) : (
                      <img src="/logo.png?v=2" alt="Logo par défaut" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Modifier le logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-medium">{uploading ? 'Téléchargement...' : 'Formats supportés : PNG, JPG, SVG.'}</p>
                  </div>
                </div>
              </div>

              {/* DASHBOARD LAYOUT */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <LayoutDashboard className="text-brand-600" />
                  <h3 className="text-lg font-bold dark:text-white">Organisation du Tableau de Bord (Employés)</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Définissez l'ordre dans lequel les cartes s'afficheront sur l'écran d'accueil de vos employés.
                </p>

                <div className="space-y-3">
                  {layout.map((widgetId, index) => {
                    const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                    if (!widget) return null;
                    return (
                      <div key={widgetId} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-4">
                          <GripVertical className="text-slate-300 dark:text-slate-600" size={20} />
                          <span className="font-bold dark:text-white">{index + 1}. {widget.label}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button type="button" onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 text-slate-400 hover:text-brand-600 disabled:opacity-30">▲</button>
                          <button type="button" onClick={() => handleMoveDown(index)} disabled={index === layout.length - 1} className="p-1 text-slate-400 hover:text-brand-600 disabled:opacity-30">▼</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                  className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Sauvegarder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
