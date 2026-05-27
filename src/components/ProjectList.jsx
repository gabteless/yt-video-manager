import { useState } from 'react';
import { useProject } from '../store/projectStore';
import { getLevel, getLevelTitle, getXpProgress, ACHIEVEMENTS } from '../data/achievements';

export default function ProjectList() {
  const {
    projects,
    completedProjects,
    gameState,
    createProject,
    setActiveProject,
    deleteProject,
    deleteCompletedProject,
  } = useProject();
  const [newProjectName, setNewProjectName] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const handleCreateProject = () => {
    const name = newProjectName.trim() || `Vídeo #${projects.length + completedProjects.length + 1}`;
    createProject(name);
    setNewProjectName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateProject();
  };

  const level = getLevel(gameState.xp);
  const levelTitle = getLevelTitle(level);
  const xpProgress = getXpProgress(gameState.xp);

  return (
    <div className="w-full py-6 animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white mb-3 select-none">
          YT Video Manager
        </h1>
        <p className="text-white/35 text-base select-none">
          By: Misterium
        </p>
      </div>

      {/* Stats Cards — full width row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-white">{gameState.totalProjectsCompleted}</p>
          <p className="text-[11px] text-white/35 uppercase tracking-wider mt-1">Produzidos</p>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-streak">🔥 {gameState.streak}</p>
          <p className="text-[11px] text-white/35 uppercase tracking-wider mt-1">Streak</p>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-xp-bar-glow">Nv. {level}</p>
          <p className="text-[11px] text-white/35 uppercase tracking-wider mt-1">{levelTitle}</p>
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-gold">{gameState.xp}</p>
          <p className="text-[11px] text-white/35 uppercase tracking-wider mt-1">XP Total</p>
        </div>
        <div className="glass rounded-xl p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50 font-medium">
              ⭐ Nível {level}
            </span>
            <span className="text-[10px] text-white/25">
              {(level) * 100} XP
            </span>
          </div>
          <div className="xp-bar-bg rounded-full h-3 overflow-hidden">
            <div
              className="xp-bar-fill h-full rounded-full"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Create Project - Full Width */}
      <div className="glass-strong rounded-xl p-8 mb-10">
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          🚀 Criar Projeto
        </h2>
        <div className="flex gap-4">
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome do vídeo..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-5 py-4
              text-white placeholder:text-white/20 outline-none
              focus:border-accent focus:ring-1 focus:ring-accent/30
              transition-all text-base"
          />
          <button
            onClick={handleCreateProject}
            className="px-8 py-4 bg-gradient-to-r from-accent to-blue-700
              text-white font-bold text-sm rounded-lg
              hover:from-accent-glow hover:to-blue-600
              transition-all duration-200
              shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
              active:scale-95 whitespace-nowrap"
          >
            ＋ Criar Projeto
          </button>
        </div>
      </div>

      {/* Active Projects - Full Width */}
      {projects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            📋 Projetos Ativos
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
              {projects.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const total = project.tasks.length;
              const done = project.tasks.filter((t) => t.column === 'pronto').length;
              const inProd = project.tasks.filter((t) => t.column === 'em_producao').length;
              const progress = total > 0 ? (done / total) * 100 : 0;

              return (
                <div
                  key={project.id}
                  className="glass rounded-xl p-5 hover:bg-white/[0.04]
                    transition-all duration-200 cursor-pointer group"
                  onClick={() => setActiveProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎬</span>
                      <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-accent transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-white/30 flex items-center gap-3 mt-1">
                          <span>📝 {total} tarefas</span>
                          {inProd > 0 && <span className="text-blue-400">🎬 {inProd} em produção</span>}
                          <span className="text-green-400">✅ {done} prontas</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-28 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/30 font-mono w-12 text-right">
                        {Math.round(progress)}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Deletar "${project.name}"?`)) {
                            deleteProject(project.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300
                          transition-all text-sm p-1"
                        title="Deletar projeto"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements + Completed in 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="text-xl font-bold text-white mb-5 flex items-center gap-2 hover:text-gold transition-colors"
          >
            🏅 Conquistas
            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
              {gameState.unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
            <span className="text-xs text-white/30">{showAchievements ? '▲' : '▼'}</span>
          </button>

          {showAchievements && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = gameState.unlockedAchievements.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`
                      glass rounded-xl p-4 transition-all duration-200
                      ${unlocked
                        ? 'border border-gold/30 bg-gold/5'
                        : 'opacity-40 grayscale'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{a.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-white">{a.title}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{a.description}</p>
                        <p className="text-xs text-xp-bar-glow font-bold mt-1">+{a.xp} XP</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Projects */}
        <div>
          {completedProjects.length > 0 && (
            <>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-xl font-bold text-white mb-5 flex items-center gap-2 hover:text-green-400 transition-colors"
              >
                🏆 Produzidos
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {completedProjects.length}
                </span>
                <span className="text-xs text-white/30">{showCompleted ? '▲' : '▼'}</span>
              </button>

              {showCompleted && (
                <div className="space-y-3 animate-fade-in-up">
                  {completedProjects.map((project) => {
                    const duration = project.completedAt - project.createdAt;
                    const durationDays = Math.floor(duration / (1000 * 60 * 60 * 24));
                    const durationHours = Math.floor(
                      (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );

                    return (
                      <div
                        key={project.id}
                        className="glass rounded-xl p-4 border border-green-500/10 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                              <h3 className="font-bold text-green-400">{project.name}</h3>
                              <p className="text-xs text-white/30 mt-0.5">
                                {project.tasks.length} tarefas • {durationDays}d {durationHours}h
                                {' • '}
                                {new Date(project.completedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Deletar "${project.name}" dos produzidos?`)) {
                                deleteCompletedProject(project.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300
                              transition-all text-sm p-1"
                            title="Deletar projeto concluído"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 && completedProjects.length === 0 && (
        <div className="text-center py-20 animate-float">
          <div className="text-7xl mb-6">🎥</div>
          <h3 className="text-2xl font-bold text-white/50 mb-3">Nenhum projeto ainda</h3>
          <p className="text-base text-white/25">
            Crie seu primeiro projeto e comece a produzir!
          </p>
        </div>
      )}
    </div>
  );
}
