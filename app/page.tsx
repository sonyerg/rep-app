"use client";

import { useEffect } from "react";
import { initSpace } from "./utils/space";
import { useRouter } from "next/navigation";

const serverURL = "https://replicache-counter.onrender.com";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const spaceID = await initSpace(serverURL);
      if (spaceID) {
        router.push(`/space/${spaceID}`);
      }
    }
    init();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Initializing...</p>
    </div>
  );
}
