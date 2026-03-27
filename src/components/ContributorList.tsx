'use client';
import React from 'react';

interface Contributor {
  username: string;
  full_name: string;
  designation: string;
  profile_pic_url: string;
  facebook: string;
}

export default function ContributorList({ contributors }: { contributors: Contributor[] }) {
  if (!contributors || contributors.length === 0) return null;

  // Unique contributors by username
  const unique = Array.from(new Map(contributors.map(item => [item.username, item])).values());

  return (
    <div className="contributors-section">
      <span className="contrib-label">Contributed by</span>
      <div className="contrib-grid">
        {unique.map((c, idx) => (
          <a key={idx} href={c.facebook} target="_blank" rel="noopener noreferrer" className="contrib-card">
            <img 
              src={c.profile_pic_url || 'https://via.placeholder.com/150'} 
              alt={c.full_name} 
              className="contrib-pic-small" 
            />
            <div className="contrib-details">
              <p className="contrib-name-text">{c.full_name}</p>
              <p className="contrib-desig-text">{c.designation}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
