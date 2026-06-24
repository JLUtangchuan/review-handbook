import { updateNoteField } from "@/lib/data-loader";

const VALID_STATUSES = ["pending", "in_progress", "completed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const fields: Record<string, unknown> = {};

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return Response.json({ error: `Invalid status: ${body.status}. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
      }
      fields.status = body.status;
    }

    if (body.rating !== undefined && body.rating !== null) {
      const r = Number(body.rating);
      if (isNaN(r) || r < 0 || r > 5) {
        return Response.json({ error: `Invalid rating: ${body.rating}. Must be 0-5.` }, { status: 400 });
      }
      fields.rating = r;
    }

    const note = updateNoteField(id, fields as { status?: "pending" | "in_progress" | "completed"; rating?: number });
    return Response.json({ success: true, note });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
