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
      console.log(`[UPDATE_TASK] mutationFn: id=${id}, dto.column_position=${dto.column_position}`);
      const result = await tasksService.update(id, dto);
      console.log(`[UPDATE_TASK] request completed for id=${id}`);
      return result;
    },
    // Optimistic update: patch the cache immediately so drag-and-drop
    // reordering (and any other edit) reflects instantly in the UI,
    // instead of waiting for the request + refetch round-trip.
    onMutate: async ({ id, dto }) => {
      console.log(`[UPDATE_TASK] onMutate start: id=${id}, dto.column_position=${dto.column_position}`);
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      console.log(`[UPDATE_TASK] onMutate: previous cache size=${previousTasks?.length}, previous state:`, previousTasks?.map(t => `${t.id}(pos${t.column_position})`));

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old) => {
        const updated = old?.map((t) => (t.id === id ? { ...t, ...dto } : t)) ?? old;
        console.log(`[UPDATE_TASK] onMutate: cache after patch:`, updated?.map(t => `${t.id}(pos${t.column_position})`));
        return updated;
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      console.log(`[UPDATE_TASK] onError: rolling back`);
      // Roll back to the last known-good state if the request fails.
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      console.log(`[UPDATE_TASK] onSettled: invalidating queries, will refetch`);
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