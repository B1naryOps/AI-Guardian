import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Search, Filter } from 'lucide-react';

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

interface StaffListModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  onSelectMember: (member: StaffMember) => void;
}

export const StaffListModal: React.FC<StaffListModalProps> = ({ 
  isOpen, onClose, staff, onSelectMember 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all"); // "all", "critical", "average", "excellent"

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      
      // Filter
      let matchesFilter = true;
      if (scoreFilter === "critical") matchesFilter = member.vigilanceScore < 50;
      else if (scoreFilter === "average") matchesFilter = member.vigilanceScore >= 50 && member.vigilanceScore <= 80;
      else if (scoreFilter === "excellent") matchesFilter = member.vigilanceScore > 80;

      return matchesSearch && matchesFilter;
    });
  }, [staff, searchQuery, scoreFilter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Personnel Total</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Liste complète des employés et scores de vigilance</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, email..."
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-semibold dark:text-white transition-all shadow-sm"
                />
              </div>
              
              <div className="relative shrink-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </div>
                <select 
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-full sm:w-auto pl-11 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-semibold dark:text-white transition-all shadow-sm appearance-none"
                >
                  <option value="all">Tous les scores</option>
                  <option value="critical">Critique (&lt; 50%)</option>
                  <option value="average">Moyen (50% - 80%)</option>
                  <option value="excellent">Excellent (&gt; 80%)</option>
                </select>
              </div>
            </div>

            <div className="p-8 overflow-y-auto">
              {filteredStaff.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <Search size={24} />
                  </div>
                  <p className="text-slate-500 font-semibold">Aucun employé ne correspond à votre recherche.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStaff.map((member) => (
                    <div 
                      key={member.id}
                      onClick={() => onSelectMember(member)}
                      className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-all shadow-sm">
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{member.firstName} {member.lastName}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{member.department}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-xl font-black ${
                            member.vigilanceScore < 50 ? 'text-red-500' : 
                            member.vigilanceScore <= 80 ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                            {member.vigilanceScore}%
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
