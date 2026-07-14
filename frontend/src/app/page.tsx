import { apiFetch } from '@/lib/api';

export default async function HomePage() {
    const data = await apiFetch('/properties');

    return (
        <main style={{ padding: '2rem' }}>
            <h1>Available Properties</h1>
            {data.properties.map((p) => (
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
                </div>
            ))}
        </main>
    );
}
