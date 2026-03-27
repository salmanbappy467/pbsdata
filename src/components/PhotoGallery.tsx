'use client';
import React, { useState, useRef } from 'react';

export default function PhotoGallery({ 
  noteId, 
  photos, 
  user, 
  onUpdate 
}: { 
  noteId: string; 
  photos: any[]; 
  user: any; 
  onUpdate: () => void 
}) {
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<any | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select an image first.');

    setLoading(true);
    try {
      // Step 1: Upload image to imgBB via our API
      const uploadData = new FormData();
      uploadData.append('image', selectedFile);
      
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const uploadResult = await uploadRes.json();
      
      if (!uploadResult.url) {
        alert('Image upload failed: ' + (uploadResult.error || 'Unknown error'));
        setLoading(false);
        return;
      }

      // Step 2: Add photo to note
      const res = await fetch(`/api/notes/${noteId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadResult.url, caption }),
      });
      
      if (res.ok) {
        setSelectedFile(null);
        setPreviewUrl('');
        setCaption('');
        setIsAdding(false);
        onUpdate();
        alert('Photo submitted for approval!');
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const approvedPhotos = photos?.filter(p => p.status === 'approved') || [];

  return (
    <div className={`gallery-section animate-fade ${viewingPhoto ? 'lightbox-active' : ''}`}>
      <div className="section-header-inline">
        <h3 className="section-title">Photos ({approvedPhotos.length})</h3>
        {user && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-edit-icon" title="Add Photo">
             <svg className="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="gallery-upload-form glass-card animate-fade">
           <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="upload-preview-img" />
              ) : (
                <div className="upload-placeholder">
                   <span className="upload-icon">📤</span>
                   <p>Click to select an image</p>
                   <span className="upload-hint">Supports JPG, PNG, WebP</span>
                </div>
              )}
           </div>
           <input type="file" ref={fileInputRef} onChange={handleFileSelect} hidden accept="image/*" />
           
           <input 
             placeholder="Add a caption (optional)..." 
             value={caption}
             onChange={(e) => setCaption(e.target.value)}
             className="gallery-caption-input"
           />
           
           <div className="gallery-form-footer">
              <p className="gallery-notice">⚠️ Photos require admin approval before appearing in the gallery.</p>
              <div className="gallery-form-btns">
                <button type="button" onClick={() => { setIsAdding(false); setPreviewUrl(''); setSelectedFile(null); }} className="btn-cancel">Cancel</button>
                <button onClick={handleSubmit} disabled={loading || !selectedFile} className="btn-save">
                  {loading ? '⏳ Uploading...' : '📤 Submit Photo'}
                </button>
              </div>
           </div>
        </div>
      )}

      <div className="premium-gallery-grid">
        {(showAllPhotos ? approvedPhotos : approvedPhotos.slice(0, 4)).map((photo, idx) => (
          <div key={idx} className="premium-photo-item animate-fade" onClick={() => setViewingPhoto(photo)}>
             <div className="photo-inner-wrap">
                <img src={photo.url} alt={photo.caption} className="premium-gallery-img" loading="lazy" />
                <div className="photo-hover-overlay">
                   <div className="overlay-content">
                      <span className="zoom-icon">🔍</span>
                      {photo.caption && <p className="overlay-caption">{photo.caption}</p>}
                   </div>
                </div>
             </div>
          </div>
        ))}
        {approvedPhotos.length === 0 && !isAdding && (
          <p className="empty-gallery">No approved photos yet. Be the first to add one!</p>
        )}
      </div>

      {approvedPhotos.length > 4 && (
        <div className="more-btn-wrap" style={{marginTop: '20px'}}>
          <button onClick={() => setShowAllPhotos(!showAllPhotos)} className="btn-show-more">
            {showAllPhotos ? 'Show Less' : `Show All Photos (${approvedPhotos.length})`}
          </button>
        </div>
      )}

      {/* Lightbox Modal with Message Box */}
      {viewingPhoto && (
        <div className="lightbox-overlay active" onClick={() => setViewingPhoto(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-side-actions">
               <button className="lightbox-close-btn" onClick={() => setViewingPhoto(null)}>✕</button>
               <a href={viewingPhoto.url} download={`photo-${viewingPhoto._id}.jpg`} className="lightbox-download-btn" title="Download Image">
                  <svg className="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
               </a>
            </div>
            <div className="lightbox-img-wrap">
               <img src={viewingPhoto.url} alt="Full view" className="lightbox-img-full" />
            </div>
            
            <div className="lightbox-message-box animate-slide-up">
               <div className="msg-avatar">👤</div>
               <div className="msg-content">
                  <div className="msg-author">{viewingPhoto.uploadedBy?.full_name || 'Contributor'}</div>
                  <div className="msg-text">{viewingPhoto.caption || 'Technical photo of the equipment.'}</div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
