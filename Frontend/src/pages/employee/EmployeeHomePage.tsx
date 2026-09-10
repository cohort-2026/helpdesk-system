import { IoHomeOutline } from "react-icons/io5";
import { TbCheckupList } from "react-icons/tb";
import SideBar from "../../components/ui/SideBar";
import LogoArea from "../../components/ui/LogoArea";
import TopHeader from "../../components/ui/TopHeader";
import { useState } from "react";

const EmployeeHomePage = () => {

  const [selectedPage, setSelectedPage] = useState<string>("My requests");

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
    <div className="flex h-screen bg-background text-sm font-medium text-body-text">
      {/* Sidebar laslhs */}
      <div className="flex w-72 flex-col border-r border-secondary/20 bg-background">
        {/* Logo Area */}
        <LogoArea />

        {/* Sidebar Navigation */}
        <SideBar navigation={navigation} setSelectedPage={setSelectedPage}/>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
          <TopHeader/>

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
