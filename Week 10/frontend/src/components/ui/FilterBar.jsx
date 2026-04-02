function SelectField({ label, value, onChange, options, placeholder = "All" }) {
  return (
    <label className="text-xs text-slate-600 dark:text-slate-300">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBar({ filters, metadata, onChange }) {
  const update = (field, value) => onChange((prev) => ({ ...prev, [field]: value }));

  return (
    <section className="glass-card grid gap-3 md:grid-cols-3 xl:grid-cols-7">
      <label className="text-xs text-slate-600 dark:text-slate-300">
        From
        <input
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
          type="date"
          value={filters.from}
          onChange={(e) => update("from", e.target.value)}
        />
      </label>

      <label className="text-xs text-slate-600 dark:text-slate-300">
        To
        <input
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
          type="date"
          value={filters.to}
          onChange={(e) => update("to", e.target.value)}
        />
      </label>

      <SelectField label="Campus" value={filters.campus} onChange={(value) => update("campus", value)} options={metadata.campuses || []} placeholder="All Campuses" />
      <SelectField label="Department" value={filters.department} onChange={(value) => update("department", value)} options={metadata.departments || []} placeholder="All Departments" />
      <SelectField label="Building" value={filters.building} onChange={(value) => update("building", value)} options={metadata.buildings || []} placeholder="All Buildings" />
      <SelectField label="Compare A" value={filters.compareA || "all"} onChange={(value) => update("compareA", value === "all" ? "" : value)} options={metadata.buildings || []} placeholder="Select Building" />
      <SelectField label="Compare B" value={filters.compareB || "all"} onChange={(value) => update("compareB", value === "all" ? "" : value)} options={metadata.buildings || []} placeholder="Select Building" />
    </section>
  );
}

export default FilterBar;
