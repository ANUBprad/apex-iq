import { useEffect, useState } from "react";

import { getDriverProfile, type DriverProfile } from "@/lib/api";

export function useDriverProfile(driver: string) {
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getDriverProfile(driver);

        setProfile(result);
      } catch {
        setProfile(null);
      }
    }

    load();
  }, [driver]);

  return profile;
}
