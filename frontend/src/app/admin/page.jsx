'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useRequireAuth } from '../../lib/useAuth';

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth('ADMIN');
  const queryClient = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
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
    onError: (err) => { alert(`Failed to disable property: ${err.message}`); }
  });

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>Loading...</p>;
  if (!user) return null;
  if (isLoading) return <p style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>Loading properties...</p>;
  if (error) return <p style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error.message}</p>;

  return (
    <main style={{ maxWidth: "800px", margin: "2rem auto", padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: "800", color: "#000" }}>All Properties (Admin)</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data.map((p) => {
          const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : null;
          const isArchived = p.status === 'ARCHIVED';

          return (
            <div 
              key={p.id} 
              style={{ 
                border: '1px solid #e4e4e7', 
                borderRadius: "12px", 
                padding: "1.5rem", 
                backgroundColor: '#ffffff',
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                opacity: isArchived ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem", fontSize: '1.25rem', fontWeight: '700', color: '#000' }}>
                    {p.title}
                  </h2>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    letterSpacing: '0.05em', 
                    color: isArchived ? '#a1a1aa' : '#71717a',
                    border: '1px solid #e4e4e7',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#fafafa'
                  }}>
                    {p.status}
                  </span>
                </div>

                <div style={{ color: '#52525b', fontSize: '0.9rem' }}>
                  <p style={{ margin: "0.25rem 0" }}>
                    <strong>Location:</strong> {p.location}
                  </p>
                  <p style={{ margin: "0.25rem 0 1rem" }}>
                    <strong>Price:</strong> ${p.price}
                  </p>
                </div>

                <div>
                  {!isArchived ? (
                    <button 
                      onClick={() => disableMutation.mutate(p.id)} 
                      style={{
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#000000',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#000000';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#000000';
                      }}
                    >
                      Disable
                    </button>
                  ) : (
                    <span style={{ color: '#a1a1aa', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Archived
                    </span>
                  )}
                </div>
              </div>

              <div style={{ 
                width: '130px', 
                height: '130px', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                border: '1px solid #e4e4e7',
                flexShrink: 0,
                backgroundColor: '#f4f4f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={p.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '600' }}>
                    No Image
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </main>
  );
}