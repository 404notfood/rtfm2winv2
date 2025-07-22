import MainLayout from '@/components/Layout/MainLayout';

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Notifications" 
      description="Vos notifications et alertes"
    >
      {children}
    </MainLayout>
  );
} 