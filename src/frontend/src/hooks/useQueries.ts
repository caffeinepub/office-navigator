import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  type ChatEntry,
  MatrixType,
  MatrixWho,
  type Scenario,
  type UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useAuthState } from "./useAuthState";

export { MatrixWho, MatrixType };
export type { ChatEntry };

const CHAT_LS_KEY = "wc_chat_history";
const SCENARIO_LS_KEY = "wc_scenario_history";
const CHATS_EVENT = "wc-chats-updated";
const SCENARIOS_EVENT = "wc-scenarios-updated";

function loadFromLS<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

// Helper to detect authorization errors and re-init
function isAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Unauthorized") ||
    msg.includes("not registered") ||
    msg.includes("Only users")
  );
}

export function useGetRecentSubmissions() {
  const [items, setItems] = useState<Scenario[]>(() =>
    loadFromLS<Scenario>(SCENARIO_LS_KEY),
  );

  useEffect(() => {
    const handler = () => setItems(loadFromLS<Scenario>(SCENARIO_LS_KEY));
    window.addEventListener(SCENARIOS_EVENT, handler);
    return () => window.removeEventListener(SCENARIOS_EVENT, handler);
  }, []);

  return { data: items, isLoading: false, refetch: () => {} };
}

export function useSubmitScenario() {
  const { actor } = useActor();

  return useMutation<
    string[],
    Error,
    { text: string; who: MatrixWho | null; challengeType: MatrixType | null }
  >({
    mutationFn: async ({ text, who, challengeType }) => {
      if (!actor) throw new Error("Actor not ready");
      let lines: string[];
      try {
        lines = await actor.submitScenario(text, who, challengeType);
      } catch (err) {
        if (isAuthError(err)) {
          lines = await actor.submitScenario(text, who, challengeType);
        } else {
          throw err;
        }
      }
      // persist locally
      const entry: Scenario = {
        text,
        who: who ?? undefined,
        challengeType: challengeType ?? undefined,
        suggestions: lines,
        timestamp: BigInt(Date.now()),
      };
      const existing = loadFromLS<Scenario>(SCENARIO_LS_KEY);
      localStorage.setItem(
        SCENARIO_LS_KEY,
        JSON.stringify([entry, ...existing].slice(0, 50)),
      );
      window.dispatchEvent(new Event(SCENARIOS_EVENT));
      return lines;
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated } = useAuthState();
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile) => {
      if (!actor) throw new Error("Actor not ready");
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (err) {
        if (isAuthError(err)) {
          return await actor.saveCallerUserProfile(profile);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}

export function useSubmitFreeChat() {
  const { actor } = useActor();

  return useMutation<string[], Error, string>({
    mutationFn: async (question) => {
      if (!actor) throw new Error("Actor not ready");
      let lines: string[];
      try {
        lines = await actor.submitFreeChat(question);
      } catch (err) {
        if (isAuthError(err)) {
          lines = await actor.submitFreeChat(question);
        } else {
          throw err;
        }
      }
      // persist locally — ChatEntry uses `answer` field per backend.d.ts
      const entry: ChatEntry = {
        question,
        answer: lines,
        timestamp: BigInt(Date.now()),
      };
      const existing = loadFromLS<ChatEntry>(CHAT_LS_KEY);
      localStorage.setItem(
        CHAT_LS_KEY,
        JSON.stringify([entry, ...existing].slice(0, 50)),
      );
      window.dispatchEvent(new Event(CHATS_EVENT));
      return lines;
    },
  });
}

export function useGetRecentChats() {
  const [chats, setChats] = useState<ChatEntry[]>(() =>
    loadFromLS<ChatEntry>(CHAT_LS_KEY),
  );

  useEffect(() => {
    const handler = () => setChats(loadFromLS<ChatEntry>(CHAT_LS_KEY));
    window.addEventListener(CHATS_EVENT, handler);
    return () => window.removeEventListener(CHATS_EVENT, handler);
  }, []);

  return { data: chats, isLoading: false, refetch: () => {} };
}
