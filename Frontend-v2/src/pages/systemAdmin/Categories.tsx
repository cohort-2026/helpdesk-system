import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#components/ui/alert-dialog";
import { Button } from "#components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#components/ui/table";
import { Sheet, SheetContent } from "#components/ui/sheet";
import { useCategories } from "#hooks/useCategories";
import { useDepartments } from "#hooks/useDepartments";
import type {
  Category,
  CategoryField,
  CategoryPayload,
} from "../../services/categoryService";
import CategoryPanel, {
  type CategoryDraft,
} from "#components/CategoryPanel";
import GroupRows from "#components/GroupRows";

interface CategoryRow {
  id: string;
  name: string;
  department: string;
  departmentName: string;
  description: string;
  icon: string;
  priority: Category["default_priority"];
  section: string;
  needsApproval: boolean;
  fields: CategoryField[];
  status: Category["status"];
}

interface CategoryGroup {
  name: string;
  items: CategoryRow[];
}

function toCategoryRow(category: Category): CategoryRow {
  return {
    id: String(category.category_id),
    name: category.category_name,
    department:
      category.category_department_id === null
        ? ""
        : String(category.category_department_id),
    departmentName:
      category.department_name ??
      (category.category_department_id === null
        ? "Unassigned"
        : `Department ${category.category_department_id}`),
    description: category.description ?? "",
    icon: "default",
    priority: category.default_priority ?? "normal",
    section: "I need something",
    needsApproval: category.needs_approval ?? false,
    fields: category.extra_fields ?? [],
    status: category.status,
  };
}

export default function Categories() {
  const {
    categories: apiCategories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchAll,
    create,
    update,
  } = useCategories();
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    fetchAll: fetchDepartments,
  } = useDepartments({ limit: 100 });

  const [selected, setSelected] = useState<string | "new" | null>(null);
  const [toDeactivate, setToDeactivate] = useState<CategoryDraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const categories = useMemo(() => apiCategories.map(toCategoryRow), [apiCategories]);
  const current = categories.find((category) => category.id === selected);
  const groups = useMemo<CategoryGroup[]>(() => {
    const grouped = new Map<string, CategoryGroup>();
    for (const category of categories) {
      const group = grouped.get(category.departmentName) ?? {
        name: category.departmentName,
        items: [],
      };
      group.items.push(category);
      grouped.set(category.departmentName, group);
    }
    return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const save = async (draft: CategoryDraft) => {
    const payload: CategoryPayload = {
      department_id: Number(draft.department),
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      status: draft.status,
      default_priority: draft.priority,
      needs_approval: draft.needsApproval,
      extra_fields: draft.fields,
    };

    if (draft.id) {
      await update(Number(draft.id), payload);
    } else {
      await create(payload);
    }
    setSelected(null);
  };

  const setStatus = async (category: CategoryDraft, status: Category["status"]) => {
    setActionError(null);
    try {
      await update(Number(category.id), { status });
      setToDeactivate(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to update category status."
      );
    }
  };

  const pageError = actionError || categoriesError || departmentsError;
  const loading = categoriesLoading || departmentsLoading;

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-slate-50/50 lg:flex-row">
      <div className="min-w-0 flex-1">
        <header className="flex items-start justify-between gap-4 border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Categories &amp; routing
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              What employees choose on the New request form, and where each choice goes
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-indigo-600 text-xs font-semibold hover:bg-indigo-700"
            onClick={() => {
              setActionError(null);
              setSelected("new");
            }}
          >
            <Plus className="size-3.5" />
            Add category
          </Button>
        </header>

        {pageError && (
          <div className="mx-4 mt-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span>{pageError}</span>
            <Button
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => {
                setActionError(null);
                void fetchAll();
                void fetchDepartments();
              }}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="p-4">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Category", "Default priority", "Approval", "Extra fields", "Status"].map((heading) => (
                    <TableHead key={heading} className="h-9 px-4 text-[10px] font-medium text-slate-500">
                      {heading}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-500">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-500">
                      No categories found. Click “Add category” to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => (
                    <GroupRows
                      key={group.name}
                      group={group}
                      selected={selected}
                      onSelect={setSelected}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          {(selected === "new" || current) && (
            <CategoryPanel
              key={`${selected}-${current?.status ?? ""}`}
              category={current}
              departments={departments}
              onSave={save}
              onCancel={() => setSelected(null)}
              onRequestDeactivate={setToDeactivate}
              onReactivate={(category) => setStatus(category, "active")}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!toDeactivate}
        onOpenChange={(open) => !open && setToDeactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {toDeactivate?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It will disappear from the New request form. Existing tickets keep
              their category, and you can reactivate it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                toDeactivate && void setStatus(toDeactivate, "inactive")
              }
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
