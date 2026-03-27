'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
          
          // Fetch my notes
          const notesRes = await fetch(`/api/notes?createdBy=${userData.user.username}`);
          const notesData = await notesRes.json();
          setMyNotes(notesData.notes || []);
        } else {
          window.location.href = '/login';
        }
      } catch (err) {}
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-container container">
      <div className="welcome-banner glass animate-fade">
         <div className="user-profile-large">
           {user?.profile_pic_url ? (
               <img src={user.profile_pic_url} alt="profile" className="avatar-lg" />
            ) : (
               <div className="avatar-lg placeholder-avatar">👤</div>
            )}
           <div className="welcome-text">
             <h1>Welcome back, <span className="gradient-text">{user?.full_name}</span></h1>
             <p className="user-tag">{user?.designation} • {(user?.role || 'user').toUpperCase()}</p>
           </div>
         </div>
         <div className="stats-mini">
           <div className="mini-stat"><b>{myNotes.length}</b> Contributions</div>
           <Link href="/data-note/new" className="btn btn-primary">+ Create New Data Hub</Link>
         </div>
      </div>

      <div className="dashboard-main-full animate-fade">
        <h3 className="section-title">My Contributions Data</h3>
        
        <div className="dashboard-cards-stack">
           {myNotes.map((note) => (
             <Link href={`/data-note/${note.slug}`} key={note._id} className="note-card-horizontal glass-card no-underline animate-fade">
                <div className="card-side-icon">
                  {note.icon && note.icon.startsWith('http') ? (
                    <img src={note.icon} alt="icon" className="side-icon-img" />
                  ) : (
                    <span className="side-emoji">{note.icon || '📄'}</span>
                  )}
                </div>
                
                <div className="card-content-stack">
                   <div className="card-header-row">
                      <h4 className="card-title-main">{note.title}</h4>
                      <span className={`status-pill pill-tiny ${note.status || 'pending'}`}>
                        {(note.status || 'pending').toUpperCase()}
                      </span>
                   </div>
                   
                   <div className="card-meta-small">
                      {note.type && <span className="meta-item">Type: <b>{note.type}</b></span>}
                      {note.item && <span className="meta-item">Item: <b>{note.item}</b></span>}
                      {note.category && <span className="meta-item">Category: <b>{note.category.replace('-', ' ')}</b></span>}
                   </div>

                   {note.details && <p className="card-desc-text">{note.details}</p>}
                </div>
             </Link>
           ))}
           {myNotes.length === 0 && (
             <div className="empty-state-notice glass-card">
                <p>You haven't contributed any data yet. Start by sharing technical info!</p>
             </div>
           )}
        </div>
      </div>

    </div>
  );
}
