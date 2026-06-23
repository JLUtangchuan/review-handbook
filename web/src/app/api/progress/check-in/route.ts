import { markDayComplete, getCurrentDay } from "@/lib/data-loader";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const day = body.day ?? getCurrentDay();
    const result = markDayComplete(day);
    return Response.json({ success: true, ...result });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
