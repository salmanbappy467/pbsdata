'use client';
import React, { useState } from 'react';
import ContributorList from '../ContributorList';
import PhotoGallery from '../PhotoGallery';
import CommentSection from '../CommentSection';

export default function GenericDataNoteLayout({ note, user, onUpdate }: { note: any; user: any; onUpdate: () => void }) {
  const [likes, setLikes] = useState(note.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user ? note.likes?.includes(user.username) : false);

  const [isAddingFile, setIsAddingFile] = useState(false);
  const [fileTitle, setFileTitle] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [savingFile, setSavingFile] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [savingPost, setSavingPost] = useState(false);


  const startEditingPost = () => {
    // Collect text posts (manual documentation)
    const allDocs = note.manualSections?.filter((s:any) => s.section_type === 'text-post' && s.status === 'approved') || [];
    const latestDoc = allDocs.sort((a:any, b:any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())[0];
    
    setPostTitle(latestDoc?.title || 'Documentation');
    setPostContent(latestDoc?.content || '');
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
        onUpdate();
      }
    } catch (err) {}
    setSavingPost(false);
  };

  const handleFileSave = async () => {
    if (!fileTitle || !fileLink) return alert('Please fill in both title and link.');
    setSavingFile(true);
    try {
      const res = await fetch(`/api/notes/${note._id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'file-link',
          title: fileTitle,
          content: fileLink
        }),
      });
      if (res.ok) {
        setIsAddingFile(false);
        setFileTitle('');
        setFileLink('');
        onUpdate();
      }
    } catch (err) {}
    setSavingFile(false);
  };

  const handleFileLike = async (sectionId: string) => {
    if (!user) return alert('Please login to like');
    try {
      await fetch(`/api/notes/${note._id}/sections`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, action: 'like' }),
      });
      onUpdate();
    } catch (err) {}
  };

  const handleDeleteFile = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this file link?')) return;
    try {
      const res = await fetch(`/api/notes/${note._id}/sections`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId }),
      });
      if (res.ok) onUpdate();
    } catch (err) {}
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

  const renderMainContent = () => {
    switch (note.category) {
      case 'document':
      case 'application-form':
        return (
          <div className="main-media-section glass-card animate-fade">
             <div className="media-header">
               <h3 className="section-title">Official {note.category.replace('-', ' ')}</h3>
               {note.fileUrl && (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-download">
                     Download File
                  </a>
               )}
             </div>
             {note.imageUrl && (
                <div className="image-viewer glass">
                   <img src={note.imageUrl} alt={note.title} className="content-img" />
                </div>
             )}
          </div>
        );
      case 'instruction':
      case 'online-data':
      case 'general-data':
        return (
           <div className="main-content-section glass-card animate-fade">
              <h3 className="section-title">Data Content</h3>
              <div className="html-render glass" dangerouslySetInnerHTML={{ __html: note.htmlContent || note.details }} />
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="generic-layout container">
      {/* Centered Side-Icon Hero Header */}
      <header className="note-header-hero animate-fade">
         <div className="header-main-info">
            <div className="header-icon-side note-icon-large">
              {note.icon && note.icon.startsWith('http') ? (
                <img src={note.icon} alt="icon" className="note-icon-large-img" />
              ) : (
                <span>{note.icon || '📄'}</span>
              )}
            </div>
            
            <div className="header-text-stack">
               <h1 className="header-title-hero">{note.title}</h1>
               <div className="meta-text-row">
                  {note.category && <span>{note.category}</span>}
                  {note.type && <span>{note.type}</span>}
               </div>
            </div>
         </div>

         <div className="header-actions-side">
            <div className="action-box-mini">
              <button onClick={handleLike} className={`btn-side-mini ${isLiked ? 'liked' : ''}`} title="Like Hub">
                 {isLiked ? '❤️' : '🤍'}
              </button>
              <span className="like-count-mini">{likes}</span>
            </div>
         </div>
      </header>

      {note.details && <p className="header-desc-hero animate-fade">{note.details}</p>}

      {(note.category !== 'instruction' && note.category !== 'document' && note.category !== 'application-form' && note.category !== 'general-data' && note.category !== 'online-data') && renderMainContent()}

      {/* Manual Posts Section (Secondary) */}
      {(note.category !== 'instruction' && note.category !== 'document' && note.category !== 'application-form' && note.category !== 'general-data' && note.category !== 'online-data') && (
        <section className="post-section glass-card animate-fade">
          <div className="section-header">
            <h3 className="section-title">Related Notes & Posts</h3>
            {user && (
              <button className="btn-edit-inline">+ Add Post</button>
            )}
          </div>

          <div className="post-list">
              {note.manualSections
                ?.filter((s:any) => s.status === 'approved' && s.section_type === 'text-post')
                .map((s:any, idx:number) => (
                  <div key={idx} className="post-item glass animate-fade">
                    <h4 className="post-item-title">{s.title}</h4>
                    <div className="post-item-content">{s.content}</div>
                    <div className="post-item-meta">
                      <span className="post-item-likes">❤️ {s.likes?.length || 0}</span>
                    </div>
                  </div>
              ))}
              {(!note.manualSections || note.manualSections.length === 0) && (
                <p className="empty-row text-center">No community posts yet.</p>
              )}
          </div>
        </section>
      )}

      {/* Documentation Style Section for general-data */}
      {note.category === 'general-data' && (
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
                 const allDocs = note.manualSections?.filter((s:any) => s.section_type === 'text-post') || [];
                 
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
      )}

      {/* Files section for application-form and online-data (Links) */}
      {(note.category === 'application-form' || note.category === 'online-data') && (
        <section className="file-section glass-card animate-fade">
          <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
             <h3 className="section-title" style={{fontSize: '1rem', margin: 0}}>{note.category === 'online-data' ? 'Website Links' : 'Files'}</h3>
             {user && (
               <button onClick={() => setIsAddingFile(true)} className="btn-edit-inline">
                 + {note.category === 'online-data' ? 'Add Link' : 'Add File'}
               </button>
             )}
          </div>
          <div className="file-grid">
             {(() => {
                const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
                const fileSections = note.manualSections?.filter((s:any) => 
                  s.section_type === 'file-link' && (s.status === 'approved' || (s.status === 'pending' && (isAdminOrOwner || s.contributors?.some((c:any) => c.username === user?.username))))
                ) || [];

                if (fileSections.length === 0) {
                  return <p className="empty-row text-center">No {note.category === 'online-data' ? 'links' : 'files'} added yet.</p>;
                }

                const visibleFiles = showAllFiles ? fileSections : fileSections.slice(0, 4);

                return (
                  <>
                    {visibleFiles.map((s:any, idx:number) => {
                      let favicon = '';
                      try {
                        const url = new URL(s.content);
                        favicon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
                      } catch (e) {}

                      return (
                        <div key={idx} className={`file-link-card glass animate-fade ${s.status === 'pending' ? 'pending-card' : ''}`}>
                           <a href={s.content} target="_blank" rel="noopener noreferrer" style={{display: 'flex', alignItems: 'center', flex: 1, textDecoration: 'none'}}>
                              <div className="file-icon-wrap" style={{width: '28px', height: '28px', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                 {favicon ? (
                                   <img src={favicon} alt="favicon" style={{width: '100%', height: '100%', borderRadius: '4px'}} />
                                 ) : (
                                   <span style={{fontSize: '1.5rem'}}>{s.content?.includes('drive.google') ? '📂' : '📄'}</span>
                                 )}
                              </div>
                              <div style={{flex: 1}}>
                                 <div style={{fontWeight: 600, color: '#fff', fontSize: '0.95rem'}}>{s.title || 'Untitled'}</div>
                                 {s.status === 'pending' && <span style={{fontSize: '0.7rem', color: 'var(--warning)'}}>Pending Approval</span>}
                              </div>
                              <div style={{color: 'var(--primary-accent)', fontSize: '1.2rem', marginRight: '10px'}}>→</div>
                           </a>
                           <div className="file-card-actions" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                              <button 
                                onClick={() => handleFileLike(s._id)} 
                                className={`btn-file-like ${s.likes?.includes(user?.username) ? 'liked' : ''}`}
                                title="Like this file"
                              >
                                ❤️ {s.likes?.length || 0}
                              </button>
                              {(user?.role === 'admin' || user?.role === 'owner') && (
                                <button 
                                  onClick={() => handleDeleteFile(s._id)} 
                                  className="btn-file-delete"
                                  title="Delete this file"
                                >
                                  🗑️
                                </button>
                              )}
                           </div>
                        </div>
                      );
                    })}
                    {!showAllFiles && fileSections.length > 4 && (
                      <button onClick={() => setShowAllFiles(true)} className="btn-show-more-full">
                         Show More ({fileSections.length - 4})
                      </button>
                    )}
                    {showAllFiles && fileSections.length > 4 && (
                      <button onClick={() => setShowAllFiles(false)} className="btn-show-more-full">
                         Show Less
                      </button>
                    )}
                  </>
                );
             })()}
          </div>
        </section>
      )}

      {/* Photo Gallery Section */}
      <PhotoGallery noteId={note._id} photos={note.photos || []} user={user} onUpdate={onUpdate} />

      {/* Joint Contributor List */}
      <ContributorList contributors={[
        note.createdBy,
        ...(note.specifications?.contributors || []),
        ...(note.photos?.map((p:any) => p.uploadedBy) || []),
        ...(note.manualSections?.flatMap((s:any) => s.contributors) || [])
      ].filter(c => c && c.username)} />

      <CommentSection noteId={note._id} comments={note.comments} user={user} onUpdate={onUpdate} />

      {/* Modal moved to ROOT level for perfect accessibility */}
      {isAddingFile && (
        <div className="modal-overlay animate-fade" style={{zIndex: 5000000}}>
           <div className="modal-content glass-card animate-scaleUp">
              <div className="modal-header">
                 <h3>{note.category === 'online-data' ? 'Add External Link' : 'Add New File Resource'}</h3>
                 <button className="btn-close-modal" onClick={() => setIsAddingFile(false)}>×</button>
              </div>
              <div className="modal-body">
                 <div className="form-group-custom">
                    <label>{note.category === 'online-data' ? 'Link Title' : 'File Title'}</label>
                    <input 
                      placeholder={note.category === 'online-data' ? "e.g. Official Website" : "e.g. Leave Application Form"} 
                      value={fileTitle} 
                      onChange={(e) => setFileTitle(e.target.value)} 
                      className="modal-input"
                    />
                 </div>
                 <div className="form-group-custom">
                    <label>{note.category === 'online-data' ? 'Website URL' : 'Google Drive / Public Link'}</label>
                    <input 
                      placeholder={note.category === 'online-data' ? "https://www.example.com" : "https://drive.google.com/..."} 
                      value={fileLink} 
                      onChange={(e) => setFileLink(e.target.value)} 
                      className="modal-input"
                    />
                 </div>
                 <p className="hint-text-modal">💡 Submission requires admin approval.</p>
              </div>
              <div className="modal-footer">
                 <button onClick={() => setIsAddingFile(false)} className="btn-cancel">Cancel</button>
                 <button onClick={handleFileSave} disabled={savingFile} className="btn-save-modal">
                    {savingFile ? 'Submitting...' : 'Submit Entry'}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
