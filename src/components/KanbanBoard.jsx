import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import { useProject } from '../store/projectStore';

const COLUMNS = ['novo', 'em_producao', 'refazer', 'pronto'];

export default function KanbanBoard() {
  const {
    projects,
    activeProjectId,
    goToList,
    renameProject,
    completeProject,
    addTask,
  } = useProject();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const project = projects.find((p) => p.id === activeProjectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        Projeto não encontrado.
      </div>
    );
  }

  const tasksByColumn = {
    novo: project.tasks.filter((t) => t.column === 'novo'),
    em_producao: project.tasks.filter((t) => t.column === 'em_producao'),
    refazer: project.tasks.filter((t) => t.column === 'refazer'),
    pronto: project.tasks.filter((t) => t.column === 'pronto'),
  };

  const totalTasks = project.tasks.length;
  const completedTasks = tasksByColumn.pronto.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const allTasksDone = totalTasks > 0 && completedTasks === totalTasks;

  const handleStartEditName = () => {
    setEditName(project.name);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      renameProject(project.id, trimmed);
    }
    setIsEditingName(false);
  };

  const handleComplete = async () => {
    const result = await completeProject(project.id);
    if (result) {
      window.dispatchEvent(
        new CustomEvent('project-completed', { detail: result })
      );
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 glass-strong rounded-xl mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToList}
            className="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            ← Voltar
          </button>
          <div className="w-px h-6 bg-white/10" />
          {isEditingName ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
              className="bg-transparent border-b-2 border-accent text-white text-lg font-bold outline-none px-1"
              autoFocus
            />
          ) : (
            <h2
              onClick={handleStartEditName}
              className="text-lg font-bold text-white cursor-pointer hover:text-accent transition-colors"
              title="Clique para renomear"
            >
              🎬 {project.name}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-40 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-white/50 font-medium">
              {completedTasks}/{totalTasks}
            </span>
          </div>

          {/* Complete Project Button */}
          {allTasksDone ? (
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-700
                text-white font-bold text-sm rounded-lg
                hover:from-blue-400 hover:to-blue-600
                transition-all duration-200 animate-pulse-glow
                flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              📤 Enviar Projeto
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 bg-white/5 text-white/30 font-medium text-sm rounded-lg
                cursor-not-allowed flex items-center gap-2"
              title="Mova todas as tarefas para 'Pronto' primeiro"
            >
              📤 Enviar Projeto
            </button>
          )}
        </div>
      </div>

      {/* Kanban Columns — 4 columns, flex to fill width */}
      <div className="flex-1 grid grid-cols-4 gap-4 pb-4 min-h-0">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column}
            column={column}
            tasks={tasksByColumn[column]}
            projectId={project.id}
          />
        ))}
      </div>

      {/* Quick Add Button (floating) */}
      <button
        onClick={() => addTask(project.id)}
        className="fixed bottom-6 right-6 w-14 h-14
          bg-gradient-to-r from-accent to-blue-700
          text-white text-2xl rounded-full
          shadow-lg shadow-accent/30
          hover:scale-110 hover:shadow-xl hover:shadow-accent/40
          transition-all duration-200
          flex items-center justify-center
          animate-float z-50"
        title="Nova tarefa rápida"
      >
        ＋
      </button>

      {/* Completion Confirm Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-scale">
          <div className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">Enviar Projeto?</h3>
            <p className="text-white/50 text-sm mb-6">
              Tem certeza que quer marcar "{project.name}" como produzido?
              <br />
              Essa ação não pode ser desfeita!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="px-5 py-2 rounded-lg bg-white/5 text-white/60
                  hover:bg-white/10 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowCompleteConfirm(false);
                  handleComplete();
                }}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700
                  text-white font-bold text-sm hover:from-blue-400 hover:to-blue-600
                  transition-all shadow-lg shadow-blue-500/20"
              >
                🚀 Enviar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
