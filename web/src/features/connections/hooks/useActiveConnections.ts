import { useCallback } from "react";
import { subscribeToActiveConnections } from "@/features/connections/api";
import type { Connection } from "@/features/connections/schemas";
import { useAuthenticatedUser } from "@/features/auth/useAuth";
import {
  useFirestoreSubscription,
  type Subscribe,
} from "@/shared/hooks/useFirestoreSubscription";

export const useActiveConnections = () => {
  const { uid } = useAuthenticatedUser();

  const subscribe = useCallback<Subscribe<Connection[]>>(
    (onData, onError) => subscribeToActiveConnections(uid, onData, onError),
    [uid],
  );

  return useFirestoreSubscription(subscribe);
};
