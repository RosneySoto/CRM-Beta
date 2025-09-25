import { Link } from "@heroui/link";
import { Outlet } from "react-router-dom";

// import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/layouts/sidebar";

export default function PublicLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="relative flex flex-col h-screen">
          {/* <Navbar /> */}
          <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
            <Outlet />
          </main>
          <footer className="w-full flex items-center justify-center py-3">
            <Link
              isExternal
              className="flex items-center gap-1 text-current"
              href="https://heroui.com"
              title="heroui.com homepage"
            >
              <span className="text-default-600">Powered by</span>
              <p className="text-primary">HeroUI</p>
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
