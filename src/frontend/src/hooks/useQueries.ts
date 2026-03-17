import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, type Scenario } from "../backend.d";
import { useActor } from "./useActor";

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
    { text: string; category: Category | null }
  >({
    mutationFn: async ({ text, category }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitScenario(text, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentSubmissions"] });
    },
  });
}

export { Category };
