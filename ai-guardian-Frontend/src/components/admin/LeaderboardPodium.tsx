import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star } from 'lucide-react';

interface DepartmentRank {
  id: string;
  name: string;
  points: number;
}

export const LeaderboardPodium: React.FC<{ departments: DepartmentRank[] }> = ({ departments }) => {
  // Trier par points (décroissant) et prendre les 3 premiers
  const topDepts = [...departments].sort((a, b) => b.points - a.points).slice(0, 3);
  
  if (topDepts.length === 0) return null;

  // L'ordre du podium visuel est souvent: 2e, 1er, 3e
  const podiumOrder = [
    topDepts[1], // Argent
    topDepts[0], // Or
    topDepts[2]  // Bronze
  ];

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-slate-400 bg-slate-100 dark:bg-slate-800'; // 2e
    if (index === 1) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'; // 1er
    return 'text-orange-700 bg-orange-50 dark:bg-orange-900/30'; // 3e
  };

  const getPodiumHeight = (index: number) => {
    if (index === 0) return 'h-24'; // 2e
    if (index === 1) return 'h-32'; // 1er
    return 'h-16'; // 3e
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center">
          <Trophy size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold dark:text-white">Leaderboard Départements</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Les équipes les plus vigilantes (+10 pts par signalement, -5 pts par clic)</p>
        </div>
      </div>

      <div className="flex items-end justify-center gap-2 sm:gap-6 pt-10">
        {podiumOrder.map((dept, idx) => {
          if (!dept) return <div key={idx} className="w-24 sm:w-32" />;
          
          return (
            <motion.div 
              key={dept.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center w-24 sm:w-32"
            >
              {/* Badge Médaille */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg ${getMedalColor(idx)} border-4 border-white dark:border-slate-900 z-10`}>
                {idx === 1 ? <Trophy size={20} /> : <Medal size={20} />}
              </div>
              
              {/* Infos */}
              <div className="text-center mb-4">
                <p className="font-bold text-slate-900 dark:text-white truncate w-24 sm:w-32 text-sm">{dept.name}</p>
                <div className="flex items-center justify-center gap-1 text-brand-600 font-black">
                  {dept.points} pts
                </div>
              </div>

              {/* Bloc Podium */}
              <div className={`w-full ${getPodiumHeight(idx)} ${idx === 1 ? 'bg-brand-500' : 'bg-brand-100 dark:bg-brand-900/40'} rounded-t-2xl flex items-start justify-center pt-4 relative overflow-hidden`}>
                <span className={`text-4xl font-black opacity-20 ${idx === 1 ? 'text-white' : 'text-brand-600'}`}>
                  {idx === 0 ? '2' : idx === 1 ? '1' : '3'}
                </span>
                {/* Effet brillant sur le 1er */}
                {idx === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};
