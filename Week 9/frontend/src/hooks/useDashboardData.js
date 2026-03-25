import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import { fetchDashboard } from "../api/laundryApi";

const defaultRange = {
  startDate: dayjs().subtract(21, "day").format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
};

export function useDashboardData() {
  const [filters, setFilters] = useState({
    ...defaultRange,
    block: "",
    horizon: 48,
    loadFactor: 1,
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const dashboard = await fetchDashboard(filters);
        if (mounted) {
          setData(dashboard);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || "Failed to load dashboard data.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const stats = useMemo(() => {
    if (!data) return null;
    return data.kpis;
  }, [data]);

  return {
    filters,
    setFilters,
    data,
    stats,
    loading,
    error,
  };
}
