import { useCallback, useEffect, useState } from "react";
import { getDashboard, getDrilldown, getFilters, getPredictions } from "../api/client";

export function useDashboardData(filters) {
  const [data, setData] = useState({
    kpis: {},
    trends: [],
    comparison: [],
    resourceDistribution: [],
    alerts: [],
  });
  const [predictionData, setPredictionData] = useState({ sourceSeries: [], forecast: [] });
  const [drilldownData, setDrilldownData] = useState([]);
  const [metadata, setMetadata] = useState({ departments: [], buildings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardRes, predictionRes, drilldownRes, filterRes] = await Promise.all([
        getDashboard(filters),
        getPredictions(filters),
        getDrilldown(filters),
        getFilters({ from: filters.from, to: filters.to }),
      ]);

      setData(dashboardRes.data.data);
      setPredictionData(predictionRes.data.data);
      setDrilldownData(drilldownRes.data.data);
      setMetadata(filterRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    predictionData,
    drilldownData,
    metadata,
    loading,
    error,
    refetch: fetchAll,
  };
}
