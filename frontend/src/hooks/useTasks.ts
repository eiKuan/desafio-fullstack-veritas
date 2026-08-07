import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { tasksService } from "../services/tasks.service";
import type { CreateTaskDTO, UpdateTaskDTO, Task } from "../types";

export const TASKS_QUERY_KEY = ["tasks"] as const;

export function useTasks() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await tasksService.getAll();
      return data;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateTaskDTO) => {
      const { data } = await tasksService.create(dto);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateTaskDTO }) => {
      await tasksService.update(id, dto);
    },
    // Optimistic update: patch the cache immediately so drag-and-drop
    // reordering (and any other edit) reflects instantly in the UI,
    // instead of waiting for the request + refetch round-trip.
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...dto } : t)) ?? old
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      // Roll back to the last known-good state if the request fails.
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      // Reconcile with the server in the background — by now the UI
      // already shows the right thing, so this shouldn't cause a jump.
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await tasksService.remove(id);
      return data;
    },
    // Same idea for delete — used by the drag-to-mascot flow, which
    // should feel instant too.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(
        TASKS_QUERY_KEY,
        (old) => old?.filter((t) => t.id !== id) ?? old
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}