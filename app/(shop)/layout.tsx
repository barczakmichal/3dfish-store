import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
