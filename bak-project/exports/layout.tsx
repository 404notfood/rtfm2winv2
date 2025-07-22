import MainLayout from '@/components/Layout/MainLayout';

export default function ExportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Exports" 
      description="Exportez vos données et statistiques"
    >
      {children}
    </MainLayout>
  );
} 