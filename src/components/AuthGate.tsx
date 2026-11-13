import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { loginWithEmail, loginAsGuest, getAuthErrorMessage } from '../services/firebaseAuth';
import { LOGO_HAN_PNG, LOGO_HAN_DATA_URL } from '../assets/logo';
import { RuinaCornerFrame, RuinaDiamondDivider } from './RuinaOrnaments';

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

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginAsGuest();
    } catch (err: any) {
      console.error('Guest login error:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ruina-stage-bg min-h-screen flex items-center justify-center p-4 text-[#efe6d5] relative overflow-hidden select-none">
      {/* Subtle Architectural Halo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(216,180,99,0.06)_0%,transparent_65%)] pointer-events-none" />

      {/* Decorative Crest Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[260px] font-cinzel font-black opacity-[0.03] text-[#d8b463] pointer-events-none">
        H
      </div>

      <div className="modal-panel ruina-panel rounded-sm relative z-10 w-full max-w-lg p-7 sm:p-9 space-y-6">
        <RuinaCornerFrame size={14} />

        {/* Invitation Gate Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-20 h-20 mx-auto rounded-sm bg-[#09070b] border border-[#d8b463]/45 flex items-center justify-center shadow-[0_0_25px_rgba(216,180,99,0.16)] relative">
            <img
              src={LOGO_HAN_PNG}
              alt="Герб Ассоциации Хана"
              className="w-14 h-14 object-contain drop-shadow-lg select-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = LOGO_HAN_DATA_URL;
              }}
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2c0d11]/90 border border-[#9f1d22]/70 text-xs font-mono uppercase text-red-200 font-bold mb-2 tracking-wider">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>ЗАКРЫТЫЙ РЕЕСТР • ВХОД ПО ПРИГЛАШЕНИЮ</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide text-[#f3ead8]">
              АРХИВ КОНТРАКТОВ ГОРОДА
            </h1>
            <p className="text-xs sm:text-sm text-[#b3a48e] font-mono-code mt-1">
              Единый каталог приглашений, свитков и поручений ассоциаций
            </p>
          </div>
        </div>

        <RuinaDiamondDivider />

        {/* Error notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-sm bg-[#2a0c10]/85 border border-red-600/50 text-xs sm:text-sm text-red-200 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#d8b463] uppercase tracking-wider mb-1.5 font-mono">
              Электронная почта (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8c7b63] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fixer@city-association.org"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#09070b] border border-[#d8b463]/30 rounded-sm text-sm text-[#efe6d5] placeholder-[#6e6150] focus:outline-none focus:border-[#d8b463] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d8b463] uppercase tracking-wider mb-1.5 font-mono">
              Пароль
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8c7b63] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#09070b] border border-[#d8b463]/30 rounded-sm text-sm text-[#efe6d5] placeholder-[#6e6150] focus:outline-none focus:border-[#d8b463] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#8c7b63] hover:text-[#f0d284] cursor-pointer"
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="ruina-btn-gold w-full py-3 rounded-sm disabled:opacity-50 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 font-mono cursor-pointer"
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

        <RuinaDiamondDivider label="или" />

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="ruina-btn-dark w-full py-3 rounded-sm font-mono text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-[#d8b463]" />
          <span>Войти как гость (Режим чтения)</span>
        </button>

        <p className="text-xs text-center text-[#b3a48e] font-mono leading-relaxed">
          Гостевой режим позволяет просматривать, разворачивать и печатать бланки без прав создания, изменения и удаления заказов.
        </p>

        <div className="border-t border-[#d8b463]/20 pt-4 text-center text-xs font-mono text-[#8c7b63] space-y-1">
          <div>Доступ к изменению разрешен только зарегистрированным сотрудникам</div>
          <div className="text-[11px] text-[#726451]">Синхронизация Firestore • Архив Ассоциации Хана</div>
        </div>
      </div>
    </div>
  );
};
