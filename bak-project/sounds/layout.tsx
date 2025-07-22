import MainLayout from '@/components/Layout/MainLayout';

export default function SoundsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Sons" 
      description="Configurez vos préférences audio"
    >
      {children}
    </MainLayout>
  );
}