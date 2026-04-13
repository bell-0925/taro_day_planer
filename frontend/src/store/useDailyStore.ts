import { create } from "zustand";
import type { DrawnCard, NlpResult } from "@/lib/api";

export type Condition = "최고" | "좋음" | "보통" | "나쁨";

interface DailyStore {
  date: string;
  cards: DrawnCard[];
  nlpResult: NlpResult | null;
  fortune: string;
  summary: string;
  condition: Condition | null;
  tasks: string[];
  advice: string;
  adviceSummary: string;
  completedTasks: string[];
  incompleteTasks: string[];
  retrospective: string;
  retroSummary: string;

  setCards: (cards: DrawnCard[]) => void;
  setFortune: (summary: string, fortune: string, nlp: NlpResult) => void;
  setCondition: (c: Condition) => void;
  setTasks: (tasks: string[]) => void;
  setAdvice: (summary: string, advice: string) => void;
  setRetrospective: (summary: string, retro: string, done: string[], notDone: string[]) => void;
  reset: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const useDailyStore = create<DailyStore>((set) => ({
  date: today(),
  cards: [],
  nlpResult: null,
  fortune: "",
  summary: "",
  condition: null,
  tasks: [],
  advice: "",
  adviceSummary: "",
  completedTasks: [],
  incompleteTasks: [],
  retrospective: "",
  retroSummary: "",

  setCards: (cards) => set({ cards }),
  setFortune: (summary, fortune, nlpResult) => set({ summary, fortune, nlpResult }),
  setCondition: (condition) => set({ condition }),
  setTasks: (tasks) => set({ tasks }),
  setAdvice: (adviceSummary, advice) => set({ adviceSummary, advice }),
  setRetrospective: (retroSummary, retrospective, completedTasks, incompleteTasks) =>
    set({ retroSummary, retrospective, completedTasks, incompleteTasks }),
  reset: () => set({
    date: today(), cards: [], nlpResult: null, fortune: "", summary: "",
    condition: null, tasks: [], advice: "", adviceSummary: "",
    completedTasks: [], incompleteTasks: [], retrospective: "", retroSummary: ""
  }),
}));
