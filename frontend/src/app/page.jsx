'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const btnStyle = (isFav) => ({
  border: '2px solid #000', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem',
  backgroundColor: isFav ? '#000' : 'transparent', color: isFav ? '#fff' : '#000',
  fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.15s'
});

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const queryClient = useQueryClient();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    apiFetch('/properties').then((d) => setProperties(d?.properties || []));
  }, []);

  useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiFetch('/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res || []).map(f => f.propertyId || f.id || f)),
    enabled: !!token,
    initialData: [],
  });

  const favorites = queryClient.getQueryData(['favorites']) || [];

  const toggleFav = useMutation({
    mutationFn: async (id) => {
      const isFav = favorites.includes(id);
      return apiFetch(`/favorites/${id}`, { method: isFav ? 'DELETE' : 'POST', headers: { Authorization: `Bearer ${token}` } });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const prev = queryClient.getQueryData(['favorites']) || [];
      queryClient.setQueryData(['favorites'], prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      return { prev };
    },
    onError: (_, __, ctx) => queryClient.setQueryData(['favorites'], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 2rem', fontFamily: 'Arial' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: '800' }}>Available Properties</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {properties.map((p) => {
          const isFav = favorites.includes(p.id);
          const img = p.images?.[0]?.url;
          return (
            <div key={p.id} style={{ border: '1px solid #e4e4e7', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', backgroundColor: '#fff' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{p.title}</h2>
                <div style={{ color: '#52525b', fontSize: '0.9rem' }}>
                  <p style={{ margin: '0.25rem 0' }}><strong>Location:</strong> {p.location}</p>
                  <p style={{ margin: '0.25rem 0 1rem' }}><strong>Price:</strong> ${p.price}</p>
                </div>
                <div>
                  {token ? (
                    <button 
                      onClick={() => toggleFav.mutate(p.id)} 
                      style={btnStyle(isFav)}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = isFav ? '#27272a' : '#000'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = isFav ? '#000' : 'transparent'}
                    >
                      {isFav ? '❤️ Favorited' : '🤍 Favorite'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontStyle: 'italic' }}>Log in to save favorites</span>
                  )}
                </div>
              </div>
              <div style={{ width: '130px', height: '130px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f5', flexShrink: 0 }}>
                {img ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '600' }}>No Image</span>}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}