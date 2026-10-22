import React, { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { useUsers, type UserRole } from "../../context/UsersContext";

interface DialogProps {
  ref: React.RefObject<HTMLDialogElement | null>;
}

export const Dialog = ({ ref }: DialogProps) => {
  const { createUser, actionLoading, error: contextError, allowedRoles } = useUsers();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(allowedRoles[0] || "Employee");
  const [localError, setLocalError] = useState("");

  // Keep role in sync with allowed roles when admin switches or loads
  React.useEffect(() => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      setRole(allowedRoles[0]);
    }
  }, [allowedRoles, role]);

  const closeModal = () => {
    setLocalError("");
    ref.current?.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!name.trim() || !surname.trim() || !email.trim() || !role) {
      setLocalError("Please fill out all required fields.");
      return;
    }

    const created = await createUser({
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      role,
    });

    if (created) {
      setName("");
      setSurname("");
      setEmail("");
      setRole(allowedRoles[0] || "Employee");
      setLocalError("");
      ref.current?.close();
    }
  };

  const displayError = localError || contextError;
  const modalTitle = allowedRoles.length === 1 ? `Create New ${allowedRoles[0]}` : "Create New User";

  return (
    <dialog
      ref={ref}
      className="m-auto max-w-xl rounded-lg bg-white p-6 shadow-lg backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4">
        <h2
          id="modalTitle"
          className="text-xl font-bold text-gray-900 sm:text-2xl"
        >
          {modalTitle}
        </h2>
        {displayError && (
          <div style={{ marginBottom: "10px" }}>
            <Alert variant="error" description={displayError} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's name"
              label="Name: "
            />
          </div>
          <div>
            <Input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's surname"
              label="Surname: "
            />
          </div>
          <div>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's email"
              label="Email: "
            />
          </div>
          <div className="w-full flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-body-text">
              Role:
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={allowedRoles.length === 1}
              className="flex h-10 w-full rounded-md border border-secondary/50 bg-background px-3 py-2 text-sm text-body-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={actionLoading}
            >
              Done
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

