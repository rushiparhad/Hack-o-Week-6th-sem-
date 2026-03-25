const links = [
  { label: "Overview", active: true },
  { label: "Forecasts", active: false },
  { label: "Classifications", active: false },
  { label: "Scenario Lab", active: false },
  { label: "Reports", active: false },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-wrap">
        <span className="brand-dot" />
        <div>
          <p className="brand-title">LaundryPulse AI</p>
          <p className="brand-subtitle">Hostel Operations</p>
        </div>
      </div>

      <nav className="nav-links">
        {links.map((link) => (
          <div key={link.label} className={`nav-link ${link.active ? "active" : ""}`}>
            {link.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Expo Ready Dashboard</p>
        <small>Predict peak loads before queues form.</small>
      </div>
    </aside>
  );
}

export default Sidebar;
