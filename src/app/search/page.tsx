'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = [
  { id: 'meter-manual', name: 'Meter Manual' },
  { id: 'equipment-manual', name: 'Equipment' },
  { id: 'instruction', name: 'Instruction' },
  { id: 'document', name: 'Document' },
  { id: 'application-form', name: 'Forms' },
  { id: 'general-data', name: 'General Data' },
  { id: 'online-data', name: 'Online Data' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [notes, setNotes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 8;

  const fetchNotes = async (page: number, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const res = await fetch(`/api/notes?search=${encodeURIComponent(query)}&category=${selectedCategory}&page=${page}&limit=${LIMIT}`);
      const data = await res.json();
      
      if (append) {
        setNotes(prev => [...prev, ...(data.notes || [])]);
      } else {
        setNotes(data.notes || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Search failed', err);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchNotes(1, false);
  }, [query, selectedCategory]);

  const handleShowMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchNotes(nextPage, true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(search)}&category=${selectedCategory}`);
  };

  const handleCategoryChange = (cat: string) => {
    const newCat = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newCat);
    router.push(`/search?q=${encodeURIComponent(query)}&category=${newCat}`);
  };

  return (
    <div className="search-page-container container">
      <div className="search-header glass animate-fade">
        <form onSubmit={handleSearchSubmit} className="search-bar-wrap">
          <div className="category-dropdown-wrap">
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <input 
            type="text" 
            placeholder="Search by name, specs, or range..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary search-btn">Search</button>
        </form>
      </div>

      <div className="search-main">
        <section className="results-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching for technical data...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state glass animate-fade">
               <span className="empty-icon">📂</span>
               <h4>No results found for "{query}"</h4>
               <p>Try searching with a different term or check your filters.</p>
               <button onClick={() => {setSearch(''); setSelectedCategory(''); router.push('/search')}} className="btn-secondary">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="dashboard-cards-stack">
                {notes.map((note) => (
                  <Link key={note._id} href={`/data-note/${note.slug}`} className="note-card-horizontal glass-card no-underline animate-fade">
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
                        <div className="card-right-info">
                          <div className="likes-count-pill">
                            ❤️ {note.likes?.length || 0}
                          </div>
                          <div className="creator-profile-mini">
                            <img src={note.createdBy?.profile_pic_url || 'https://via.placeholder.com/30'} alt="p" className="avatar-xxs" />
                            <span>{note.createdBy?.full_name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-meta-small">
                        {note.type && <span className="meta-item">Type: <b>{note.type}</b></span>}
                        {note.item && <span className="meta-item">Item: <b>{note.item}</b></span>}
                        {note.category && <span className="meta-item">Category: <b>{note.category.replace('-', ' ')}</b></span>}
                      </div>

                      {note.details && <p className="card-desc-text">{note.details?.substring(0, 160)}...</p>}
                    </div>
                  </Link>
                ))}
              </div>
              
              {notes.length < total && (
                <div className="pagination-wrap animate-fade">
                  <button 
                    onClick={handleShowMore} 
                    className="btn-primary"
                    disabled={loadingMore}
                    style={{ padding: '12px 30px', margin: '30px auto', display: 'flex' }}
                  >
                    {loadingMore ? <div className="spinner-xs"></div> : 'Show More Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>


  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
