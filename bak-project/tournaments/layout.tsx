import MainLayout from '@/components/Layout/MainLayout';

export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Tournois" 
      description="Participez aux tournois de programmation"
    >
      {children}
    </MainLayout>
  );
} 