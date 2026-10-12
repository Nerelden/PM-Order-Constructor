import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const loginWithEmail = async (email: string, pass: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
};

export const registerWithEmail = async (email: string, pass: string): Promise<User> => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
};

export const logout = async (): Promise<void> => {
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
    default:
      return err?.message || 'Произошла ошибка при аутентификации.';
  }
};
