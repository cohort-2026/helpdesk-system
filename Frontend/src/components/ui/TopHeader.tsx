import React from 'react'
import { IoChevronDownOutline, IoNotificationsOutline, IoSearch, IoMenuOutline } from 'react-icons/io5'
import { Input } from './Input'
import { useState } from 'react'
import ProfileDropDown from './ProfileDropDown'

const TopHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {

  const [isOpen, setIsOpen] = useState(false);

  return (
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-secondary/20 bg-background px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-body-text/60 hover:text-primary md:hidden mr-4"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <IoMenuOutline className="h-6 w-6" />
          </button>
          {/* Search Bar */}
          <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Search
              </label>
              <IoSearch className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-body-text/50" />
              <Input
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
                  className="flex items-center gap-x-3 p-1.5 outline-none cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
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

              {isOpen && (
              <ProfileDropDown />
              )}
            </div>
          </div>
        </div>
  )
}

export default TopHeader