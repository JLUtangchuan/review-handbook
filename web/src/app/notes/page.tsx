import { getNotes, getTopics } from "@/lib/data-loader";
import NotesClient from "./NotesClient";

export default function NotesPage() {
  const notes = getNotes();
  const topics = getTopics();
  return <NotesClient notes={notes} topics={topics} />;
}
