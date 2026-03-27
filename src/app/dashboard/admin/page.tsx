'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [pendingNotes, setPendingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/admin/approve');
      if (res.ok) {
        const data = await res.json();
        setPendingNotes(data.pendingNotes || []);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (noteId: string, sectionType?: string, sectionId?: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, sectionType, sectionId, action: 'approve' }),
      });
      if (res.ok) {
        fetchPending();
      }
    } catch (err) {}
  };

  const handleReject = async (noteId: string, sectionType?: string, sectionId?: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, sectionType, sectionId, action: 'reject' }),
      });
      if (res.ok) {
        fetchPending();
      }
    } catch (err) {}
  };

  if (loading) return <div>Loading admin panel...</div>;

  return (
    <div className="admin-container container">
      <Link href="/dashboard" className="btn-back">← Back to Dashboard</Link>
      <div className="page-header animate-fade">
         <h1 className="title-text">Admin Control <span className="gradient-text">Panel</span></h1>
         <p className="subtitle">Verify and approve technical data before it goes public.</p>
      </div>

      <div className="pending-list animate-fade">
         {pendingNotes.length === 0 ? (
           <div className="empty-state glass">
             <span className="icon-huge">✅</span>
             <h3>System Fully Synced</h3>
             <p>All technical data and specifications are currently up to date.</p>
           </div>
         ) : (
           <div className="pending-grid">
              {pendingNotes.map((note) => (
                <div key={note._id} className="approval-card glass-card">
                   <div className="card-top">
                     <div className="note-info">
                      <div className="note-icon-box" style={{ width: '60px', height: '60px' }}>
                        {note.icon && note.icon.startsWith('http') ? (
                          <img src={note.icon} alt="icon" className="note-icon-img" />
                        ) : (
                          <span className="icon-med">{note.icon || '📄'}</span>
                        )}
                      </div>
                       <div className="info-txt">
                         <h4>{note.title}</h4>
                         <p className="note-meta">{note.category.replace('-', ' ')} • By: <b>{note.createdBy?.username}</b></p>
                       </div>
                     </div>
                     <div className="admin-actions">
                        <Link href={`/data-note/${note.slug}`} className="btn-preview-hub">
                           🔍 Preview Hub
                        </Link>
                        {/* Note Level Pending */}
                        {note.status === 'pending' && (
                           <div className="quick-approve">
                              <button onClick={() => handleApprove(note._id)} className="btn-yes">Approve Hub</button>
                              <button onClick={() => handleReject(note._id)} className="btn-no">Reject</button>
                           </div>
                        )}
                     </div>
                   </div>

                   <div className="approval-items">
                      {/* Specs Level Pending */}
                      {note.specifications?.status === 'pending' && (
                        <div className="approval-item glass warning">
                           <div className="item-label">
                              <span className="badge">UPGRADE</span>
                              <span>Specification Table Update Request</span>
                           </div>
                           <div className="btn-group">
                             <button onClick={() => handleApprove(note._id, 'specification')} className="btn-yes">Approve</button>
                             <button onClick={() => handleReject(note._id, 'specification')} className="btn-no">Reject</button>
                           </div>
                        </div>
                      )}

                      {/* Manual Section Pending */}
                      {note.manualSections?.filter((s:any)=>s.status === 'pending').map((s:any) => (
                         <div key={s._id} className="approval-item glass">
                            <div className="item-label">
                               <span className="badge">POST</span>
                               <span>Manual Section: <b>{s.title || s.section_type}</b></span>
                            </div>
                            <div className="btn-group">
                              <button onClick={() => handleApprove(note._id, 'manual-section', s._id)} className="btn-yes">Approve</button>
                              <button onClick={() => handleReject(note._id, 'manual-section', s._id)} className="btn-no">Reject</button>
                           </div>
                         </div>
                      ))}

                      {/* Photos Pending */}
                      {note.photos?.filter((p:any)=>p.status === 'pending').map((p:any) => (
                         <div key={p._id} className="approval-item glass">
                             <div className="item-label photo-label">
                                {p.url ? (
                                   <img src={p.url} alt="p" className="img-preview" />
                                ) : (
                                   <div className="img-preview placeholder-box">🖼️</div>
                                )}
                                <span>New Photo Attachment: <i>{p.caption || 'No caption'}</i></span>
                             </div>
                            <div className="btn-group">
                              <button onClick={() => handleApprove(note._id, 'photo', p._id)} className="btn-yes">Approve</button>
                              <button onClick={() => handleReject(note._id, 'photo', p._id)} className="btn-no">Reject</button>
                           </div>
                         </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>

      <style jsx>{`
         .admin-actions { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
         .btn-preview-hub { background: rgba(255,255,255,0.05); color: #fff; padding: 10px 20px; border-radius: 12px; font-size: 0.9rem; font-weight: 600; border: 1px solid var(--glass-border); transition: var(--transition); }
         .btn-preview-hub:hover { background: var(--primary-accent); border-color: var(--primary-accent); }
         .quick-approve { display: flex; gap: 10px; }
         
         .item-label { display: flex; align-items: center; gap: 12px; }
         .badge { padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; background: var(--primary-accent); color: #fff; }
         .warning .badge { background: var(--warning); color: #000; }
         .photo-label { flex: 1; }

         @media (max-width: 768px) {
           .card-top { flex-direction: column; align-items: flex-start; gap: 20px; }
           .admin-actions { align-items: stretch; width: 100%; }
           .quick-approve { flex-direction: row; }
         }
      `}</style>
    </div>
  );
}
