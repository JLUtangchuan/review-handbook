import { getProgress, updateProgress } from "@/lib/data-loader";

export async function GET() {
  try {
    const progress = getProgress();
    return Response.json(progress);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const progress = updateProgress(body);
    return Response.json({ success: true, progress });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
