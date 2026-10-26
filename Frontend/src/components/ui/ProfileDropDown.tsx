import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProfileDropDownProps {
  onClose?: () => void;
}

const ProfileDropDown: React.FC<ProfileDropDownProps> = ({ onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const getProfilePath = (): string => {
    switch (user?.role) {
      case "Employee":
        return "/employee/profile";
      case "Agent":
        return "/agent/profile";
      case "Department Lead":
        return "/department-lead/profile";
      case "System Admin":
        return "/system-admin/profile";
      case "Platform Admin":
        return "/platform-admin/profile";
      default:
        return "/";
    }
  };

  const handleProfileClick = () => {
    navigate(getProfilePath());
    onClose?.();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    onClose?.();
  };

  return (
    <div className="absolute top-16 right-4 sm:right-6 lg:right-8 w-56 bg-background border border-secondary/20 rounded-md shadow-lg py-1 z-50">
      <div className="px-4 py-2 border-b border-secondary/20">
        <div className="text-sm font-semibold text-body-text truncate">
          {user?.name ? `${user.name} ${user.surname || ''}`.trim() : "User"}
        </div>
        <div className="text-xs text-body-text/60">
          {user?.role || "Employee"}
        </div>
      </div>
      <div className="py-1">
        <button
          type="button"
          className="w-full text-left px-4 py-2 text-sm text-body-text hover:bg-secondary/20 cursor-pointer transition-colors"
          onClick={handleProfileClick}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropDown;