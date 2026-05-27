import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { ACHIEVEMENTS, getLevel } from '../data/achievements';
import { useAuth } from './AuthProvider';
import {
  fetchProjects,
  createProjectDB,
  renameProjectDB,
  deleteProjectDB,
  completeProjectDB,
  createTaskDB,
  updateTaskDB,
  deleteTaskDB,
  fetchGameState,
  saveGameState,
} from '../lib/supabaseData';

const ProjectContext = createContext(null);

function calculateTimeInProduction(task) {
  if (!task.movedToProductionAt) return null;
  const end = task.movedToProntoAt || Date.now();
  const diff = end - task.movedToProductionAt;
  const totalMinutes = diff / (1000 * 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return { days, hours, minutes, totalMs: diff };
}

const initialGameState = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  totalProjectsCompleted: 0,
  totalTasksCreated: 0,
  totalTasksCompleted: 0,
  unlockedAchievements: [],
  pendingAchievements: [],
  fastestProject: null,
  noProcrastinationProject: false,
};

function checkAchievements(gameState) {
  const newAchievements = [];
  const level = getLevel(gameState.xp);
  const stateForCheck = { ...gameState, level };

  for (const achievement of ACHIEVEMENTS) {
    if (
      !gameState.unlockedAchievements.includes(achievement.id) &&
      achievement.condition(stateForCheck)
    ) {
      newAchievements.push(achievement);
    }
  }
  return newAchievements;
}

function updateStreak(gameState) {
  const today = new Date().toDateString();
  const lastActive = gameState.lastActiveDate;

  if (lastActive === today) return gameState;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastActive === yesterday.toDateString()) {
    return { ...gameState, streak: gameState.streak + 1, lastActiveDate: today };
  }

  return { ...gameState, streak: 1, lastActiveDate: today };
}

function gameReducer(state, action) {
  let newState = { ...state };

  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...action.payload,
        pendingAchievements: state.pendingAchievements || [],
      };

    case 'ADD_XP': {
      newState.xp = state.xp + action.payload;
      newState = updateStreak(newState);
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        const achievementXp = newAchievements.reduce((sum, a) => sum + a.xp, 0);
        newState.xp += achievementXp;
        newState.unlockedAchievements = [
          ...newState.unlockedAchievements,
          ...newAchievements.map((a) => a.id),
        ];
        newState.pendingAchievements = [
          ...newState.pendingAchievements,
          ...newAchievements,
        ];
      }
      return newState;
    }

    case 'TASK_CREATED':
      newState.totalTasksCreated = state.totalTasksCreated + 1;
      newState = updateStreak(newState);
      return newState;

    case 'TASK_COMPLETED':
      newState.totalTasksCompleted = state.totalTasksCompleted + 1;
      return newState;

    case 'PROJECT_COMPLETED': {
      newState.totalProjectsCompleted = state.totalProjectsCompleted + 1;
      const duration = action.payload?.duration;
      if (duration && (!state.fastestProject || duration < state.fastestProject)) {
        newState.fastestProject = duration;
      }
      if (action.payload?.noProcrastination) {
        newState.noProcrastinationProject = true;
      }
      // Also add XP and check achievements right here so totalProjectsCompleted is up-to-date
      newState.xp = newState.xp + (action.payload?.xp || 50);
      newState = updateStreak(newState);
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        const achievementXp = newAchievements.reduce((sum, a) => sum + a.xp, 0);
        newState.xp += achievementXp;
        newState.unlockedAchievements = [
          ...newState.unlockedAchievements,
          ...newAchievements.map((a) => a.id),
        ];
        newState.pendingAchievements = [
          ...newState.pendingAchievements,
          ...newAchievements,
        ];
      }
      return newState;
    }

    case 'DISMISS_ACHIEVEMENT':
      newState.pendingAchievements = state.pendingAchievements.filter(
        (a) => a.id !== action.payload
      );
      return newState;

    case 'CHECK_STREAK':
      return updateStreak(newState);

    default:
      return state;
  }
}

const initialProjectsState = {
  projects: [],
  completedProjects: [],
  activeProjectId: null,
};

function projectsReducer(state, action) {
  switch (action.type) {
    case 'LOAD_PROJECTS':
      return {
        ...state,
        projects: action.payload.projects,
        completedProjects: action.payload.completedProjects,
      };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        activeProjectId: action.payload.id,
      };

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload };

    case 'GO_TO_LIST':
      return { ...state, activeProjectId: null };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        activeProjectId:
          state.activeProjectId === action.payload ? null : state.activeProjectId,
      };

    case 'RENAME_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? { ...p, name: action.payload.name } : p
        ),
      };

    case 'ADD_TASK': {
      const { projectId, task } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p
        ),
      };
    }

    case 'UPDATE_TASK': {
      const { projectId, taskId, updates } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
              }
            : p
        ),
      };
    }

    case 'MOVE_TASK': {
      const { projectId, taskId, newColumn } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) => {
                  if (t.id !== taskId) return t;
                  const updates = { column: newColumn };
                  if (newColumn === 'em_producao' && !t.movedToProductionAt) {
                    updates.movedToProductionAt = Date.now();
                  }
                  if (newColumn === 'pronto' && !t.movedToProntoAt) {
                    updates.movedToProntoAt = Date.now();
                  }
                  if (newColumn !== 'pronto') {
                    updates.movedToProntoAt = null;
                  }
                  if (newColumn === 'novo') {
                    updates.movedToProductionAt = null;
                  }
                  return { ...t, ...updates };
                }),
              }
            : p
        ),
      };
    }

    case 'DELETE_TASK': {
      const { projectId, taskId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
            : p
        ),
      };
    }

    case 'COMPLETE_PROJECT': {
      const project = state.projects.find((p) => p.id === action.payload);
      if (!project) return state;
      const completedProject = {
        ...project,
        completedAt: Date.now(),
        tasks: project.tasks.map((t) => ({
          ...t,
          timeInProduction: calculateTimeInProduction(t),
        })),
      };
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        completedProjects: [...state.completedProjects, completedProject],
        activeProjectId: null,
      };
    }

    case 'DELETE_COMPLETED_PROJECT':
      return {
        ...state,
        completedProjects: state.completedProjects.filter(
          (p) => p.id !== action.payload
        ),
      };

    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const { user } = useAuth();

  const [projectsState, projectsDispatch] = useReducer(
    projectsReducer,
    initialProjectsState
  );
  const [gameState, gameDispatch] = useReducer(gameReducer, initialGameState);
  const [dataLoading, setDataLoading] = useState(true);

  // XP floating text
  const [xpFloats, setXpFloats] = useState([]);
  const xpFloatIdRef = useRef(0);

  const showXpFloat = useCallback((amount) => {
    const id = ++xpFloatIdRef.current;
    setXpFloats((prev) => [...prev, { id, amount }]);
    setTimeout(() => {
      setXpFloats((prev) => prev.filter((f) => f.id !== id));
    }, 1500);
  }, []);

  // =============================
  // Load data from Supabase on mount / user change
  // =============================
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setDataLoading(true);
      try {
        const [projectData, gameData] = await Promise.all([
          fetchProjects(user.id),
          fetchGameState(user.id),
        ]);

        if (cancelled) return;

        projectsDispatch({ type: 'LOAD_PROJECTS', payload: projectData });
        if (gameData) {
          gameDispatch({ type: 'LOAD_STATE', payload: gameData });
        }
      } catch (err) {
        console.error('Erro ao carregar dados do Supabase:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [user]);

  // =============================
  // Save game state to Supabase whenever it changes
  // =============================
  const gameStateRef = useRef(gameState);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!user || dataLoading) return;

    // Debounce saves to avoid hammering the DB
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      // Strip pendingAchievements before saving (it's UI-only)
      const { pendingAchievements, ...toSave } = gameStateRef.current;
      saveGameState(user.id, toSave).catch((err) =>
        console.error('Erro ao salvar game state:', err)
      );
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [gameState, user, dataLoading]);

  // Check streak on mount
  useEffect(() => {
    if (user && !dataLoading) {
      gameDispatch({ type: 'CHECK_STREAK' });
    }
  }, [user, dataLoading]);

  // =============================
  // Wrapped actions with XP + Supabase writes
  // =============================
  const createProject = useCallback(
    async (name) => {
      if (!user) return;
      try {
        const newProject = await createProjectDB(user.id, name);
        projectsDispatch({ type: 'ADD_PROJECT', payload: newProject });
      } catch (err) {
        console.error('Erro ao criar projeto:', err);
      }
    },
    [user]
  );

  const addTask = useCallback(
    async (projectId, title) => {
      if (!user) return;
      try {
        const newTask = await createTaskDB(user.id, projectId, title);
        projectsDispatch({ type: 'ADD_TASK', payload: { projectId, task: newTask } });
        gameDispatch({ type: 'TASK_CREATED' });
      } catch (err) {
        console.error('Erro ao criar tarefa:', err);
      }
    },
    [user]
  );

  const moveTask = useCallback(
    async (projectId, taskId, newColumn) => {
      const project = projectsState.projects.find((p) => p.id === projectId);
      const task = project?.tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Compute updates locally
      const updates = { column: newColumn };
      if (newColumn === 'em_producao' && !task.movedToProductionAt) {
        updates.movedToProductionAt = Date.now();
      }
      if (newColumn === 'pronto' && !task.movedToProntoAt) {
        updates.movedToProntoAt = Date.now();
      }
      if (newColumn !== 'pronto') {
        updates.movedToProntoAt = null;
      }
      if (newColumn === 'novo') {
        updates.movedToProductionAt = null;
      }

      // Update locally first (optimistic)
      projectsDispatch({
        type: 'MOVE_TASK',
        payload: { projectId, taskId, newColumn },
      });

      // Track task completion for achievements (no XP here)
      if (newColumn === 'pronto' && task.column === 'em_producao') {
        gameDispatch({ type: 'TASK_COMPLETED' });
      }

      // Save to Supabase
      try {
        await updateTaskDB(taskId, updates);
      } catch (err) {
        console.error('Erro ao mover tarefa:', err);
      }
    },
    [projectsState.projects]
  );

  const completeProject = useCallback(
    async (projectId) => {
      const project = projectsState.projects.find((p) => p.id === projectId);
      if (!project) return null;

      const duration = Date.now() - project.createdAt;
      const noProcrastination = project.tasks.every((t) => {
        if (!t.movedToProductionAt) return true;
        const time = calculateTimeInProduction(t);
        return !time || time.totalMs < 48 * 60 * 60 * 1000;
      });

      // Update locally
      projectsDispatch({ type: 'COMPLETE_PROJECT', payload: projectId });
      const taskCount = project.tasks.length;
      gameDispatch({
        type: 'PROJECT_COMPLETED',
        payload: { duration, noProcrastination, xp: 50, taskCount },
      });
      showXpFloat(50);

      // Save to Supabase
      try {
        await completeProjectDB(projectId);
      } catch (err) {
        console.error('Erro ao completar projeto:', err);
      }

      return {
        project,
        duration,
        xpGained: 50,
      };
    },
    [projectsState.projects, showXpFloat]
  );

  const updateTask = useCallback(
    async (projectId, taskId, updates) => {
      projectsDispatch({
        type: 'UPDATE_TASK',
        payload: { projectId, taskId, updates },
      });

      try {
        await updateTaskDB(taskId, updates);
      } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
      }
    },
    []
  );

  const deleteTaskAction = useCallback(
    async (projectId, taskId) => {
      projectsDispatch({
        type: 'DELETE_TASK',
        payload: { projectId, taskId },
      });

      try {
        await deleteTaskDB(taskId);
      } catch (err) {
        console.error('Erro ao deletar tarefa:', err);
      }
    },
    []
  );

  const deleteProject = useCallback(
    async (id) => {
      projectsDispatch({ type: 'DELETE_PROJECT', payload: id });

      try {
        await deleteProjectDB(id);
      } catch (err) {
        console.error('Erro ao deletar projeto:', err);
      }
    },
    []
  );

  const deleteCompletedProject = useCallback(
    async (id) => {
      projectsDispatch({ type: 'DELETE_COMPLETED_PROJECT', payload: id });

      try {
        await deleteProjectDB(id);
      } catch (err) {
        console.error('Erro ao deletar projeto concluído:', err);
      }
    },
    []
  );

  const renameProject = useCallback(
    async (id, name) => {
      projectsDispatch({ type: 'RENAME_PROJECT', payload: { id, name } });

      try {
        await renameProjectDB(id, name);
      } catch (err) {
        console.error('Erro ao renomear projeto:', err);
      }
    },
    []
  );

  const value = {
    // Project state
    projects: projectsState.projects,
    completedProjects: projectsState.completedProjects,
    activeProjectId: projectsState.activeProjectId,

    // Game state
    gameState,
    xpFloats,
    dataLoading,

    // Project actions
    createProject,
    setActiveProject: (id) =>
      projectsDispatch({ type: 'SET_ACTIVE_PROJECT', payload: id }),
    goToList: () => projectsDispatch({ type: 'GO_TO_LIST' }),
    deleteProject,
    deleteCompletedProject,
    renameProject,

    // Task actions
    addTask,
    updateTask,
    moveTask,
    deleteTask: deleteTaskAction,
    completeProject,

    // Game actions
    dismissAchievement: (id) =>
      gameDispatch({ type: 'DISMISS_ACHIEVEMENT', payload: id }),

    // Utilities
    calculateTimeInProduction,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
