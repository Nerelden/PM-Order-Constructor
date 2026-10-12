import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth();
const provider = new GoogleAuthProvider();

provider.addScope('https://googleapis.com');

// Локальные переменные для хранения токена сессии
let currentToken: string | null = null;

export const initAuth = () => {
  return auth;
};

export const setAccessToken = (token: string | null) => {
  currentToken = token;
};

export const getAccessToken = (): string | null => {
  return currentToken;
};

export const googleSignIn = async (): Promise<{ user: User; token: string | null }> => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || null;
  
  if (token) {
    setAccessToken(token);
  }
  
  return { user: result.user, token };
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  setAccessToken(null);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
