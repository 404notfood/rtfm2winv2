import MainLayout from '@/components/Layout/MainLayout';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Profil" 
      description="Gérez votre profil et vos paramètres"
    >
      {children}
    </MainLayout>
  );
} 