import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { OrderContract } from '../types';
import { auth } from './firebaseAuth';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Recursively strips undefined values so Firestore setDoc never fails with
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) {
    return null;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned;
}

const ORDERS_COLLECTION = 'orders';

/**
 * Subscribes to the real-time orders collection in Firestore.
 */
export const subscribeToRealtimeOrders = (
  onUpdate: (orders: OrderContract[]) => void,
  onError?: (err: any) => void
) => {
  const colRef = collection(db, ORDERS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }

      const remoteOrders: OrderContract[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as OrderContract;
        remoteOrders.push(data);
      });

      // Sort by updatedAt descending
      remoteOrders.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(remoteOrders);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ORDERS_COLLECTION);
      if (onError) onError(err);
    }
  );
};

/**
 * Saves a new or updated order to Firestore in real-time.
 */
export const syncOrderToFirestore = async (order: OrderContract) => {
  const docRef = doc(db, ORDERS_COLLECTION, order.id);
  try {
    const rawData = {
      ...order,
      tacticalNotes: Array.isArray(order.tacticalNotes) ? order.tacticalNotes : [],
      threats: Array.isArray(order.threats) ? order.threats : [],
      updatedAt: Date.now(),
    };
    const sanitized = sanitizeForFirestore(rawData);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    throw err;
  }
};

/**
 * Deletes an order from Firestore in real-time.
 */
export const deleteOrderFromFirestore = async (orderId: string) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    throw err;
  }
};

/**
 * Completely clears ALL orders from Firestore.
 */
export const clearAllOrdersFromFirestore = async () => {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);

    snap.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, ORDERS_COLLECTION);
    throw err;
  }
};
