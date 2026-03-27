'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    }
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Close menus on click outside
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.profile-btn')) {
            setProfileOpen(false);
        }
    };
    window.addEventListener('click', handleClickOutside);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfileOpen(false);
    setIsMobileNavOpen(false);
    router.replace('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link href="/" className="logo">
          <img src="https://i.ibb.co/C3C1Xdtn/96.png" alt="PBS" className="nav-logo-img" />
          <span className="logo-accent">PBS</span>
          <span>hub</span>
        </Link>

        <div className="nav-actions">
          {user ? (
            <div className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
              <img src={user.profile_pic_url || 'https://via.placeholder.com/40'} alt={user.username} className="avatar-sm" />
              <div className={`user-dropdown ${profileOpen ? 'open' : ''} glass`}>
                <div className="dropdown-header">
                  <p className="full-name">{user.full_name}</p>
                  <p className="role-tag">{user.role}</p>
                  <p className="id-tag">ID: {user.username}</p>
                </div>
                <Link href="/dashboard" className="dropdown-item">📊 My Dashboard</Link>
                <Link href="/data-note/new" className="dropdown-item">➕ Create Data-Manual</Link>
                {(user.role === 'admin' || user.role === 'owner') && <Link href="/dashboard/admin" className="dropdown-item">🛡️ Admin Panel</Link>}
                {user.role === 'owner' && <Link href="/dashboard/owner" className="dropdown-item">👑 Owner Panel</Link>}
                <button onClick={handleLogout} className="dropdown-item btn-logout">🚪 Logout</button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn btn-login">Login</Link>
          )}
          
          <button className="mobile-toggle" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
             <span className="dot"></span>
             <span className="dot"></span>
             <span className="dot"></span>
          </button>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`mobile-nav ${isMobileNavOpen ? 'open' : ''} glass`}>
        {user ? (
          <>
            <Link href="/dashboard" onClick={() => setIsMobileNavOpen(false)} className="mobile-item">📊 My Dashboard</Link>
            <Link href="/data-note/new" onClick={() => setIsMobileNavOpen(false)} className="mobile-item">➕ Create Data-Manual</Link>
            {(user.role === 'admin' || user.role === 'owner') && (
              <Link href="/dashboard/admin" onClick={() => setIsMobileNavOpen(false)} className="mobile-item">🛡️ Admin Panel</Link>
            )}
            {user.role === 'owner' && (
              <Link href="/dashboard/owner" onClick={() => setIsMobileNavOpen(false)} className="mobile-item">👑 Owner Panel</Link>
            )}
            <button onClick={handleLogout} className="mobile-item btn-logout">🚪 Logout</button>
          </>
        ) : (
          <Link href="/login" onClick={() => setIsMobileNavOpen(false)} className="mobile-item">Login</Link>
        )}
      </div>

    </nav>

  );
}
