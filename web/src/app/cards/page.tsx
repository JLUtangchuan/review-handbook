import { getNotes } from "@/lib/data-loader";
import CardsClient from "./CardsClient";

export default function CardsPage() {
  const notes = getNotes();
  return <CardsClient notes={notes} />;
}
