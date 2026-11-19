import { useEffect, useState } from "react";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { Button } from "#components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#components/ui/sheet";
import {
  avatarColor,
  fullName,
  initialsOf,
  ROLES,
  StatusLabel,
} from "../pages/systemAdmin/Users";
import { cn } from "#lib/utils";
import type { User, UserRole } from "#context/UsersContext";
import type { Department } from "#hooks/useDepartments";

export interface UserFormData {
  firstName: string;
  surname: string;
  email: string;
  role: string;
  department_id: string; // "none" or string number
}

const emptyForm: UserFormData = {
  firstName: "",
  surname: "",
  email: "",
  role: "Employee",
  department_id: "none",
};

interface UserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  departments: Department[];
  allowedRoles?: UserRole[];
  onSave: (form: UserFormData, user: User | null) => Promise<void>;
  onRequestDeactivate: (user: User) => void;
  onReactivate: (user: User) => Promise<void>;
}

function FieldError({ children }: { children?: React.ReactNode }) {
  return children ? (
    <p className="text-[11px] text-red-600">{children}</p>
  ) : null;
}

export default function UserSheet({
  open,
  onOpenChange,
  user,
  departments,
  allowedRoles = ["Department Lead", "Agent", "Employee"],
  onSave,
  onRequestDeactivate,
  onReactivate,
}: UserSheetProps) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset whenever the drawer opens or switches user
  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setErrorMsg(null);
    if (user) {
      setForm({
        firstName: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        role: user.role || "Employee",
        department_id: user.department_id ? String(user.department_id) : "none",
      });
    } else {
      setForm({
        ...emptyForm,
        role: allowedRoles[0] || "Employee",
      });
    }
  }, [open, user, allowedRoles]);

  const setField = (key: keyof UserFormData) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!isEdit) {
      if (!form.firstName.trim()) errors.firstName = "First name is required";
      if (!form.surname.trim()) errors.surname = "Surname is required";
      if (!/^\S+@\S+\.\S+$/.test(form.email))
        errors.email = "Enter a valid work email";
    if (!form.role) errors.role = "Role is required";
    }
    return errors;
  };

  const errors = validate();
  const show = (key: string) => submitted && errors[key];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave(form, user);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex h-full flex-col"
        >
          <SheetHeader className="border-b p-5">
            <SheetTitle className="text-base">
              {isEdit ? "Edit user" : "Add user"}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {isEdit
                ? "Update user role, department, or active status."
                : "Enter user details to send them login instructions and temporary credentials."}
            </SheetDescription>
          </SheetHeader>

          {errorMsg && (
            <div className="mx-5 mt-4 rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {isEdit && user ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <Avatar className="size-9">
                  <AvatarFallback
                    className={cn(
                      "text-xs font-semibold text-white",
                      avatarColor(user.user_id),
                    )}
                  >
                    {initialsOf(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-sm font-semibold">{fullName(user)}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user.email}
                  </p>
                </div>
                <StatusLabel active={user.active !== false} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs">
                      First name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setField("firstName")(e.target.value)}
                      aria-invalid={!!show("firstName")}
                      className="h-9 text-xs"
                      disabled={saving}
                    />
                    <FieldError>{show("firstName")}</FieldError>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="surname" className="text-xs">
                      Surname <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="surname"
                      value={form.surname}
                      onChange={(e) => setField("surname")(e.target.value)}
                      aria-invalid={!!show("surname")}
                      className="h-9 text-xs"
                      disabled={saving}
                    />
                    <FieldError>{show("surname")}</FieldError>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Work email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email")(e.target.value)}
                    aria-invalid={!!show("email")}
                    className="h-9 text-xs"
                    disabled={saving}
                  />
                  <FieldError>{show("email")}</FieldError>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">
                Role<span className="text-red-500">*</span>
              </Label>

              <Select
                value={form.role}
                onValueChange={(val) => val && setField("role")(val)}
                disabled={saving}
              >
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((r) => {
                    const meta = ROLES[r as keyof typeof ROLES] || { label: r };
                    return (
                      <SelectItem key={r} value={r} className="text-xs">
                        {meta.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.department_id}
                onValueChange={(val) => val && setField("department_id")(val)}
                disabled={saving}
              >
                <SelectTrigger id="department" className="h-9 w-full text-xs">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None / Unassigned
                  </SelectItem>
                  {departments.map((d) => (
                    <SelectItem
                      key={d.department_id}
                      value={String(d.department_id)}
                      className="text-xs"
                    >
                      {d.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] leading-snug text-slate-500">
                Assigning a department connects the user with the corresponding
                ticket queue.
              </p>
            </div>

            {isEdit && (
              <p className="text-[11px] leading-snug text-slate-500">
                Deactivating blocks user sign-in but retains their ticket
                assignment history.
              </p>
            )}
          </div>

          <SheetFooter className="flex-row items-center justify-end gap-2 border-t p-4">
            {isEdit &&
              user &&
              (user.active === false ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-auto text-xs"
                  disabled={saving}
                  onClick={() => onReactivate(user)}
                >
                  Reactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-auto border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={saving}
                  onClick={() => onRequestDeactivate(user)}
                >
                  Deactivate
                </Button>
              ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add user"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
