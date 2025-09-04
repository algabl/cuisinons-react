export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-4">{children}</div>;
}
