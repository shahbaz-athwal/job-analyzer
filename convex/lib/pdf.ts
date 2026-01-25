import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPdf(blob: Blob): Promise<string> {
	const buffer = await blob.arrayBuffer();
	const pdf = await getDocumentProxy(new Uint8Array(buffer));
	const { text } = await extractText(pdf, { mergePages: true });
	return text;
}
