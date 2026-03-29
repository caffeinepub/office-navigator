import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MatrixType,
  MatrixWho,
  type Scenario,
  type UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useAuthState } from "./useAuthState";

export { MatrixWho, MatrixType };

export interface ChatEntry {
  question: string;
  answer: string[];
  timestamp: bigint;
}

export function useGetRecentSubmissions() {
  const { actor, isFetching } = useActor();
  return useQuery<Scenario[]>({
    queryKey: ["recentSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentSubmissions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useSubmitScenario() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    string[],
    Error,
    { text: string; who: MatrixWho | null; challengeType: MatrixType | null }
  >({
    mutationFn: async ({ text, who, challengeType }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitScenario(text, who, challengeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentSubmissions"] });
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
      return actor.getCallerUserProfile();
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
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}

export function useSubmitFreeChat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<string[], Error, string>({
    mutationFn: async (question) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = actor as any;
      if (typeof a.submitFreeChat !== "function") {
        throw new Error("submitFreeChat not available");
      }
      return a.submitFreeChat(question);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentChats"] });
    },
  });
}

export function useGetRecentChats() {
  const { actor, isFetching } = useActor();
  const { isAuthenticated } = useAuthState();
  return useQuery<ChatEntry[]>({
    queryKey: ["recentChats"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = actor as any;
      if (typeof a.getRecentChats !== "function") return [];
      return a.getRecentChats();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    refetchInterval: 30_000,
  });
}
