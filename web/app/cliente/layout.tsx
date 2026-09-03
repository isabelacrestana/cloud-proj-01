export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <nav>Area do cliente</nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
