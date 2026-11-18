import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, BadgeCheck, Check, CheckCircle2, Clock3, Eye, Flag, Heart,
  MessageCircle, MoreHorizontal, Pin, Play, PlaySquare, Search, Share2,
  Shield, ShieldAlert, Sparkles, Trash2, Upload, Video, X, XCircle
} from 'lucide-react';

type ReelStatus = 'Published' | 'Under Review' | 'Reported' | 'Removed';
type Reel = {
  id: string; user: string; username: string; uid: string; level: number; vip: number;
  caption: string; hashtags: string; views: number; likes: number; comments: number;
  shares: number; status: ReelStatus; duration: string; uploaded: string;
  category: 'Video' | 'Moment'; avatar: string; flagged: boolean; pinned: boolean;
  blocked?: boolean; mediaUrl?: string;
};
const seedReels: Reel[] = [];
const compact=(n:number)=>n>=1000000?(n/1000000).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':String(n);
const tabs=['All Reels','Published','Under Review','Removed','Reported','Blocked Users'];
export default function ReelsMomentsManagement(){
 const [reels,setReels]=useState<Reel[]>(seedReels);
 const [selectedId,setSelectedId]=useState('');
 const [tab,setTab]=useState('All Reels');
 const [query,setQuery]=useState('');
 const [status,setStatus]=useState('All Status');
 const [content,setContent]=useState('All Content');
 const [userFilter,setUserFilter]=useState('All Users');
 const [sort,setSort]=useState('Newest First');
 const [aiOn,setAiOn]=useState(true);
 const [selectedRows,setSelectedRows]=useState<string[]>([]);
 const [toast,setToast]=useState('');
 const [modal,setModal]=useState<'policy'|'caption'|'warning'|'bulk'|null>(null);
 const [policy,setPolicy]=useState({maxDuration:60,maxSize:100,allowComments:true,allowHashtags:true,blockedWords:'spam, scam, hate'});
 const [reason,setReason]=useState('');
 const [blockDuration,setBlockDuration]=useState('Permanent');
 const [captionDraft,setCaptionDraft]=useState('');
 const [page,setPage]=useState(1);
 const [rowsPerPage,setRowsPerPage]=useState(7);
 const [previewPlaying,setPreviewPlaying]=useState(false);
 const [uploadedName,setUploadedName]=useState('');
 const fileRef=useRef<HTMLInputElement>(null);
 const notify=(s:string)=>{setToast(s);window.setTimeout(()=>setToast(''),2600)};
 const selected=reels.find(r=>r.id===selectedId)||reels[0];
 const counts={all:reels.length,published:reels.filter(r=>r.status==='Published').length,review:reels.filter(r=>r.status==='Under Review').length,removed:reels.filter(r=>r.status==='Removed').length,reported:reels.filter(r=>r.status==='Reported'||r.flagged).length,blocked:new Set(reels.filter(r=>r.blocked).map(r=>r.uid)).size};
 const filtered=useMemo(()=>reels.filter(r=>{
  const q=[r.user,r.username,r.uid,r.id,r.caption,r.hashtags].join(' ').toLowerCase();
  const tabOk=tab==='All Reels'||(tab==='Published'&&r.status==='Published')||(tab==='Under Review'&&r.status==='Under Review')||(tab==='Removed'&&r.status==='Removed')||(tab==='Reported'&&(r.status==='Reported'||r.flagged))||(tab==='Blocked Users'&&r.blocked);
  return tabOk&&q.includes(query.toLowerCase())&&(status==='All Status'||r.status===status)&&(content==='All Content'||r.category===content)&&(userFilter==='All Users'||(userFilter==='VIP Users'&&r.vip>0)||(userFilter==='Verified Users'&&r.user!=='User_9821'));
 }).sort((a,b)=>sort==='Most Viewed'?b.views-a.views:sort==='Most Liked'?b.likes-a.likes:sort==='Oldest First'?a.uploaded.localeCompare(b.uploaded):b.id.localeCompare(a.id)),[reels,tab,query,status,content,userFilter,sort]);
 const pageCount=Math.max(1,Math.ceil(filtered.length/rowsPerPage));
 const rows=filtered.slice((page-1)*rowsPerPage,page*rowsPerPage);
 const update=(id:string,patch:Partial<Reel>)=>setReels(cur=>cur.map(r=>r.id===id?{...r,...patch}:r));
 const act=(action:string)=>{
  if(action==='Approve')update(selected.id,{status:'Published',flagged:false});
  if(action==='Remove')update(selected.id,{status:'Removed'});
  if(action==='Pin')update(selected.id,{pinned:!selected.pinned});
  if(action==='Block')update(selected.id,{blocked:true});
  if(action==='Unblock')update(selected.id,{blocked:false});
  if(action==='Warn'){setModal('warning');return;}
  notify(action+' applied to '+selected.id+' in demo preview.');
 };
 const applyBulk=(action:string)=>{
  setReels(cur=>cur.map(r=>selectedRows.includes(r.id)?{...r,...(action==='Approve'?{status:'Published' as ReelStatus,flagged:false}:action==='Remove'?{status:'Removed' as ReelStatus}:action==='Block'?{blocked:true}:{status:'Under Review' as ReelStatus})}:r));
  notify(action+' applied to '+selectedRows.length+' selected demo reels.');setSelectedRows([]);setModal(null);
 };
 const uploadFile=(file?:File)=>{
  if(!file)return;
  if(!file.type.startsWith('video/')){notify('Please select a video file.');return;}
  setUploadedName(file.name);
  const url=URL.createObjectURL(file);
  const newReel:Reel={...seedReels[0],id:'RL-DEMO-'+Date.now(),user:'Preview Admin',username:'preview_admin',uid:'ADMIN',caption:file.name.replace(/\.[^.]+$/,''),hashtags:'#NewUpload',views:0,likes:0,comments:0,shares:0,status:'Under Review',duration:'Preview',uploaded:'Just now',category:'Video',avatar:'PA',flagged:false,pinned:false,mediaUrl:url};
  setReels(cur=>[newReel,...cur]);setSelectedId(newReel.id);setTab('All Reels');setPage(1);notify('Video added to local moderation preview as Under Review.');
 };
 return <div className="reels-page">
  <div className="reels-heading"><div className="reels-title"><span><PlaySquare size={23}/></span><div><h1>Reels & Moments Management</h1><p>View, review and manage all user uploaded reels, moments and short videos.</p></div></div><div className="reels-head-actions"><button className={'reels-ai-switch '+(aiOn?'enabled':'')} onClick={()=>{setAiOn(!aiOn);notify('AI moderation '+(!aiOn?'enabled':'paused')+' in demo mode.')}}><Shield size={16}/> AI Moderation <b>{aiOn?'ON':'OFF'}</b></button><button className="reels-primary" onClick={()=>setModal('policy')}><Shield size={15}/> Upload Policy</button></div></div>
  <div className="reels-demo-note"><Sparkles size={13}/> DEMO PREVIEW · Sample reels and local actions only. AI moderation is simulated; no actual user uploads are scanned.</div>
  <div className="reels-stats">{[{label:'Total Reels',value:'1,246,500',sub:'↑ 21.4%',icon:PlaySquare,tone:'purple'},{label:'Published',value:'1,198,320',sub:'96.1%',icon:CheckCircle2,tone:'green'},{label:'Under Review',value:'12,480',sub:'1.0%',icon:Clock3,tone:'gold'},{label:'Removed',value:'23,640',sub:'1.9%',icon:XCircle,tone:'red'},{label:'Blocked Uploaders',value:'1,280',sub:'',icon:ShieldAlert,tone:'blue'},{label:'Reported Content',value:'4,320',sub:'',icon:Flag,tone:'pink'}].map(s=>{const I=s.icon;return <div className="reels-stat" key={s.label}><span className={s.tone}><I size={21}/></span><div><small>{s.label}</small><b>{s.value}</b><em>{s.sub}</em></div></div>})}</div>
  <div className="reels-tabs">{tabs.map((t,i)=><button key={t} className={tab===t?'active':''} onClick={()=>{setTab(t);setPage(1)}}>{t} <small>({[counts.all,counts.published,counts.review,counts.removed,counts.reported,counts.blocked][i].toLocaleString()})</small></button>)}</div>
  <div className="reels-filters"><label><Search size={16}/><input placeholder="Search by User, UID, Reel ID or Caption..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option>All Status</option>{['Published','Under Review','Reported','Removed'].map(s=><option key={s}>{s}</option>)}</select><select value={content} onChange={e=>setContent(e.target.value)}><option>All Content</option><option>Video</option><option>Moment</option></select><select value={userFilter} onChange={e=>setUserFilter(e.target.value)}><option>All Users</option><option>VIP Users</option><option>Verified Users</option></select><select value={sort} onChange={e=>setSort(e.target.value)}><option>Newest First</option><option>Oldest First</option><option>Most Viewed</option><option>Most Liked</option></select><button onClick={()=>{setQuery('');setStatus('All Status');setContent('All Content');setUserFilter('All Users');setSort('Newest First');setTab('All Reels');notify('Reel filters reset.')}}><X size={14}/> Reset</button></div>
  <div className="reels-workspace"><section className="reels-list-panel"><div className="reels-list-toolbar"><label><input type="checkbox" checked={rows.length>0&&rows.every(r=>selectedRows.includes(r.id))} onChange={e=>setSelectedRows(e.target.checked?[...new Set([...selectedRows,...rows.map(r=>r.id)])]:selectedRows.filter(id=>!rows.some(r=>r.id===id)))}/> Select page</label><button disabled={!selectedRows.length} onClick={()=>setModal('bulk')}>Bulk Actions ({selectedRows.length})</button><button onClick={()=>{notify('Demo reel list refreshed.')}}>Refresh</button></div>
   <div className="reels-table-wrap"><table className="reels-table"><thead><tr><th></th><th>Reel Preview</th><th>User Details</th><th>Caption</th><th>Stats</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className={selectedId===r.id?'chosen':''} onClick={()=>{setSelectedId(r.id);setPreviewPlaying(false)}}><td><input type="checkbox" checked={selectedRows.includes(r.id)} onClick={e=>e.stopPropagation()} onChange={e=>setSelectedRows(cur=>e.target.checked?[...cur,r.id]:cur.filter(id=>id!==r.id))}/></td><td><button className="reel-thumb" onClick={e=>{e.stopPropagation();setSelectedId(r.id);setPreviewPlaying(!previewPlaying)}}>{r.mediaUrl?<video src={r.mediaUrl}/>:<span>{r.avatar}</span>}<i><Play size={13}/></i><small>{r.duration}</small></button></td><td><div className="reel-user"><span>{r.avatar}</span><div><b>{r.user} {r.user!=='User_9821'&&<BadgeCheck size={12}/>}</b><small>@{r.username}</small><small>UID: {r.uid}</small><em>Lv. {r.level} · {r.vip?'VIP '+r.vip:'No VIP'}</em></div></div></td><td><b>{r.caption||'—'}</b><small>{r.hashtags}</small></td><td><span><Eye size={13}/> {compact(r.views)}</span><span><Heart size={13}/> {compact(r.likes)}</span><span><MessageCircle size={13}/> {compact(r.comments)}</span></td><td><i className={'reel-status '+r.status.toLowerCase().replaceAll(' ','-')}>{r.status}</i>{r.pinned&&<small className="pinned-label"><Pin size={11}/> Pinned</small>}</td><td><div className="reel-actions"><button title="View details" onClick={e=>{e.stopPropagation();setSelectedId(r.id)}}><Eye size={14}/></button><button title="Pin / unpin" onClick={e=>{e.stopPropagation();update(r.id,{pinned:!r.pinned});notify('Pin status updated locally.')}}><Pin size={14}/></button><button title="Edit caption" onClick={e=>{e.stopPropagation();setSelectedId(r.id);setCaptionDraft(r.caption);setModal('caption')}}><MoreHorizontal size={14}/></button><button title="Remove" className="remove" onClick={e=>{e.stopPropagation();setSelectedId(r.id);update(r.id,{status:'Removed'});notify('Reel removed in demo preview.')}}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table>{!rows.length&&<div className="reels-empty">No reels match these filters.</div>}</div>
   <div className="reels-pagination"><span>Showing {(page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage,filtered.length)} of {filtered.length.toLocaleString()} demo reels</span><div><button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button><b>{page} / {pageCount}</b><button disabled={page===pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>›</button></div><label>Rows per page <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setPage(1)}}><option value={5}>5</option><option value={7}>7</option><option value={10}>10</option></select></label></div>
  </section>
  <aside className="reel-detail"><div className="reel-detail-head"><h2>Reel Details</h2><button onClick={()=>notify('Select a reel row to change the detail panel.')}><X size={16}/></button></div><div className="reel-player">{selected.mediaUrl?<video src={selected.mediaUrl} controls/>:<div className="reel-player-placeholder"><span>{selected.avatar}</span><button onClick={()=>setPreviewPlaying(!previewPlaying)}><Play size={24}/></button><small>{previewPlaying?'Preview playing (sample)':'Sample video preview'} · {selected.duration}</small></div>}</div>
   <div className="reel-owner"><span>{selected.avatar}</span><div><b>{selected.user} {selected.user!=='User_9821'&&<BadgeCheck size={13}/>}</b><small>@{selected.username} · UID: {selected.uid}</small></div><strong>Lv. {selected.level} · VIP {selected.vip}</strong></div>
   <div className="reel-metrics">{[{icon:Eye,value:compact(selected.views),label:'Views'},{icon:Heart,value:compact(selected.likes),label:'Likes'},{icon:MessageCircle,value:compact(selected.comments),label:'Comments'},{icon:Share2,value:compact(selected.shares),label:'Shares'}].map(m=>{const I=m.icon;return <div key={m.label}><I size={17}/><b>{m.value}</b><small>{m.label}</small></div>})}</div>
   <div className="reel-info"><h3>Content Information</h3><p>▣ Uploaded At: {selected.uploaded}</p><p>◷ Duration: {selected.duration}</p><p>◆ Reel ID: {selected.id}</p><p>◆ Status: <b>{selected.status}</b></p><p>Caption: {selected.caption||'No caption'}</p><p>Hashtags: {selected.hashtags||'None'}</p></div>
   <h3 className="reel-action-title">Moderation Actions</h3><div className="reel-moderation-grid"><button className="approve" onClick={()=>act('Approve')}><Check size={17}/>Approve (Publish)</button><button className="remove" onClick={()=>act('Remove')}><Trash2 size={16}/>Delete (Remove Reel)</button><button className="block" onClick={()=>act(selected.blocked?'Unblock':'Block')}><ShieldAlert size={16}/>{selected.blocked?'Unblock Uploader':'Block Reels (Stop Future Uploads)'}</button><button className="warn" onClick={()=>act('Warn')}><AlertTriangle size={16}/>Warn User (Send Notice)</button><button className="pin" onClick={()=>act('Pin')}><Pin size={16}/>{selected.pinned?'Unpin Reel':'Pin Reel'}</button><button className="edit" onClick={()=>{setCaptionDraft(selected.caption);setModal('caption')}}><MoreHorizontal size={16}/>Edit Caption</button></div>
   <div className="reel-block-options"><b>Block Upload Duration</b>{['Permanent','24 Hours','Custom Duration'].map(d=><label key={d}><input type="radio" checked={blockDuration===d} onChange={()=>setBlockDuration(d)}/>{d}</label>)}</div><label className="reel-reason">Reason (required)<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Policy violation, inappropriate content, etc."/></label><button className="reel-apply" onClick={()=>{if(!reason.trim()){notify('Please enter a moderation reason first.');return;}if(selected.blocked)act('Unblock');else{update(selected.id,{blocked:true});notify('Uploader restriction saved: '+blockDuration+'. Demo only.');}}}>Apply Action</button>
  </aside></div>
  <div className="reels-upload-row"><div><Upload size={18}/><b>Upload a sample video to preview moderation</b><small>{uploadedName||'Choose a local video file; it will stay in this browser preview.'}</small></div><button onClick={()=>fileRef.current?.click()}>Choose Video</button><input ref={fileRef} type="file" accept="video/*" hidden onChange={e=>uploadFile(e.target.files?.[0])}/></div>
  {modal&&<div className="reels-modal-backdrop" onClick={()=>setModal(null)}><div className="reels-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setModal(null)}><X size={17}/></button>
   {modal==='policy'&&<><h2>Upload Policy Settings</h2><p>Configure the demo rules shown to users before uploading Reels and Moments.</p><label>Maximum video duration (seconds)<input type="number" min="5" max="600" value={policy.maxDuration} onChange={e=>setPolicy({...policy,maxDuration:Number(e.target.value)})}/></label><label>Maximum file size (MB)<input type="number" min="1" max="2048" value={policy.maxSize} onChange={e=>setPolicy({...policy,maxSize:Number(e.target.value)})}/></label><label className="policy-check"><input type="checkbox" checked={policy.allowComments} onChange={e=>setPolicy({...policy,allowComments:e.target.checked})}/> Allow comments</label><label className="policy-check"><input type="checkbox" checked={policy.allowHashtags} onChange={e=>setPolicy({...policy,allowHashtags:e.target.checked})}/> Allow hashtags</label><label>Blocked words (comma separated)<textarea value={policy.blockedWords} onChange={e=>setPolicy({...policy,blockedWords:e.target.value})}/></label><button className="reels-primary wide" onClick={()=>{setModal(null);notify('Upload policy saved in local demo state.')}}>Save Upload Policy</button></>}
   {modal==='caption'&&<><h2>Edit Reel Caption</h2><label>Caption<textarea value={captionDraft} onChange={e=>setCaptionDraft(e.target.value)}/></label><button className="reels-primary wide" onClick={()=>{update(selected.id,{caption:captionDraft});setModal(null);notify('Caption updated in demo preview.')}}>Save Caption</button></>}
   {modal==='warning'&&<><h2>Warn Uploader</h2><p>Send a moderation warning to {selected.user}.</p><label>Warning reason<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Enter the policy violation..."/></label><button className="reels-primary wide" onClick={()=>{if(!reason.trim()){notify('Warning reason is required.');return;}setModal(null);notify('Demo warning recorded for '+selected.username+'. No notification was sent.')}}>Send Demo Warning</button></>}
   {modal==='bulk'&&<><h2>Bulk Moderation</h2><p>{selectedRows.length} reels selected. Choose an action to apply to the selected demo items.</p><div className="reels-bulk-actions"><button onClick={()=>applyBulk('Approve')}>Approve & Publish</button><button onClick={()=>applyBulk('Review')}>Send to Review</button><button onClick={()=>applyBulk('Remove')}>Remove Reels</button><button onClick={()=>applyBulk('Block')}>Block Uploaders</button></div></>}
  </div></div>}
  {toast&&<div className="reels-toast"><CheckCircle2 size={15}/>{toast}</div>}
 </div>;
}
