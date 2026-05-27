import { supabase } from './supabaseClient';

// =============================================
// PROJECTS
// =============================================

export async function fetchProjects(userId) {
  const { data: active, error: activeError } = await supabase
    .from('projects')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: true });

  if (activeError) throw activeError;

  const { data: completed, error: completedError } = await supabase
    .from('projects')
    .select('*, tasks(*)')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false });

  if (completedError) throw completedError;

  // Map DB format → app format
  const mapTask = (t) => ({
    id: t.id,
    title: t.title,
    column: t.column,
    urgency: t.urgency,
    createdAt: t.created_at,
    movedToProductionAt: t.moved_to_production_at,
    movedToProntoAt: t.moved_to_pronto_at,
  });

  const mapProject = (p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.created_at,
    completedAt: p.completed_at,
    tasks: (p.tasks || []).map(mapTask),
  });

  return {
    projects: (active || []).map(mapProject),
    completedProjects: (completed || []).map(mapProject),
  };
}

export async function createProjectDB(userId, name) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: name || 'Novo Projeto',
      created_at: Date.now(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    completedAt: null,
    tasks: [],
  };
}

export async function renameProjectDB(projectId, name) {
  const { error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', projectId);

  if (error) throw error;
}

export async function deleteProjectDB(projectId) {
  // Tasks are cascade-deleted via FK
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

export async function completeProjectDB(projectId) {
  const { error } = await supabase
    .from('projects')
    .update({ is_completed: true, completed_at: Date.now() })
    .eq('id', projectId);

  if (error) throw error;
}

// =============================================
// TASKS
// =============================================

export async function createTaskDB(userId, projectId, title) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      project_id: projectId,
      title: title || 'Nova tarefa',
      column: 'novo',
      urgency: 'baixa',
      created_at: Date.now(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    column: data.column,
    urgency: data.urgency,
    createdAt: data.created_at,
    movedToProductionAt: null,
    movedToProntoAt: null,
  };
}

export async function updateTaskDB(taskId, updates) {
  // Map app field names → DB column names
  const dbUpdates = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.column !== undefined) dbUpdates.column = updates.column;
  if (updates.urgency !== undefined) dbUpdates.urgency = updates.urgency;
  if (updates.movedToProductionAt !== undefined)
    dbUpdates.moved_to_production_at = updates.movedToProductionAt;
  if (updates.movedToProntoAt !== undefined)
    dbUpdates.moved_to_pronto_at = updates.movedToProntoAt;

  const { error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', taskId);

  if (error) throw error;
}

export async function deleteTaskDB(taskId) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

// =============================================
// GAME STATE
// =============================================

export async function fetchGameState(userId) {
  const { data, error } = await supabase
    .from('game_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no row exists yet, return defaults
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return {
    xp: data.xp,
    streak: data.streak,
    lastActiveDate: data.last_active_date,
    totalProjectsCompleted: data.total_projects_completed,
    totalTasksCreated: data.total_tasks_created,
    totalTasksCompleted: data.total_tasks_completed,
    unlockedAchievements: data.unlocked_achievements || [],
    fastestProject: data.fastest_project,
    noProcrastinationProject: data.no_procrastination_project,
  };
}

export async function saveGameState(userId, gameState) {
  const { error } = await supabase
    .from('game_state')
    .upsert({
      user_id: userId,
      xp: gameState.xp,
      streak: gameState.streak,
      last_active_date: gameState.lastActiveDate,
      total_projects_completed: gameState.totalProjectsCompleted,
      total_tasks_created: gameState.totalTasksCreated,
      total_tasks_completed: gameState.totalTasksCompleted,
      unlocked_achievements: gameState.unlockedAchievements,
      fastest_project: gameState.fastestProject,
      no_procrastination_project: gameState.noProcrastinationProject,
    });

  if (error) throw error;
}
