export const ACHIEVEMENTS = [
  // === Primeiros Passos ===
  {
    id: 'first_task',
    icon: '📝',
    title: 'Primeira Cena',
    description: 'Crie sua primeira tarefa',
    xp: 15,
    condition: (state) => state.totalTasksCreated >= 1,
  },
  {
    id: 'first_take',
    icon: '🎬',
    title: 'Primeiro Take',
    description: 'Complete seu primeiro projeto',
    xp: 50,
    condition: (state) => state.totalProjectsCompleted >= 1,
  },

  // === Projetos ===
  {
    id: 'three_projects',
    icon: '🎞️',
    title: 'Trilogia',
    description: 'Complete 3 projetos',
    xp: 75,
    condition: (state) => state.totalProjectsCompleted >= 3,
  },
  {
    id: 'five_projects',
    icon: '🌟',
    title: 'Estrela em Ascensão',
    description: 'Complete 5 projetos',
    xp: 100,
    condition: (state) => state.totalProjectsCompleted >= 5,
  },
  {
    id: 'veteran',
    icon: '🏆',
    title: 'Produtor Veterano',
    description: 'Complete 10 projetos',
    xp: 200,
    condition: (state) => state.totalProjectsCompleted >= 10,
  },
  {
    id: 'content_machine',
    icon: '📹',
    title: 'Máquina de Conteúdo',
    description: 'Complete 25 projetos',
    xp: 500,
    condition: (state) => state.totalProjectsCompleted >= 25,
  },
  {
    id: 'fifty_projects',
    icon: '🎥',
    title: 'Estúdio Próprio',
    description: 'Complete 50 projetos',
    xp: 750,
    condition: (state) => state.totalProjectsCompleted >= 50,
  },
  {
    id: 'hundred_projects',
    icon: '👑',
    title: 'Lenda do YouTube',
    description: 'Complete 100 projetos',
    xp: 1500,
    condition: (state) => state.totalProjectsCompleted >= 100,
  },

  // === Tarefas ===
  {
    id: 'ten_tasks',
    icon: '📋',
    title: 'Organizador',
    description: 'Crie 10 tarefas',
    xp: 30,
    condition: (state) => state.totalTasksCreated >= 10,
  },
  {
    id: 'fifty_tasks',
    icon: '📑',
    title: 'Detalhista',
    description: 'Crie 50 tarefas',
    xp: 100,
    condition: (state) => state.totalTasksCreated >= 50,
  },
  {
    id: 'hundred_tasks',
    icon: '🗂️',
    title: 'Mestre do Planejamento',
    description: 'Crie 100 tarefas',
    xp: 200,
    condition: (state) => state.totalTasksCreated >= 100,
  },
  {
    id: 'task_slayer',
    icon: '⚔️',
    title: 'Destruidor de Tasks',
    description: 'Complete 50 tarefas',
    xp: 150,
    condition: (state) => state.totalTasksCompleted >= 50,
  },
  {
    id: 'task_legend',
    icon: '🐉',
    title: 'Lenda das Tarefas',
    description: 'Complete 200 tarefas',
    xp: 400,
    condition: (state) => state.totalTasksCompleted >= 200,
  },

  // === Velocidade ===
  {
    id: 'speedster',
    icon: '⚡',
    title: 'Velocista',
    description: 'Complete um projeto em menos de 24h',
    xp: 100,
    condition: (state) => state.fastestProject && state.fastestProject < 24 * 60 * 60 * 1000,
  },
  {
    id: 'flash',
    icon: '💨',
    title: 'Flash',
    description: 'Complete um projeto em menos de 1h',
    xp: 200,
    condition: (state) => state.fastestProject && state.fastestProject < 60 * 60 * 1000,
  },

  // === Streak ===
  {
    id: 'on_fire_3',
    icon: '🔥',
    title: 'Em Chamas',
    description: 'Mantenha um streak de 3 dias',
    xp: 75,
    condition: (state) => state.streak >= 3,
  },
  {
    id: 'marathon_7',
    icon: '⏱️',
    title: 'Maratonista',
    description: 'Mantenha um streak de 7 dias',
    xp: 150,
    condition: (state) => state.streak >= 7,
  },
  {
    id: 'streak_14',
    icon: '🌋',
    title: 'Imparável',
    description: 'Mantenha um streak de 14 dias',
    xp: 250,
    condition: (state) => state.streak >= 14,
  },
  {
    id: 'streak_30',
    icon: '🏔️',
    title: 'Mês de Ferro',
    description: 'Mantenha um streak de 30 dias',
    xp: 500,
    condition: (state) => state.streak >= 30,
  },
  {
    id: 'streak_60',
    icon: '🌌',
    title: 'Disciplina Absoluta',
    description: 'Mantenha um streak de 60 dias',
    xp: 1000,
    condition: (state) => state.streak >= 60,
  },

  // === Qualidade ===
  {
    id: 'no_procrastination',
    icon: '🎯',
    title: 'Sem Procrastinar',
    description: 'Finalize um projeto sem nenhuma task ficando mais de 48h em produção',
    xp: 100,
    condition: (state) => state.noProcrastinationProject === true,
  },

  // === Níveis ===
  {
    id: 'level_3',
    icon: '🥉',
    title: 'Nível 3',
    description: 'Alcance o nível 3',
    xp: 50,
    condition: (state) => state.level >= 3,
  },
  {
    id: 'level_5',
    icon: '⭐',
    title: 'Nível 5',
    description: 'Alcance o nível 5',
    xp: 100,
    condition: (state) => state.level >= 5,
  },
  {
    id: 'level_10',
    icon: '💎',
    title: 'Diamante',
    description: 'Alcance o nível 10',
    xp: 300,
    condition: (state) => state.level >= 10,
  },
  {
    id: 'level_15',
    icon: '🔮',
    title: 'Místico',
    description: 'Alcance o nível 15',
    xp: 500,
    condition: (state) => state.level >= 15,
  },
  {
    id: 'level_20',
    icon: '🌠',
    title: 'Transcendente',
    description: 'Alcance o nível 20',
    xp: 750,
    condition: (state) => state.level >= 20,
  },
  {
    id: 'level_25',
    icon: '☄️',
    title: 'Celestial',
    description: 'Alcance o nível 25',
    xp: 1000,
    condition: (state) => state.level >= 25,
  },

  // === XP Total ===
  {
    id: 'xp_500',
    icon: '💰',
    title: 'Meio Mil',
    description: 'Acumule 500 XP',
    xp: 50,
    condition: (state) => state.xp >= 500,
  },
  {
    id: 'xp_1000',
    icon: '💎',
    title: 'Milhar',
    description: 'Acumule 1.000 XP',
    xp: 100,
    condition: (state) => state.xp >= 1000,
  },
  {
    id: 'xp_5000',
    icon: '🏦',
    title: 'Cofre Cheio',
    description: 'Acumule 5.000 XP',
    xp: 250,
    condition: (state) => state.xp >= 5000,
  },
  {
    id: 'xp_10000',
    icon: '🌟',
    title: 'Lendário',
    description: 'Acumule 10.000 XP',
    xp: 500,
    condition: (state) => state.xp >= 10000,
  },
];

export const MOTIVATIONAL_PHRASES = [
  "🎬 Mais um vídeo pro mundo! Continue assim!",
  "🚀 Produtividade em alta! Você é uma máquina!",
  "💪 Cada vídeo é um passo a mais na sua jornada!",
  "🔥 Tá ON FIRE! Ninguém te segura!",
  "⭐ Conteúdo de qualidade leva tempo, mas você entrega!",
  "🏆 Champion! Mais uma produção finalizada!",
  "📈 Sua consistência é admirável. Keep going!",
  "🎯 Foco total! Esse vídeo vai bombar!",
  "✨ Excelente trabalho! O canal cresce a cada upload!",
  "🎪 Show! Mais um projeto entregue com sucesso!",
];

export const LEVEL_TITLES = [
  'Iniciante',          // 1
  'Aprendiz',           // 2
  'Roteirista',         // 3
  'Cinegrafista',       // 4
  'Editor Jr.',         // 5
  'Editor',             // 6
  'Produtor',           // 7
  'Diretor',            // 8
  'Diretor Criativo',   // 9
  'Mestre',             // 10
  'Grão-Mestre',        // 11
  'Especialista',       // 12
  'Guru',               // 13
  'Visionário',         // 14
  'Ícone',              // 15
  'Lenda',              // 16
  'Mítico',             // 17
  'Imortal',            // 18
  'Transcendente',      // 19
  'Celestial',          // 20
  'Divindade',          // 21
  'Criador Supremo',    // 22
  'Além do Infinito',   // 23
  'O Absoluto',         // 24
  'O Todo-Poderoso',    // 25+
];

export function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

export function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

export function getXpForLevel(level) {
  return (level - 1) * 100;
}

export function getXpProgress(xp) {
  const level = getLevel(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
}
