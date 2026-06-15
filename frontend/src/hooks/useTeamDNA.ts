import { useEffect, useState } from "react";
import { getTeamDNA, type TeamDNA } from "@/lib/api";

export function useTeamDNA(team: string) {
  const [data, setData] = useState<TeamDNA | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getTeamDNA(team);
        setData(result);
      } catch {
        setData(null);
      }
    }

    load();
  }, [team]);

  return data;
}
