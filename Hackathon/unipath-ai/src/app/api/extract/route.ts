import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extract text from an uploaded PDF (resume / transcript / portfolio).
 *  Mirrors the Streamlit app's pdfplumber step, in Node via unpdf. */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 15 MB)." }, { status: 413 });
  }

  try {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const buf = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = (Array.isArray(text) ? text.join("\n") : text).trim();

    if (!clean) {
      return NextResponse.json(
        {
          error:
            "No readable text found — this may be a scanned image. Try a text-based PDF.",
          text: "",
        },
        { status: 422 }
      );
    }
    return NextResponse.json({ text: clean, chars: clean.length, name: file.name });
  } catch {
    return NextResponse.json(
      { error: "We couldn't read this PDF. Make sure it's a valid, text-based file." },
      { status: 422 }
    );
  }
}
