import MainLayout from '@/components/Layout/MainLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Tableau de bord" 
      description="Votre espace personnel RTFM2WIN"
    >
      {children}
    </MainLayout>
  );
} 