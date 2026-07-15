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
        <main style={{ padding:'2rem', maxWidth: 400 }}>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required /><br />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="USER">Regular User</option>
                    <option value="OWNER">Property Owner</option>
                </select><br />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Register</button>
            </form>
        </main>
    );
}