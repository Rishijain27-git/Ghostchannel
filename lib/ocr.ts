import Tesseract from "tesseract.js";

export async function extractTextFromImage(file: File): Promise<string> {
  const result = await Tesseract.recognize(file, "eng");
  return result.data.text.trim();
}
