import { useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";
import { LuBuilding } from "react-icons/lu";
import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "../../components/ui/TopHeader";
import SideBar from "../../components/ui/SideBar";
import LogoArea from "../../components/ui/LogoArea";

const SystemAdminHomePage = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigation = [
    { name: "Dashboard", href: "/system-admin", current: location.pathname === "/system-admin", icon: IoHomeOutline },
    { name: "Users", href: "/system-admin/users", current: location.pathname === "/system-admin/users", icon: IoPersonAddOutline },
    {
      name: "Departments",
      href: "/system-admin/departments",
      current: location.pathname === "/system-admin/departments",
      icon: LuBuilding,
    },
    // { name: "Reports", href: "/system-admin/reports", current: location.pathname === "/system-admin/reports", icon: HiOutlineDocumentReport },
  ];

  return (
    <div className="flex h-screen bg-background text-sm font-medium text-body-text relative">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-body-text/20 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar laslhs */}
      <div className={`fixed inset-y-0 left-0 z-50 flex w-62 flex-col border-r border-secondary/20 bg-background transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo Area */}
        <LogoArea />

        {/* Sidebar Navigation */}
        <SideBar navigation={navigation} closeSidebar={() => setIsSidebarOpen(false)}/>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
          <TopHeader onMenuClick={() => setIsSidebarOpen(true)}/>

        {/* Dashboard Main Content */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 bg-background">
          <div className="h-full rounded-xl border-2 border-dashed border-secondary/30 bg-accent/5 p-4 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemAdminHomePage;
