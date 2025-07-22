import MainLayout from '@/components/Layout/MainLayout';

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      title="Amis" 
      description="Gérez vos amis et invitations"
    >
      {children}
    </MainLayout>
  );
}