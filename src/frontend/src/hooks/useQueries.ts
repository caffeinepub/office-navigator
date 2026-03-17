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
