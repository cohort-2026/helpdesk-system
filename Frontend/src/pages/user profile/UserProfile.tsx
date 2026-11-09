import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UsersContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

const UserProfile: React.FC = () => {
  // Use AuthContext to fetch and access authenticated user data
  const { user, loading: authLoading, checkAuth, updateAuthUser } = useAuth();

  // Use UsersContext to perform the update operation
  const { updateUser, actionLoading, error: userContextError, clearError } = useUsers();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  // Fetch / refresh user data from AuthContext on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sync form inputs with the user data in AuthContext whenever it changes.
  // Done during render (not in an effect) so the form never shows stale values.
  const [syncedUser, setSyncedUser] = useState<typeof user>(null);
  if (user && user !== syncedUser) {
    setSyncedUser(user);
    setName(user.name || "");
    setSurname(user.surname || "");
    setEmail(user.email || "");
  }

  const handleReset = () => {
    setName(user?.name || "");
    setSurname(user?.surname || "");
    setNewPassword("");
    setConfirmPassword("");
    setLocalError("");
    setSuccessMessage("");
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");
    clearError();

    const userId = user?.user_id || user?.id;
    if (!userId) {
      setLocalError("Unable to locate your user ID. Please sign in again.");
      return;
    }

    if (!name.trim()) {
      setLocalError("First name is required.");
      return;
    }

    if (!surname.trim()) {
      setLocalError("Surname is required.");
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setLocalError("Password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setLocalError("New password and confirmation do not match.");
        return;
      }
    }

    const payload: { name: string; surname: string; password?: string } = {
      name: name.trim(),
      surname: surname.trim(),
    };

    if (newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    // Use UsersContext to update user information
    const updatedUser = await updateUser(userId, payload);

    if (updatedUser) {
      // Synchronize updated user information into AuthContext
      updateAuthUser({
        name: updatedUser.name,
        surname: updatedUser.surname,
      });

      setSuccessMessage("Your profile has been updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const displayError = localError || userContextError;
  const initials = `${name?.[0] || user?.name?.[0] || ""}${surname?.[0] || user?.surname?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-body-text">Account Profile</h2>
        <p className="text-xs text-body-text/70 mt-1">
          Manage your personal information, role details, and security credentials.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          description={successMessage}
          icon={<IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />}
        />
      )}

      {displayError && (
        <Alert
          variant="error"
          title="Error"
          description={displayError}
        />
      )}

      {/* Profile Overview Card */}
      <div className="bg-background border border-secondary/20 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-xl select-none">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold text-body-text">
              {name || user?.name} {surname || user?.surname}
            </h3>
            <p className="text-xs text-body-text/70 flex items-center gap-1.5 mt-0.5">
              <IoMailOutline className="w-3.5 h-3.5" />
              {email || user?.email || "No email on file"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
                {user?.role || "Employee"}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Active Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-background border border-secondary/20 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Group */}
          <div>
            <h3 className="text-base font-semibold text-body-text flex items-center gap-2 pb-2 border-b border-secondary/15">
              <IoPersonOutline className="w-4 h-4 text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Input
                  label="First Name"
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                  disabled={authLoading || actionLoading}
                />
              </div>
              <div>
                <Input
                  label="Surname"
                  id="profile-surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Enter your surname"
                  required
                  disabled={authLoading || actionLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Email Address"
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  placeholder="email@example.com"
                  className="bg-accent/10 cursor-not-allowed opacity-80"
                />
                <p className="text-xs text-body-text/50 mt-1">
                  Email address is associated with your login credentials and managed by administrators.
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Group */}
          <div>
            <h3 className="text-base font-semibold text-body-text flex items-center gap-2 pb-2 border-b border-secondary/15">
              <IoLockClosedOutline className="w-4 h-4 text-primary" />
              Security & Password
            </h3>
            <p className="text-xs text-body-text/60 mt-2">
              Leave these fields blank if you do not want to change your password.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Input
                  label="New Password"
                  id="profile-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  disabled={authLoading || actionLoading}
                />
              </div>
              <div>
                <Input
                  label="Confirm New Password"
                  id="profile-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  disabled={authLoading || actionLoading}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary/15">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={actionLoading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={actionLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
