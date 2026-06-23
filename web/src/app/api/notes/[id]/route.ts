import { updateNoteField } from "@/lib/data-loader";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const fields: Record<string, unknown> = {};
    if (body.status) fields.status = body.status;
    if (body.rating !== undefined && body.rating !== null) fields.rating = body.rating;
    const note = updateNoteField(id, fields as { status?: "pending" | "in_progress" | "completed"; rating?: number });
    return Response.json({ success: true, note });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
