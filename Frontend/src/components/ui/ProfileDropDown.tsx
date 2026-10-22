import {useState} from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Dialog } from "./Dialog";

const ProfileDropDown = () => {

  const [profileOpen, setProfileOpen] = useState(false);

    const {logout} = useAuth();
    const navigate = useNavigate();
    const {user} = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
      <>
      <div>
            <div className="absolute top-16 right-0 w-56 bg-background border border-secondary/20 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-secondary/20">
                    <div className="text-sm font-semibold text-body-text">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-body-text/60">
                      {user?.role || "Employee"}
                    </div>
                  </div>
                  <div className="py-1">
                    <div
                      className="block px-4 py-2 text-sm text-body-text hover:bg-secondary/20 cursor-pointer"
                      onClick={() => setProfileOpen(!profileOpen)}
                      >
                      Profile
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-body-text hover:bg-secondary/20"
                    >
                      Logout
                    </button>
                  </div>
                </div>
        </div>
                        {profileOpen && <Dialog />}

</>
    );
};

export default ProfileDropDown;