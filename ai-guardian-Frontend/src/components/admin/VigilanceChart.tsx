import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface VigilanceChartProps {
  data: { name: string; score: number }[];
}

export const VigilanceChart: React.FC<VigilanceChartProps> = ({ data }) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Évolution de la Vigilance</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Moyenne globale sur les 6 derniers mois</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
          <TrendingUp size={16} className="text-emerald-500" />
          +12.4% ce mois
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid-color)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text-color)', fontSize: 12, fontWeight: 600}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--chart-text-color)', fontSize: 12, fontWeight: 600}} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
