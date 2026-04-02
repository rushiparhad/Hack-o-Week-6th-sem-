import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FilterBar from "../ui/FilterBar";

function DashboardLayout({ children, score, filters, metadata, onFilterChange }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <Sidebar score={score} />
      <main className="px-4 pb-6 pt-4 md:px-6 lg:px-8">
        <Topbar />
        <section className="mt-4 space-y-4">
          <FilterBar filters={filters} metadata={metadata} onChange={onFilterChange} />
          {children}
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
