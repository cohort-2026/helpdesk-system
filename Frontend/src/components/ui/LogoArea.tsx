
const LogoArea = () => {
  return (
          <div className="flex h-16 shrink-0 items-center px-6 position sticky top-0 z-1 bg-background">
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
  )
}

export default LogoArea
