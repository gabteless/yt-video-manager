import { useState, useEffect, useRef, useMemo } from 'react';
import { useProject } from '../store/projectStore';

const URGENCY_CONFIG = {
  baixa: { icon: '🟢', label: 'Baixa', color: 'bg-urgency-low', border: 'border-green-500/30' },
  media: { icon: '🟡', label: 'Média', color: 'bg-urgency-medium', border: 'border-yellow-500/30' },
  alta: { icon: '🟠', label: 'Alta', color: 'bg-urgency-high', border: 'border-orange-500/30' },
  urgente: { icon: '🔴', label: 'Urgente', color: 'bg-urgency-critical', border: 'border-red-500/30' },
};

const URGENCY_ORDER = ['baixa', 'media', 'alta', 'urgente'];

const POSTIT_COLORS = {
  novo: {
    bg: 'bg-postit-yellow',
    text: 'text-slate-800',
    accent: 'border-postit-yellow-dark',
  },
  em_producao: {
    bg: 'bg-postit-orange',
    text: 'text-blue-900',
    accent: 'border-postit-orange-dark',
  },
  refazer: {
    bg: 'bg-postit-red',
    text: 'text-red-900',
    accent: 'border-postit-red-dark',
  },
  pronto: {
    bg: 'bg-postit-green',
    text: 'text-green-900',
    accent: 'border-postit-green-dark',
  },
};

export default function PostItCard({ task, projectId }) {
  const { updateTask, deleteTask, moveTask, calculateTimeInProduction } = useProject();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showDelete, setShowDelete] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('');
  const inputRef = useRef(null);

  // Subtle post-it tilt (very small range to avoid misalignment)
  const rotation = useMemo(() => {
    const seed = task.id.charCodeAt(0) + task.id.charCodeAt(1);
    return ((seed % 3) - 1) * 0.5; // -0.5 to 0.5 degrees
  }, [task.id]);

  // Live timer for tasks in production
  useEffect(() => {
    if (task.column !== 'em_producao' || !task.movedToProductionAt) {
      if ((task.column === 'pronto' || task.column === 'refazer') && task.movedToProductionAt) {
        const time = calculateTimeInProduction(task);
        if (time) {
          if (time.days > 0) {
            setTimeDisplay(`${time.days}d ${time.hours}h ${time.minutes}m`);
          } else {
            setTimeDisplay(`${time.hours}h ${time.minutes}m`);
          }
        }
      } else {
        setTimeDisplay('');
      }
      return;
    }

    const updateTimer = () => {
      const time = calculateTimeInProduction(task);
      if (time) {
        if (time.days > 0) {
          setTimeDisplay(`${time.days}d ${time.hours}h ${time.minutes}m`);
        } else {
          setTimeDisplay(`${time.hours}h ${time.minutes}m`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute
    return () => clearInterval(interval);
  }, [task, calculateTimeInProduction]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      updateTask(projectId, task.id, { title: trimmed });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const cycleUrgency = () => {
    const currentIndex = URGENCY_ORDER.indexOf(task.urgency);
    const nextIndex = (currentIndex + 1) % URGENCY_ORDER.length;
    updateTask(projectId, task.id, { urgency: URGENCY_ORDER[nextIndex] });
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task.id,
      projectId,
      sourceColumn: task.column,
    }));
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const colors = POSTIT_COLORS[task.column];
  const urgency = URGENCY_CONFIG[task.urgency];
  const isUrgent = task.urgency === 'urgente';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        ${colors.bg} ${colors.text} postit-shadow
        rounded-sm p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:scale-[1.03]
        border-t-4 ${colors.accent}
        animate-fade-in-up relative group
        ${isUrgent ? 'animate-shake-urgent' : ''}
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Top bar: urgency left, timer right */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={cycleUrgency}
          className="flex items-center gap-1 text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
          title={`Urgência: ${urgency.label} (clique para mudar)`}
        >
          <span className="text-sm">{urgency.icon}</span>
          <span className="uppercase tracking-wide text-[10px]">{urgency.label}</span>
        </button>

        {timeDisplay && (
          <span className={`
            text-xs font-bold px-1.5 py-0.5 rounded
            ${task.column === 'em_producao' ? 'bg-orange-800/20 text-orange-900' : 'bg-green-800/20 text-green-900'}
          `}>
            ⏱ {timeDisplay}
          </span>
        )}
      </div>

      {/* Title */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          className={`
            w-full bg-transparent border-b-2 border-current/30
            outline-none text-sm font-medium py-1 ${colors.text}
            placeholder:text-current/40
          `}
          placeholder="Título da tarefa..."
          maxLength={60}
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium cursor-text min-h-[24px] leading-snug break-words"
          title="Clique para editar"
        >
          {task.title}
        </p>
      )}

      {/* Delete button */}
      {showDelete && (
        <button
          onClick={() => {
            if (window.confirm(`Deletar "${task.title}"?`)) {
              deleteTask(projectId, task.id);
            }
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full
            text-xs flex items-center justify-center hover:bg-red-600
            transition-all animate-fade-in-scale shadow-md"
          title="Deletar tarefa"
        >
          ✕
        </button>
      )}
    </div>
  );
}
