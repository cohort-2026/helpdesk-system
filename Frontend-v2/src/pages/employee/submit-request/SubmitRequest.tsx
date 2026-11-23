import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/button";
import { useTickets } from "#hooks/useTickets";

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// From PDF p.14 - S5 Guided requests
// Category comes from backend ONLY: GET /api/categories
// Admin creates it. Employee never creates it. No constant here.
type Category = {
  category_id: number;
  category_department_id: number;
  category_name: string;
  description?: string;
  status: string;
  // not in your current response, see the note below
  department_name?: string;
};

type DepartmentGroup = {
  id: number;
  name: string;
  categories: Category[];
};
export default function SubmitRequest() {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [impact, setImpact] = useState("");
  const [createdRef, setCreatedRef] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { createTicket } = useTickets({ autoFetch: false });

  // Employee READS categories. Does not create them.
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories?status=active`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // handle bare arrays and { categories } / { category } / { data } wrappers
        const raw = Array.isArray(data)
          ? data
          : (data.categories ?? data.category ?? data.data);
        setCategories(Array.isArray(raw) ? raw : raw ? [raw] : []);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo<DepartmentGroup[]>(() => {
    const q = search.toLowerCase();
    const map = new Map<number, DepartmentGroup>();

    for (const c of categories) {
      const deptName =
        c.department_name ?? `Department ${c.category_department_id}`;

      const haystack =
        `${c.category_name} ${c.description ?? ""} ${deptName}`.toLowerCase();
      if (!haystack.includes(q)) continue;

      if (!map.has(c.category_department_id)) {
        map.set(c.category_department_id, {
          id: c.category_department_id,
          name: deptName,
          categories: [],
        });
      }
      map.get(c.category_department_id)!.categories.push(c);
    }

    return [...map.values()].sort((a, b) => a.id - b.id);
  }, [categories, search]);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const ticket = await createTicket({
        department_id: selected.category_department_id,
        category_id: selected.category_id,
        title,
        description: details,
      });
      setCreatedRef(`HD-${ticket.ticket_id}`);
      setStep(3);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // STEP 3 - Confirmation - PDF: "get a reference number"
  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center space-y-4">
        <div className="text-5xl">✓</div>
        <h1 className="text-2xl font-bold">Request submitted</h1>
        <p className="text-muted-foreground">
          Your reference is{" "}
          <span className="font-bold text-foreground">{createdRef}</span>
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Link to="/employee/my-requests">View my requests</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New request</h1>
        <p className="text-muted-foreground">
          Step {step} of 2 —{" "}
          {step === 1 ? "What do you need help with?" : "Tell us more"}
        </p>
      </div>

      {step === 1 && (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search — e.g. VPN, printer, payslip..."
            className="w-full rounded-lg border px-4 py-2.5 bg-white"
          />

          {loading && (
            <p className="text-muted-foreground">Loading categories...</p>
          )}

          {!loading && categories.length === 0 && (
            <div className="rounded-lg border p-6 text-center bg-white">
              <p className="font-medium">No categories yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Categories are added by System Admin. Once Admin adds them, they
                will appear here.
              </p>
            </div>
          )}

          {!loading && categories.length > 0 && grouped.length === 0 && (
            <p className="text-muted-foreground">
              No categories match your search.
            </p>
          )}

          {!loading && grouped.length > 0 && (
            <div className="space-y-6">
              {grouped.map((dept) => (
                <section key={dept.id} className="space-y-3">
                  <h2 className="text-lg font-semibold border-b pb-1">
                    {dept.name}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {dept.categories.map((c) => (
                      <button
                        key={c.category_id}
                        onClick={() => setSelected(c)}
                        className={`text-left rounded-lg border p-4 hover:border-indigo-500 ${
                          selected?.category_id === c.category_id
                            ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                            : "bg-white"
                        }`}
                      >
                        <p className="font-medium">{c.category_name}</p>
                        {c.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {c.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              disabled={!selected}
              onClick={() => setStep(2)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              Continue →
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="rounded-lg border bg-indigo-50 border-indigo-200 p-3 text-sm">
            Selected:{" "}
            <span className="font-medium">{selected?.category_name}</span>
            <button
              onClick={() => setStep(1)}
              className="ml-2 underline text-indigo-700"
            >
              Change
            </button>
          </div>
          <div className="space-y-4">
            {submitError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </p>
            )}
            <div>
              <label className="text-sm font-medium">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VPN drops every 10 minutes on home fibre"
                className="w-full rounded-lg border px-3 py-2 mt-1 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium">What happened? *</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="When did it start? What did you try? What happens exactly?"
                rows={5}
                className="w-full rounded-lg border px-3 py-2 mt-1 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                How does this affect your work? *
              </label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 mt-1 bg-white"
              >
                <option value="">Select impact...</option>
                <option value="cant-work">I can't work at all</option>
                <option value="slowed">I'm slowed down, but I can work</option>
                <option value="minor">Minor inconvenience</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              disabled={!title.trim() || !details.trim() || !impact || submitting}
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
