import React from "react";

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const SideBar = ({navigation, setSelectedPage}: {navigation: NavigationItem[], setSelectedPage: React.Dispatch<React.SetStateAction<string>>}) => {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8">
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                      item.current
                        ? "bg-accent/30 text-primary"
                        : "text-body-text/70 hover:bg-accent/20 hover:text-primary"
                    }`}
                    onClick={() => setSelectedPage(item.name)}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        item.current
                          ? "text-primary"
                          : "text-body-text/60 group-hover:text-primary"
                      }`}
                    />
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
