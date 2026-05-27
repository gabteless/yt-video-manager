import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './store/AuthProvider';
import { ProjectProvider, useProject } from './store/projectStore';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';
import GamePanel from './components/GamePanel';
import AchievementPopup from './components/AchievementPopup';
import ProjectCompletionModal from './components/ProjectCompletionModal';
import LoginPage from './components/LoginPage';

function XpFloats() {
  const { xpFloats } = useProject();

  return (
    <div className="fixed top-16 right-8 z-[80] pointer-events-none">
      {xpFloats.map((float) => (
        <div
          key={float.id}
          className="animate-xp-gain text-xp-bar-glow font-black text-lg"
        >
          +{float.amount} XP
        </div>
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center animate-fade-in-scale">
        <div className="text-6xl mb-4 animate-float">🎬</div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-white/40 text-sm font-medium">Carregando seus projetos...</span>
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 glass rounded-lg px-3 py-1.5
          hover:bg-white/[0.06] transition-all cursor-pointer"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold text-white">
            {displayName?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <span className="text-xs text-white/60 font-medium max-w-[120px] truncate hidden md:block">
          {displayName}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 glass-strong rounded-xl p-2 min-w-[180px] z-50 animate-fade-in-scale shadow-xl shadow-black/30">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/30 truncate">{user.email}</p>
            </div>
            <button
              onClick={async () => {
                setShowMenu(false);
                await signOut();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400
                hover:bg-red-500/10 transition-all flex items-center gap-2"
            >
              🚪 Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AppContent() {
  const { activeProjectId, dataLoading } = useProject();
  const [completionData, setCompletionData] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setCompletionData(e.detail);
    };
    window.addEventListener('project-completed', handler);
    return () => window.removeEventListener('project-completed', handler);
  }, []);

  if (dataLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 md:px-12 lg:px-16 xl:px-20 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-white tracking-tight select-none">
            YT Video Manager
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <GamePanel />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-16 xl:px-20 py-6">
        {activeProjectId ? <KanbanBoard /> : <ProjectList />}
      </main>

      {/* Floating Elements */}
      <XpFloats />
      <AchievementPopup />

      {/* Completion Modal */}
      {completionData && (
        <ProjectCompletionModal
          data={completionData}
          onClose={() => setCompletionData(null)}
        />
      )}
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in-scale">
          <div className="text-6xl mb-4 animate-float">🎬</div>
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
