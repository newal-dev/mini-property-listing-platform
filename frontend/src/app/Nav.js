'use client';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const dashboardPath = user?.role === 'ADMIN' ? '/admin'
    : user?.role === 'OWNER' ? '/owner'
    : user?.role === 'USER' ? '/user'
    : null;

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  return (
    <nav style={{ padding: '1rem 2rem', display: 'flex', gap: '1.5rem', backgroundColor: "#000", color: "#fff", alignItems: "center" }}>
      <a href="/" style={{ color: '#fff' }}>Home</a>
      {!user && <a href="/login" style={{ color: '#fff' }}>Login</a>}
      {!user && <a href="/register" style={{ color: '#fff' }}>Register</a>}
      {user && dashboardPath && <a href={dashboardPath} style={{ color: '#fff' }}>Dashboard</a>}
      {user && <button onClick={logout} style={{ marginLeft: 'auto' }}>Logout</button>}
    </nav>
  );
}