'use client';
import React, { useState } from 'react';
import SpecTable from '../SpecTable';
import ContributorList from '../ContributorList';
import PhotoGallery from '../PhotoGallery';
import CommentSection from '../CommentSection';

export default function EquipmentManualLayout({ note, user, onUpdate }: { note: any; user: any; onUpdate: () => void }) {
  const [likes, setLikes] = useState(note.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user ? note.likes?.includes(user.username) : false);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [savingPost, setSavingPost] = useState(false);

  const startEditingPost = () => {
    const allDocs = note.manualSections?.filter((s:any) => s.section_type !== 'display-list' && s.status === 'approved') || [];
    const latestDoc = allDocs.sort((a:any, b:any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];
    
    setPostTitle(latestDoc?.title || 'Documentation');
    setPostContent(latestDoc?.content || '');
    // We stop setting editingSectionId to ensure edits create NEW pending records 
    // instead of overwriting the approved one (safety first).
    setIsEditingPost(true);
  };

  const handlePostSave = async () => {
    if (!postTitle || !postContent) return alert('Please fill in both title and content.');
    setSavingPost(true);
    try {
      const res = await fetch(`/api/notes/${note._id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text-post',
          title: postTitle,
          content: postContent
        }),
      });
      if (res.ok) {
        setIsEditingPost(false);
        setPostTitle('');
        setPostContent('');
        onUpdate();
      }
    } catch (err) {}
    setSavingPost(false);
  };

  const handleLike = async () => {
    if (!user) return alert('Please login to like');
    try {
      const res = await fetch(`/api/notes/${note._id}/like`, { method: 'POST' });
      const data = await res.json();
      setLikes(data.likes);
      setIsLiked(data.liked);
    } catch (err) {}
  };

  return (
    <div className="equipment-layout container">
      {/* Centered Side-Icon Hero Header */}
      <header className="note-header-hero animate-fade">
         <div className="header-main-info">
            <div className="header-icon-side note-icon-large">
              {note.icon && note.icon.startsWith('http') ? (
                <img src={note.icon} alt="icon" className="note-icon-large-img" />
              ) : (
                <span>{note.icon || '⚙️'}</span>
              )}
            </div>
            
            <div className="header-text-stack">
               <h1 className="header-title-hero">{note.title}</h1>
               <div className="meta-text-row">
                  {note.item && <span>{note.item}</span>}
                  {note.type && <span>{note.type}</span>}
                  {note.category && <span>{note.category}</span>}
               </div>
            </div>
         </div>

         <div className="header-actions-side">
            {(user?.role === 'admin' || user?.role === 'owner' || user?.username === note.createdBy?.username) && (
              <button onClick={() => alert('Editing Hub info...')} className="btn-side-mini" title="Edit Hub">
                ✏️
              </button>
            )}
            <div className="action-box-mini">
              <button onClick={handleLike} className={`btn-side-mini ${isLiked ? 'liked' : ''}`} title="Like Hub">
                 {isLiked ? '❤️' : '🤍'}
              </button>
              <span className="like-count-mini">{likes}</span>
            </div>
         </div>
      </header>

      {note.details && <p className="header-desc-hero animate-fade">{note.details}</p>}

      {/* Specification Section */}
      <SpecTable noteId={note._id} specs={note.specifications} user={user} onUpdate={onUpdate} />

      {/* Documentation Section (Images) */}
      <PhotoGallery noteId={note._id} photos={note.photos} user={user} onUpdate={onUpdate} />

      {/* Documentation Section */}
      <section className="manual-section glass-card animate-fade">
         <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
           <h3 className="section-title" style={{fontSize: '1rem', margin: 0}}>Documentation</h3>
           {user && !isEditingPost && (
             <button onClick={startEditingPost} className="btn-edit-inline" title="Edit Documentation">
               ✏️
             </button>
           )}
         </div>

         {isEditingPost ? (
            <div className="post-editor glass-card animate-fade">
                <input 
                  className="post-title-input" 
                  placeholder="Title (e.g. Documentation)" 
                  value={postTitle} 
                  onChange={(e) => setPostTitle(e.target.value)} 
                />
                <textarea 
                  className="post-content-textarea" 
                  placeholder="Technical documentation (HTML supported)..." 
                  value={postContent} 
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={15}
                />
                <div className="edit-actions">
                   <p className="hint-text">💡 Safety: Your edit will be submitted as a new version for approval.</p>
                   <div className="right-btns">
                      <button onClick={() => setIsEditingPost(false)} className="btn-cancel">Cancel</button>
                      <button onClick={handlePostSave} disabled={savingPost} className="btn-save">
                        {savingPost ? 'Submitting...' : 'Submit Version'}
                      </button>
                   </div>
                </div>
            </div>
         ) : (
           <div className="manual-posts">
              {(() => {
                const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
                const allDocs = note.manualSections?.filter((s:any) => s.section_type !== 'display-list') || [];
                
                // Prioritize visible pending over approved
                const visiblePending = allDocs.filter((s:any) => 
                  s.status === 'pending' && (isAdminOrOwner || s.contributors?.some((c:any) => c.username === user?.username))
                );

                const finalDoc = visiblePending.length > 0 
                  ? visiblePending[0] 
                  : allDocs
                    .filter((s:any) => s.status === 'approved')
                    .sort((a:any, b:any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];

                if (!finalDoc) {
                  return <p className="empty-row text-center">No documentation added yet.</p>;
                }

                return (
                  <div className={`manual-post-item single-entry animate-fade ${finalDoc.status === 'pending' ? 'pending-card' : ''}`}>
                     <div className="post-content" dangerouslySetInnerHTML={{ __html: finalDoc.content }} />
                     <div className="post-item-meta" style={{marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', justifyContent: 'center'}}>
                       {finalDoc.updatedAt && <span className="post-date">Last updated: {new Date(finalDoc.updatedAt).toLocaleDateString()}</span>}
                     </div>
                  </div>
                );
              })()}
           </div>
         )}
      </section>

      {/* Contributor List Section */}
      <ContributorList contributors={[
        note.createdBy,
        ...(note.specifications?.contributors || []),
        ...(note.photos?.map((p:any) => p.uploadedBy) || []),
        ...(note.manualSections?.flatMap((s:any) => s.contributors) || [])
      ].filter(c => c && c.username)} />

      <CommentSection noteId={note._id} comments={note.comments} user={user} onUpdate={onUpdate} />

    </div>
  );
}
