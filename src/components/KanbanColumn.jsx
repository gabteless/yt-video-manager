import { useState } from 'react';
import PostItCard from './PostItCard';
import { useProject } from '../store/projectStore';

const COLUMN_CONFIG = {
  novo: {
    title: 'Novo',
    icon: '🆕',
    subtitle: 'Ideias e tarefas a fazer',
    gradient: 'from-blue-500/10 to-transparent',
    headerBg: 'bg-blue-500/10',
    headerBorder: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  em_producao: {
    title: 'Em Produção',
    icon: '🎬',
    subtitle: 'Trabalho em andamento',
    gradient: 'from-sky-500/10 to-transparent',
    headerBg: 'bg-sky-500/10',
    headerBorder: 'border-sky-500/30',
    iconColor: 'text-sky-400',
  },
  refazer: {
    title: 'Refazer',
    icon: '🔄',
    subtitle: 'Precisa de ajustes',
    gradient: 'from-red-500/10 to-transparent',
    headerBg: 'bg-red-500/10',
    headerBorder: 'border-red-500/30',
    iconColor: 'text-red-400',
  },
  pronto: {
    title: 'Pronto',
    icon: '✅',
    subtitle: 'Finalizado!',
    gradient: 'from-green-500/10 to-transparent',
    headerBg: 'bg-green-500/10',
    headerBorder: 'border-green-500/30',
    iconColor: 'text-green-400',
  },
};

export default function KanbanColumn({ column, tasks, projectId }) {
  const { addTask, moveTask } = useProject();
  const [isDragOver, setIsDragOver] = useState(false);
  const config = COLUMN_CONFIG[column];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only set false if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.sourceColumn !== column) {
        moveTask(data.projectId, data.taskId, column);
      }
    } catch (err) {
      console.warn('Drop error:', err);
    }
  };

  const handleAddTask = () => {
    addTask(projectId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col w-full
        glass rounded-xl overflow-hidden
        transition-all duration-300
        ${isDragOver ? 'drag-over ring-2 ring-accent/50' : ''}
      `}
    >
      {/* Column Header */}
      <div className={`
        ${config.headerBg} border-b ${config.headerBorder}
        px-4 py-3 bg-gradient-to-b ${config.gradient}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <div>
              <h3 className="font-bold text-sm text-white/90">{config.title}</h3>
              <p className="text-[10px] text-white/40">{config.subtitle}</p>
            </div>
          </div>
          <span className={`
            ${config.iconColor} bg-white/5 px-2 py-0.5 rounded-full
            text-xs font-bold
          `}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto max-h-[60vh]">
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-white/20 text-sm">
            {isDragOver ? '📥 Solte aqui!' : 'Nenhuma tarefa'}
          </div>
        )}
        {tasks.map((task) => (
          <PostItCard key={task.id} task={task} projectId={projectId} />
        ))}
      </div>

      {/* Add Task (only on "novo" column) */}
      {column === 'novo' && (
        <div className="p-3 pt-0">
          <button
            onClick={handleAddTask}
            className="w-full py-2 rounded-lg border-2 border-dashed border-white/10
              text-white/40 text-sm font-medium
              hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5
              transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg">＋</span> Nova Tarefa
          </button>
        </div>
      )}
    </div>
  );
}
