import MainLayout from '@/components/Layout/MainLayout';

export default function ThemesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Thèmes" 
      description="Personnalisez l'apparence de votre interface"
    >
      {children}
    </MainLayout>
  );
}