import { getRoadmap, getProgress, getWeekCompletion } from "@/lib/data-loader";
import RoadmapClient from "./RoadmapClient";

export default function RoadmapPage() {
  const roadmap = getRoadmap();
  const progress = getProgress();
  const weekProgress = roadmap.weeks.map((w) => ({
    ...w,
    completion: getWeekCompletion(w.week),
  }));
  const totalNotes = roadmap.weeks.reduce(
    (sum, w) =>
      sum + w.content.foundations.length + w.content.interview_qa.length +
      w.content.advanced.length + w.content.coding.length + w.content.papers.length,
    0
  );

  return <RoadmapClient roadmap={roadmap} progress={progress} weekProgress={weekProgress} totalNotes={totalNotes} />;
}
