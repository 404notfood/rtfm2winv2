import MainLayout from '@/components/Layout/MainLayout';

export default function LeaguesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Ligues" 
      description="Rejoignez des ligues et grimpez dans les classements"
    >
      {children}
    </MainLayout>
  );
} 