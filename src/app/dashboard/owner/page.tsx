'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/owner/admins?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleAdmin = async (username: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/owner/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername: username, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading Owner Control Panel...</p>
    </div>
  );

  return (
    <div className="owner-container container">
      <Link href="/dashboard" className="btn-back">← Back to Dashboard</Link>
      <div className="page-header animate-fade">
        <h1 className="title-text">Owner <span className="gradient-text">Control Center</span></h1>
        <p className="subtitle">Manage system administrators and user permissions across the platform.</p>
      </div>

      <div className="user-management glass-card animate-fade">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search users by name or username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <img src={user.profile_pic_url || 'https://via.placeholder.com/40'} alt="p" className="avatar-xs" />
                  </td>
                  <td>{user.full_name}</td>
                  <td>@{user.username}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.designation || 'N/A'}</td>
                  <td>
                    {user.role !== 'owner' ? (
                      <button 
                        onClick={() => handleToggleAdmin(user.username, user.role)}
                        className={`btn-role ${user.role === 'admin' ? 'demote' : 'promote'}`}
                      >
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    ) : (
                      <span className="text-muted">Master Admin</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row text-center">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
