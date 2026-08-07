import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import addInformationCard from "../assets/cards/addInformationCard.png";
import type { Task, CreateTaskDTO, UpdateTaskDTO } from "../types";
import { toISOOrSentinel, isNoDate } from "../utils/task";

const schema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().default(""),
  tag: z.string().default(""),
  priority: z.coerce.number().min(1).max(3),
  due_date: z.string().optional().default(""),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDTO | UpdateTaskDTO) => void;
  editingTask: Task | null;
  columnType: number;
  columnPosition: number;
}

const MAX_TAG_LENGTH = 9;

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  editingTask,
  columnType,
  columnPosition,
}: TaskFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description,
        tag: editingTask.tag,
        priority: editingTask.priority,
        due_date: isNoDate(editingTask.due_date) ? "" : editingTask.due_date?.split("T")[0] ?? "",
      });
    } else {
      reset({ title: "", description: "", tag: "", priority: 1, due_date: "" });
    }
  }, [editingTask, open, reset]);

  const submit = (data: FormValues) => {
    const payload: CreateTaskDTO | UpdateTaskDTO = {
      title: data.title,
      description: data.description ?? "",
      column_type: editingTask?.column_type ?? columnType,
      column_position: editingTask?.column_position ?? columnPosition,
      tag: data.tag,
      priority: data.priority,
      due_date: toISOOrSentinel(data.due_date),
      completed: editingTask?.completed ?? false,
    };
    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-[460px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={addInformationCard}
              alt="Form"
              className="w-full h-auto rounded-lg pointer-events-none"
              draggable={false}
            />
            <form
              onSubmit={handleSubmit(submit)}
              className="absolute inset-0 flex flex-col justify-between gap-2 px-[50px] pt-[90px] pb-[75px]"
            >
              <div className="flex flex-col gap-1 relative">
                <label className="text-[20px] font-bold text-[#3a0808]">
                  Título *
                </label>
                <input
                  {...register("title")}
                  className="rounded border border-amber-900/50 bg-black/60 px-2 py-1.5 text-xm text-amber-50 outline-none focus:border-amber-600"
                  placeholder="Digite o título..."
                />
                {errors.title && (
                  <span className="absolute left-0 top-full mt-0.5 text-[16px] font-semibold text-red-700">
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[20px] font-semibold text-[#3a0808] mt-[11px]">
                  Descrição
                </label>
                <textarea
                  {...register("description")}
                  className="rounded border border-amber-900/50 bg-black/60 px-2 py-1.5 text-xm text-amber-50 outline-none focus:border-amber-600 resize-none"
                  rows={11}
                  placeholder="Descrição opcional..."
                />
              </div>

              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[20px] font-semibold text-[#3a0808]">
                    Tag (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={MAX_TAG_LENGTH}
                    {...register("tag")}
                    className="rounded border border-amber-900/50 bg-black/60 px-2 py-1.5 text-xs text-amber-50 outline-none focus:border-amber-600"
                    placeholder={`Max ${MAX_TAG_LENGTH} letras...`}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[20px] font-semibold text-[#3a0808]">
                    Prioridade
                  </label>
                  <select
                    {...register("priority")}
                    className="rounded border border-amber-900/50 bg-black/60 px-1.5 py-1.5 text-xs text-amber-50 outline-none focus:border-amber-600"
                  >
                    <option value={1}>Baixo</option>
                    <option value={2}>Médio</option>
                    <option value={3}>Alto</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[20px] font-semibold text-[#3a0808]">
                  Data limite (opcional)
                </label>
                <input
                  type="date"
                  {...register("due_date")}
                  className="rounded border border-amber-900/50 bg-black/60 px-2 py-1.5 text-xs text-amber-50 outline-none focus:border-amber-600 [color-scheme:dark]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    relative overflow-hidden
                    rounded
                    border border-[#5b2c1c]
                    bg-gradient-to-b
                    from-[#8b4d24]
                    via-[#6e3918]
                    to-[#4b230f]
                    px-5 py-2
                    text-[14px]
                    font-semibold
                    text-[#f3dec2]
                    shadow-[0_2px_5px_rgba(0,0,0,0.55)]
                    transition-all
                    duration-200

                    before:absolute
                    before:left-2
                    before:right-2
                    before:top-1
                    before:h-px
                    before:bg-white/20
                    before:content-['']

                    hover:from-[#a35b2d]
                    hover:via-[#83431e]
                    hover:to-[#5c2d13]
                    hover:border-[#b8884b]
                    hover:text-[#fff2d5]
                    hover:shadow-[0_0_12px_rgba(180,130,60,0.35)]
                    hover:-translate-y-[1px]

                    active:translate-y-[1px]
                    active:shadow-inner
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    mr-[6px]
                    relative overflow-hidden
                    rounded
                    border border-[#5a1616]
                    bg-gradient-to-b
                    from-[#8d2d2d]
                    via-[#6d1f1f]
                    to-[#471111]
                    px-5 py-2
                    text-[14px]
                    font-semibold
                    text-[#f7e6dc]
                    shadow-[0_2px_5px_rgba(0,0,0,0.55)]
                    transition-all
                    duration-200

                    before:absolute
                    before:left-2
                    before:right-2
                    before:top-1
                    before:h-px
                    before:bg-white/15
                    before:content-['']

                    hover:from-[#a83939]
                    hover:via-[#852727]
                    hover:to-[#5d1616]
                    hover:border-[#b54b4b]
                    hover:text-[#fff8f5]
                    hover:shadow-[0_0_15px_rgba(160,40,40,0.4)]
                    hover:-translate-y-[1px]
                    hover:scale-[1.02]

                    active:translate-y-[1px]
                    active:scale-[0.98]
                    active:shadow-inner
                  "
                >
                  {editingTask ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}