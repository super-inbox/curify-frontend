import topics from "@/public/data/topics.json";

export type Topic = {
  id: string;
  icon: string;
  priority: number;
  keywords: string[];
};

export function getTopics(): Topic[] {
  return [...topics].sort((a, b) => a.priority - b.priority);
}