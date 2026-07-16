'use client';
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api';
import { useRequireAuth } from '../../lib/useAuth';

export default function UserDashboard() {
    const { user, loading } = useRequireAuth('USER');

    const {data, isLoading, error } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => apiFetch('/favorites', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        enabled: !!user && !loading,
    });

    if (loading) return <p>Loading...</p>;
    if(!user) return null;
    if (isLoading) return <p>Loading Favorites...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <main style={{ padding: '2rem' }}>
            <h1>My Favorites</h1>
            {data.length === 0 && <p>No favorites yet.</p>}
            {data.map((fav) => (
                <div key={fav.id} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
                    <h2>{fav.property.title}</h2>
                    <p>{fav.property.location} - ${fav.property.price}</p>
                </div>
            ))}
        </main>
    );
}