import MainLayout from '@/components/Layout/MainLayout';

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Achievements" 
      description="Vos réussites et trophées"
    >
      {children}
    </MainLayout>
  );
}