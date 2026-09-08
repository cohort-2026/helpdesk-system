import React from "react";
import { IoHomeOutline } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const EmployeeHomePage = () => {
  const navigation = [
    { name: "My requests", href: "#", current: true, icon: IoHomeOutline },
    {
      name: "Submit request",
      href: "#",
      current: false,
      icon: IoPersonAddOutline,
    },
  ];

  return (
    <div className="flex h-screen bg-background text-sm font-medium text-body-text">
      {/* Sidebar laslhs */}
      <div className="flex w-72 flex-col border-r border-secondary/20 bg-background">
        {/* Logo Area */}
        <div className="flex h-16 shrink-0 items-center px-6">
          <svg
            className="h-8 w-8 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.31 5.01l2.45-2.45C5.28 13.79 5 12.92 5 12c0-3.87 3.13-7 7-7s7 3.13 7 7c0 .92-.28 1.79-.76 2.56l2.45 2.45C21.52 15.5 22 13.8 22 12c0-5.52-4.48-10-10-10zm-3 15h6v-2h-6v2zm3-12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
              opacity="0.8"
            />
          </svg>
          <span className="text-body-text text-sm font-semibold leading-6">
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
                            ? "bg-accent/30 text-primary"
                            : "text-body-text/70 hover:bg-accent/20 hover:text-primary"
                        }`}
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
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-secondary/20 bg-background px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <IoSearch className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-body-text/50" />
              <input
                id="search-field"
                className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-body-text focus:ring-0 sm:text-sm placeholder:text-body-text/50 outline-none"
                placeholder="Search"
                type="search"
                name="search"
              />
            </form>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-body-text/60 hover:text-primary"
              >
                <span className="sr-only">View notifications</span>
                <IoNotificationsOutline className="h-6 w-6" />
              </button>

              <div
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-secondary/20"
                aria-hidden="true"
              />

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4">
                <button
                  type="button"
                  className="flex items-center gap-x-3 p-1.5 outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full bg-secondary/30"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Tom Cook"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="text-sm font-semibold leading-6 text-body-text"
                      aria-hidden="true"
                    >
                      John Doe
                    </span>
                    <IoChevronDownOutline className="ml-2 h-5 w-5 text-body-text/60" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Content / Placeholder */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 bg-background">
          <div className="h-full rounded-xl border-2 border-dashed border-secondary/30 bg-accent/5 p-4">
       
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeHomePage;
