import { useMemo, useState } from 'react';
import { auth } from '@appdeploy/client';
import AuthGate from './AuthGate';
import {
  AlertTriangle, BadgeCheck, Ban, CheckCircle, Download, Mail, Minus,
  Pencil, Phone, RotateCcw, Trash2, TrendingDown, Upload, UserCheck,
  ChevronLeft
} from 'lucide-react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Coins,
  Crown,
  Gift,
  Headphones,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PlaySquare,
  Radio,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Video,
  Wallet,
  X,
  Zap,
  UserPlus,
  Plus,
  TrendingUp,
  Clock3,
  Eye,
  UserRound,
  BarChart3,
  CreditCard,
  FileText,
  LogOut,
} from 'lucide-react';
import { Pause } from 'lucide-react';
import ReelsMomentsManagement from './ReelsMomentsManagement';
import StoreManagement from './StoreManagement';
import AgencyManagement from './AgencyManagement';
import ModeratorManagement from './ModeratorManagement';
import GiftManagement from './GiftManagement';
import CoinWalletManagement from './CoinWalletManagement';
import VipLevelManagement from './VipLevelManagement';
import TransactionManagement from './TransactionManagement';
import SupportManagement from './SupportManagement';
import StaffAccessManagement from './StaffAccessManagement';
import AuditLogs from './AuditLogs';
import AppSettings from './AppSettings';

type NavItem = { label: string; icon: React.ElementType; children?: string[] };

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home },
  {
    label: 'User Management',
    icon: Users,
    children: ['All Users', 'User Warnings', 'Suspended Users'],
  },
  {
    label: 'Live & Party Management',
    icon: Radio,
    children: ['Active Live Sessions', 'Party Rooms', 'PK & Team Matches'],
  },
  {
    label: 'Reels / Moments',
    icon: PlaySquare,
    children: ['All Reels', 'Reported Reels', 'Upload Restrictions'],
  },
  {
    label: 'Agency Management',
    icon: Building2,
    children: [
      'Coin Seller Agencies',
      'Host Agencies',
      'Agency Requests',
      'Host Leave Requests',
    ],
  },
  {
    label: 'Store Management',
    icon: ShoppingBag,
    children: [
      'Store Items',
      'Gift Management',
      'Frame Management',
      'Entry Effects',
      'Tag Management',
      'Event Store',
      'Packages & Bundles',
      'Coin Packages',
      'VIP Plans',
      'Promotions',      'Transactions',
    ],
  },
  { label: 'Moderator Management', icon: ShieldCheck },
  {
    label: 'Gift Management',
    icon: Gift,
    children: ['Gift Categories', 'All Gifts', 'Add New Gift'],
  },
  { label: 'Coins & Wallet', icon: Coins },
  {
    label: 'VIP & Level Management',
    icon: Crown,
    children: ['VIP 1–12', 'Level 0–100', 'Badge Configuration'],
  },
  { label: 'Transactions & Payments', icon: CreditCard, children: ['Transactions'] },
  { label: 'Support & Complaints', icon: Headphones, children: ['Support Inbox', 'Contact Settings'] },
  { label: 'Admin & Staff Management', icon: UserPlus },
  { label: 'Roles & Permissions', icon: LockKeyhole },
  { label: 'Audit Logs', icon: FileText },
  { label: 'App Settings', icon: Settings },
];

const stats = [];

const activities = [];

const agencies = [];

const quickActions = [];


type DemoUser = {
  id: string;
  name: string;
  username: string;
  uid: string;
  avatar: string;
  verified: boolean;
  level: number;
  vip: number;
  earned: number;
  spent: number;
  current: number;
  party: boolean;
  live: boolean;
  status: 'Active' | 'Suspended';
  email: string;
  phone: string;
};

const initialUsers: DemoUser[] = [];

const demoNames = [];
const demoUsers: DemoUser[] = [];
const allDemoUsers=[];
const formatCoins = (value: number) => value.toLocaleString('en-US');
const vipLabel = (vip: number) => vip > 0 ? 'VIP ' + vip : 'No VIP';

function UserManagement() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState('All Users');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [vipFilter, setVipFilter] = useState('All VIP');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editTab, setEditTab] = useState('Profile');
  const [draft, setDraft] = useState<DemoUser>({id:'',name:'',username:'',uid:'',avatar:'',verified:false,level:0,vip:0,earned:0,spent:0,current:0,party:false,live:false,status:'Active',email:'',phone:''});
  const [modal, setModal] = useState<{type:string; userId:string; title:string} | null>(null);
  const [amount, setAmount] = useState('');
  const [warningText, setWarningText] = useState('');
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [blueTickRulesOpen, setBlueTickRulesOpen] = useState(false);
  const [autoBlueTick, setAutoBlueTick] = useState(true);
  const [blueTickMinLevel, setBlueTickMinLevel] = useState(30);

  const selectedUser = users.find(user => user.id === selectedId) || users[0] || draft;
  const filtered = users.filter(user => {
    const matchesSearch = [user.name, user.username, user.uid, user.email, user.phone].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'All Users' || (tab === 'Active' && user.status === 'Active') || (tab === 'Suspended' && user.status === 'Suspended') || (tab === 'VIP' && user.vip > 0);
    const matchesLevel = levelFilter === 'All Levels' || (levelFilter === 'Level 0–9' && user.level <= 9) || (levelFilter === 'Level 10–29' && user.level >= 10 && user.level <= 29) || (levelFilter === 'Level 30–59' && user.level >= 30 && user.level <= 59) || (levelFilter === 'Level 60–100' && user.level >= 60);
    const matchesVip = vipFilter === 'All VIP' || (vipFilter === 'No VIP' && user.vip === 0) || vipFilter === 'VIP ' + user.vip;
    const matchesStatus = statusFilter === 'All Status' || statusFilter === user.status;    return matchesSearch && matchesTab && matchesLevel && matchesVip && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedUsers = filtered.slice((page-1)*rowsPerPage, page*rowsPerPage);
  const activeCount = users.filter(user => user.status === 'Active').length;
  const suspendedCount = users.filter(user => user.status === 'Suspended').length;
  const vipCount = users.filter(user => user.vip > 0).length;
  const liveCount = users.filter(user => user.live).length;
  const partyCount = users.filter(user => user.party).length;

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const openEdit = (user: DemoUser) => { setSelectedId(user.id); setDraft({...user}); setEditTab('Profile'); };
  const updateDraft = (key: keyof DemoUser, value: string | number | boolean) => setDraft(current => ({...current, [key]: value}));
  const saveDraft = () => {
    setUsers(current => current.map(user => user.id === draft.id ? {...draft, current: Math.max(0, draft.current)} : user));
    setSelectedId(draft.id);
    notify('Demo user details saved locally. No live account was changed.');
  };
  const adjustCoins = (userId: string, mode: string, value: number) => {
    setUsers(current => current.map(user => {
      if (user.id !== userId) return user;
      const next = mode === 'add' ? user.current + value : mode === 'zero' ? 0 : Math.max(0, user.current - value);
      return {...user, current: next};
    }));
    setModal(null); setAmount('');
    notify('Demo coin balance updated locally only.');
  };
  const toggleBlueTick = (userId: string) => {
    setUsers(current => current.map(user => user.id === userId ? {...user, verified: !user.verified} : user));
    notify('Blue Tick manually updated for this demo user.');
  };
  const applyBlueTickRules = () => {
    if (autoBlueTick) setUsers(current => current.map(user => ({...user, verified: user.level >= blueTickMinLevel})));
    setBlueTickRulesOpen(false);
    notify(autoBlueTick ? `Automatic Blue Tick rule applied: Level ${blueTickMinLevel}+` : 'Automatic Blue Tick rule disabled. Manual Blue Tick settings are retained.');
  };
  const toggleUserFlag = (userId: string, key: 'party' | 'live') => {
    setUsers(current => current.map(user => user.id === userId ? {...user, [key]: !user[key]} : user));
    notify('Demo ' + key + ' setting toggled locally.');
  };
  const toggleSuspend = (userId: string) => {
    setUsers(current => current.map(user => user.id === userId ? {...user, status: user.status === 'Active' ? 'Suspended' : 'Active'} : user));
    setModal(null);
    notify('Demo account status updated locally.');
  };
  const openAction = (type: string, user: DemoUser) => { setSelectedId(user.id); setModal({type, userId:user.id, title:type}); setAmount(''); setWarningText(''); };
  const activeModalUser = users.find(user => user.id === modal?.userId) || selectedUser;
  const toggleRow = (id: string) => setSelectedRows(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedRows(selectedRows.length === filtered.length ? [] : filtered.map(user => user.id));

  return (
    <div className="users-page">
      <div className="users-heading">
        <div className="users-title"><div className="users-heading-icon"><Users size={23}/></div><div><h1>User Management</h1><p>Manage all app users, their levels, VIP, coins, activities and access.</p></div></div>
        <div className="users-head-actions">
          <button className="user-primary-btn" onClick={() => notify('Add User form will be connected in a later step.')}><Plus size={16}/> Add User</button>
          <button className="user-outline-btn" onClick={() => notify('Demo user export prepared. Export file integration will be added later.')}><Download size={16}/> Export</button>
          <button className="user-outline-btn" onClick={() => notify('Import is reserved for a future verified CSV workflow.')}><Upload size={16}/> Import</button>
          <button className="user-outline-btn blue-tick-rule-button" onClick={() => setBlueTickRulesOpen(!blueTickRulesOpen)}><BadgeCheck size={16}/> Blue Tick Rules</button>
        </div>
      </div>

      <div className="users-demo-note"><Sparkles size={13}/> DEMO DATA · Changes are local to this preview and are not sent to real users.</div>
      {blueTickRulesOpen && <section className="blue-tick-rules-panel"><div className="blue-tick-rules-heading"><div><h3><BadgeCheck size={18}/> Blue Tick & Level Automation</h3><p>Manage manual verification and automatic eligibility rules.</p></div><button onClick={()=>setBlueTickRulesOpen(false)} aria-label="Close Blue Tick settings"><X size={17}/></button></div><div className="blue-tick-rule-controls"><label className="blue-tick-auto-switch"><span><b>Automatic Blue Tick by Level</b><small>Automatically apply Blue Tick when a user reaches the configured level.</small></span><button className={'user-toggle '+(autoBlueTick?'on':'')} onClick={()=>setAutoBlueTick(!autoBlueTick)} aria-label="Toggle automatic Blue Tick"><i/></button></label><label className="blue-tick-level-select">Minimum eligible level<select value={blueTickMinLevel} onChange={e=>setBlueTickMinLevel(Number(e.target.value))}>{Array.from({length:101},(_,i)=>(<option key={i} value={i}>Level {i}</option>))}</select></label><div className="blue-tick-rule-summary"><BadgeCheck size={16}/> {autoBlueTick ? `Users at Level ${blueTickMinLevel} and above will receive Blue Tick; users below this level will not.` : 'Automatic rule is OFF. Blue Tick must be managed manually for each user.'}</div><button className="user-primary-btn" onClick={applyBlueTickRules}><Check size={15}/> Save & Apply Rule to Demo Users</button></div></section>}

      <div className="user-stat-grid">
        {[
          {label:'Total Users', value:'2,548,320', icon:Users, tone:'violet'},
          {label:'Active Users', value:'2,417,980', icon:UserCheck, tone:'green'},
          {label:'Suspended', value:'12,480', icon:Ban, tone:'red'},
          {label:'VIP Users', value:'128,650', icon:Crown, tone:'gold'},
          {label:'Live Enabled', value:'2,284,300', icon:Radio, tone:'pink'},
          {label:'Party Enabled', value:'2,396,410', icon:Users, tone:'purple'}
        ].map(item => { const Icon = item.icon; return <div className="user-stat-card" key={item.label}><div className={'user-stat-icon '+item.tone}><Icon size={21}/></div><div><span>{item.label}</span><strong>{item.value}</strong></div></div>; })}
      </div>

      <div className="users-workspace">
        <section className="users-main-column">
          <div className="user-tabs-row">
            <div className="user-tabs">
              {[
                ['All Users','2,548,320'],['Active','2,417,980'],['Suspended','12,480'],['VIP','128,650']
              ].map(([label,count]) => <button key={label} className={tab===label?'user-tab active':'user-tab'} onClick={()=>{setTab(label);setPage(1);}}>{label} <span>({count})</span></button>)}
            </div>
            <div className="bulk-wrap">
              <button className="user-outline-btn" onClick={()=>setModal({type:'bulk',userId:selectedRows[0]||selectedId,title:'Bulk Actions'})}>Bulk Actions <ChevronDown size={15}/></button>
            </div>
          </div>

          <div className="user-filters">
            <label className="user-search"><Search size={17}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by Name, Username, UID, Email or Phone..."/></label>
            <select value={levelFilter} onChange={e=>{setLevelFilter(e.target.value);setPage(1);}}><option>All Levels</option><option>Level 0–9</option><option>Level 10–29</option><option>Level 30–59</option><option>Level 60–100</option></select>
            <select value={vipFilter} onChange={e=>{setVipFilter(e.target.value);setPage(1);}}><option>All VIP</option><option>No VIP</option>{Array.from({length:12},(_,i)=><option key={i}>VIP {i+1}</option>)}</select>
            <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}><option>All Status</option><option>Active</option><option>Suspended</option></select>
            <button className="reset-user-filters" onClick={()=>{setSearch('');setLevelFilter('All Levels');setVipFilter('All VIP');setStatusFilter('All Status');setTab('All Users');}}><RotateCcw size={15}/> Reset</button>
          </div>

          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th><input type="checkbox" checked={filtered.length>0 && selectedRows.length===filtered.length} onChange={toggleAll}/></th><th>User (Name / Username / UID)</th><th>Level</th><th>VIP</th><th>Blue Tick</th><th>Coins (Earning / Spent / Current)</th><th>Party</th><th>Live</th><th>Status</th><th>Actions</th></tr></thead>              <tbody>
                {paginatedUsers.map(user => <tr key={user.id} className={selectedId===user.id?'selected-user-row':''}>
                  <td><input type="checkbox" checked={selectedRows.includes(user.id)} onChange={()=>toggleRow(user.id)}/></td>
                  <td><button className="user-identity" onClick={()=>openEdit(user)}><span className="user-avatar">{user.avatar}</span><span className="user-identity-text"><b>{user.name} {user.verified && <BadgeCheck size={13}/>}</b><small>@{user.username}</small><small>UID: {user.uid}</small></span></button></td>
                  <td><span className="level-chip">Lv. {user.level}</span></td>
                  <td><span className={'vip-chip '+(user.vip>=5?'vip-high':'')}>{user.vip>0?<><Crown size={13}/> VIP {user.vip}</>:'No VIP'}</span></td>
                  <td><button className={'blue-tick-toggle '+(user.verified?'enabled':'')} onClick={()=>toggleBlueTick(user.id)} title={user.verified?'Remove Blue Tick':'Grant Blue Tick'}><BadgeCheck size={15}/><span>{user.verified?'ON':'OFF'}</span></button></td>
                  <td><div className="coin-breakdown"><span className="coin-earned"><TrendingUp size={13}/> Earned: <b>{formatCoins(user.earned)}</b></span><span className="coin-spent"><TrendingDown size={13}/> Spent: <b>{formatCoins(user.spent)}</b></span><span className="coin-current"><Coins size={13}/> Current: <b>{formatCoins(user.current)}</b></span></div></td>
                  <td><button className={'user-toggle '+(user.party?'on':'')} onClick={()=>toggleUserFlag(user.id,'party')} aria-label="Toggle party permission"><i/></button></td>
                  <td><button className={'user-toggle '+(user.live?'on':'')} onClick={()=>toggleUserFlag(user.id,'live')} aria-label="Toggle live permission"><i/></button></td>
                  <td><span className={'user-status '+(user.status==='Active'?'status-active':'status-suspended')}>{user.status}</span></td>
                  <td><div className="user-row-actions"><button title="Edit details" onClick={()=>openEdit(user)}><Pencil size={15}/></button><button title="Issue warning" onClick={()=>openAction('Issue Warning',user)}><AlertTriangle size={15}/></button><button title={user.status==='Active'?'Suspend user':'Reactivate user'} onClick={()=>openAction(user.status==='Active'?'Suspend User':'Reactivate User',user)}><Ban size={15}/></button><button title="More actions" onClick={()=>openAction('More Actions',user)}><MoreHorizontal size={16}/></button></div></td>
                </tr>)}
                {filtered.length===0 && <tr><td colSpan={9} className="users-empty">No users match the selected search and filters.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="users-pagination"><span>Showing {filtered.length ? (page-1)*rowsPerPage+1 : 0} – {Math.min(page*rowsPerPage, filtered.length)} of {filtered.length.toLocaleString()} demo users</span><div className="page-buttons"><button onClick={()=>setPage(Math.max(1,page-1))} disabled={page===1}><ChevronLeft size={16}/></button>{Array.from({length:pageCount},(_,i)=>i+1).slice(Math.max(0,Math.min(page-3,pageCount-5)),Math.max(5,Math.min(page-3,pageCount-5))+5).map(p=><button key={p} className={page===p?'current-page':''} onClick={()=>setPage(p)}>{p}</button>)}<button onClick={()=>setPage(Math.min(pageCount,page+1))} disabled={page===pageCount}><ChevronRight size={16}/></button></div><label>Rows per page <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setPage(1);}}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label></div>
        </section>

        <aside className="user-editor">
          <div className="user-editor-header"><h2>Edit User Details</h2><button onClick={()=>openEdit(selectedUser)} aria-label="Refresh selected user"><X size={18}/></button></div>
          <div className="selected-user-summary"><div className="user-avatar large">{selectedUser.avatar}</div><div className="selected-user-meta"><strong>{selectedUser.name} {selectedUser.verified && <BadgeCheck size={14}/>}</strong><span>@{selectedUser.username}</span><small>UID: {selectedUser.uid}</small></div><span className={'user-status '+(selectedUser.status==='Active'?'status-active':'status-suspended')}>{selectedUser.status}</span></div>
          <div className="editor-tabs">{['Profile','Coins','Level & VIP','Actions'].map(item=><button key={item} className={editTab===item?'active':''} onClick={()=>{setEditTab(item);setDraft({...selectedUser});}}>{item}</button>)}</div>

          {editTab==='Profile' && <div className="editor-fields">
            <label>Full Name<input value={draft.id===selectedUser.id?draft.name:selectedUser.name} onChange={e=>updateDraft('name',e.target.value)}/></label>
            <label>Username<div className="input-prefix"><span>@</span><input value={draft.username} onChange={e=>updateDraft('username',e.target.value)}/></div></label>
            <label>Email<div className="input-prefix"><Mail size={15}/><input type="email" value={draft.email} onChange={e=>updateDraft('email',e.target.value)}/></div></label>
            <label>Phone Number<div className="input-prefix"><Phone size={15}/><input value={draft.phone} onChange={e=>updateDraft('phone',e.target.value)}/></div></label>
            <div className="blue-tick-editor-row"><div><b><BadgeCheck size={15}/> Verified Blue Tick</b><small>Manually grant or remove the blue verification badge.</small></div><button className={'user-toggle '+(draft.verified?'on':'')} onClick={()=>updateDraft('verified',!draft.verified)}><i/></button></div>
          </div>}

          {editTab==='Coins' && <div className="editor-fields coin-editor-fields">
            <div className="coin-balance-box"><span>Current coin balance</span><strong>{formatCoins(selectedUser.current)}</strong></div>
            <label>Earned Coins<input value={formatCoins(draft.earned)} readOnly/></label><label>Spent Coins<input value={formatCoins(draft.spent)} readOnly/></label>
            <label>Current Balance<input type="number" value={draft.current} onChange={e=>updateDraft('current',Number(e.target.value))}/></label>
            <p className="field-hint">Earned and spent totals are read-only in this preview. Balance adjustments are available below.</p>
          </div>}

          {editTab==='Level & VIP' && <div className="editor-fields">
            <label>Level<select value={draft.level} onChange={e=>updateDraft('level',Number(e.target.value))}>{Array.from({length:101},(_,i)=><option key={i} value={i}>Level {i}</option>)}</select></label>
            <label>VIP Status<select value={draft.vip} onChange={e=>updateDraft('vip',Number(e.target.value))}><option value={0}>No VIP</option>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>VIP {i+1}</option>)}</select></label>
            <p className="field-hint">Level 0–100 and VIP 1–12 controls are demo-only until verified server permissions are connected.</p>
          </div>}

          {editTab==='Actions' && <div className="editor-fields">
            <div className="action-setting-row"><span>Party access</span><button className={'user-toggle '+(draft.party?'on':'')} onClick={()=>updateDraft('party',!draft.party)}><i/></button></div>
            <div className="action-setting-row"><span>Live access</span><button className={'user-toggle '+(draft.live?'on':'')} onClick={()=>updateDraft('live',!draft.live)}><i/></button></div>
            <button className="user-outline-btn full" onClick={()=>openAction('Issue Warning',selectedUser)}><AlertTriangle size={15}/> Issue Warning</button>
            <button className="user-danger-btn full" onClick={()=>openAction(selectedUser.status==='Active'?'Suspend User':'Reactivate User',selectedUser)}><Ban size={15}/> {selectedUser.status==='Active'?'Suspend Account':'Reactivate Account'}</button>
          </div>}

          <div className="editor-quick-title">Quick Actions</div>
          <div className="editor-quick-grid">
            <button onClick={()=>openAction('Add Coins',selectedUser)}><span className="quick-add"><Plus size={18}/></span>Add Coins</button>
            <button onClick={()=>openAction('Minus Coins',selectedUser)}><span className="quick-minus"><Minus size={18}/></span>Minus Coins</button>
            <button onClick={()=>openAction('Set Coins to Zero',selectedUser)}><span className="quick-coin"><Coins size={18}/></span>Set to Zero</button>
            <button onClick={()=>openAction('Issue Warning',selectedUser)}><span className="quick-warn"><AlertTriangle size={18}/></span>Warning</button>
            <button onClick={()=>openAction('Suspend User',selectedUser)}><span className="quick-suspend"><Ban size={18}/></span>Suspend User</button>
            <button onClick={()=>openAction('Delete User',selectedUser)}><span className="quick-delete"><Trash2 size={18}/></span>Delete User</button>
          </div>
          <div className="editor-footer"><button className="user-outline-btn" onClick={()=>{setDraft({...selectedUser});notify('Unsaved demo edits discarded.');}}>Cancel</button><button className="user-primary-btn" onClick={saveDraft}><Check size={15}/> Save Changes</button></div>
        </aside>
      </div>

      {modal && <div className="user-modal-backdrop" onClick={()=>setModal(null)}><div className="user-action-modal" onClick={e=>e.stopPropagation()}>
        <button className="user-modal-close" onClick={()=>setModal(null)}><X size={18}/></button>
        <div className="user-modal-icon"><Shield size={22}/></div>
        <h3>{modal.title}</h3><p>Selected user: <b>{activeModalUser.name}</b> · UID {activeModalUser.uid}</p>
        {modal.type==='Add Coins' || modal.type==='Minus Coins' ? <><label>Coin amount<input type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter coin amount"/></label><button className="user-primary-btn full" disabled={!amount || Number(amount)<=0} onClick={()=>adjustCoins(activeModalUser.id,modal.type==='Add Coins'?'add':'minus',Number(amount))}>Confirm {modal.type}</button></> :
        modal.type==='Set Coins to Zero' ? <><p>This will set the selected demo user's current balance to zero.</p><button className="user-danger-btn full" onClick={()=>adjustCoins(activeModalUser.id,'zero',0)}>Confirm Set to Zero</button></> :
        modal.type==='Issue Warning' ? <><label>Warning message<textarea value={warningText} onChange={e=>setWarningText(e.target.value)} placeholder="Enter the reason for this warning..."/></label><button className="user-primary-btn full" disabled={!warningText.trim()} onClick={()=>{setModal(null);notify('Demo warning recorded locally; no notification was sent.');}}>Issue Demo Warning</button></> :
        modal.type==='Suspend User' || modal.type==='Reactivate User' ? <><p>{modal.type==='Suspend User'?'This will mark the demo account as suspended.':'This will reactivate the demo account.'} No real user will be affected.</p><button className="user-danger-btn full" onClick={()=>toggleSuspend(activeModalUser.id)}>Confirm {modal.type}</button></> :
        modal.type==='Delete User' ? <><p>Permanent deletion is disabled in this demo. Real deletion will require server-side authorization and audit logging.</p><button className="user-outline-btn full" onClick={()=>setModal(null)}>Close</button></> :
        <><div className="bulk-action-list"><button onClick={()=>{setModal({type:'Issue Warning',userId:activeModalUser.id,title:'Issue Warning'});}}>Issue warning</button><button onClick={()=>{setModal({type:activeModalUser.status==='Active'?'Suspend User':'Reactivate User',userId:activeModalUser.id,title:activeModalUser.status==='Active'?'Suspend User':'Reactivate User'});}}> {activeModalUser.status==='Active'?'Suspend account':'Reactivate account'}</button><button onClick={()=>{setModal({type:'Add Coins',userId:activeModalUser.id,title:'Add Coins'});}}>Adjust coins</button><button onClick={()=>{setModal(null);setEditTab('Profile');}}>Edit profile in side panel</button></div><button className="user-outline-btn full" onClick={()=>setModal(null)}>Close</button></>}
      </div></div>}
      {toast && <div className="user-toast"><CheckCircle size={16}/>{toast}</div>}
    </div>
  );
}

type LiveRoom = {id:string;host:string;username:string;uid:string;type:string;users:number;capacity:number;scoreA:number;scoreB:number;country:string;status:string;started:string;avatar:string;reason?:string;suspension?:string};
const liveSeed:LiveRoom[]=[];
function LivePartyManagement(){
 const [rooms,setRooms]=useState<LiveRoom[]>([]),[selectedId,setSelectedId]=useState('AM-90871'),[tab,setTab]=useState('All Sessions'),[search,setSearch]=useState(''),[type,setType]=useState('All Types'),[status,setStatus]=useState('All Status'),[country,setCountry]=useState('All Countries'),[page,setPage]=useState(1),[size,setSize]=useState(7),[duration,setDuration]=useState('24 Hours'),[hours,setHours]=useState('12'),[reason,setReason]=useState(''),[sendNotice,setSendNotice]=useState(true),[toast,setToast]=useState(''),[endConfirm,setEndConfirm]=useState(false),[announcementOpen,setAnnouncementOpen]=useState(false),[announcement,setAnnouncement]=useState(''),[audience,setAudience]=useState('All Live & Party Users');
 const [globalPartyOff,setGlobalPartyOff]=useState(false),[globalLiveOff,setGlobalLiveOff]=useState(false),[globalConfirm,setGlobalConfirm]=useState<'party'|'live'|null>(null); const applyGlobalShutdown=(kind:'party'|'live')=>{const off=kind==='party'?!globalPartyOff:!globalLiveOff;const matches=(r:LiveRoom)=>kind==='party'?r.type==='Party':r.type==='Solo Live'||r.type==='PK Match'||r.type==='Team';setRooms(cur=>cur.map(r=>matches(r)&&r.status!=='Ended'?{...r,status:off?'Suspended':'Active',suspension:off?'Global shutdown':undefined,reason:off?'Global admin shutdown':undefined}:r));if(kind==='party')setGlobalPartyOff(off);else setGlobalLiveOff(off);setGlobalConfirm(null);notify(off?(kind==='party'?'All Party Rooms disabled in demo preview.':'All Live Streams disabled in demo preview.'):(kind==='party'?'All Party Rooms re-enabled in demo preview.':'All Live Streams re-enabled in demo preview.'));};
 const selected=rooms.find(r=>r.id===selectedId)||rooms[0],active=rooms.filter(r=>r.status==='Active');
 const notify=(m:string)=>{setToast(m);window.setTimeout(()=>setToast(''),2600)};
 const count=(t:string)=>active.filter(r=>r.type===t).length;
 const filtered=rooms.filter(r=>{const q=search.toLowerCase(),tabOk=tab==='All Sessions'||(tab==='Live'&&r.type==='Solo Live')||(tab==='Party Rooms'&&r.type==='Party')||(tab==='PK Matches'&&r.type==='PK Match')||(tab==='Team Matches'&&r.type==='Team');return tabOk&&[r.id,r.host,r.username,r.uid].join(' ').toLowerCase().includes(q)&&(type==='All Types'||r.type===type)&&(status==='All Status'||r.status===status)&&(country==='All Countries'||r.country===country)});
 const pages=Math.max(1,Math.ceil(filtered.length/size)),rows=filtered.slice((page-1)*size,page*size);
 const apply=(mode:string)=>{setRooms(cur=>cur.map(r=>r.id!==selected.id?r:mode==='end'?{...r,status:'Ended'}:mode==='allow'?{...r,status:'Active',suspension:undefined,reason:undefined}:{...r,status:'Suspended',suspension:duration==='Custom Duration'?hours+' Hours':duration,reason:reason||'Admin moderation'}));setEndConfirm(false);notify((mode==='end'?'Room ended':mode==='allow'?'Room access restored':'Room suspended')+(sendNotice?'; demo notification queued.':'. Notification disabled.'))};
 return <div className="live-page">
 <div className="live-heading"><div className="live-title"><div className="live-heading-icon"><Radio size={23}/></div><div><h1>Live & Party Management</h1><p>Monitor, control and manage all live streams, party rooms and live events in real time.</p></div></div><div className="live-heading-actions"><button className="live-outline-btn" onClick={()=>notify('Demo room list refreshed.')}><RotateCcw size={15}/> Refresh (5s)</button><button className="live-primary-btn" onClick={()=>setAnnouncementOpen(true)}><Plus size={16}/> Create Announcement</button></div></div>
 <div className="live-demo-note"><Sparkles size={13}/> DEMO DATA · Actions update this preview only. No real live room is affected.</div><section className="global-stream-controls"><div className="global-stream-heading"><div><h2><Shield size={17}/> Global Stream Controls</h2><p>Emergency controls for streaming across the entire app.</p></div><span>SUPER ADMIN</span></div><div className="global-stream-actions"><div className={globalPartyOff?'global-stream-card is-off':'global-stream-card'}><div><b>All Party Rooms</b><small>{globalPartyOff?'Disabled app-wide':'Party access enabled'}</small></div><button onClick={()=>setGlobalConfirm('party')}>{globalPartyOff?'Enable All Party':'Disable All Party'}</button></div><div className={globalLiveOff?'global-stream-card is-off':'global-stream-card'}><div><b>All Live Streams</b><small>{globalLiveOff?'Disabled app-wide':'Solo Live, PK & Team enabled'}</small></div><button onClick={()=>setGlobalConfirm('live')}>{globalLiveOff?'Enable All Live':'Disable All Live'}</button></div></div><p className="global-stream-warning"><AlertTriangle size={14}/> Emergency action affects every matching active room. Confirmation required. Demo preview only; backend enforcement is not connected.</p></section>
 <div className="live-stat-grid">{[{label:'Total Live Sessions',value:'6,420',icon:Radio},{label:'Active Party Rooms',value:String(count('Party')) ,icon:Users},{label:'PK Matches',value:String(count('PK Match')),icon:Zap},{label:'Team Matches',value:String(count('Team')),icon:Users},{label:'Solo Live',value:String(count('Solo Live')),icon:Video},{label:'Total Viewers',value:active.reduce((s,r)=>s+r.users,0).toLocaleString(),icon:Eye}].map(x=>{const I=x.icon;return <div className="live-stat-card" key={x.label}><span><I size={20}/></span><div><small>{x.label}</small><b>{x.value}</b><em>↑ Live activity</em></div></div>})}</div>
 <div className="live-workspace"><section className="live-main-column">
 <div className="live-tabs">{['All Sessions','Live','Party Rooms','PK Matches','Team Matches'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>{setTab(t);setPage(1)}}>{t}</button>)}</div>
 <div className="live-filters"><label><Search size={16}/><input placeholder="Search by Room ID, Host Name, User ID..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></label><select value={type} onChange={e=>{setType(e.target.value);setPage(1)}}><option>All Types</option><option>Party</option><option>Solo Live</option><option>PK Match</option><option>Team</option></select><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option>All Status</option><option>Active</option><option>Suspended</option><option>Ended</option></select><select value={country} onChange={e=>{setCountry(e.target.value);setPage(1)}}><option>All Countries</option><option>Pakistan</option><option>UAE</option><option>Saudi Arabia</option><option>India</option><option>Qatar</option></select><span className="live-realtime">● Real-time</span></div>
 <div className="live-table-wrap"><table className="live-table"><thead><tr><th>Room / Host</th><th>Type</th><th>Users</th><th>PK / Match</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className={r.id===selectedId?'chosen':''} onClick={()=>setSelectedId(r.id)}><td><div className="live-host-cell"><span className="live-host-avatar">{r.avatar}</span><span><b>{r.host} <BadgeCheck size={12}/></b><small>@{r.username}</small><small>UID: {r.uid}</small></span></div></td><td><span className="live-type-chip">{r.type}</span></td><td><Users size={13}/> {r.users.toLocaleString()}{r.capacity?' / '+r.capacity:''}</td><td>{r.type==='PK Match'||r.type==='Team'?<b className="live-score">{r.scoreA.toLocaleString()} VS {r.scoreB.toLocaleString()}</b>:'—'}</td><td><span className={'live-status '+r.status.toLowerCase()}>{r.status}</span></td><td><div className="live-row-actions"><button onClick={e=>{e.stopPropagation();setSelectedId(r.id)}}><Eye size={14}/> View</button><button className={'live-mini-toggle '+(r.status==='Active'?'on':'')} onClick={e=>{e.stopPropagation();setSelectedId(r.id);setRooms(cur=>cur.map(x=>x.id===r.id?{...x,status:x.status==='Active'?'Suspended':'Active'}:x));notify('Room access toggled in demo.')}}><i/></button><button onClick={e=>{e.stopPropagation();setSelectedId(r.id);notify('Use the control panel for more actions.')}}><MoreHorizontal size={15}/></button></div></td></tr>)}</tbody></table>{!rows.length&&<div className="live-empty">No sessions match your filters.</div>}</div>
 <div className="live-pagination"><span>Showing {filtered.length?(page-1)*size+1:0}–{Math.min(page*size,filtered.length)} of {filtered.length} sessions</span><div>{Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} className={page===n?'current':''} onClick={()=>setPage(n)}>{n}</button>)}</div><label>Rows per page <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option value={7}>7</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label></div>
 </section><aside className="live-detail-panel"><h2>Room Details (Live {selected.type})</h2><div className="live-room-preview"><div className="live-feature-avatar">{selected.avatar}<b>{selected.status==='Active'?'LIVE':selected.status.toUpperCase()}</b></div><div className="live-guest-grid"><i>1</i><i>2</i><i>3</i><i>4</i></div><span className="live-viewers"><Eye size={13}/>{selected.users}</span></div>
 <div className="live-selected-host"><span className="live-host-avatar">{selected.avatar}</span><div><b>{selected.host} <BadgeCheck size={12}/></b><small>@{selected.username}</small><small>UID: {selected.uid}</small></div><button onClick={()=>notify('User profile preview opened.')}>View Profile</button></div>
 <div className="live-detail-grid"><div><span>Room Type<b>{selected.type}</b></span></div><div><span>Current Users<b>{selected.users.toLocaleString()}{selected.capacity?' / '+selected.capacity:''}</b></span></div><div><span>Created At<b>{selected.started}</b></span></div><div><span>Country<b>{selected.country}</b></span></div><div><span>Room ID<b>{selected.id}</b></span></div><div><span>Status<b>{selected.status}</b></span></div></div>
 {(selected.type==='PK Match'||selected.type==='Team')&&<div className="live-score-detail">Match Score: <b>{selected.scoreA.toLocaleString()} VS {selected.scoreB.toLocaleString()}</b></div>}
 <h3>Moderation & Control</h3><div className="live-control-buttons"><button className="allow" onClick={()=>apply('allow')}><CheckCircle size={16}/>Allow / Unblock</button><button className="suspend" onClick={()=>apply('suspend')}><Pause size={16}/>Suspend</button><button className="end" onClick={()=>setEndConfirm(true)}><Ban size={16}/>End Room Now</button></div>
 <div className="live-suspend-options"><b>Suspend Duration</b>{['24 Hours','Custom Duration','Until Manually Unblocked'].map(d=><label key={d}><input type="radio" checked={duration===d} onChange={()=>setDuration(d)}/>{d}</label>)}{duration==='Custom Duration'&&<div><input type="number" min="1" max="8760" value={hours} onChange={e=>setHours(e.target.value)}/> Hours</div>}</div>
 <label className="live-reason">Reason (Optional)<input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Policy violation, user report..."/></label><label className="live-notify-option"><input type="checkbox" checked={sendNotice} onChange={e=>setSendNotice(e.target.checked)}/> Send notification to host/user</label><button className="live-apply-action" onClick={()=>apply('suspend')}>Apply Action</button>{selected.status==='Suspended'&&<p className="live-suspended-info">Suspended: {selected.suspension||'Until manually unblocked'} · {selected.reason}</p>}</aside></div>
 {globalConfirm&&<div className="live-modal-backdrop" onClick={()=>setGlobalConfirm(null)}><div className="live-modal" onClick={e=>e.stopPropagation()}><h3>{(globalConfirm==='party'?globalPartyOff:globalLiveOff)?'Re-enable app-wide streaming?':'Disable streaming across the entire app?'}</h3><p>{globalConfirm==='party'?'This will disable all Party Rooms app-wide.':'This will disable Solo Live, PK Matches and Team Matches app-wide.'} This is an emergency-wide action.</p><button className="live-danger-confirm" onClick={()=>applyGlobalShutdown(globalConfirm)}>{(globalConfirm==='party'?globalPartyOff:globalLiveOff)?'Confirm Enable':'Confirm Disable All'}</button><button className="live-outline-btn" onClick={()=>setGlobalConfirm(null)}>Cancel</button></div></div>}
 {endConfirm&&<div className="live-modal-backdrop" onClick={()=>setEndConfirm(false)}><div className="live-modal" onClick={e=>e.stopPropagation()}><h3>End room immediately?</h3><p>This marks {selected.host} room as ended in demo data.</p><button className="live-danger-confirm" onClick={()=>apply('end')}>Confirm End Room</button><button className="live-outline-btn" onClick={()=>setEndConfirm(false)}>Cancel</button></div></div>}
 {announcementOpen&&<div className="live-modal-backdrop" onClick={()=>setAnnouncementOpen(false)}><div className="live-modal" onClick={e=>e.stopPropagation()}><h3>Create Announcement</h3><label>Audience<select value={audience} onChange={e=>setAudience(e.target.value)}><option>All Live & Party Users</option><option>Party Room Hosts</option><option>Solo Live Hosts</option><option>PK & Team Match Hosts</option></select></label><label>Message<textarea value={announcement} onChange={e=>setAnnouncement(e.target.value)}/></label><button className="live-danger-confirm" disabled={!announcement.trim()} onClick={()=>{setAnnouncementOpen(false);notify('Demo announcement saved for '+audience);setAnnouncement('')}}>Publish Demo Announcement</button></div></div>}
 {toast&&<div className="live-toast"><CheckCircle size={15}/>{toast}</div>}</div>;
}
function AdminWorkspace() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [accessRole, setAccessRole] = useState('Super Admin');
  const [allowedModules, setAllowedModules] = useState<string[]>(navItems.map(item => item.label));
  const handleAccessChange = (role: string, permissions: string[]) => { setAccessRole(role); setAllowedModules(role === 'Super Admin' ? navItems.map(item => item.label) : permissions); };
  const [expanded, setExpanded] = useState<string[]>(['User Management']);
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('Last 7 Days');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickInfo, setShowQuickInfo] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredActivities = useMemo(
    () =>
      activities.filter(item =>
        (item.title + ' ' + item.detail)
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  const selectNav = (label: string) => {
    setActiveNav(label);
    setMobileMenu(false);
  };

  const toggleExpand = (label: string) => {
    setExpanded(current =>
      current.includes(label)
        ? current.filter(item => item !== label)
        : [...current, label]
    );
    setActiveNav(label);
  };

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <img className="brand-logo" src="/resources/alpha-mate-logo.png" alt="Alpha Mate official logo" />
          <div>
            <div className="brand-name">Alpha Mate</div>
            <div className="brand-sub">App Administration</div>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="side-nav" aria-label="Administration navigation">
          {navItems.filter(item => item.label === 'Dashboard' || (accessRole === 'Super Admin' || allowedModules.includes(item.label))).map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            const isExpanded = expanded.includes(item.label);
            return (
              <div className="nav-group" key={item.label}>
                <button
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() =>
                    item.children
                      ? toggleExpand(item.label)
                      : selectNav(item.label)
                  }
                >
                  <Icon size={18} strokeWidth={2.1} />
                  <span>{item.label}</span>
                  {item.children ? (
                    <ChevronRight
                      className={isExpanded ? 'chevron expanded' : 'chevron'}
                      size={15}                    />
                  ) : null}
                </button>
                {item.children && isExpanded && (
                  <div className="sub-nav">
                    {item.children.map(child => (
                      <button
                        key={child}
                        className={
                          activeNav === child ? 'sub-item selected' : 'sub-item'
                        }
                        onClick={() => selectNav(child)}
                      >
                        {child}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="secure-dot" /> Secure Admin Workspace{' '}
          <span>v1.0</span>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>
          <div className="top-title">
            <img className="topbar-brand-logo" src="/resources/alpha-mate-logo.png" alt="Alpha Mate official logo" />
            <span>
              Alpha Mate <b>App Administration</b>
            </span>
          </div>
          <div className="top-actions">
            <label className="global-search">
              <Search size={17} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search users, agencies, rooms..."
              />
            </label>
            <div className="popover-wrap">
              <button
                className="icon-button notification-button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={20} />
                <i />
              </button>
              {showNotifications && (
                <div className="popover">
                  <strong>Notifications</strong>
                  <p>3 demo notifications</p>
                  <div className="popover-line">
                    New agency request received
                  </div>
                  <div className="popover-line">
                    Live room flagged for review
                  </div>
                  <div className="popover-line">Daily report is ready</div>
                </div>
              )}
            </div>
            <div className="popover-wrap">
              <button
                className="profile-trigger"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
              >
                <span className="avatar-admin">A</span>
                <span>{accessRole === 'Super Admin' ? 'Super Admin' : accessRole.startsWith('ADM-') || accessRole.startsWith('STF-') ? 'Limited Access' : accessRole}</span>
                <ChevronDown size={15} />
              </button>
              {showProfile && (
                <div className="popover profile-popover">                  <strong>Super Admin</strong>
                  <p>Signed in as alphamateapp@gmail.com</p>
                  <button
                    onClick={() =>
                      setShowQuickInfo(
                        'Profile settings will be configured when authentication is connected.'
                      )
                    }
                  >
                    Account settings
                  </button>
                  <button
                    onClick={async () => {
                      await auth.signOut();
                      window.location.reload();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeNav !== 'Dashboard' && accessRole !== 'Super Admin' && !allowedModules.includes(activeNav) ? (
          <div className="module-placeholder"><div className="placeholder-icon"><LockKeyhole size={28}/></div><span className="eyebrow">ACCESS RESTRICTED</span><h1>Permission Required</h1><p>Your current account does not have permission to open {activeNav}. Contact the Super Admin to request access.</p><div className="placeholder-note"><LockKeyhole size={17}/> This module is locked for the selected role.</div></div>
        ) : activeNav === 'App Settings' ? (
          <AppSettings />
        ) : activeNav === 'Audit Logs' ? (
          <AuditLogs />
        ) : activeNav === 'Admin & Staff Management' || activeNav === 'Roles & Permissions' ? (
          <StaffAccessManagement onAccessChange={handleAccessChange}/>
        ) : ['Coin Seller Agencies','Host Agencies','Agency Requests','Host Leave Requests','Agency Management'].includes(activeNav) ? (
          <AgencyManagement section={activeNav} />
        ) : activeNav === 'Support Inbox' || activeNav === 'Contact Settings' || activeNav === 'Support & Complaints' ? (
          <SupportManagement />
        ) : activeNav === 'Transactions' || activeNav === 'Transactions & Payments' ? (
          <TransactionManagement />
        ) : activeNav === 'Coins & Wallet' ? (
          <CoinWalletManagement />
        ) : activeNav === 'VIP & Level Management' ? (
          <VipLevelManagement />
        ) : activeNav === 'Gift Management' ? (
          <GiftManagement />
        ) : ['Store Management','Store Items','Gift Store','Frame Management','Entry Effects','Tag Management','Event Store','Packages & Bundles'].includes(activeNav) ? (
          <StoreManagement section={activeNav} />
        ) : activeNav === 'Reels / Moments' ? (
          <ReelsMomentsManagement />
        ) : activeNav === 'User Management' ? (
          <UserManagement />
        ) : activeNav === 'Live & Party Management' ? (
          <LivePartyManagement />
        ) : activeNav === 'Moderator Management' ? (
          <ModeratorManagement />
        ) : activeNav === 'Dashboard' ? (
          
          <div className="page-content">
            <div className="page-heading">
              <div className="heading-left">
                <div className="heading-icon">
                  <LayoutDashboard size={23} />
                </div>
                <div>
                  <h1>Dashboard</h1>
                  <p>Overview of your Alpha Mate platform</p>
                </div>
              </div>
              <div className="range-select">
                <CalendarDays size={16} />
                <select
                  value={range}
                  onChange={e => setRange(e.target.value)}
                  aria-label="Date range"
                >
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
            <div className="demo-banner">
              <Sparkles size={14} /> DEMO PREVIEW · Sample analytics only — not
              connected to live app data
            </div>

            <section className="stats-grid" aria-label="Platform statistics">
              {stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <article className="stat-card" key={stat.label}>
                    <div className={`stat-icon ${stat.tone}`}>
                      <Icon size={23} />
                    </div>
                    <div className="stat-copy">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <small>
                        <ArrowUpRight size={13} /> {stat.change}{' '}
                        <em>vs previous period</em>
                      </small>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="dashboard-grid">
              <article className="panel growth-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <TrendingUp size={18} /> User Growth                    </h2>
                    <p>New and total users over time</p>
                  </div>
                  <button
                    className="more-button"
                    aria-label="More user growth options"
                    onClick={() =>
                      setShowQuickInfo(
                        'User Growth chart is currently showing sample data.'
                      )
                    }
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="chart-legend">
                  <span>
                    <i className="legend-dot purple-dot" /> Total users
                  </span>
                  <span>
                    <i className="legend-dot pink-dot" /> Growth trend
                  </span>
                </div>
                <div className="chart-wrap">
                  <div className="y-labels">
                    <span>2.6M</span>
                    <span>2.4M</span>
                    <span>2.2M</span>
                    <span>2.0M</span>
                    <span>1.8M</span>
                  </div>
                  <svg
                    className="growth-chart"
                    viewBox="0 0 660 220"
                    role="img"
                    aria-label="Sample user growth chart rising from November 1 to November 7"
                  >
                    <defs>
                      <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#a855f7"
                          stopOpacity=".38"
                        />
                        <stop
                          offset="100%"
                          stopColor="#a855f7"
                          stopOpacity=".015"
                        />
                      </linearGradient>
                      <linearGradient id="lineFill" x1="0" x2="1">
                        <stop offset="0%" stopColor="#9b5cff" />
                        <stop offset="100%" stopColor="#e45be8" />
                      </linearGradient>
                    </defs>
                    {[20, 65, 110, 155, 200].map(y => (
                      <line
                        key={y}
                        x1="8"
                        y1={y}
                        x2="650"
                        y2={y}
                        className="grid-line"
                      />
                    ))}
                    <path
                      d="M8 178 L112 158 L216 132 L320 111 L424 82 L528 58 L642 28 L642 200 L8 200 Z"
                      fill="url(#areaFill)"
                    />
                    <path
                      d="M8 178 L112 158 L216 132 L320 111 L424 82 L528 58 L642 28"
                      fill="none"
                      stroke="url(#lineFill)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[
                      [8, 178],
                      [112, 158],
                      [216, 132],
                      [320, 111],
                      [424, 82],
                      [528, 58],
                      [642, 28],
                    ].map(([cx, cy], i) => (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#f0c8ff"
                        stroke="#9b5cff"
                        strokeWidth="3"
                      />
                    ))}
                    <rect
                      x="555"
                      y="2"
                      width="92"                      height="28"
                      rx="8"
                      fill="#a855f7"
                    />
                    <text
                      x="601"
                      y="21"
                      textAnchor="middle"
                      fill="white"
                      fontSize="13"
                      fontWeight="700"
                    >
                      2,548,320
                    </text>
                  </svg>
                  <div className="x-labels">
                    <span>Nov 1</span>
                    <span>Nov 2</span>
                    <span>Nov 3</span>
                    <span>Nov 4</span>
                    <span>Nov 5</span>
                    <span>Nov 6</span>
                    <span>Nov 7</span>
                  </div>
                </div>
              </article>

              <article className="panel distribution-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <Users size={18} /> User Distribution
                    </h2>
                    <p>Audience breakdown</p>
                  </div>
                  <button
                    className="more-button"
                    aria-label="Distribution information"
                    onClick={() =>
                      setShowQuickInfo(
                        'User Distribution is a sample breakdown for the dashboard preview.'
                      )
                    }
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <div className="distribution-content">
                  <div className="donut">
                    <div>
                      <strong>2.55M</strong>
                      <span>Total Users</span>
                    </div>
                  </div>
                  <div className="distribution-legend">
                    <div>
                      <i className="d-purple" />
                      <span>Regular Users</span>
                      <b>74.2%</b>
                    </div>
                    <div>
                      <i className="d-yellow" />
                      <span>VIP Users</span>
                      <b>5.0%</b>
                    </div>
                    <div>
                      <i className="d-blue" />
                      <span>Hosts / Broadcasters</span>
                      <b>12.6%</b>
                    </div>
                    <div>
                      <i className="d-pink" />
                      <span>Agency Users</span>
                      <b>8.2%</b>
                    </div>
                  </div>
                </div>
              </article>

              <article className="panel activity-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <Zap size={18} /> Platform Activity{' '}
                      <span className="today-pill">Today</span>
                    </h2>
                    <p>Live platform snapshot</p>
                  </div>
                </div>
                <div className="activity-metrics">
                  <div>
                    <span className="mini-icon green">
                      <Radio size={16} />
                    </span>
                    <span>Live Sessions</span>
                    <b>4,280</b>
                  </div>
                  <div>
                    <span className="mini-icon purple">
                      <Users size={16} />                    </span>
                    <span>Active Party Rooms</span>
                    <b>1,320</b>
                  </div>
                  <div>
                    <span className="mini-icon blue">
                      <Video size={16} />
                    </span>
                    <span>Reels Uploaded</span>
                    <b>185,600</b>
                  </div>
                  <div>
                    <span className="mini-icon pink">
                      <Gift size={16} />
                    </span>
                    <span>Gifts Sent</span>
                    <b>12,450,000</b>
                  </div>
                  <div>
                    <span className="mini-icon gold">
                      <Coins size={16} />
                    </span>
                    <span>Coins Purchased</span>
                    <b>86,400,000</b>
                  </div>
                </div>
              </article>
            </section>

            <section className="bottom-grid">
              <article className="panel recent-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <Activity size={18} /> Recent Activities
                    </h2>
                    <p>Latest events across the platform</p>
                  </div>
                  <button
                    className="text-link"
                    onClick={() =>
                      setShowQuickInfo(
                        'The full Activity Log module will be built in a later step.'
                      )
                    }
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="activity-list">
                  {filteredActivities.length ? (
                    filteredActivities.map(item => {
                      const Icon = item.icon;
                      return (
                        <div className="activity-row" key={item.title}>
                          <div className={`activity-symbol ${item.tone}`}>
                            <Icon size={18} />
                          </div>
                          <div className="activity-description">
                            <strong>{item.title}</strong>
                            <span>{item.detail}</span>
                          </div>
                          <time>{item.time}</time>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-state">
                      No demo activities match your search.
                    </div>
                  )}
                </div>
              </article>

              <article className="panel agencies-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <Crown size={18} /> Top Agencies
                    </h2>
                    <p>Leading agencies by coin activity</p>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => selectNav('Agency Management')}
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="agency-list">
                  {agencies.map(agency => (
                    <div className="agency-row" key={agency.name}>
                      <div className={`rank-badge ${agency.medal}`}>
                        {agency.rank}
                      </div>
                      <div className="agency-info">
                        <strong>{agency.name}</strong>
                        <span>
                          {agency.hosts} Hosts · {agency.owner}
                        </span>                      </div>
                      <div className="agency-coins">
                        <Coins size={15} />
                        {agency.coins}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel quick-panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      <Zap size={18} /> Quick Actions
                    </h2>
                    <p>Shortcuts to admin tools</p>
                  </div>
                </div>
                <div className="quick-grid">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        className="quick-action"
                        onClick={() =>
                          setShowQuickInfo(
                            `${action.label} will be implemented when we build its management module. No real action is performed in this demo.`
                          )
                        }
                      >
                        <span>
                          <Icon size={21} />
                        </span>
                        <b>{action.label}</b>
                      </button>
                    );
                  })}
                </div>
              </article>
            </section>
            <footer className="page-footer">
              <span>© 2026 Alpha Mate · App Administration</span>
              <span>
                  <span className="footer-dot" /> Secure admin session · Firebase status shown in the connection banner
                </span>
            </footer>
          </div>
        ) : (
          <div className="module-placeholder">
            <div className="placeholder-icon">
              <Settings size={28} />
            </div>
            <span className="eyebrow">ADMIN MODULE</span>
            <h1>{activeNav}</h1>
            <p>
              This section is reserved for the next development step. The
              dashboard is ready as the first block.
            </p>
            <div className="placeholder-note">
              <CircleHelp size={17} /> This is a UI placeholder. No live data or
              administrative actions are connected yet.
            </div>
            <button
              className="primary-button"
              onClick={() => setActiveNav('Dashboard')}
            >
              <Home size={16} /> Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {showQuickInfo && (
        <div className="modal-backdrop" onClick={() => setShowQuickInfo('')}>
          <div className="info-modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close icon-button"
              onClick={() => setShowQuickInfo('')}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="modal-symbol">
              <CircleHelp size={23} />
            </div>
            <h3>Coming in the next step</h3>
            <p>{showQuickInfo}</p>
            <button
              className="primary-button"
              onClick={() => setShowQuickInfo('')}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>  );
}

export default function App() {
  return (
    <AuthGate>
      <AdminWorkspace />
    </AuthGate>
  );
}
