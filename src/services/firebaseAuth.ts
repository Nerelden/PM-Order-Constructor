import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GUEST_SESSION_KEY = 'pm_is_guest_session';

/**
 * Checks if the current user has guest (read-only) status.
 */
export const isGuestUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.isAnonymous) return true;
  if (typeof window !== 'undefined' && localStorage.getItem(GUEST_SESSION_KEY) === 'true') {
    return true;
  }
  return false;
};

/**
 * Helper to construct a local guest session user fallback
 */
const createLocalGuestUser = (): User => {
  return {
    uid: 'guest-preview-session',
    isAnonymous: true,
    email: null,
    displayName: 'Гость (Только чтение)',
    photoURL: null,
    phoneNumber: null,
    emailVerified: false,
    providerId: 'anonymous',
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
  } as unknown as User;
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.isAnonymous) {
        if (typeof window !== 'undefined') localStorage.setItem(GUEST_SESSION_KEY, 'true');
      } else {
        if (typeof window !== 'undefined') localStorage.removeItem(GUEST_SESSION_KEY);
      }
      callback(user);
    } else {
      // Check if user previously chose guest mode
      if (typeof window !== 'undefined' && localStorage.getItem(GUEST_SESSION_KEY) === 'true') {
        callback(createLocalGuestUser());
      } else {
        callback(null);
      }
    }
  });
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  if (typeof window !== 'undefined') localStorage.removeItem(GUEST_SESSION_KEY);
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
};

export const registerWithEmail = async (email: string, pass: string): Promise<User> => {
  if (typeof window !== 'undefined') localStorage.removeItem(GUEST_SESSION_KEY);
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
};

/**
 * Signs in as an anonymous guest with read-only permissions.
 * Falls back to local guest session if Firebase Anonymous provider is not enabled in Firebase Console.
 */
export const loginAsGuest = async (): Promise<User> => {
  if (typeof window !== 'undefined') localStorage.setItem(GUEST_SESSION_KEY, 'true');
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err: any) {
    console.warn('Firebase anonymous sign in notice (using local guest session):', err?.message || err);
    return createLocalGuestUser();
  }
};

export const logout = async (): Promise<void> => {
  if (typeof window !== 'undefined') localStorage.removeItem(GUEST_SESSION_KEY);
  await signOut(auth);
};

export const getAuthErrorMessage = (err: any): string => {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверный адрес электронной почты или пароль.';
    case 'auth/email-already-in-use':
      return 'Пользователь с таким email уже зарегистрирован.';
    case 'auth/weak-password':
      return 'Пароль слишком слабый (минимум 6 символов).';
    case 'auth/invalid-email':
      return 'Некорректный формат адреса электронной почты.';
    case 'auth/too-many-requests':
      return 'Слишком много попыток входа. Пожалуйста, подождите немного.';
    case 'auth/network-request-failed':
      return 'Ошибка сети. Проверьте подключение к интернету.';
    case 'auth/operation-not-allowed':
      return 'Данный метод аутентификации отключен в настройках проекта.';
    default:
      return err?.message || 'Произошла ошибка при аутентификации.';
  }
};
