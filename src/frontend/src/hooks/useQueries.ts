import type { Identity } from "@icp-sdk/core/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  type ChatEntry,
  MatrixType,
  MatrixWho,
  type Scenario,
  type UserProfile,
} from "../backend.d";
import { createActorWithConfig } from "../config";
import { useActor } from "./useActor";
import { useAuthState } from "./useAuthState";
import { useInternetIdentity } from "./useInternetIdentity";

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

/**
 * Fallback: always create a fresh actor with a new HTTP agent.
 * The backend only checks caller.isAnonymous() — no role registration needed.
 */
async function freshActorCall<T>(
  identity: Identity | undefined,
  fn: (actor: Awaited<ReturnType<typeof createActorWithConfig>>) => Promise<T>,
): Promise<T> {
  const actor = await createActorWithConfig(
    identity ? { agentOptions: { identity } } : undefined,
  );
  return fn(actor);
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
  const { identity } = useInternetIdentity();

  return useMutation<
    string[],
    Error,
    { text: string; who: MatrixWho | null; challengeType: MatrixType | null }
  >({
    mutationFn: async ({ text, who, challengeType }) => {
      let lines: string[];
      try {
        if (!actor) throw new Error("no actor");
        lines = await actor.submitScenario(text, who, challengeType);
      } catch {
        lines = await freshActorCall(identity, (a) =>
          a.submitScenario(text, who, challengeType),
        );
      }
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
  const { identity } = useInternetIdentity();
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      try {
        if (!actor) throw new Error("no actor");
        return await actor.getCallerUserProfile();
      } catch {
        try {
          return await freshActorCall(identity, (a) =>
            a.getCallerUserProfile(),
          );
        } catch {
          return null;
        }
      }
    },
    enabled: !isFetching && isAuthenticated,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile) => {
      try {
        if (!actor) throw new Error("no actor");
        return await actor.saveCallerUserProfile(profile);
      } catch {
        return await freshActorCall(identity, (a) =>
          a.saveCallerUserProfile(profile),
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}

export function useSubmitFreeChat() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useMutation<string[], Error, string>({
    mutationFn: async (question) => {
      let lines: string[];
      try {
        if (!actor) throw new Error("no actor");
        lines = await actor.submitFreeChat(question);
      } catch {
        lines = await freshActorCall(identity, (a) =>
          a.submitFreeChat(question),
        );
      }
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
