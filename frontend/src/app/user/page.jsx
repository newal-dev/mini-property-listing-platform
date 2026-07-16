'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useRequireAuth } from '../../lib/useAuth';

export default function UserDashboard() {
    const { user, loading } = useRequireAuth('USER');
    const queryClient = useQueryClient();

    const [localLocation, setLocalLocation] = useState('');
    const [localMinPrice, setLocalMinPrice] = useState('');
    const [localMaxPrice, setLocalMaxPrice] = useState('');

    const [location, setLocation] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);
    const limit = 6;

    const handleApplyFilters = (e) => {
        if (e) e.preventDefault();
        setLocation(localLocation);
        setMinPrice(localMinPrice);
        setMaxPrice(localMaxPrice);
        setPage(1);
    };

    const { data: catalogData, isLoading: isCatalogLoading, isFetching: isCatalogFetching } = useQuery({
        queryKey: ['publicProperties', page, location, minPrice, maxPrice],
        queryFn: () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                ...(location && { location }),
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
            });
            return apiFetch(`/properties?${params.toString()}`);
        },
    });

    const { data: favoritesData = [], isLoading: isFavsLoading, error: favsError } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => apiFetch('/favorites', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        enabled: !!user && !loading,
    });

    const isFavorited = (propertyId) => {
        return favoritesData.some(fav => fav.propertyId === propertyId);
    };

    const toggleFavoriteMutation = useMutation({
        mutationFn: async ({ propertyId, currentlyFav }) => {
            const token = localStorage.getItem('token');
            const url = `/favorites/${propertyId}`;
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${url}`, {
                method: currentlyFav ? 'DELETE' : 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to process request');
            }

            if (response.status === 204) { 
                return null;
            }

            return response.json();
        },
        onMutate: async ({ propertyId, currentlyFav }) => {
            await queryClient.cancelQueries({ queryKey: ['favorites'] });

            const previousFavorites = queryClient.getQueryData(['favorites']);

            queryClient.setQueryData(['favorites'], (oldFavorites = []) => {
                if (currentlyFav) {
                    return oldFavorites.filter(fav => fav.propertyId !== propertyId);
                } else {
                    const targetProperty = catalogData?.properties?.find(p => p.id === propertyId);
                    if (!targetProperty) return oldFavorites;

                    const mockNewFavorite = {
                        id: `temp-id-${Date.now()}`, 
                        userId: user.id,
                        propertyId: propertyId,
                        property: targetProperty
                    };
                    return [...oldFavorites, mockNewFavorite];
                }
            });

            return { previousFavorites };
        },
        onError: (err, variables, context) => {
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites'], context.previousFavorites);
            }
            alert(`Failed to update favorite: ${err.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    if (loading) return <p>Loading...</p>;
    if(!user) return null;
    if (isCatalogLoading && !catalogData) return <p>Loading Catalog...</p>;
    if (isFavsLoading) return <p>Loading Favorites List...</p>;
    if (favsError) return <p>Error: {favsError.message}</p>;

    const properties = catalogData?.properties || [];
    const totalPages = catalogData?.totalPages || 1;

    return (
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ marginBottom: '2rem' }}>Welcome, {user.name || 'User'}!</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                <div>
                    <h2>Available Listings {isCatalogFetching && <span style={{ fontSize: '0.9rem', color: '#888' }}>(Updating...)</span>}</h2>
                    
                    <form onSubmit={handleApplyFilters} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input 
                            placeholder="Search location..." 
                            value={localLocation} 
                            onChange={(e) => setLocalLocation(e.target.value)} 
                            style={{ padding: '0.5rem', flex: 1 }}
                        />
                        <input 
                            type="number" 
                            placeholder="Min Price" 
                            value={localMinPrice} 
                            onChange={(e) => setLocalMinPrice(e.target.value)} 
                            style={{ padding: '0.5rem', width: '100px' }}
                        />
                        <input 
                            type="number" 
                            placeholder="Max Price" 
                            value={localMaxPrice} 
                            onChange={(e) => setLocalMaxPrice(e.target.value)} 
                            style={{ padding: '0.5rem', width: '100px' }}
                        />
                        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                            Apply Filters
                        </button>
                    </form>

                    {properties.length === 0 && <p>No published properties found matching those filters.</p>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: isCatalogFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                        {properties.map((property) => {
                            const isFav = isFavorited(property.id);
                            return (
                                <div key={property.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ width: '100%', height: '150px', backgroundColor: '#eee', overflow: 'hidden', position: 'relative' }}>
                                        {property.images && property.images.length > 0 ? (
                                            <img 
                                                src={property.images[0].url} 
                                                alt={property.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                                No Image
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={() => toggleFavoriteMutation.mutate({ propertyId: property.id, currentlyFav: isFav })}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: isFav ? '#ff4d4d' : '#fff',
                                                color: isFav ? '#fff' : '#000',
                                                border: '1px solid #ddd',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0px 2px 5px rgba(0,0,0,0.1)'
                                            }}
                                            title={isFav ? "Unfavorite" : "Favorite"}
                                        >
                                            ♥
                                        </button>
                                    </div>
                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{property.title}</h3>
                                            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{property.location}</p>
                                        </div>
                                        <p style={{ margin: '0', fontWeight: 'bold' }}>${property.price}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
                                Next
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ borderLeft: '1px solid #eee', paddingLeft: '2rem' }}>
                    <h2>My Saved Favorites</h2>
                    {favoritesData.length === 0 && <p style={{ color: '#888' }}>No favorites saved yet.</p>}
                    
                    {favoritesData.map((fav) => (
                        <div 
                            key={fav.id} 
                            style={{ 
                                border: '1px solid #ccc', 
                                borderRadius: '8px', 
                                margin: '1rem 0', 
                                padding: '1rem',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                        >
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                {fav.property?.images && fav.property.images.length > 0 ? (
                                    <img 
                                        src={fav.property.images[0].url} 
                                        alt={fav.property.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#999' }}>
                                        Saved
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{fav.property?.title || 'Unknown Title'}</h3>
                                <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>{fav.property?.location} - ${fav.property?.price}</p>
                            </div>
                            <button 
                                onClick={() => toggleFavoriteMutation.mutate({ propertyId: fav.propertyId, currentlyFav: true })}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#888',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}