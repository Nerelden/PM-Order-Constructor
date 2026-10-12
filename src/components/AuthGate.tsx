import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { loginWithEmail, getAuthErrorMessage } from '../services/firebaseAuth';
import { LOGO_HAN_PNG, LOGO_HAN_DATA_URL } from '../assets/logo';

interface AuthGateProps {
  onSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Пожалуйста, введите email и пароль.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(trimmedEmail, password);
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0c10] text-stone-100 relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0c10] to-[#050608] pointer-events-none" />

      {/* Decorative Roman Numeral watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[260px] font-cinzel font-black opacity-[0.02] text-amber-400 pointer-events-none">
        H
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#12141a]/95 backdrop-blur-md border border-amber-900/50 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <img
            src={LOGO_HAN_PNG}
            alt="Герб Ассоциации Хана"
            className="w-14 h-14 mx-auto object-contain drop-shadow-lg select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = LOGO_HAN_DATA_URL;
            }}
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-[10px] font-mono uppercase text-red-300 font-bold mb-1">
              <Lock className="w-3 h-3 text-red-400" />
              <span>ЗАКРЫТЫЙ РЕЕСТР • ДОСТУП ОГРАНИЧЕН</span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-stone-100">
              АРХИВ КОНТРАКТОВ ГОРОДА
            </h1>
            <p className="text-xs text-stone-400 font-mono-code mt-0.5">
              Вход в единую базу данных заказов и ассоциаций
            </p>
          </div>
        </div>

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Электронная почта (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fixer@city-association.org"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 font-mono">
              Пароль
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-300"
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all font-mono"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Проверка учетных данных...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Войти в систему</span>
              </>
            )}
          </button>
        </form>

        <div className="border-t border-stone-800/80 pt-4 text-center text-[11px] font-mono text-stone-500 space-y-1">
          <div>Доступ разрешен только зарегистрированным сотрудникам</div>
          <div className="text-[10px] text-stone-600">Синхронизация Firestore • PM-Order-Constructor</div>
        </div>
      </div>
    </div>
  );
};
