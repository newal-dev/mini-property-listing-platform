'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useRequireAuth } from '../../lib/useAuth';

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth('ADMIN');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['allProperties'],
    queryFn: () => apiFetch('/properties/admin/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
    enabled: !!user && !loading,
  });

  const disableMutation = useMutation({
    mutationFn: (propertyId) => apiFetch(`/properties/${propertyId}/disable`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allProperties'] }),
  });

  if (loading) return <p>Loading...</p>;
  if (!user) return null;
  if (isLoading) return <p>Loading properties...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>All Properties (Admin)</h1>
      {data.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
          <h2>{p.title} — {p.status}</h2>
          <p>{p.location} — ${p.price}</p>
          {p.status !== 'ARCHIVED' && (
            <button onClick={() => disableMutation.mutate(p.id)}>Disable</button>
          )}
        </div>
      ))}
    </main>
  );
}