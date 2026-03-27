'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const categories = [
  { id: 'meter-manual', name: 'Meter Manual', icon: '📟', count: '1.2k+', color: '#3b82f6' },
  { id: 'equipment-manual', name: 'Equipment', icon: '⚙️', count: '450+', color: '#8b5cf6' },
  { id: 'instruction', name: 'Instruction', icon: '📚', count: '300+', color: '#10b981' },
  { id: 'document', name: 'Document', icon: '📄', count: '800+', color: '#f59e0b' },
  { id: 'application-form', name: 'Forms', icon: '📝', count: '120+', color: '#ef4444' },
  { id: 'general-data', name: 'General Data', icon: '📊', count: '2k+', color: '#06b6d4' },
];

export default function Home() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          The Hub for Technical <span className="gradient-text">Manuals</span> & 
          <span className="gradient-text"> Specifications</span>
        </h1>
        <p className="hero-subtitle">
          Search for meters, equipments, technical docs and range-based specifications instantly.
        </p>

        <form onSubmit={handleSearch} className="search-form-home">
          <div className="search-input-wrapper glass">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by Meter No, Item, Model or Range (e.g. 500-800)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-home"
            />
            <button type="submit" className="search-btn-home">Search</button>
          </div>
        </form>

        <div className="stats-strip">
          <span className="stat-item">⚡ High Performance Range Search</span>
          <span className="stat-item">⭐ 5,000+ Verified Specs</span>
          <span className="stat-item">🤝 Open Contribution</span>
        </div>
      </div>

      <div className="categories-grid container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="grid">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/search?category=${cat.id}`} className="cat-card glass-card">
              <div className="cat-icon-wrap" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                 <span className="cat-icon-large">{cat.icon}</span>
              </div>
              <h3 className="cat-name">{cat.name}</h3>
              <p className="cat-count">{cat.count} files</p>
              <div className="cat-indicator" style={{ backgroundColor: cat.color }}></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
