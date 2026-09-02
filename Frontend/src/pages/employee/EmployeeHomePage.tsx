import React from 'react'

const EmployeeHomePage = () => {
  const navigation = [
    { name: 'My requests', href: '#', current: true, icon: HomeIcon },
    { name: 'Submit request', href: '#', current: false, icon: UsersIcon },   
  ];


  return (
    <div className="flex h-screen bg-[#0f172a] text-sm font-medium">
      {/* Sidebar */}
      <div className="flex w-72 flex-col border-r border-slate-800 bg-[#0f172a]">
        {/* Logo Area */}
        <div className="flex h-16 shrink-0 items-center px-6">
          <svg className="h-8 w-8 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.31 5.01l2.45-2.45C5.28 13.79 5 12.92 5 12c0-3.87 3.13-7 7-7s7 3.13 7 7c0 .92-.28 1.79-.76 2.56l2.45 2.45C21.52 15.5 22 13.8 22 12c0-5.52-4.48-10-10-10zm-3 15h6v-2h-6v2zm3-12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" opacity="0.8" />
          </svg>
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
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            item.current ? 'text-white' : 'text-slate-400 group-hover:text-white'
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
              <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-500" />
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
              <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-300">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-800" aria-hidden="true" />

              {/* Profile dropdown */}
              <div className="flex items-center gap-x-4">
                <button type="button" className="flex items-center gap-x-3 p-1.5 outline-none">
                  <img
                    className="h-8 w-8 rounded-full bg-slate-800"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Tom Cook"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="text-sm font-semibold leading-6 text-white" aria-hidden="true">
                      Tom Cook
                    </span>
                    <ChevronDownIcon className="ml-2 h-5 w-5 text-slate-400" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Content / Placeholder */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-full rounded-xl border-2 border-dashed border-slate-700/50 bg-[#0f172a] opacity-50" 
               style={{ backgroundImage: `repeating-linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b), repeating-linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b)`, backgroundPosition: `0 0, 10px 10px`, backgroundSize: `20px 20px`}}>
               {/* Pattern overlay for the striped dash effect in the design */}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================
   Inline SVG Icons for complete copy-paste 
   ========================================= */

function HomeIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function FolderIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );
}

function DocumentIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ChartPieIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  );
}

function MagnifyingGlassIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );    
}

export default EmployeeHomePage
