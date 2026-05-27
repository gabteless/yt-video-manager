import { useState } from 'react';
import { useAuth } from '../store/AuthProvider';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Configure o Supabase no arquivo .env antes de fazer login.');
      return;
    }
    
    if (!email || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Preencha seu nome para se cadastrar.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
        setSuccessMsg('Cadastro realizado com sucesso! Se o Supabase exigir confirmação por e-mail, verifique sua caixa de entrada antes de fazer login.');
        // Clear registration fields and transition to signin
        setName('');
        setEmail('');
        setPassword('');
        setMode('signin');
      }
    } catch (err) {
      console.error(err);
      if (err.message === 'Invalid login credentials' || err.message === 'Email not confirmed') {
        if (err.message === 'Email not confirmed') {
          setError('Confirme seu e-mail antes de fazer login.');
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } else if (err.message === 'User already registered') {
        setError('Este e-mail já está cadastrado.');
      } else {
        setError(err.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, var(--color-xp-bar-glow) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Login Card */}
      <div className="glass-strong rounded-2xl p-8 md:p-10 max-w-md w-full text-center relative z-10 animate-fade-in-scale">
        {/* Logo / Icon */}
        <div className="mb-6">
          <div className="text-6xl mb-3 animate-float">🎬</div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 select-none">
            YT Video Manager
          </h1>
          <p className="text-xs text-white/40 select-none">
            By: Misterium
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-accent/40 to-transparent mx-auto mb-6" />

        {/* Config Warning */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-left animate-fade-in-up">
            <p className="text-yellow-400 text-sm font-bold mb-2">⚠️ Supabase não configurado</p>
            <p className="text-yellow-400/70 text-xs leading-relaxed">
              Edite o arquivo <code className="bg-white/10 px-1.5 py-0.5 rounded text-yellow-300">.env</code> na raiz do projeto com suas credenciais:
            </p>
            <pre className="mt-2 text-[10px] text-yellow-300/60 bg-black/20 rounded-lg p-2 overflow-x-auto">
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon`}
            </pre>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs leading-relaxed text-left animate-fade-in-up animate-pulse-glow">
            <p className="font-bold mb-1">🎉 Sucesso!</p>
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="text-left animate-fade-in-up">
              <label htmlFor="name" className="block text-[10px] font-bold text-white/40 mb-1.5 tracking-wider uppercase">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
              />
            </div>
          )}

          <div className="text-left">
            <label htmlFor="email" className="block text-[10px] font-bold text-white/40 mb-1.5 tracking-wider uppercase">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
            />
          </div>

          <div className="text-left">
            <label htmlFor="password" className="block text-[10px] font-bold text-white/40 mb-1.5 tracking-wider uppercase">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-200"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left animate-fade-in-up">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isSupabaseConfigured}
            className={`
              w-full flex items-center justify-center gap-2
              px-6 py-3.5 rounded-xl
              bg-accent text-white font-bold text-sm
              hover:bg-accent/80 hover:shadow-lg hover:shadow-accent/20
              active:scale-[0.98]
              transition-all duration-200
              shadow-lg shadow-black/20
              ${isLoading || !isSupabaseConfigured ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                {mode === 'signin' ? 'Entrar com E-mail' : 'Criar Conta'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-sm">
          {mode === 'signin' ? (
            <p className="text-white/40">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-accent hover:text-accent/80 font-bold cursor-pointer transition-all"
              >
                Cadastre-se
              </button>
            </p>
          ) : (
            <p className="text-white/40">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="text-accent hover:text-accent/80 font-bold cursor-pointer transition-all"
              >
                Entre aqui
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-[10px] text-white/20">
          Seus projetos e conquistas são sincronizados em tempo real com o Supabase ☁️
        </p>
      </div>
    </div>
  );
}
