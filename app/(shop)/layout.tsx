import AnnouncementBar from '@/components/AnnouncementBar';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <NavbarWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
