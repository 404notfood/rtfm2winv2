import MainLayout from '@/components/Layout/MainLayout';

export default function BattleRoyaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Battle Royale" 
      description="Affrontez d'autres développeurs en temps réel"
    >
      {children}
    </MainLayout>
  );
} 