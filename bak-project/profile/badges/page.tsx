'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileBadgesPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page des achievements
    router.replace('/achievements');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
} 