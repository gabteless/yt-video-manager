import { useEffect, useState } from 'react';
import { useProject } from '../store/projectStore';

export default function AchievementPopup() {
  const { gameState, dismissAchievement } = useProject();
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    if (gameState.pendingAchievements.length > 0 && !visible) {
      const achievement = gameState.pendingAchievements[0];
      setVisible(achievement);

      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        handleDismiss(achievement.id);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [gameState.pendingAchievements, visible]);

  const handleDismiss = (id) => {
    setVisible(null);
    dismissAchievement(id);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div
        className="glass-strong rounded-xl p-4 max-w-xs border border-gold/30 shadow-lg shadow-gold/10 cursor-pointer"
        onClick={() => handleDismiss(visible.id)}
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl animate-bounce-in">{visible.icon}</div>
          <div>
            <p className="text-[10px] text-gold font-bold uppercase tracking-wider mb-0.5">
              🏅 Conquista Desbloqueada!
            </p>
            <p className="text-sm font-bold text-white">{visible.title}</p>
            <p className="text-xs text-white/50 mt-0.5">{visible.description}</p>
            <p className="text-xs text-xp-bar-glow font-bold mt-1">+{visible.xp} XP</p>
          </div>
        </div>
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-yellow-300 rounded-full"
            style={{
              animation: 'shrinkBar 5s linear forwards',
            }}
          />
        </div>
        <style>{`
          @keyframes shrinkBar {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}
