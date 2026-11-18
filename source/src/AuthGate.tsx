import { useEffect, useState, type ReactNode } from 'react';
import { api, auth } from '@appdeploy/client';
import { LockKeyhole, ShieldCheck, Database, AlertTriangle, LogIn } from 'lucide-react';

const ADMIN_EMAIL = 'alphamateapp@gmail.com';

type User = { email?: string; name?: string; picture?: string };
type FirebaseStatus = { ok: boolean; firebase?: { connected: boolean; projectId: string; collectionCount: number } };

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatus | null>(null);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const current = await auth.getUser();
        if (!active) return;
        if (!current) {
          setLoading(false);
          return;
        }
        if ((current.email || '').toLowerCase() !== ADMIN_EMAIL) {
          await auth.signOut();
          if (active) {
            setMessage('This email is not authorized for Alpha Mate Super Admin access.');
            setLoading(false);
          }
          return;
        }
        const result = await api.get('/api/admin/firebase-status');
        if (!active) return;
        setUser(current);
        setFirebaseStatus(result.data as FirebaseStatus);
      } catch (err) {
        if (!active) return;
        const text = err instanceof Error ? err.message : 'Unable to verify your admin session.';
        if (text.includes('403') || text.toLowerCase().includes('forbidden')) {
          await auth.signOut();
          setMessage('Access denied. This account is not on the Super Admin allowlist.');
        } else {
          setUser(await auth.getUser());
          setFirebaseStatus({ ok: false });
          setMessage('Your admin login is valid, but the Firebase connection check failed. The workspace is available while the connection is reviewed.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    restore();
    return () => { active = false; };
  }, []);

  const signIn = async () => {
    setBusy(true);
    setMessage('');
    try {
      await auth.signInWithRedirect({ scope: 'openid email profile offline_access' });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to start secure email sign-in. Please try again.');
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="auth-screen"><div className="auth-card"><div className="auth-mark"><ShieldCheck size={30}/></div><h1>Verifying secure access</h1><p>Restoring your Alpha Mate administrator session…</p></div></div>;
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-mark"><img src="/resources/alpha-mate-logo.png" alt="Alpha Mate"/></div>
          <span className="auth-eyebrow">OFFICIAL ADMINISTRATION</span>
          <h1>Alpha Mate Admin</h1>
          <p className="auth-copy">Secure owner access for the Alpha Mate management workspace.</p>
          <div className="auth-account"><LockKeyhole size={17}/><span><small>Authorized Super Admin</small><b>{ADMIN_EMAIL}</b></span></div>
          {message && <div className="auth-message"><AlertTriangle size={16}/>{message}</div>}
          <button className="auth-submit" disabled={busy} onClick={signIn}><LogIn size={17}/>{busy ? 'Opening secure sign-in…' : 'Continue with email'}</button>
          <p className="auth-foot">AppDeploy will send a secure sign-in link to the authorized email address. Other accounts are not permitted.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="firebase-status-bar">
        <Database size={15}/>
        {firebaseStatus?.ok && firebaseStatus.firebase?.connected
          ? 'Firebase connected · ' + firebaseStatus.firebase.projectId
          : 'Firebase connection needs attention · Admin login is protected'}
      </div>
      {children}
    </>
  );
}
