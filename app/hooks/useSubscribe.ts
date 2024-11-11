import { useEffect, useState } from 'react';
import { Replicache, ReadTransaction } from 'replicache';

export function useSubscribe<T>(
  rep: Replicache | null,
  query: (tx: ReadTransaction) => Promise<T>,
  defaultValue: T
): T {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (!rep) return;
    return rep.subscribe(query, {
      onData: (data: T) => setValue(data),
    });
  }, [rep, query]);

  return value;
} 