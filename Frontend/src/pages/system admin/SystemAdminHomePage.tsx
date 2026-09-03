import React from "react";
import { IoHomeOutline } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";

const SystemAdminHomePage = () => {
  const navigation = [
    { name: "Dashboard", href: "#", current: true, icon: IoHomeOutline },
    { name: "Users", href: "#", current: false, icon: IoPersonAddOutline },
    {
      name: "Departments",
      href: "#",
      current: false,
      icon: IoPersonAddOutline,
    },
    { name: "Reports", href: "#", current: false, icon: IoPersonAddOutline },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-sm font-medium">
      {/* Sidebar */}
      <div className="flex w-72 flex-col border-r border-slate-800 bg-[#0f172a]">
        {/* Logo Area */}
        <div className="flex h-16 shrink-0 items-center px-6">
          <svg
            className="h-8 w-8 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.31 5.01l2.45-2.45C5.28 13.79 5 12.92 5 12c0-3.87 3.13-7 7-7s7 3.13 7 7c0 .92-.28 1.79-.76 2.56l2.45 2.45C21.52 15.5 22 13.8 22 12c0-5.52-4.48-10-10-10zm-3 15h6v-2h-6v2zm3-12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
              opacity="0.8"
            />
          </svg>
          <span className="text-white text-sm font-semibold leading-6">
            Helpdesk System
          </span>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4">
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
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            item.current
                              ? "text-white"
                              : "text-slate-400 group-hover:text-white"
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
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0f172a] px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <IoSearch className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-500" />
              <input
                id="search-field"
                className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm placeholder:text-slate-500 outline-none"
                placeholder="Search"
                type="search"
                name="search"
              />
            </form>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-300"
              >
                <span className="sr-only">View notifications</span>
                <IoNotificationsOutline className="h-6 w-6" />
              </button>

              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-800"
                aria-hidden="true"
              />

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4">
                <button
                  type="button"
                  className="flex items-center gap-x-3 p-1.5 outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full bg-slate-800"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Tom Cook"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="text-sm font-semibold leading-6 text-white"
                      aria-hidden="true"
                    >
                      Tom Cook
                    </span>
                    <IoChevronDownOutline className="ml-2 h-5 w-5 text-slate-400" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Content / Placeholder */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-full rounded-xl border-2 border-dashed border-slate-700/50 bg-[#0f172a] opacity-50">
            {/* Pattern overlay for the striped dash effect in the design */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemAdminHomePage;
