"use client";

import { useState, useEffect } from "react";
import { Replicache, WriteTransaction } from "replicache";
import { useSubscribe } from "../../hooks/useSubscribe";
import { initSpace } from "../../utils/space";

const serverURL = "https://replicache-counter.onrender.com";

type M = {
  increment: (tx: WriteTransaction, delta: number) => Promise<void>;
};

export default function SpacePage() {
  const [rep, setRep] = useState<Replicache<M> | null>(null);
  const count = useSubscribe(
    rep,
    async (tx) => (await tx.get("count")) ?? 0,
    0
  );

  useEffect(() => {
    async function init() {
      const spaceID = await initSpace(serverURL);
      if (!spaceID) return;

      const r = new Replicache<M>({
        name: `user42:${spaceID}`,
        licenseKey: process.env.NEXT_PUBLIC_REPLICACHE_LICENSE_KEY!,
        pushURL: `${serverURL}/api/replicache/push?spaceID=${spaceID}`,
        pullURL: `${serverURL}/api/replicache/pull?spaceID=${spaceID}`,
        mutators: {
          increment: async (tx: WriteTransaction, delta: number) => {
            const prev = ((await tx.get("count")) ?? 0) as number;
            const next = prev + delta;
            await tx.set("count", next);
          },
        },
      });

      const ev = new EventSource(
        `${serverURL}/api/replicache/poke?spaceID=${spaceID}`,
        { withCredentials: false }
      );

      ev.onmessage = async (event) => {
        if (event.data === "poke") {
          await r.pull();
        }
      };

      setRep(r);

      return () => {
        ev.close();
        r.close();
      };
    }

    init();
  }, []);

  const handleIncrement = () => {
    if (!rep) return;
    rep.mutate.increment(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-4">
      <h1 className="text-2xl font-sans">Hello, Replicache!</h1>
      <p>
        IDB Database Name: <code id="idbName">{rep?.name}</code>
      </p>
      <button
        onClick={handleIncrement}
        className="rounded-md bg-blue-500 text-white p-2 text-lg"
      >
        Button clicked {count as unknown as string} times
      </button>
    </div>
  );
} 