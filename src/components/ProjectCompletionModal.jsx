import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MOTIVATIONAL_PHRASES } from '../data/achievements';

export default function ProjectCompletionModal({ data, onClose }) {
  const { project, duration, xpGained } = data;

  const durationDays = Math.floor(duration / (1000 * 60 * 60 * 24));
  const durationHours = Math.floor(
    (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  const phrase =
    MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];

  // Fire confetti!
  useEffect(() => {
    const end = Date.now() + 3000;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#fbbf24', '#6366f1', '#22c55e', '#f97316'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#fbbf24', '#6366f1', '#22c55e', '#f97316'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#6366f1', '#22c55e', '#f97316', '#ec4899'],
      });
    }, 500);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[90] animate-fade-in-scale">
      <div className="glass-strong rounded-2xl p-8 max-w-lg w-full mx-4 text-center border border-gold/20">
        {/* Trophy */}
        <div className="text-7xl mb-4 animate-bounce-in">🏆</div>

        <h2 className="text-2xl font-black text-white mb-1">Projeto Produzido!</h2>
        <p className="text-lg font-bold text-gold mb-6">"{project.name}"</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-3">
            <p className="text-xl font-black text-white">{project.tasks.length}</p>
            <p className="text-[10px] text-white/40 uppercase">Tarefas</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xl font-black text-white">
              {durationDays}d {durationHours}h
            </p>
            <p className="text-[10px] text-white/40 uppercase">Duração</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-xl font-black text-xp-bar-glow">+{xpGained}</p>
            <p className="text-[10px] text-white/40 uppercase">XP</p>
          </div>
        </div>

        {/* Motivational Phrase */}
        <div className="glass rounded-xl p-4 mb-6">
          <p className="text-sm text-white/70 italic">{phrase}</p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-gold to-yellow-500
            text-black font-black text-sm rounded-lg
            hover:from-yellow-400 hover:to-yellow-300
            transition-all duration-200
            shadow-lg shadow-gold/30 active:scale-95"
        >
          🎬 Continuar Produzindo!
        </button>
      </div>
    </div>
  );
}
