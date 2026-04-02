import { useEffect, useState } from "react";
import dayjs from "dayjs";

import {
  fetchDashboard,
  fetchDrilldown,
  fetchFilters,
  fetchPredictions,
} from "../api/sustainabilityApi";

const defaultRange = {
  from: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
  to: dayjs().format("YYYY-MM-DD"),
};

export function useDashboardData() {
  const [filters, setFilters] = useState({
    ...defaultRange,
    campus: "all",
    department: "all",
    building: "all",
    compareA: "",
    compareB: "",
  });
  const [dashboard, setDashboard] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [drilldown, setDrilldown] = useState({ points: [], comparison: null });
  const [metadata, setMetadata] = useState({ campuses: [], departments: [], buildings: [] });
  const [liveKpis, setLiveKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const spanDays = dayjs(filters.to).diff(dayjs(filters.from), "day") + 1;
        const previousTo = dayjs(filters.from).subtract(1, "day").format("YYYY-MM-DD");
        const previousFrom = dayjs(previousTo).subtract(Math.max(1, spanDays), "day").format("YYYY-MM-DD");

        const query = {
          ...filters,
          previousFrom,
          previousTo,
        };

        const [dashboardData, predictionData, drilldownData, filterData] = await Promise.all([
          fetchDashboard(query),
          fetchPredictions(query),
          fetchDrilldown(query),
          fetchFilters({ from: filters.from, to: filters.to }),
        ]);

        if (mounted) {
          setDashboard(dashboardData);
          setPredictions(predictionData);
          setDrilldown(drilldownData || { points: [], comparison: null });
          setMetadata(filterData || { campuses: [], departments: [], buildings: [] });
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

  useEffect(() => {
    const search = new URLSearchParams({
      from: filters.from,
      to: filters.to,
      campus: filters.campus,
      department: filters.department,
      building: filters.building,
    });

    const stream = new EventSource(`/api/stream?${search.toString()}`);
    stream.onmessage = (event) => {
      setLiveKpis(JSON.parse(event.data));
    };
    stream.onerror = () => {
      stream.close();
    };

    return () => stream.close();
  }, [filters.from, filters.to, filters.campus, filters.department, filters.building]);

  return {
    filters,
    setFilters,
    dashboard,
    predictions,
    drilldown,
    metadata,
    liveKpis,
    loading,
    error,
  };
}
