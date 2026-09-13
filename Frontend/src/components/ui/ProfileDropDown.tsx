const ProfileDropDown = () => {
    return (
        <div>
            <div className="absolute top-16 right-0 w-56 bg-background border border-secondary/20 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-secondary/20">
                    <div className="text-sm font-semibold text-body-text">
                      John Doe
                    </div>
                    <div className="text-xs text-body-text/60">
                      Employee
                    </div>
                  </div>
                  <div className="py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-body-text hover:bg-secondary/20"
                    >
                      Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-body-text hover:bg-secondary/20"
                    >
                      Logout
                    </a>
                  </div>
                </div>
        </div>
    );
};

export default ProfileDropDown;