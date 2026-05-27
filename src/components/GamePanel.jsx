import { useProject } from '../store/projectStore';
import { getLevel, getLevelTitle, getXpProgress } from '../data/achievements';

export default function GamePanel() {
  const { gameState } = useProject();
  const level = getLevel(gameState.xp);
  const levelTitle = getLevelTitle(level);
  const xpProgress = getXpProgress(gameState.xp);

  return (
    <div className="flex items-center gap-4">
      {/* Streak */}
      <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5" title="Streak diário">
        <span className="text-lg">🔥</span>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-streak leading-none">
            {gameState.streak}
          </span>
          <span className="text-[9px] text-white/30 leading-none">dias</span>
        </div>
      </div>

      {/* Videos Produced */}
      <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5" title="Vídeos produzidos">
        <span className="text-lg">📹</span>
        <span className="text-xs font-bold text-white/70">
          {gameState.totalProjectsCompleted}
        </span>
      </div>

      {/* Level + XP */}
      <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5" title={`${levelTitle} — ${gameState.xp} XP`}>
        <div className="flex items-center gap-1">
          <span className="text-lg">⭐</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 leading-none">{levelTitle}</span>
            <span className="text-xs font-bold text-xp-bar-glow leading-none">
              Nv. {level}
            </span>
          </div>
        </div>
        <div className="w-20">
          <div className="xp-bar-bg rounded-full h-1.5 overflow-hidden">
            <div
              className="xp-bar-fill h-full rounded-full"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-[8px] text-white/25 text-right mt-0.5">
            {gameState.xp} XP
          </p>
        </div>
      </div>
    </div>
  );
}
