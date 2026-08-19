import * as pdfjsLib from 'pdfjs-dist';

// Use bundled worker or inline fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  // Worker fallback
}

/**
 * Extract clean human-readable text from a PDF file in the browser
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str || '')
        .join(' ');
      fullText += pageText + '\n\n';
    }

    const cleaned = fullText.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 20) {
      return fullText.trim();
    }
    throw new Error('PDF has no extractable text layer.');
  } catch (err) {
    console.warn('PDF.js client extraction failed, using fallback text reader:', err.message);
    // Fallback: read as text and strip PDF markers if possible
    const raw = await file.text();
    // Simple stream text extractor regex
    const matches = raw.match(/\(([^()]+)\)/g);
    if (matches && matches.length > 5) {
      const extracted = matches.map(m => m.slice(1, -1)).join(' ');
      if (extracted.length > 50) return extracted;
    }
    return raw;
  }
}

/**
 * Smart file reader that extracts readable text from PDF or Text files
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function parseResumeFile(file) {
  if (!file) return '';
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    return await extractTextFromPdf(file);
  }
  // Plain text, markdown, json, etc.
  return await file.text();
}
