'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NewNotePage() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'meter-manual',
    item: '',
    type: '',
    details: '',
    icon: '',
    imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const categories = [
    { id: 'meter-manual', name: 'Meter Manual' },
    { id: 'equipment-manual', name: 'Equipment Manual' },
    { id: 'instruction', name: 'Instruction' },
    { id: 'document', name: 'Document' },
    { id: 'application-form', name: 'Forms' },
    { id: 'general-data', name: 'General Data' },
    { id: 'online-data', name: 'Online Data' },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'icon' | 'main' = 'icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.url) {
        if (field === 'icon') {
          setFormData({ ...formData, icon: data.url });
        } else {
          setFormData({ ...formData, imageUrl: data.url });
        }
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload failed. Please check your connection.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.icon) return alert('Please upload a Hub Icon');
    
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/data-note/${data.note.slug}`);
      }
    } catch (err) {
      console.error('Failed to create hub', err);
    }
    setLoading(false);
  };

  return (
    <div className="new-note-container container">
       <div className="form-card glass-card">
          <header className="form-header">
            <h1 className="form-title">Create New <span className="gradient-text">Data Hub</span></h1>
            <p className="form-subtitle">Register a new meter, equipment, or document to the global hub.</p>
          </header>

          <form onSubmit={handleSubmit} className="note-form">
             
             {/* Icon and Title in Same Row */}
             <div className="icon-title-row">
                <div className="hub-icon-upload">
                   <div 
                      className={`icon-preview-circle ${uploading ? 'uploading' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      title="Click to upload icon"
                   >
                      {formData.icon ? (
                         <img src={formData.icon} alt="Icon" className="preview-img-full" />
                      ) : (
                         <span className="plus-icon">{uploading ? '⏳' : '➕'}</span>
                      )}
                   </div>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      hidden 
                      accept="image/*" 
                   />
                   <label className="icon-label">{uploading ? 'Uploading...' : 'Icon'}</label>
                </div>

                <div className="input-group flex-1">
                   <label><span className="label-icon">🏷️</span> Title <span className="req">*</span></label>
                   <input 
                      placeholder="e.g. Sanxing Three Phase Smart Meter S34U18" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                   />
                </div>
             </div>

             <div className="grid-2">
                <div className="input-group">
                   <label><span className="label-icon">📂</span> Category <span className="req">*</span></label>
                   <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                   >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="input-group">
                   <label><span className="label-icon">🧩</span> Item Name</label>
                   <input 
                      placeholder="e.g. MTS, LT-Meters" 
                      value={formData.item}
                      onChange={(e) => setFormData({...formData, item: e.target.value})}
                   />
                </div>
             </div>

              <div className="input-group">
                 <label><span className="label-icon">🛠️</span> Model / Type</label>
                 <input 
                    placeholder="e.g. S34U18, SX342" 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                 />
              </div>

              {/* Main Media Upload removed for all categories as requested */}


             <div className="input-group">
                <label><span className="label-icon">📝</span> Hub Description</label>
                <textarea 
                   placeholder="Provide a high-level summary of this equipment or entry..." 
                   value={formData.details}
                   onChange={(e) => setFormData({...formData, details: e.target.value})}
                   rows={4}
                />
             </div>

             <footer className="form-footer">
                <div className="notice-box">
                   <span className="notice-icon">💡</span>
                   <p>Admins will review your hub entry for accuracy before it becomes public in search results.</p>
                </div>
                
                <button type="submit" disabled={loading || uploading} className="btn-submit">
                  {loading ? 'Processing Hub...' : 'Finalize & Create Hub'}
                </button>
             </footer>
          </form>
       </div>

       <style jsx>{`
         .icon-title-row { display: flex; gap: 24px; align-items: flex-end; }
         .hub-icon-upload { display: flex; flex-direction: column; align-items: center; gap: 10px; }
         .flex-1 { flex: 1; }
         
         .icon-preview-circle { 
            width: 80px; 
            height: 80px; 
            border-radius: 50%; 
            border: 2px dashed var(--glass-border); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            overflow: hidden; 
            background: rgba(255, 255, 255, 0.02); 
            transition: var(--transition);
         }
         .icon-preview-circle:hover { border-color: var(--primary-accent); background: rgba(59, 130, 246, 0.05); }
         .icon-preview-circle.uploading { opacity: 0.5; cursor: wait; }
         
         .preview-img-full { width: 100%; height: 100%; object-fit: cover; }
         .plus-icon { font-size: 1.5rem; color: var(--text-muted); }
          .icon-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }

          .main-media-drop { 
             border: 2px dashed var(--glass-border); 
             border-radius: 16px; 
             padding: 24px; 
             cursor: pointer; 
             text-align: center; 
             min-height: 120px; 
             display: flex; 
             align-items: center; 
             justify-content: center; 
             background: rgba(255, 255, 255, 0.01); 
             transition: var(--transition);
          }
          .main-media-drop:hover { border-color: var(--primary-accent); background: rgba(59, 130, 246, 0.04); }
          .media-preview-box { position: relative; width: 100%; }
          .media-preview-img { max-width: 100%; max-height: 200px; border-radius: 12px; }
          .media-change { display: block; margin-top: 10px; font-size: 0.8rem; color: var(--primary-accent); font-weight: 600; }
          .media-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted); }
          .media-icon { font-size: 2rem; }

         @media (max-width: 600px) {
           .icon-title-row { flex-direction: column; align-items: center; }
           .hub-icon-upload { margin-bottom: 20px; }
           .input-group { width: 100%; }
         }
       `}</style>
    </div>
  );
}
