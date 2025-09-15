'use client';

import { useState, useEffect } from 'react';

interface ClientWrapperProps {
    children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark as client-side rendered
        setIsClient(true);
    }, []);

    // Show nothing while hydrating, then show children
    if (!isClient) {
        return null;
    }

    return <>{children}</>;
}
