import { useState, useRef, useCallback } from "react";
import {
  runSimulation,
  getSimulationJob,
  type SimulationRunRequest,
  type SimulationJobStatusResponse,
} from "@/api/simulations";

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 120;

export function useSimulation() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationJobStatusResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const run = useCallback(
    async (params: SimulationRunRequest) => {
      stopPolling();
      setLoading(true);
      setError(null);
      setResult(null);
      setJobId(null);
      setStatus(null);

      try {
        const { job_id, status: initialStatus } = await runSimulation(params);
        setJobId(job_id);
        setStatus(initialStatus);

        attemptsRef.current = 0;

        pollingRef.current = setInterval(async () => {
          attemptsRef.current += 1;
          if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
            stopPolling();
            setError("Simulation timed out");
            setLoading(false);
            return;
          }

          try {
            const statusResult = await getSimulationJob(job_id);
            setResult(statusResult);
            setStatus(statusResult.status);

            if (
              statusResult.status === "COMPLETED" ||
              statusResult.status === "FAILED"
            ) {
              stopPolling();
              setLoading(false);
            }
          } catch {
            stopPolling();
            setError("Failed to fetch simulation status");
            setLoading(false);
          }
        }, POLL_INTERVAL_MS);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start simulation",
        );
        setLoading(false);
      }
    },
    [stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setJobId(null);
    setStatus(null);
    setResult(null);
    setLoading(false);
    setError(null);
  }, [stopPolling]);

  return {
    jobId,
    status,
    result,
    loading,
    error,
    run,
    reset,
  };
}
