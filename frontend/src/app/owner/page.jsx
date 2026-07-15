'use client'
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api'; 
import { useRequireAuth } from '../../lib/useAuth';

export default function OwnerDashboard() {
    const { user, loading } = useRequireAuth('OWNER');

    const { data, isLoading, error } = useQuery({
        queryKey: ['myProperties'],
        queryFn: () => apiFetch('/properties/mine', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`},
        }),
        enabled: !!user && !loading,
    });

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    if(isLoading) return <p>Loading ...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <main style={{ padding: '2rem' }}>
            <h1>My Properties</h1>
            {data.map((p) => (
                <div key={p.id}>
                    {p.title} – {p.status}
                </div>
            ))}
        </main>
    );
}