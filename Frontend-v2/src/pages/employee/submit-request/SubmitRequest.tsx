import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/button";

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
  id: string;
  category_name: string;
  icon: string;
  categorydepartment_id: string;
  // server derives these - browser can't override (PDF p.14)
  defaultPriority?: string;
  needsApproval?: boolean;
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

  // Employee READS categories. Does not create them.
useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/categories?department_id=1`, { credentials: "include" })
    .then((r) => {
      if (!r.ok) throw new Error(`Request failed: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      // handle both bare arrays and { data: [...] } / { categories: [...] } wrappers
      const list = Array.isArray(data) ? data : data.categories ?? data.data;
      setCategories(Array.isArray(list) ? list : []);
      console.log("Fetched categories:", list);
    })
    .catch((err) => {
      console.error("Failed to load categories:", err);
      setCategories([]);
    })
    .finally(() => setLoading(false));
}, []);

  const filtered = categories.filter((c) =>
    (c.category_name + c.categorydepartment_id).toLowerCase().includes(search.toLowerCase()),
  );

  async function handleSubmit() {
    if (!selected) return;
    // PDF p.14: POST /api/tickets - server returns HD-xxxx + first reply time
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/create`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        categoryId: selected.id,
        title,
        description: details,
        impact,
      }),
    });
    if (!res.ok) {
      alert("Failed to submit request. Please try again." + res.status);
      return;
    }
    const data = await res.json();
    setCreatedRef(data.reference || data.ticketNumber || "");
    setStep(3);
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

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`text-left rounded-lg border p-4 hover:border-indigo-500 ${
                    selected?.id === c.id
                      ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                      : "bg-white"
                  }`}
                >
                  <p className="font-medium">
                    {c.icon} {c.category_name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {c.categorydepartment_id}
                  </p>
                </button>
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
            Selected: <span className="font-medium">{selected?.category_name}</span>
            <button
              onClick={() => setStep(1)}
              className="ml-2 underline text-indigo-700"
            >
              Change
            </button>
          </div>
          <div className="space-y-4">
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
              disabled={!title.trim() || !details.trim() || !impact}
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              Submit request
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
