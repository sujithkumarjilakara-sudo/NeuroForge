import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";
PDFParse.setWorker(getPath());

export type ParsedDocument = {
  text: string;
  pageCount: number;
  metadata?: Record<string, unknown>;
};

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<ParsedDocument> {
  if (!buffer || buffer.length === 0) {
    throw new Error("PDF data buffer is empty (0 bytes).");
  }

  let parser: PDFParse | undefined;

  try {
    parser = new PDFParse({ data: buffer });

    const result = await parser.getText();
    const text = (result.text || "").trim();

    if (!text) {
      throw new Error("No readable text could be extracted from this PDF.");
    }

    return {
      text,
      pageCount: result.total ?? 1,
    };
  } catch (error) {
    console.error("[PDF Extraction Server Error]:", error);

    const detail =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `Failed to parse the uploaded PDF file (${detail}). Please ensure it is a valid PDF.`
    );
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
