'use client'

import { useState, useEffect } from 'react';
import { useMutation,  useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export default function HomePage() {
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        apiFetch('/properties').then((data) => setProperties(data.properties));
    }, []);

    return (
        <main style={{ padding: '2rem' }}>
            <h1>Available Properties</h1>
            {properties.map((p) => (
                <div
                    key={p.id}
                    style={{ 
                      border: '1px solid #ccc', 
                      margin: '1rem 0', 
                      padding: '1rem' 
                    }}
                >
                    <h2>{p.title}</h2>
                    <p>{p.location} = ${p.price}</p>
                    <FavoriteButton propertyId={p.id} />
                </div>
            ))}
        </main>
    );
}

function FavoriteButton({ propertyId }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/favorites/${propertyId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData(['favorites']) || [];
      queryClient.setQueryData(['favorites'], [...previous, propertyId]);
      return { previous };
    },

    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['favorites'], context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const favorites = queryClient.getQueryData(['favorites']) || [];
  const isFavorited = favorites.includes(propertyId);

  return (
    <button onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
      {isFavorited ? '💔 Unfavorite' : '🤍 Favorite'}
    </button>
  );
}