import MainLayout from '@/components/Layout/MainLayout';

export default function LeaderboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Classements" 
      description="Découvrez les meilleurs développeurs"
    >
      {children}
    </MainLayout>
  );
} 