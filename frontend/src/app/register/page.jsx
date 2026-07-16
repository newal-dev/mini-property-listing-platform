'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const router = useRouter();

    const inputStyle = { padding: "0.75rem", borderRadius: "6px", border: "1px solid #e4e4e7", fontSize: "0.95rem", outline: "none", width: "100%", boxSizing: "border-box" };
    const buttonStyle = { padding: "0.75rem", borderRadius: "6px", border: "none", backgroundColor: "#000", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem", transition: "background-color 0.2s" };

    async function handleSubmit (e) {
        e.preventDefault();
        setError('');
        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password, role }),
            });
            router.push('/login');
        } catch(err) {
            setError(err.message);
        }
    }

    return (
    <main style={{ maxWidth: "400px", margin: "4rem auto", padding: "2.5rem", border: "1px solid #e4e4e7", borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "1.75rem", fontWeight: "800", color: "#000", textAlign: "center" }}>Register</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
        
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, cursor: "pointer", backgroundColor: "#fff" }}>
          <option value="USER">Regular User</option>
          <option value="OWNER">Property Owner</option>
        </select>

        {error && <p style={{ color: '#ef4444', margin: 0, fontSize: "0.85rem", textAlign: "center" }}>{error}</p>}
        
        <button 
          type="submit" 
          style={buttonStyle}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#27272a"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#000"}
        >
          Register
        </button>
      </form>
    </main>
  );
}