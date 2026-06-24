import { getRoadmap, getNotesByWeek } from "@/lib/data-loader";
import { notFound } from "next/navigation";
import WeekClient from "./WeekClient";

interface WeekPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  const roadmap = getRoadmap();
  return roadmap.weeks.map((w) => ({ id: String(w.week) }));
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { id } = await params;
  const weekNum = parseInt(id, 10);
  if (isNaN(weekNum)) notFound();

  const roadmap = getRoadmap();
  const weekPlan = roadmap.weeks.find((w) => w.week === weekNum);
  if (!weekPlan) notFound();

  const notes = getNotesByWeek(weekNum);
  const hasPrev = weekNum > 1;
  const hasNext = weekNum < roadmap.total_weeks;

  return (
    <WeekClient
      weekPlan={weekPlan}
      notes={notes}
      weekNum={weekNum}
      hasPrev={hasPrev}
      hasNext={hasNext}
      totalWeeks={roadmap.total_weeks}
    />
  );
}
