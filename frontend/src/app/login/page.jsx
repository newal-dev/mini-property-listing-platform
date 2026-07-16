'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'OWNER') {
        router.push('/owner');
      } else {
        router.push('/user');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </main>
  );
}