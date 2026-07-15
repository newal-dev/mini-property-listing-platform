'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireAuth(requiredRole) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if(!token || !userStr) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if(requiredRole && user.role !== requiredRole) {
            router.push('/');
            return;
        }

        setUser(user);
        setLoading(false); 
    }, [requiredRole, router]);

    return { user, loading };
}