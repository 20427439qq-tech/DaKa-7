import { auth } from '../firebase';

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  const errorMessage = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorMessage);
  
  // Only throw if it's a permission error. We don't throw on quota errors 
  // because it causes unhandled promise rejections and the Firebase SDK 
  // already handles retries/backoff internally.
  if (
    errInfo.error.includes('permission') || 
    errInfo.error.includes('Missing or insufficient permissions')
  ) {
    throw new Error(errorMessage);
  }
  
  // For quota errors, we just log and return so the app doesn't crash
  if (
    errInfo.error.includes('resource-exhausted') ||
    errInfo.error.includes('Quota exceeded')
  ) {
    console.warn("Firebase Quota Exceeded. The app will sync data when quota is restored.");
  }
  
  return errInfo;
}
