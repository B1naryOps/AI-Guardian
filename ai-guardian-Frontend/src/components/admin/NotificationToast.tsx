import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationToastProps {
  notification: { message: string; type: 'success' | 'error' } | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]"
        >
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <p className="text-sm font-bold">{notification.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
