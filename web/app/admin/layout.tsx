export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <nav>Area administrativa</nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
