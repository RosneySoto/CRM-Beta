import { Outlet } from "react-router-dom";

// import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/layouts/sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="relative flex flex-col h-screen">
          {/* <Navbar /> */}
          <main className="flex-grow px-6 max-h-screen">
            <Outlet />
          </main>
        </div>
      </main>
    </div>
  );
}
