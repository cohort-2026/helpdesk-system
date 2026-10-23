import { useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineAssignmentInd } from "react-icons/md";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { HiOutlineQueueList } from "react-icons/hi2";
import { Outlet, useLocation } from "react-router-dom";
import LogoArea from "../../components/ui/LogoArea";
import SideBar from "../../components/ui/SideBar";
import TopHeader from "../../components/ui/TopHeader";

const AgentHomePage = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/agent", current: location.pathname === "/agent", icon: IoHomeOutline },
    {
      name: "Ticket queue",
      href: "/agent/ticket-queue",
      current: location.pathname === "/agent/ticket-queue",
      icon: HiOutlineQueueList,
    },
    {
      name: "Assigned tickets",
      href: "/agent/assigned-tickets",
      current: location.pathname === "/agent/assigned-tickets",
      icon: MdOutlineAssignmentInd,
    },
    {
      name: "Resolved tickets",
      href: "/agent/resolved-tickets",
      current: location.pathname === "/agent/resolved-tickets",
      icon: MdOutlineAssignmentTurnedIn,
    },
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

export default AgentHomePage;
