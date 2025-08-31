export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <main className="mx-auto mt-36 max-w-[1250px] px-4">{children}</main>
}
