'use client'
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api'; 
import { useRequireAuth } from '../../lib/useAuth';

export default function OwnerDashboard() {
    const { user, loading } = useRequireAuth('OWNER');
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [files, setFiles] = useState({});

    const { data=[], isLoading, error } = useQuery({
        queryKey: ['myProperties'],
        queryFn: () => apiFetch('/properties/mine', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`},
        }),
        enabled: !!user && !loading,
    });

    const createMutation = useMutation({
        mutationFn: () => apiFetch('/properties', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ title, description, location, price: Number(price) }),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myProperties'] });
            setTitle(''); setDescription(''); setLocation(''); setPrice('');
        },
    });

    const uploadImageMutation = useMutation({
        mutationFn: ({ propertyId, file }) => {
            const formData = new FormData();
            formData.append('image', file);

            return apiFetch(`/properties/${propertyId}/images`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: formData,
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProperties'] }),
        onError: (err) => alert(err.message)
    });

    const publishMutation = useMutation({
        mutationFn: (id) => apiFetch(`/properties/${id}/publish`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`},
        }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProperties'] }),
    });

    if (loading) return <p>Loading...</p>;
    if (!user) return null;
    if(isLoading) return <p>Loading ...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
            <h1 style={{ padding: '1rem' }}>My Properties</h1>

            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}
                >
                <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <button type="submit">Create Property</button>
            </form>
            
            {data.map((p) => (
                <div key={p.id}
                    style={{
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                    }}
                >
                    <h2>{p.title} — {p.status}</h2>
                    <p>{p.location} — ${p.price}</p>
                    {p.status === 'DRAFT' && (
                        <>
                            <label className="file-upload">
                                <p style={{
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        padding: '0.2rem 0.5rem',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        width:'9rem'
                                    }}>Choose Image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                    setFiles({ ...files, [p.id]: e.target.files[0] })
                                    }
                                />
                            </label>


                            <div
                                style={{
                                    display: 'flex',
                                    gap: '2rem',
                                    marginTop: '0.75rem',
                                }}
                            >
                                <button type="button"
                                    onClick={() => {
                                        const file = files[p.id];

                                        if (file) {
                                            uploadImageMutation.mutate({
                                                propertyId: p.id,
                                                file,
                                            });
                                        }
                                    }}
                                    style={{
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Upload Image
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => publishMutation.mutate(p.id)}
                                    style={{
                                        border: '2px solid #ddd',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Publish
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </main>
    );
}