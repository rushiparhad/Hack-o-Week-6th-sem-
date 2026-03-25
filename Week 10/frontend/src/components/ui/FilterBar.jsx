function FilterBar({ filters, onChange }) {
  const update = (field, value) => onChange((prev) => ({ ...prev, [field]: value }));

  return (
    <section className="filter-bar">
      <label>
        Start Date
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update("startDate", e.target.value)}
        />
      </label>

      <label>
        End Date
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update("endDate", e.target.value)}
        />
      </label>

      <label>
        Hostel Block
        <select value={filters.block} onChange={(e) => update("block", e.target.value)}>
          <option value="">All Blocks</option>
          <option value="A">Block A</option>
          <option value="B">Block B</option>
          <option value="C">Block C</option>
          <option value="D">Block D</option>
          <option value="E">Block E</option>
        </select>
      </label>

      <label>
        Forecast Horizon (hours)
        <input
          type="number"
          min="12"
          max="168"
          step="12"
          value={filters.horizon}
          onChange={(e) => update("horizon", Number(e.target.value || 48))}
        />
      </label>

      <label className="slider-wrap">
        Scenario Multiplier ({filters.loadFactor.toFixed(2)}x)
        <input
          type="range"
          min="0.7"
          max="1.4"
          step="0.01"
          value={filters.loadFactor}
          onChange={(e) => update("loadFactor", Number(e.target.value))}
        />
      </label>
    </section>
  );
}

export default FilterBar;
