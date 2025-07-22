'use client';

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les problèmes de rendu côté serveur avec localStorage
const AuthPage = dynamic(() => import('./auth'), {
  ssr: false,
});

export default function Page() {
  return <AuthPage />;
} 