import AppHeader from "@/components/AppHeader";

export default function MemorialLayout({
  children,
}: LayoutProps<"/memorial">) {
  return (
    <div className="flex-1 flex flex-col">
      <AppHeader />
      {children}
    </div>
  );
}
