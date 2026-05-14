import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings, Play, Zap, History, Plus, BarChart3, Trash2, Mail, Smartphone, RefreshCw
} from 'lucide-react';
import { RealTimeProtection } from '../components/admin/RealTimeProtection';
import { userService, departmentService, simulationService, settingsService } from '../services/api';
import apiClient from '../services/apiClient';

// Sub-components
import { AdminStatsCards } from '../components/admin/AdminStatsCards';
import { VigilanceChart } from '../components/admin/VigilanceChart';
import { DepartmentCard } from '../components/admin/DepartmentCard';
import { StaffListModal } from '../components/admin/StaffListModal';
import { DepartmentDetailsModal } from '../components/admin/DepartmentDetailsModal';
import { SimulationModal } from '../components/admin/SimulationModal';
import { StaffProfileModal } from '../components/admin/StaffProfileModal';
import { AddDepartmentModal } from '../components/admin/AddDepartmentModal';
import { ResetConfirmModal } from '../components/admin/ResetConfirmModal';
import { NotificationToast } from '../components/admin/NotificationToast';
import { SimulationResultsModal } from '../components/admin/SimulationResultsModal';
import { AuditLogsSection } from '../components/admin/AuditLogsSection';
import { LeaderboardPodium } from '../components/admin/LeaderboardPodium';
import { ReportExportButton } from '../components/admin/ReportExportButton';
import { ThreatIntelligenceWidget, ThreatAlert } from '../components/admin/ThreatIntelligenceWidget';
import { CompanySettingsModal } from '../components/admin/CompanySettingsModal';
import { CriticalAlertsModal } from '../components/admin/CriticalAlertsModal';

const DepartmentSkeleton = () => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        <div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full"></div>
  </div>
);

const SimulationSkeleton = () => (
  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
    </div>
    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
    <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
      <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  </div>
);

interface Simulation {
  id: number;
  name: string;
  target_department: string;
  total_targets: number;
  total_clicks: number;
  status: string;
  channel?: string;
  scheduled_at?: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  staffCount: number;
  avgVigilance: number;
  priority?: 'normal' | 'high' | 'critical';
  description?: string;
  points: number;
  inviteCode?: string;
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  vigilanceScore: number;
  lastTest: string;
  status: 'active' | 'warning' | 'critical';
}

interface CompanyInfo {
  name: string;
  industry: string;
  numDepartments: number;
  departments: string[];
  isConfigured: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [showStaffList, setShowStaffList] = useState(false);
  const [showDeptDetails, setShowDeptDetails] = useState(false);
  const [showCriticalAlerts, setShowCriticalAlerts] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCompanySettings, setShowCompanySettings] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedSimulationId, setSelectedSimulationId] = useState<number | null>(null);
  const [selectedSimulationName, setSelectedSimulationName] = useState("");

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [setupStep, setSetupStep] = useState(1);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loadingSimulations, setLoadingSimulations] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ 
    name: '', industry: '', numDepartments: 0, departments: [], isConfigured: true // Par défaut true pour éviter le flash de l'écran de setup
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await settingsService.get();
        setCompanyInfo({
          name: settings.name,
          industry: settings.industry || '',
          numDepartments: 0,
          departments: [],
          isConfigured: settings.is_configured,
          logo_url: settings.logo_url,
          dashboard_layout: settings.dashboard_layout
        });
      } catch (err) {
        console.error("Erreur chargement settings:", err);
      }
    }
    loadSettings();
  }, []);

  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchSimulations = async () => {
    setLoadingSimulations(true);
    try {
      const data = await simulationService.list();
      setSimulations(data);
    } catch (err) {
      console.error("Erreur chargement simulations:", err);
    } finally {
      setLoadingSimulations(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
    
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
        const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000';
        const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/simulations';
        ws = new WebSocket(wsUrl);
      
        ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'SIMULATION_UPDATE') {
          setSimulations(prev => prev.map(sim => 
            sim.id === data.simulation_id 
              ? { ...sim, total_clicks: data.total_clicks !== null ? data.total_clicks : sim.total_clicks + 1 } 
              : sim
          ));
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const fetchDepts = async () => {
    try {
      const data = await departmentService.list();
      setDepartments(data.map((d: any) => ({
        id: String(d.id),
        name: d.name,
        staffCount: d.staff_count,
        avgVigilance: d.avg_vigilance,
        priority: d.priority,
        description: d.description,
        points: d.points || 0,
        inviteCode: d.invite_code
      })));
    } catch (err) {
      console.error("Erreur chargement départements:", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    setLoadingDepts(true);
    fetchDepts();
  }, []);

  const [simulationForm, setSimulationForm] = useState({
    name: '',
    department: 'Tous',
    channel: 'email',
    template: 'Microsoft 365 Login',
    sendingProfile: 'IT Support',
    targetGroup: 'Tout le personnel',
    scheduledAt: ''
  });

  const [newDept, setNewDept] = useState({
    name: '',
    staffCount: 0,
    description: '',
    priority: 'normal' as 'normal' | 'high' | 'critical'
  });

  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    localStorage.setItem('admin_departments', JSON.stringify(departments));
  }, [departments]);

  const fetchUsers = async () => {
    try {
      const users = await userService.listUsers();
      const mappedUsers: StaffMember[] = users.map((u: any) => {
        let deptName = 'Non assigné';
        if (u.department_id) {
          const d = departments.find(d => d.id === String(u.department_id));
          if (d) deptName = d.name;
        } else if (u.role === 'ADMIN') {
          deptName = 'Informatique';
        }
        
        const vScore = u.vigilance_score !== undefined ? u.vigilance_score : 100;
        let userStatus: 'active' | 'warning' | 'critical' = 'active';
        if (vScore < 60) userStatus = 'critical';
        else if (vScore < 75) userStatus = 'warning';

        return {
          id: String(u.id),
          firstName: u.prenoms,
          lastName: u.nom,
          email: u.email,
          department: deptName,
          vigilanceScore: Math.round(vScore),
          lastTest: new Date().toISOString().split('T')[0],
          status: userStatus
        };
      });
      setStaff(mappedUsers);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
    }
  };

  useEffect(() => {
    if (!loadingDepts) {
      fetchUsers().then(() => {
        // Une fois les utilisateurs chargés, on met à jour le staffCount réel des départements
        setDepartments(prevDepts => prevDepts.map(dept => {
          const actualCount = staff.filter(s => s.department === dept.name).length;
          return { ...dept, staffCount: actualCount || dept.staffCount };
        }));
      });
    }
  }, [departments.length, loadingDepts]); // On surveille le nombre de départements

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (companyInfo.isConfigured) {
        fetchSimulations();
        fetchUsers();
        fetchDepts();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [companyInfo.isConfigured, departments.length]);

  const handleResetData = async () => {
    try {
      await settingsService.update({ is_configured: false });
      window.location.reload();
    } catch (err) {
      setNotification({ message: "Erreur lors de la réinitialisation", type: 'error' });
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupStep === 1) {
      setSetupStep(2);
    } else if (setupStep === 2) {
      const depts = Array(companyInfo.numDepartments).fill('');
      setCompanyInfo({ ...companyInfo, departments: depts });
      setSetupStep(3);
    } else {
      const finishSetup = async () => {
        try {
          const updated = { ...companyInfo, isConfigured: true };
          await settingsService.update({
            name: companyInfo.name,
            industry: companyInfo.industry,
            is_configured: true
          });
          setCompanyInfo(updated);
          
          // Créer les départements en base
          for (const name of companyInfo.departments) {
            if (!name.trim()) continue;
            try {
              await departmentService.create({
                name,
                staff_count: 0,
                description: `Département ${name}`,
                priority: 'normal'
              });
            } catch (err) {
              console.warn(`Le département ${name} existe peut-être déjà.`, err);
            }
          }
          
          // Rafraîchir la liste des départements
          const data = await departmentService.list();
          setDepartments(data.map((d: any) => ({
            id: String(d.id),
            name: d.name,
            staffCount: d.staff_count,
            avgVigilance: d.avg_vigilance,
            priority: d.priority,
            description: d.description,
            points: d.points || 0,
            inviteCode: d.invite_code
          })));
        } catch (err) {
          setNotification({ message: "Erreur lors de la configuration", type: 'error' });
        }
      };
      finishSetup();
    }
  };

  const handleLaunchCampaign = (deptName?: string) => {
    setSimulationForm({
      ...simulationForm,
      department: deptName || 'Tous',
      name: `Campagne ${deptName || 'Globale'} - ${new Date().toLocaleDateString()}`,
      scheduledAt: ''
    });
    setShowSimulationModal(true);
  };

  const handleSimulateThreat = async (threat: ThreatAlert) => {
    setNotification({ message: "Création du modèle Gophish en cours...", type: 'success' });
    try {
      await apiClient.post('/simulations/threat-template', {
        name: threat.templateName,
        subject: threat.title,
        html_content: `<html><body><p>${threat.description}</p><p><a href="{{.URL}}">Cliquez ici pour vérifier</a></p></body></html>`
      });
    } catch (e) {
      console.error("Erreur lors de la création du modèle:", e);
    }
    
    setSimulationForm({
      ...simulationForm,
      name: `Simu: ${threat.title}`,
      channel: threat.type,
      template: threat.templateName,
      department: 'Tous',
      scheduledAt: ''
    });
    setShowSimulationModal(true);
  };

  const executeSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);
    try {
      await simulationService.create({
        name: simulationForm.name,
        target_department: simulationForm.department,
        channel: simulationForm.channel,
        template: simulationForm.template,
        sending_profile: simulationForm.sendingProfile,
        target_group: simulationForm.targetGroup,
        scheduled_at: simulationForm.scheduledAt ? new Date(simulationForm.scheduledAt).toISOString() : null,
        status: simulationForm.scheduledAt ? 'scheduled' : 'active'
      });
      setShowSimulationModal(false);
      fetchSimulations();
      setNotification({ message: `Simulation "${simulationForm.name}" enregistrée et lancée !`, type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ message: "Échec du lancement de la simulation", type: 'error' });
    } finally {
      setIsLaunching(false);
    }
  };

  const handleDeleteSimulation = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) return;
    try {
      await simulationService.delete(id);
      setSimulations(simulations.filter(s => s.id !== id));
      setNotification({ message: 'Campagne supprimée avec succès.', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Erreur lors de la suppression de la campagne.', type: 'error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    try {
      const added = await departmentService.create({
        name: newDept.name.trim(),
        staff_count: 0,
        description: newDept.description.trim(),
        priority: newDept.priority
      });

      setDepartments([...departments, {
        id: String(added.id),
        name: added.name,
        staffCount: 0,
        avgVigilance: added.avg_vigilance,
        priority: added.priority as any,
        points: 0,
        inviteCode: added.invite_code
      }]);

      setNewDept({ name: '', staffCount: 0, description: '', priority: 'normal' });
      setShowAddDeptModal(false);
      setNotification({ message: `Département "${added.name}" créé avec succès.`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ message: "Erreur lors de la création du département", type: 'error' });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await departmentService.delete(parseInt(id));
      setDepartments(departments.filter(d => d.id !== id));
      setNotification({ message: `Département supprimé.`, type: 'success' });
    } catch (err) {
      setNotification({ message: "Erreur lors de la suppression", type: 'error' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const sendWarningEmail = (member: StaffMember) => {
    setNotification({ message: `Avertissement envoyé à ${member.email}.`, type: 'success' });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveCompanySettings = async (logo_url: string, layout: string[]) => {
    try {
      await settingsService.update({
        logo_url: logo_url || null,
        dashboard_layout: JSON.stringify(layout)
      });
      setCompanyInfo({ ...companyInfo, logo_url, dashboard_layout: JSON.stringify(layout) });
      setShowCompanySettings(false);
      setNotification({ message: "Paramètres de personnalisation enregistrés.", type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ message: "Erreur lors de la sauvegarde.", type: 'error' });
    }
  };

  if (!companyInfo.isConfigured) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-brand-200/50 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Configuration Initiale</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Veuillez entrer les informations de votre entreprise.</p>
          <form onSubmit={handleSaveCompany} className="space-y-6">
            {setupStep === 1 && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom de l'entreprise</label>
                  <input required type="text" value={companyInfo.name} onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold dark:text-white transition-all" />
                </div>
              </>
            )}
            {setupStep === 2 && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre de départements</label>
                <input required type="number" min="1" max="20" value={companyInfo.numDepartments || ''} onChange={(e) => setCompanyInfo({ ...companyInfo, numDepartments: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 font-bold dark:text-white transition-all" />
              </div>
            )}
            {setupStep === 3 && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {companyInfo.departments.map((dept, index) => (
                  <div key={index}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Département {index + 1}</label>
                    <input required type="text" value={dept} onChange={(e) => {
                      const newDepts = [...companyInfo.departments];
                      newDepts[index] = e.target.value;
                      setCompanyInfo({ ...companyInfo, departments: newDepts });
                    }} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/10 font-bold dark:text-white transition-all" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-4">
              {setupStep > 1 && <button type="button" onClick={() => setSetupStep(setupStep - 1)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl font-bold">Retour</button>}
              <button type="submit" className="flex-[2] py-5 bg-brand-600 text-white rounded-2xl font-bold">{setupStep === 3 ? "Terminer" : "Continuer"}</button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleOpenResults = (sim: Simulation) => {
    setSelectedSimulationId(sim.id);
    setSelectedSimulationName(sim.name);
    setShowResultsModal(true);
  };

  const handleSyncGophish = async () => {
    setIsLaunching(true);
    try {
      await simulationService.sync();
      await fetchDepts();
      await fetchUsers();
      await fetchSimulations();
      setNotification({ message: "Synchronisation Gophish terminée !", type: 'success' });
    } catch (err) {
      setNotification({ message: "Erreur de synchronisation", type: 'error' });
    } finally {
      setIsLaunching(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 text-brand-600 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 p-2">
            {companyInfo.logo_url ? (
              <img src={companyInfo.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.src = '/logo.png')} />
            ) : (
              <img src="/logo.png?v=2" alt="Logo" className="w-full h-full object-cover rounded-xl" />
            )}
          </div>
          <div>
            <div className="text-brand-600 font-bold text-sm uppercase tracking-widest mb-1">Console Administration</div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{companyInfo.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ReportExportButton 
            departments={departments} 
            globalVigilance={
              departments.length > 0 
                ? Number((departments.reduce((acc, d) => acc + (d.avgVigilance || 0), 0) / departments.length).toFixed(1))
                : 100
            } 
          />
          <button onClick={handleSyncGophish} disabled={isLaunching} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-50 transition-colors" title="Synchroniser Gophish">
            <RefreshCw size={20} className={isLaunching ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowCompanySettings(true)} className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-brand-600 font-bold flex items-center gap-2 hover:border-brand-500 transition-colors">
            <Settings size={18} /> <span className="hidden sm:inline">Personnaliser</span>
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="p-3 bg-white dark:bg-slate-800 border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"><History size={20} /></button>
          
          {/* BOUTON SYNC ORANGE - TRÈS VISIBLE */}
          <button 
            onClick={handleSyncGophish} 
            disabled={isLaunching} 
            className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
            title="Synchroniser les clics depuis Gophish"
          >
            <RefreshCw size={18} className={isLaunching ? 'animate-spin' : ''} />
            <span className="hidden xl:inline">{isLaunching ? 'Sync...' : 'Actualiser Stats'}</span>
          </button>

          <button onClick={() => handleLaunchCampaign()} disabled={isLaunching} className="hidden lg:flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"><Zap size={18} fill="currentColor" />{isLaunching ? 'Lancement...' : 'Simulation'}</button>
        </div>
      </div>

      <LeaderboardPodium departments={departments} />

      <AdminStatsCards
        deptCount={departments.length}
        staffCount={staff.length}
        avgScore={
          departments.length > 0
            ? (departments.reduce((acc, d) => acc + (d.avgVigilance || 0), 0) / departments.length).toFixed(1) + '%'
            : '0%'
        }
        alertCount={String(staff.filter(s => s.status === 'critical').length)}
        onShowDepts={() => setShowDeptDetails(true)}
        onShowStaff={() => setShowStaffList(true)}
        onShowAlerts={() => setShowCriticalAlerts(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {(() => {
          const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          const data = [];
          const today = new Date();
          const baseScores = [65, 68, 70, 72, 73, 75]; // Tendance vers ~75%
          
          for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            data.push({ 
              name: months[d.getMonth()], 
              score: baseScores[5 - i] 
            });
          }
          return <VigilanceChart data={data} />;
        })()}

        <ThreatIntelligenceWidget onSimulateThreat={handleSimulateThreat} />

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold dark:text-white">Équipes</h2>
            <button onClick={() => setShowAddDeptModal(true)} className="p-2 bg-brand-50 text-brand-600 rounded-xl"><Plus size={20} /></button>
          </div>
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {loadingDepts ? (
              <>
                <DepartmentSkeleton />
                <DepartmentSkeleton />
                <DepartmentSkeleton />
              </>
            ) : departments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 font-bold">Aucune équipe définie.</p>
              </div>
            ) : (
              departments.map(dept => {
                const actualCount = staff.filter(s => s.department === dept.name).length;
                return <DepartmentCard key={dept.id} dept={{...dept, staffCount: actualCount}} onDelete={handleDeleteDepartment} onLaunch={handleLaunchCampaign} />;
              })
            )}
          </div>
        </div>
      </div>

      {/* New Campaigns Section */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center">
              <Zap size={24} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-extrabold dark:text-white">Campagnes de Sensibilisation</h2>
          </div>
          <button
            onClick={() => handleLaunchCampaign()}
            className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle Campagne
          </button>
        </div>

        {loadingSimulations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SimulationSkeleton />
            <SimulationSkeleton />
            <SimulationSkeleton />
          </div>
        ) : simulations.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center max-w-md mx-auto">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-[40px] flex items-center justify-center text-brand-500 mb-8 shadow-inner"
            >
              <Zap size={64} fill="currentColor" className="drop-shadow-lg" />
            </motion.div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Aucune menace simulée</h3>
            <p className="font-semibold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Prêt à tester vos équipes ? Lancez votre première campagne de phishing pour évaluer et améliorer la vigilance de votre entreprise.
            </p>
            <button 
              onClick={() => handleLaunchCampaign()} 
              className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black shadow-xl shadow-brand-200/50 hover:bg-brand-700 transition-all flex items-center gap-3"
            >
              <Zap size={20} fill="currentColor" /> Lancer une simulation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map(sim => (
              <div key={sim.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2 items-center">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sim.status === 'active' ? 'bg-brand-100 text-brand-600' :
                        sim.status === 'scheduled' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                      }`}>
                      {sim.status}
                    </div>
                    {sim.channel === 'sms' ? (
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg shadow-sm" title="Campagne SMS">
                        <Smartphone size={14} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-lg shadow-sm" title="Campagne Email">
                        <Mail size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenResults(sim)}
                      className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-brand-600 rounded-xl shadow-sm transition-all"
                      title="Voir les résultats"
                    >
                      <BarChart3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteSimulation(sim.id)}
                      className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition-all"
                      title="Supprimer la campagne"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white mb-1 truncate">{sim.name}</h3>
                {sim.status === 'scheduled' && sim.scheduled_at && (
                  <div className="text-xs font-semibold text-amber-600 mb-2">
                    Prévu pour le {new Date(sim.scheduled_at).toLocaleString('fr-FR')}
                  </div>
                )}
                <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">{sim.target_department}</p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cibles</span>
                    <span className="font-black dark:text-white">{sim.total_targets}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Clics</span>
                    <span className="font-black text-red-500">{sim.total_clicks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AuditLogsSection />

      <StaffListModal isOpen={showStaffList} onClose={() => setShowStaffList(false)} staff={staff} onSelectMember={(m) => setSelectedStaff(m)} />
      <DepartmentDetailsModal isOpen={showDeptDetails} onClose={() => setShowDeptDetails(false)} departments={departments} staff={staff} onAddDept={() => setShowAddDeptModal(true)} onLaunchPhishing={handleLaunchCampaign} onDeleteDept={handleDeleteDepartment} onSelectMember={setSelectedStaff} />
      <SimulationModal isOpen={showSimulationModal} onClose={() => setShowSimulationModal(false)} simulationForm={simulationForm} setSimulationForm={setSimulationForm} departments={departments} onExecute={executeSimulation} />
      <StaffProfileModal selectedStaff={selectedStaff} onClose={() => setSelectedStaff(null)} onSendWarning={sendWarningEmail} />
      <AddDepartmentModal isOpen={showAddDeptModal} onClose={() => setShowAddDeptModal(false)} newDept={newDept} setNewDept={setNewDept} onAdd={handleAddDepartment} />
      <CompanySettingsModal isOpen={showCompanySettings} onClose={() => setShowCompanySettings(false)} companyInfo={companyInfo} onSave={handleSaveCompanySettings} />
      <ResetConfirmModal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={handleResetData} />
      <SimulationResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        simulationId={selectedSimulationId!}
        simulationName={selectedSimulationName}
      />
      <CriticalAlertsModal 
        isOpen={showCriticalAlerts} 
        onClose={() => setShowCriticalAlerts(false)} 
        staff={staff} 
        onSendWarning={sendWarningEmail} 
      />
      <NotificationToast notification={notification} />
    </div>
  );
};
