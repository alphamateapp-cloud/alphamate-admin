import { router, json, requireAuth, requireAdminEmailAllowlist } from '@appdeploy/sdk';
import { secrets } from '@appdeploy/sdk';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const ADMIN_EMAILS = ['alphamateapp@gmail.com'];

async function getAdminFirestore() {
  const raw = await secrets.readSecret('FIREBASE_SERVICE_ACCOUNT_JSON');
  const serviceAccount = JSON.parse(raw) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Firebase service-account credential is incomplete.');
  }
  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
  return { firestore: getFirestore(app), projectId: serviceAccount.project_id };
}

export const handler = router({
  'GET /api/admin/firebase-status': [
    requireAuth(),
    requireAdminEmailAllowlist(ADMIN_EMAILS),
    async () => {
      try {
        const { firestore, projectId } = await getAdminFirestore();
        const collections = await firestore.listCollections();
        return json({
          ok: true,
          firebase: {
            connected: true,
            projectId,
            collectionCount: collections.length,
          },
          dataIntegration: {
            status: 'connection_verified',
            note: 'Firebase Admin SDK can reach Firestore. Dashboard collections and live metrics still need explicit mapping to the Alpha Mate app schema.',
          },
        });
      } catch {
        return json({
          ok: false,
          firebase: { connected: false },
          error: 'firebase_connection_failed',
          message: 'Firebase credentials or Firestore access could not be verified. Check the service account and Firestore permissions.',
        }, 503);
      }
    },
  ],
});
