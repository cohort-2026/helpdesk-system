import { IoHomeOutline } from "react-icons/io5";
import { TbCheckupList } from "react-icons/tb";
import SideBar from "../../components/ui/SideBar";
import LogoArea from "../../components/ui/LogoArea";
import TopHeader from "../../components/ui/TopHeader";
import { useState } from "react";

const EmployeeHomePage = () => {

  const [selectedPage, setSelectedPage] = useState<string>("My requests");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: "My requests", href: "#", current: true, icon: IoHomeOutline },
    {
      name: "Submit request",
      href: "#",
      current: false,
      icon: TbCheckupList,
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
        <SideBar navigation={navigation} setSelectedPage={setSelectedPage} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
          <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Dashboard Main Content */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 bg-background">
          <div className="h-full rounded-xl border-2 border-dashed border-secondary/30 bg-accent/5 p-4">
            <h5>{selectedPage}</h5>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeHomePage;
