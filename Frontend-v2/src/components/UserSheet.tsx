import { useEffect, useState } from "react";
import { Input } from "#components/ui/input";
import { Label } from "#components/ui/label";
import { Avatar, AvatarFallback } from "#components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "#components/ui/toggle-group";
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
import { avatarColor, DEPARTMENTS, fullName, initialsOf, ROLES, StatusLabel } from "../pages/systemAdmin/Users";
import { cn } from "#lib/utils";

const emptyForm = {
  firstName: "",
  surname: "",
  email: "",
  role: "employee",
  department: "",
  forcePasswordChange: true,
};

function validate(form, isEdit) {
  const errors = {};
  if (!isEdit) {
    if (!form.firstName.trim()) errors.firstName = "Required";
    if (!form.surname.trim()) errors.surname = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Enter a valid work email";
  }
  if (!form.department) errors.department = "Choose a department";
  return errors;
}

function FieldError({ children }) {
  return children ? <p className="text-[11px] text-red-600">{children}</p> : null;
}

function UserSheet({ open, onOpenChange, user, onSave, onRequestDeactivate, onReactivate }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  // Reset whenever the drawer opens or switches user
  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setForm(user ? { ...emptyForm, role: user.role, department: user.department ?? "" } : emptyForm);
  }, [open, user]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const errors = validate(form, isEdit);
  const show = (key) => submitted && errors[key];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onSave(form, user);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col">
          <SheetHeader className="border-b p-5">
            <SheetTitle className="text-base">{isEdit ? "Edit user" : "Add user"}</SheetTitle>
            <SheetDescription className="text-xs">
              {isEdit
                ? "Change their role or department. Name and email can't be edited here."
                : "They'll get an email with a temporary password."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {isEdit ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <Avatar className="size-9">
                  <AvatarFallback className={cn("text-xs font-semibold text-white", avatarColor(user.id))}>
                    {initialsOf(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-sm font-semibold">{fullName(user)}</p>
                  <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                </div>
                <StatusLabel status={user.status} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs">First name</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => set("firstName")(e.target.value)}
                      aria-invalid={!!show("firstName")}
                      className="h-9 text-xs"
                    />
                    <FieldError>{show("firstName")}</FieldError>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="surname" className="text-xs">Surname</Label>
                    <Input
                      id="surname"
                      value={form.surname}
                      onChange={(e) => set("surname")(e.target.value)}
                      aria-invalid={!!show("surname")}
                      className="h-9 text-xs"
                    />
                    <FieldError>{show("surname")}</FieldError>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    aria-invalid={!!show("email")}
                    className="h-9 text-xs"
                  />
                  <FieldError>{show("email")}</FieldError>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={form.role}
                onValueChange={(v) => v && set("role")(v)} // keep one always selected
                className="grid w-full grid-cols-3 gap-2"
                aria-label="Role"
              >
                {Object.entries(ROLES).map(([value, r]) => (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    className="h-9 rounded-md text-xs data-[state=on]:border-indigo-600 data-[state=on]:bg-indigo-50 data-[state=on]:font-semibold data-[state=on]:text-indigo-700"
                  >
                    {r.segment}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={set("department")}>
                <SelectTrigger
                  id="department"
                  aria-invalid={!!show("department")}
                  className="h-9 w-full text-xs"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] leading-snug text-slate-500">
                Required for employees, agents and leads. Agents only see this
                department's tickets.
              </p>
              <FieldError>{show("department")}</FieldError>
            </div>

        

            {isEdit && (
              <p className="text-[11px] leading-snug text-slate-500">
                Users can't be deleted. Deactivating blocks sign-in but keeps
                their tickets and history, and you can reactivate them any time.
              </p>
            )}
          </div>

          <SheetFooter className="flex-row items-center justify-end gap-2 border-t p-4">
            {isEdit &&
              (user.status === "deactivated" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-auto text-xs"
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
                  onClick={() => onRequestDeactivate(user)}
                >
                  Deactivate
                </Button>
              ))}
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 text-xs font-semibold hover:bg-indigo-700">
              {isEdit ? "Save changes" : "Add user"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default UserSheet;