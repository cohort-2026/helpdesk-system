function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-[11px] text-slate-500">{label}</dt>
      <dd className="text-right text-[11px] font-semibold text-slate-900">{children}</dd>
    </div>
  );
}

export default DetailRow