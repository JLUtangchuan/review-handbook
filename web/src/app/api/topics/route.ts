import { getTopics, updateTopics } from "@/lib/data-loader";
import type { Topic } from "@/lib/types";

export async function GET() {
  try {
    const tree = getTopics();
    return Response.json(tree);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.topics || !Array.isArray(body.topics)) {
      return Response.json({ error: "Invalid body: expected { topics: Topic[] }" }, { status: 400 });
    }
    const tree = updateTopics(body.topics as Topic[]);
    return Response.json({ success: true, topics: tree.topics });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
