import { useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineAssignmentInd } from "react-icons/md";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { HiOutlineQueueList } from "react-icons/hi2";
import LogoArea from "../../components/ui/LogoArea";
import SideBar from "../../components/ui/SideBar";
import TopHeader from "../../components/ui/TopHeader";

const AgentHomePage = () => {

    const [selectedPage, setSelectedPage] = useState<string>("Dashboard");
  

  const navigation = [
    { name: "Dashboard", href: "#", current: true, icon: IoHomeOutline },
    {
      name: "Ticket queue",
      href: "#",
      current: false,
      icon: HiOutlineQueueList,
    },
    {
      name: "Assigned tickets",
      href: "#",
      current: false,
      icon: MdOutlineAssignmentInd,
    },
    {
      name: "Resolved tickets",
      href: "#",
      current: false,
      icon: MdOutlineAssignmentTurnedIn,
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

export default AgentHomePage;
