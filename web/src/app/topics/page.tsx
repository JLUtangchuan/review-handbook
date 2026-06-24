import { getTopics, getNotes } from "@/lib/data-loader";
import TopicsClient from "./TopicsClient";

export default function TopicsPage() {
  const topics = getTopics();
  const notes = getNotes();
  return <TopicsClient topics={topics} notes={notes} />;
}
