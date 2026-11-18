import { useMemo, useState } from 'react';
import { Settings, Save, RotateCcw, ShieldCheck, Globe2, Coins, Radio, Bell, FileText, CreditCard, Users, LockKeyhole, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { logAudit } from './auditTrail';

type Field = { key:string; label:string; type:'toggle'|'text'|'number'|'select'|'textarea'; help:string; options?:string[]; min?:number; step?:number };
type Section = { id:string; title:string; description:string; icon:any; fields:Field[] };
const sections:Section[] = [
 {id:'general',title:'General & Branding',description:'Core app identity, availability and public-facing information.',icon:Globe2,fields:[
  {key:'appName',label:'Application Name',type:'text',help:'Public name shown across the app.'},
  {key:'tagline',label:'App Tagline',type:'text',help:'Short brand line shown on approved app surfaces.'},
  {key:'supportEmail',label:'Support Email',type:'text',help:'Customer support contact address.'},
  {key:'defaultLanguage',label:'Default Language',type:'select',options:['English','Urdu','Arabic','Turkish','Indonesian'],help:'Default language for new users.'},
  {key:'maintenanceMode',label:'Maintenance Mode',type:'toggle',help:'When enabled, the mobile app should show a maintenance screen. Requires backend/app integration.'},
  {key:'maintenanceMessage',label:'Maintenance Message',type:'textarea',help:'Message displayed while maintenance mode is active.'},
  {key:'minimumAppVersion',label:'Minimum Supported Version',type:'text',help:'Older versions can be asked to update, after backend enforcement.'},
  {key:'forceUpdate',label:'Force App Update',type:'toggle',help:'Require users on unsupported versions to update.'}
 ]},
 {id:'accounts',title:'Registration & Accounts',description:'Control account creation, sign-in methods and profile requirements.',icon:Users,fields:[
  {key:'registrationEnabled',label:'New Registration',type:'toggle',help:'Allow new users to create accounts.'},
  {key:'googleLogin',label:'Google Sign-in',type:'toggle',help:'Enable Google authentication provider.'},
  {key:'appleLogin',label:'Apple Sign-in',type:'toggle',help:'Enable Apple authentication provider.'},
  {key:'phoneLogin',label:'Phone / OTP Login',type:'toggle',help:'Enable phone verification where supported.'},
  {key:'whatsappLogin',label:'WhatsApp Login',type:'toggle',help:'Enable only after a verified authentication integration.'},
  {key:'emailVerification',label:'Require Email Verification',type:'toggle',help:'Require verified email before selected account actions.'},
  {key:'phoneVerification',label:'Require Phone Verification',type:'toggle',help:'Require verified phone before selected account actions.'},
  {key:'uniqueDeviceLimit',label:'Maximum Active Devices',type:'number',min:1,step:1,help:'Maximum simultaneous devices per account.'},
  {key:'usernameChangeDays',label:'Username Change Cooldown (days)',type:'number',min:0,step:1,help:'Minimum wait between username changes.'}
 ]},
 {id:'security',title:'Security & Privacy',description:'Account protection, abuse controls and privacy defaults.',icon:LockKeyhole,fields:[
  {key:'twoFactorAdmins',label:'Admin Two-Factor Authentication',type:'toggle',help:'Require MFA for privileged accounts once authentication is connected.'},
  {key:'loginAlerts',label:'New Login Alerts',type:'toggle',help:'Notify users about new or unusual logins.'},
  {key:'loginAttemptLimit',label:'Failed Login Attempt Limit',type:'number',min:1,step:1,help:'Attempts before temporary protection is triggered.'},
  {key:'sessionTimeout',label:'Admin Session Timeout (minutes)',type:'number',min:5,step:5,help:'Idle timeout for admin sessions.'},
  {key:'screenshotProtection',label:'Sensitive Screen Protection',type:'toggle',help:'Request screen capture protection on supported mobile screens.'},
  {key:'profileVisibility',label:'Default Profile Visibility',type:'select',options:['Public','Friends Only','Private'],help:'Default visibility for newly created profiles.'},
  {key:'showOnlineStatus',label:'Show Online Status by Default',type:'toggle',help:'Default online visibility for new users.'}
 ]},
 {id:'coins',title:'Coins, Wallet & Economy',description:'Coin conversion, wallet limits and platform coin policy.',icon:Coins,fields:[
  {key:'coinRate',label:'PKR per 100,000 Coins',type:'number',min:0.01,step:0.01,help:'Reference selling rate. Current configured planning rate: PKR 2,800.'},
  {key:'minimumTopup',label:'Minimum Top-up (PKR)',type:'number',min:0,step:1,help:'Minimum permitted purchase amount.'},
  {key:'maximumTopup',label:'Maximum Top-up (PKR)',type:'number',min:0,step:1,help:'Maximum permitted purchase amount per transaction.'},
  {key:'minimumGift',label:'Minimum Gift Value (coins)',type:'number',min:1,step:1,help:'Lowest permitted gift value.'},
  {key:'dailyTransferLimit',label:'Daily Coin Transfer Limit',type:'number',min:0,step:1,help:'Maximum user-to-user coin transfer per day; 0 means disabled.'},
  {key:'walletFreeze',label:'Emergency Wallet Freeze',type:'toggle',help:'Block coin purchases, transfers and redemptions when enforced by backend.'},
  {key:'coinTerms',label:'Coin Ownership & Misuse Policy',type:'textarea',help:'Policy text: coins remain platform property; fraud or misuse may lead to restriction or adjustment under published terms.'}
 ]},
 {id:'payments',title:'Payments & Payouts',description:'Payment channels, verification and payout controls.',icon:CreditCard,fields:[
  {key:'jazzcash',label:'JazzCash Payments',type:'toggle',help:'Enable only after merchant credentials and callback verification are configured.'},
  {key:'easypaisa',label:'Easypaisa Payments',type:'toggle',help:'Enable only after merchant credentials and callback verification are configured.'},
  {key:'bankTransfer',label:'Bank Transfer',type:'toggle',help:'Allow bank transfer as an accepted payment method.'},
  {key:'manualPaymentReview',label:'Manual Payment Review Required',type:'toggle',help:'Require Finance verification before crediting purchased coins.'},
  {key:'payoutsEnabled',label:'Host / Agency Payouts',type:'toggle',help:'Allow payouts only when eligibility, compliance and balance checks pass.'},
  {key:'minimumPayout',label:'Minimum Payout (PKR)',type:'number',min:0,step:1,help:'Minimum payout request amount.'},
  {key:'payoutApprovalCount',label:'Approvals Required for Payout',type:'number',min:1,step:1,help:'Number of authorized approvals required.'}
 ]},
 {id:'live',title:'Live Streaming & Party',description:'Live room behavior, seats, moderation and stream limits.',icon:Radio,fields:[
  {key:'soloLiveEnabled',label:'Solo Live',type:'toggle',help:'Allow eligible users to start solo live sessions.'},
  {key:'partyRoomsEnabled',label:'Party Rooms',type:'toggle',help:'Allow party room creation and joining.'},
  {key:'maxPartySeats',label:'Maximum Party Seats',type:'number',min:1,step:1,help:'Maximum seats including host, subject to room tier rules.'},
  {key:'pkMatchesEnabled',label:'PK / Team Matches',type:'toggle',help:'Enable competitive live match modes.'},
  {key:'guestCameraDefault',label:'Guest Camera Default',type:'select',options:['Off','On'],help:'Default guest camera state on joining a room.'},
  {key:'recordingEnabled',label:'Live Recording',type:'toggle',help:'Enable only with clear consent, storage policy and legal review.'},
  {key:'liveReportThreshold',label:'Reports to Auto-Flag Live',type:'number',min:1,step:1,help:'Report count that triggers review, not automatic guilt.'}
 ]},
 {id:'content',title:'Content & Moderation',description:'Reels, comments, user reports and safety controls.',icon:ShieldCheck,fields:[
  {key:'reelsEnabled',label:'Reels / Moments',type:'toggle',help:'Allow users to publish short videos and moments.'},
  {key:'commentsEnabled',label:'Comments',type:'toggle',help:'Allow comments on eligible content.'},
  {key:'autoModeration',label:'Automated Content Review',type:'toggle',help:'Requires a configured moderation service and human escalation.'},
  {key:'newUserPosting',label:'New User Posting',type:'toggle',help:'Allow newly registered users to publish content.'},
  {key:'maxVideoDuration',label:'Maximum Video Duration (seconds)',type:'number',min:1,step:1,help:'Maximum duration for uploaded short videos.'},
  {key:'maxUploadSize',label:'Maximum Upload Size (MB)',type:'number',min:1,step:1,help:'Maximum accepted video upload size.'},
  {key:'reportReviewHours',label:'Target Report Review Time (hours)',type:'number',min:1,step:1,help:'Operational target for moderation review.'}
 ]},
 {id:'notifications',title:'Notifications',description:'Push, email and in-app notification preferences.',icon:Bell,fields:[
  {key:'pushNotifications',label:'Push Notifications',type:'toggle',help:'Send app push notifications through configured provider.'},
  {key:'emailNotifications',label:'Email Notifications',type:'toggle',help:'Send transactional email through configured provider.'},
  {key:'inAppNotifications',label:'In-App Notifications',type:'toggle',help:'Show notifications in the app inbox.'},
  {key:'marketingNotifications',label:'Marketing Notifications',type:'toggle',help:'Send marketing only with valid user consent and opt-out.'},
  {key:'quietHours',label:'Quiet Hours',type:'text',help:'Example: 22:00–08:00; requires timezone-aware backend handling.'}
 ]},
 {id:'legal',title:'Legal & Compliance',description:'Published policies, age gate and user consent requirements.',icon:FileText,fields:[
  {key:'termsUrl',label:'Terms & Conditions URL',type:'text',help:'Public URL to the current terms.'},
  {key:'privacyUrl',label:'Privacy Policy URL',type:'text',help:'Public URL to the current privacy policy.'},
  {key:'communityUrl',label:'Community Guidelines URL',type:'text',help:'Public URL to content and conduct rules.'},
  {key:'minimumAge',label:'Minimum User Age',type:'number',min:13,step:1,help:'Set according to the app distribution countries and legal advice.'},
  {key:'consentVersion',label:'Current Consent Version',type:'text',help:'Version identifier users accept during onboarding.'},
  {key:'dataDeletionRequests',label:'Allow Account Deletion Requests',type:'toggle',help:'Provide an accessible account and data deletion request flow.'}
 ]}
];
const defaults:Record<string,string|number|boolean> = {
 appName:'Alpha Mate',tagline:'LIVE • PARTY • SOCIAL',supportEmail:'',defaultLanguage:'English',maintenanceMode:false,maintenanceMessage:'We are improving Alpha Mate. Please try again shortly.',minimumAppVersion:'1.0.0',forceUpdate:false,
 registrationEnabled:true,googleLogin:true,appleLogin:true,phoneLogin:true,whatsappLogin:false,emailVerification:false,phoneVerification:true,uniqueDeviceLimit:3,usernameChangeDays:30,
 twoFactorAdmins:true,loginAlerts:true,loginAttemptLimit:5,sessionTimeout:30,screenshotProtection:false,profileVisibility:'Public',showOnlineStatus:true,
 coinRate:2800,minimumTopup:100,maximumTopup:500000,minimumGift:1,dailyTransferLimit:0,walletFreeze:false,coinTerms:'All coins are the property of Alpha Mate. Coins are virtual platform credits and are not cash or user-owned property. Fraud, abuse, chargebacks or policy violations may result in account restrictions and coin adjustments in accordance with published terms and applicable law.',
 jazzcash:false,easypaisa:false,bankTransfer:true,manualPaymentReview:true,payoutsEnabled:false,minimumPayout:5000,payoutApprovalCount:2,
 soloLiveEnabled:true,partyRoomsEnabled:true,maxPartySeats:16,pkMatchesEnabled:true,guestCameraDefault:'Off',recordingEnabled:false,liveReportThreshold:3,
 reelsEnabled:true,commentsEnabled:true,autoModeration:false,newUserPosting:true,maxVideoDuration:60,maxUploadSize:100,reportReviewHours:24,
 pushNotifications:true,emailNotifications:false,inAppNotifications:true,marketingNotifications:false,quietHours:'22:00–08:00',
 termsUrl:'',privacyUrl:'',communityUrl:'',minimumAge:18,consentVersion:'1.0',dataDeletionRequests:true
};
const KEY='alpha-mate-app-settings-v1';
function readSettings(){try{const raw=localStorage.getItem(KEY);return raw?{...defaults,...JSON.parse(raw)}:defaults}catch{return defaults}}
export default function AppSettings(){
 const [values,setValues]=useState<Record<string,string|number|boolean>>(readSettings);
 const [active,setActive]=useState('general'); const [notice,setNotice]=useState(''); const [dirty,setDirty]=useState(false);
 const current=sections.find(s=>s.id===active)||sections[0];
 const changed=useMemo(()=>Object.keys(values).filter(k=>values[k]!==readSettings()[k]),[values]);
 const set=(key:string,value:string|number|boolean)=>{setValues(v=>({...v,[key]:value}));setDirty(true)};
 const save=()=>{const before=readSettings();try{localStorage.setItem(KEY,JSON.stringify(values));logAudit({action:'Update App Settings',category:'System Settings',target:'App Configuration',targetId:'alpha-mate-config',description:'Saved '+changed.length+' setting value(s). Changed keys: '+changed.join(', '),before:JSON.stringify(Object.fromEntries(changed.map(k=>[k,before[k]]))),after:JSON.stringify(Object.fromEntries(changed.map(k=>[k,values[k]])))});setDirty(false);setNotice('Settings saved in this browser preview and recorded in Audit Logs.')}catch{setNotice('Unable to save settings in this browser.')}};
 const reset=()=>{if(!window.confirm('Reset all App Settings to the default preview values?'))return;const before=readSettings();try{localStorage.setItem(KEY,JSON.stringify(defaults));logAudit({action:'Reset App Settings',category:'System Settings',target:'App Configuration',targetId:'alpha-mate-config',description:'Reset all configuration values to preview defaults.',before:JSON.stringify(before),after:JSON.stringify(defaults)});setValues({...defaults});setDirty(false);setNotice('Preview settings reset to defaults.')}catch{setNotice('Unable to reset settings.')}};
 return <div className="as-page"><style>{`
 .as-page{padding:22px;color:#f7f0ff}.as-head{display:flex;align-items:center;gap:13px;margin-bottom:15px}.as-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(140deg,#9b39f2,#4b168e);display:grid;place-items:center}.as-head h1{margin:0;font-size:23px}.as-head p{margin:5px 0 0;color:#ad9cbe;font-size:11px}.as-actions{margin-left:auto;display:flex;gap:8px}.as-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid #4b3264;border-radius:8px;background:#1a1028;color:#e4d6f2;font-size:10px;cursor:pointer}.as-btn.primary{background:linear-gradient(100deg,#8d27e8,#5815a8);border-color:#a75df0;color:#fff}.as-banner{padding:11px 13px;margin-bottom:14px;border:1px solid #75552a;background:#2b2011;border-radius:9px;color:#f5dba7;font-size:10px;line-height:1.65}.as-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:14px}.as-nav,.as-content{border:1px solid #3c2852;background:linear-gradient(145deg,#1c122b,#100a1c);border-radius:12px;padding:12px}.as-nav button{display:flex;align-items:center;gap:9px;width:100%;padding:11px 9px;margin:2px 0;border:0;border-radius:8px;background:transparent;color:#c9b6dc;text-align:left;font-size:10px;cursor:pointer}.as-nav button.active{background:#38204e;color:#fff}.as-content h2{font-size:16px;margin:3px 0 5px}.as-desc{color:#ad9cbe;font-size:10px;margin:0 0 15px}.as-fields{display:grid;grid-template-columns:1fr 1fr;gap:11px}.as-field{padding:12px;border:1px solid #39264b;border-radius:9px;background:#140d20;min-width:0}.as-field label{display:block;font-size:10px;font-weight:700;color:#eadcf6;margin-bottom:6px}.as-field p{font-size:9px;line-height:1.5;color:#a995bd;margin:6px 0 0}.as-field input,.as-field select,.as-field textarea{width:100%;padding:9px;border:1px solid #4b3264;border-radius:7px;background:#0d0817;color:#fff;font-size:11px;box-sizing:border-box}.as-field textarea{min-height:85px;resize:vertical}.as-field.toggle{display:flex;align-items:center;justify-content:space-between;gap:10px}.as-field.toggle label{margin:0}.as-switch{width:39px;height:22px;border:0;border-radius:20px;background:#554761;padding:3px;cursor:pointer;flex:none}.as-switch i{display:block;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}.as-switch.on{background:#8534d1}.as-switch.on i{transform:translateX(17px)}.as-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px}.as-hint{color:#a995bd;font-size:9px}.as-notice{position:fixed;right:18px;bottom:18px;z-index:300;padding:12px 15px;border:1px solid #8a5eb3;border-radius:9px;background:#211532;color:#fff;font-size:10px;max-width:90vw}.as-count{font-size:9px;color:#d9b7ff;margin-left:auto}@media(max-width:850px){.as-layout{grid-template-columns:1fr}.as-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.as-nav button{font-size:9px}}@media(max-width:600px){.as-page{padding:13px 9px}.as-head h1{font-size:19px}.as-actions{flex-direction:column}.as-fields{grid-template-columns:1fr}.as-bottom{align-items:flex-start;flex-direction:column}}
 `}</style>
 <div className="as-head"><div className="as-icon"><Settings size={25}/></div><div><h1>App Settings</h1><p>Central configuration workspace · platform policies and feature controls</p></div><div className="as-actions"><button className="as-btn" onClick={reset}><RotateCcw size={14}/> Reset Defaults</button><button className="as-btn primary" onClick={save} disabled={!dirty}><Save size={14}/> Save Changes</button></div></div>
 <div className="as-banner"><b>Configuration preview:</b> Settings currently save in this browser only. They do not yet change the live Flutter app, Firebase, payment gateways or streaming services. Production rollout requires authenticated backend APIs, validation, change approvals for sensitive settings, and server-side enforcement. Every save is recorded in the local Audit Logs preview.</div>
 <div className="as-layout"><nav className="as-nav" aria-label="Settings categories">{sections.map(s=>{const Icon=s.icon;return <button key={s.id} className={active===s.id?'active':''} onClick={()=>setActive(s.id)}><Icon size={15}/>{s.title}</button>})}</nav><section className="as-content"><h2>{current.title}</h2><p className="as-desc">{current.description}</p><div className="as-fields">{current.fields.map(f=><div className={'as-field '+(f.type==='toggle'?'toggle':'')} key={f.key}><div style={{flex:1,minWidth:0}}><label htmlFor={'setting-'+f.key}>{f.label}</label>{f.type==='toggle'?<p>{f.help}</p>:null}</div>{f.type==='toggle'?<button id={'setting-'+f.key} role="switch" aria-checked={Boolean(values[f.key])} className={'as-switch '+(values[f.key]?'on':'')} onClick={()=>set(f.key,!values[f.key])}><i/></button>:f.type==='select'?<select id={'setting-'+f.key} value={String(values[f.key])} onChange={e=>set(f.key,e.target.value)}>{f.options?.map(o=><option key={o}>{o}</option>)}</select>:f.type==='textarea'?<textarea id={'setting-'+f.key} value={String(values[f.key]??'')} onChange={e=>set(f.key,e.target.value)}/>:<input id={'setting-'+f.key} type={f.type==='number'?'number':'text'} min={f.min} step={f.step} value={String(values[f.key]??'')} onChange={e=>set(f.key,f.type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value)}/>}<p>{f.type==='toggle'?'':f.help}</p></div>)}</div><div className="as-bottom"><span className="as-hint">{changed.length} unsaved setting change(s) · Changes apply only after Save</span><button className="as-btn primary" onClick={save} disabled={!dirty}><Save size={14}/> Save {current.title}</button></div></section></div>
 {notice&&<div className="as-notice" onClick={()=>setNotice('')}><CheckCircle2 size={14}/> {notice}</div>}
 </div>;
}
