export type AuditRecord = {
  id: string; timestamp: string; actor: string; actorId: string; role: string;
  action: string; category: string; target: string; targetId: string;
  description: string; before: string; after: string; result: 'Success'|'Failed'|'Blocked';
  ip: string; userAgent: string;
};
const KEY = 'alpha-mate-audit-ledger-v1';
export function readAuditLogs(): AuditRecord[] {
  try { const value = localStorage.getItem(KEY); return value ? JSON.parse(value) as AuditRecord[] : []; }
  catch { return []; }
}
export function logAudit(input: Partial<AuditRecord> & Pick<AuditRecord,'action'|'category'|'description'>) {
  const record: AuditRecord = {
    id: 'AM-AUD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase(),
    timestamp: new Date().toISOString(),
    actor: input.actor || 'Super Admin (Preview)',
    actorId: input.actorId || '',
    role: input.role || 'Super Admin',
    action: input.action,
    category: input.category,
    target: input.target || 'Admin Workspace',
    targetId: input.targetId || '',
    description: input.description,
    before: input.before || '',
    after: input.after || '',
    result: input.result || 'Success',
    ip: '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  };
  const records = readAuditLogs();
  try { localStorage.setItem(KEY, JSON.stringify([record, ...records].slice(0,10000))); }
  catch { /* Storage failure must not break the admin action. */ }
  return record;
}
