import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Calendar, Mail, FileText, AlertTriangle, Smartphone } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationForm: {
    name: string;
    department: string;
    channel: string;
    template: string;
    sendingProfile: string;
    targetGroup: string;
    scheduledAt: string;
  };
  setSimulationForm: (form: any) => void;
  departments: Department[];
  onExecute: (e: React.FormEvent) => void;
}

const TemplatePreview = ({ template, channel }: { template: string, channel: string }) => {
  if (channel === 'sms') {
    let smsText = "";
    switch (template) {
      case 'Microsoft 365 Login':
        smsText = "Alerte Microsoft: Activité suspecte sur votre compte. Vérifiez vos infos ici: http://login-ms.com/sec";
        break;
      case 'Facture Urgente':
        smsText = "URGENT: Votre facture #9482 est impayée. Évitez la suspension en réglant ici: http://pay-invoice.net/9482";
        break;
      case 'Mise à jour RH':
        smsText = "RH: Merci de mettre à jour vos infos de paie avant vendredi via ce lien: http://rh-portal-secure.com";
        break;
      case 'Alerte Sécurité Compte':
        smsText = "Sécurité: Connexion bloquée. Confirmez votre identité immédiatement sur: http://sec-auth.net/verify";
        break;
      case 'Invitation Réunion Teams':
        smsText = "Rappel Teams: Point d'équipe exceptionnel à 14:00. Rejoignez via: http://teams-invite.com/join";
        break;
      default:
        smsText = "Notification Système: Action requise immédiatement. Cliquez ici: http://sys-alert.net/action";
    }
    
    return (
      <div className="flex flex-col items-start justify-center h-full w-full max-w-[280px] mx-auto">
        <div className="bg-emerald-500 text-white p-4 rounded-2xl rounded-bl-sm text-sm shadow-md leading-relaxed w-full">
          {smsText}
          <div className="text-emerald-100 text-[10px] mt-2 text-right">Aujourd'hui 14:32</div>
        </div>
      </div>
    );
  }
  if (template === 'Microsoft 365 Login') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm font-sans text-slate-800 text-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#E81123] text-white flex items-center justify-center font-bold text-lg">M</div>
          <span className="font-semibold text-lg text-slate-700">Microsoft 365</span>
        </div>
        <p className="font-bold mb-2">Alerte de sécurité de votre compte</p>
        <p className="mb-4">Nous avons détecté une activité de connexion inhabituelle sur votre compte. Veuillez vérifier votre activité récente immédiatement pour éviter un blocage de l'accès.</p>
        <div className="inline-block bg-[#0078D4] text-white px-5 py-2 font-semibold cursor-pointer">Vérifier l'activité</div>
      </div>
    );
  }
  if (template === 'Facture Urgente') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm font-sans text-slate-800 text-sm">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <span className="font-bold text-lg text-slate-600">INVOICE #9482</span>
          <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded">URGENT</span>
        </div>
        <p className="mb-2">Veuillez trouver ci-joint la facture pour les services du mois en cours.</p>
        <p className="mb-4 font-semibold text-red-600">Le paiement est attendu sous 24h pour éviter une suspension de vos services.</p>
        <div className="border border-slate-200 p-3 rounded flex items-center gap-3 w-max bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
          <FileText size={24} className="text-blue-500" />
          <span className="font-semibold text-blue-600 underline">Facture_Avril.pdf</span>
        </div>
      </div>
    );
  }
  if (template === 'Mise à jour RH') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm font-sans text-slate-800 text-sm">
        <div className="flex items-center gap-3 mb-4 border-b pb-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-full">RH</div>
          <span className="font-bold text-lg text-slate-700">Ressources Humaines</span>
        </div>
        <p className="font-bold mb-2">Mise à jour obligatoire de vos informations</p>
        <p className="mb-4">Conformément à la nouvelle politique de l'entreprise, merci de valider vos informations de paie avant la fin de la semaine.</p>
        <div className="inline-block bg-emerald-600 text-white px-5 py-2 font-semibold cursor-pointer rounded">Portail RH</div>
      </div>
    );
  }
  
  if (template === 'Alerte Sécurité Compte') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm font-sans text-slate-800 text-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-amber-500" size={24} />
          <span className="font-bold text-lg text-slate-700">Alerte de Sécurité</span>
        </div>
        <p className="font-bold mb-2">Activité suspecte détectée</p>
        <p className="mb-4">Une connexion depuis une adresse IP inconnue a été bloquée. Veuillez confirmer votre identité pour sécuriser votre compte.</p>
        <div className="inline-block bg-slate-800 text-white px-5 py-2 font-semibold cursor-pointer rounded">Sécuriser mon compte</div>
      </div>
    );
  }

  if (template === 'Invitation Réunion Teams') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm font-sans text-slate-800 text-sm">
        <div className="flex items-center gap-2 mb-4 border-b pb-3">
          <div className="w-8 h-8 bg-[#5059C9] text-white flex items-center justify-center font-bold text-sm rounded">T</div>
          <span className="font-bold text-lg text-slate-700">Microsoft Teams</span>
        </div>
        <p className="font-bold mb-2">Vous avez été invité à une réunion</p>
        <p className="text-slate-500 mb-4">Sujet: Point d'équipe exceptionnel<br/>Heure: Aujourd'hui à 14:00</p>
        <div className="inline-block bg-[#5059C9] text-white px-5 py-2 font-semibold cursor-pointer rounded">Rejoindre la réunion</div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm font-sans text-slate-800 text-sm">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-amber-500" size={24} />
        <span className="font-bold text-lg text-slate-700">Notification Système</span>
      </div>
      <p className="mb-4">Ceci est un message de notification requérant votre attention immédiate.</p>
      <div className="inline-block bg-slate-800 text-white px-5 py-2 font-semibold cursor-pointer rounded">Cliquer ici</div>
    </div>
  );
};

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen, onClose, simulationForm, setSimulationForm, departments, onExecute
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 my-8"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-200">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">Créer une Campagne</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Configuration et aperçu en temps réel</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={onExecute} className="flex flex-col md:flex-row">
              {/* Form Section */}
              <div className="p-6 md:p-8 flex-1 space-y-6 md:border-r border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom de la Campagne</label>
                  <input 
                    required
                    type="text" 
                    value={simulationForm.name}
                    onChange={(e) => setSimulationForm({...simulationForm, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                    placeholder="Ex: Test Vigilance Q2"
                  />
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Canal</label>
                      <select 
                        value={simulationForm.channel}
                        onChange={(e) => setSimulationForm({...simulationForm, channel: e.target.value})}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Département</label>
                      <select 
                        value={simulationForm.department}
                        onChange={(e) => setSimulationForm({...simulationForm, department: e.target.value})}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                      >
                        <option value="Tous">Tous</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cibles</label>
                    <select 
                      value={simulationForm.targetGroup}
                      onChange={(e) => setSimulationForm({...simulationForm, targetGroup: e.target.value})}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all"
                    >
                      <option>Tout le personnel</option>
                      <option>Nouveaux arrivants</option>
                      <option>Managers uniquement</option>
                    </select>
                  </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar size={14} /> Planification (Optionnel)
                  </label>
                  <input 
                    type="datetime-local" 
                    value={simulationForm.scheduledAt}
                    onChange={(e) => setSimulationForm({...simulationForm, scheduledAt: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 ml-1">Laissez vide pour lancer immédiatement.</p>
                </div>

              </div>

              {/* Preview Section */}
              <div className="p-6 md:p-8 flex-1 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Modèle {simulationForm.channel === 'sms' ? 'de SMS' : 'd\'E-mail'}
                  </label>
                  <select 
                    value={simulationForm.template}
                    onChange={(e) => setSimulationForm({...simulationForm, template: e.target.value})}
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all shadow-sm"
                  >
                    <option>Microsoft 365 Login</option>
                    <option>Facture Urgente</option>
                    <option>Mise à jour RH</option>
                    <option>Alerte Sécurité Compte</option>
                    <option>Invitation Réunion Teams</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expéditeur (Spoofing)</label>
                  <select 
                    value={simulationForm.sendingProfile}
                    onChange={(e) => setSimulationForm({...simulationForm, sendingProfile: e.target.value})}
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all shadow-sm"
                  >
                    <option>IT Support (support@company.com)</option>
                    <option>RH (rh-info@company.com)</option>
                    <option>Finance (billing@company.com)</option>
                  </select>
                </div>

                <div className="flex-1 min-h-[200px]">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {simulationForm.channel === 'sms' ? <Smartphone size={14} /> : <Mail size={14} />} 
                    Aperçu du message
                  </label>
                  <div className="bg-slate-200/50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 h-full flex flex-col justify-center shadow-inner overflow-hidden">
                    <TemplatePreview template={simulationForm.template} channel={simulationForm.channel} />
                  </div>
                </div>

                <div className="pt-8 flex gap-4 mt-auto">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all shadow-xl shadow-brand-200/50 flex items-center justify-center gap-3"
                  >
                    {simulationForm.scheduledAt ? (
                      <><Calendar size={20} /> Planifier</>
                    ) : (
                      <><Zap size={20} fill="currentColor" /> Lancer</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
