'use client';
import React, { useState } from 'react';
import SpecTable from '../SpecTable';
import ContributorList from '../ContributorList';
import PhotoGallery from '../PhotoGallery';
import CommentSection from '../CommentSection';

export default function MeterManualLayout({ note, user, onUpdate }: { note: any; user: any; onUpdate: () => void }) {
  const [likes, setLikes] = useState(note.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(user ? note.likes?.includes(user.username) : false);

  const [isEditingManual, setIsEditingManual] = useState(false);
  const [manualRows, setManualRows] = useState<any[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [savingManual, setSavingManual] = useState(false);
  const [showAllManual, setShowAllManual] = useState(false);

  const startEditingManual = () => {
    const approvedSections = note.manualSections
      ?.filter((s: any) => s.section_type === 'display-list' && s.status === 'approved')
      .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()) || [];
    
    const latestSection = approvedSections[0];
    const rowsToEdit = latestSection?.display_rows || [];
    
    setManualRows([...rowsToEdit]);
    setEditingSectionId(latestSection?._id || null);
    setIsEditingManual(true);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...manualRows];
    updated[index] = { ...updated[index], [field]: value };
    setManualRows(updated);
  };

  const handleManualSave = async () => {
    setSavingManual(true);
    try {
      const res = await fetch(`/api/notes/${note._id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: editingSectionId,
          type: 'display-list',
          display_rows: manualRows,
          title: 'Manual Display List'
        }),
      });
      if (res.ok) {
        setIsEditingManual(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to save manual', err);
    }
    setSavingManual(false);
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
    <div className="meter-layout container">
      {/* Centered Side-Icon Hero Header */}
      <header className="note-header-hero animate-fade">
         <div className="header-main-info">
            <div className="header-icon-side note-icon-large">
              {note.icon && note.icon.startsWith('http') ? (
                <img src={note.icon} alt="icon" className="note-icon-large-img" />
              ) : (
                <span>{note.icon || '📟'}</span>
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

      {/* Manual Section */}
      <section className="manual-section glass-card animate-fade">
         <div className="section-header" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '10px'}}>
           <h3 className="section-title" style={{fontSize: '1rem', margin: 0}}>Manual</h3>
           {user && !isEditingManual && (
             <button onClick={startEditingManual} className="btn-edit-inline" title="Edit Manual">
               ✏️
             </button>
           )}
         </div>

         {isEditingManual ? (
           <div className="manual-edit-container animate-fade">
             <div className="edit-table-scroll">
               <table className="display-table">
                 <thead>
                   <tr>
                     <th>SL</th>
                     <th>Display ID</th>
                     <th>Unit</th>
                     <th>Name</th>
                     <th>Details</th>
                     <th></th>
                   </tr>
                 </thead>
                 <tbody>
                   {manualRows.map((row, idx) => (
                     <tr key={idx}>
                       <td><input className="edit-input-tiny" style={{fontSize: '1rem'}} value={row.sl_no} onChange={(e) => updateRow(idx, 'sl_no', e.target.value)} /></td>
                       <td><input className="edit-input-tiny" style={{fontSize: '1rem'}} value={row.id_number} onChange={(e) => updateRow(idx, 'id_number', e.target.value)} /></td>
                       <td><input className="edit-input-tiny" style={{fontSize: '1rem'}} value={row.display_unit} onChange={(e) => updateRow(idx, 'display_unit', e.target.value)} /></td>
                       <td><input className="edit-input-small" style={{fontSize: '1rem'}} value={row.parameter_name} onChange={(e) => updateRow(idx, 'parameter_name', e.target.value)} /></td>
                       <td><input className="edit-input-small" style={{fontSize: '1rem'}} value={row.parameter_details} onChange={(e) => updateRow(idx, 'parameter_details', e.target.value)} /></td>
                       <td><button onClick={() => setManualRows(manualRows.filter((_, i) => i !== idx))} className="btn-remove">×</button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="edit-actions" style={{marginTop: '20px'}}>
               <button onClick={() => setManualRows([...manualRows, {sl_no: manualRows.length + 1, id_number:'', display_unit:'', parameter_name:'', parameter_details:''}])} className="btn-add-row">
                 + Add Row
               </button>
               <div className="right-btns">
                 <button onClick={() => setIsEditingManual(false)} className="btn-cancel">Cancel</button>
                 <button onClick={handleManualSave} className="btn-save" disabled={savingManual}>
                   {savingManual ? 'Saving...' : 'Submit for Approval'}
                 </button>
               </div>
             </div>
           </div>
         ) : (
           <div className="display-table-container">
             <table className="display-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Display ID</th>
                    <th>Unit</th>
                    <th>Parameter Name</th>
                    <th>Details & Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
                    const allManualSections = note.manualSections?.filter((s:any) => s.section_type === 'display-list') || [];
                    
                    // Prioritization: If there are ANY pending sections visible to this user, show ONLY those.
                    // Otherwise show approved ones. This prevents duplication of rows in the same hub.
                    const visiblePending = allManualSections.filter((s:any) => 
                      s.status === 'pending' && (isAdminOrOwner || s.contributors?.some((c:any) => c.username === user?.username))
                    );

                    const displaySections = visiblePending.length > 0 
                      ? visiblePending 
                      : allManualSections
                        .filter((s:any) => s.status === 'approved')
                        .sort((a:any, b:any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
                        .slice(0, 1);

                    const allRows = displaySections.flatMap((s:any) => s.display_rows?.map((row:any) => ({ ...row, status: s.status, sectionId: s._id })));

                    if (allRows.length === 0) {
                      return <tr><td colSpan={5} className="empty-row text-center">No manual data added yet.</td></tr>;
                    }

                    const displayedRows = showAllManual ? allRows : allRows.slice(0, 5);

                    return displayedRows.map((row:any, idx:number) => (
                      <tr key={`${row.sectionId}-${idx}`} className={row.status === 'pending' ? 'pending-row' : ''}>
                        <td className="text-center" style={{fontSize: '1rem'}}>{row.sl_no}</td>
                        <td className="text-center" style={{fontSize: '1rem'}}><b>{row.id_number}</b></td>
                        <td className="text-center" style={{fontSize: '1rem'}}>{row.display_unit}</td>
                        <td className="param-name" style={{fontSize: '1rem'}}>
                          {row.parameter_name}
                          {row.status === 'pending' && <span className="pending-badge-mini">Pending Review</span>}
                        </td>
                        <td className="param-details" style={{fontSize: '1rem'}}>
                           <p>{row.parameter_details}</p>
                           {row.remarks && <p className="remarks">💡 {row.remarks}</p>}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
             </table>
           </div>
         )}
         {(() => {
           const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';
           const allManualSections = note.manualSections?.filter((s:any) => s.section_type === 'display-list') || [];
           const visiblePending = allManualSections.filter((s:any) => 
             s.status === 'pending' && (isAdminOrOwner || s.contributors?.some((c:any) => c.username === user?.username))
           );

           const displaySections = visiblePending.length > 0 
             ? visiblePending 
             : allManualSections
               .filter((s:any) => s.status === 'approved')
               .sort((a:any, b:any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
               .slice(0, 1);

           const allRowsCount = displaySections.reduce((acc: number, s: any) => acc + (s.display_rows?.length || 0), 0);
           
           if (!isEditingManual && allRowsCount > 5) {
             return (
               <div className="more-btn-wrap" style={{marginTop: '10px'}}>
                 <button onClick={() => setShowAllManual(!showAllManual)} className="btn-show-more">
                   {showAllManual ? 'Show Less' : `Show More (${allRowsCount} rows)`}
                 </button>
               </div>
             );
           }
           return null;
         })()}
      </section>

      {/* Photo Gallery Section */}
      <PhotoGallery noteId={note._id} photos={note.photos} user={user} onUpdate={onUpdate} />

      {/* Contributor List Section */}
      <ContributorList contributors={[
        note.createdBy,
        ...(note.specifications?.contributors || []),
        ...(note.photos?.map((p:any) => p.uploadedBy) || []),
        ...(note.manualSections?.flatMap((s:any) => s.contributors) || [])
      ].filter(c => c && c.username)} />

      {/* Comment Section */}
      <CommentSection noteId={note._id} comments={note.comments} user={user} onUpdate={onUpdate} />

    </div>
  );
}
