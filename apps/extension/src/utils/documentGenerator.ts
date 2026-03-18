// Document generation utilities for cover letters and resumes
// These functions match the ones used in the web app

export interface DocumentData {
    title: string;
    company?: string;
    content: string;
    createdAt: number;
    filename?: string;
}

const splitTextIntoPdfLines = (
    pdf: import("jspdf").jsPDF,
    text: string,
    maxWidth: number
): string[] =>
    text
        .split(/\r?\n/)
        .flatMap((line) => {
            const trimmed = line.trim();
            if (!trimmed) return [""];
            return pdf.splitTextToSize(trimmed, maxWidth) as string[];
        });

const writeWrappedPdfBlock = (
    pdf: import("jspdf").jsPDF,
    text: string,
    currentY: number,
    options: {
        fontSize: number;
        fontStyle: "bold" | "normal" | "italic";
        maxWidth: number;
        pageHeight: number;
        margin: number;
        gapAfter: number;
    }
): number => {
    const trimmed = text.trim();
    if (!trimmed) return currentY;

    pdf.setFontSize(options.fontSize);
    pdf.setFont("helvetica", options.fontStyle);

    const lines = splitTextIntoPdfLines(pdf, trimmed, options.maxWidth);
    const lineHeight = Math.max(pdf.getTextDimensions("Ag").h * 1.2, 6);
    const bottomLimit = options.pageHeight - options.margin;
    let nextY = currentY;
    let index = 0;

    while (index < lines.length) {
        const availableHeight = bottomLimit - nextY;
        const linesThatFit = Math.max(Math.floor(availableHeight / lineHeight), 0);

        if (linesThatFit === 0) {
            pdf.addPage();
            nextY = options.margin;
            continue;
        }

        const chunk = lines.slice(index, index + linesThatFit);
        pdf.text(chunk, options.margin, nextY);
        nextY += chunk.length * lineHeight;
        index += chunk.length;

        if (index < lines.length) {
            pdf.addPage();
            nextY = options.margin;
        }
    }

    return nextY + options.gapAfter;
};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const coverLetterContentToHtml = (content: string): string => {
    const paragraphs = content
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
        .join("");
};

export const generateDocx = async (data: DocumentData): Promise<void> => {
    try {
        const { Document, Packer, Paragraph, TextRun } = await import('docx');

        // Create a new document
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: data.title,
                                bold: true,
                                size: 32,
                            }),
                        ],
                    }),
                    ...(data.company ? [new Paragraph({
                        children: [
                            new TextRun({
                                text: data.company,
                                bold: true,
                                size: 24,
                            }),
                        ],
                    })] : []),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Generated on ${new Date(data.createdAt).toLocaleDateString()}`,
                                italics: true,
                                size: 20,
                            }),
                        ],
                    }),
                    new Paragraph({ children: [] }), // Empty paragraph for spacing
                    ...data.content.split('\n\n').map(paragraph =>
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: paragraph.trim(),
                                    size: 24,
                                }),
                            ],
                        })
                    ),
                ],
            }],
        });

        // Generate and download the document
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename || 'document.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to generate DOCX:', error);
        throw new Error('Failed to generate Word document. Please try again.');
    }
};

export const generatePdf = async (data: DocumentData): Promise<void> => {
    try {
        const { jsPDF } = await import('jspdf');

        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let currentY = 30;

        currentY = writeWrappedPdfBlock(pdf, data.title, currentY, {
            fontSize: 16,
            fontStyle: "bold",
            maxWidth,
            pageHeight,
            margin,
            gapAfter: 6,
        });

        if (data.company) {
            currentY = writeWrappedPdfBlock(pdf, data.company, currentY, {
                fontSize: 14,
                fontStyle: "bold",
                maxWidth,
                pageHeight,
                margin,
                gapAfter: 6,
            });
        }

        currentY = writeWrappedPdfBlock(
            pdf,
            `Generated on ${new Date(data.createdAt).toLocaleDateString()}`,
            currentY,
            {
                fontSize: 10,
                fontStyle: "italic",
                maxWidth,
                pageHeight,
                margin,
                gapAfter: 10,
            }
        );

        data.content
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .forEach((paragraph) => {
                currentY = writeWrappedPdfBlock(pdf, paragraph, currentY, {
                    fontSize: 12,
                    fontStyle: "normal",
                    maxWidth,
                    pageHeight,
                    margin,
                    gapAfter: 8,
                });
            });

        // Download
        const filename = data.filename || 'document.pdf';
        pdf.save(filename);
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};

export const generateCoverLetterFilename = (company?: string, jobTitle?: string, format: 'docx' | 'pdf' = 'docx'): string => {
    const cleanString = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
    const companyPart = company ? cleanString(company) : 'Company';
    const titlePart = jobTitle ? cleanString(jobTitle) : 'Position';
    return `Cover_Letter_${companyPart}_${titlePart}.${format}`;
};

export const generateResumeFilename = (originalFilename: string, format: 'docx' | 'pdf' = 'pdf'): string => {
    const cleanString = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
    const baseName = originalFilename.replace(/\.[^/.]+$/, ""); // Remove original extension
    return `${cleanString(baseName)}.${format}`;
};

export const copyDocumentToClipboard = async (content: string): Promise<void> => {
    const plainText = content.trim();
    const html = coverLetterContentToHtml(plainText);

    if (typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
            new ClipboardItem({
                "text/plain": new Blob([plainText], { type: "text/plain" }),
                "text/html": new Blob([html], { type: "text/html" }),
            }),
        ]);
        return;
    }

    await navigator.clipboard.writeText(plainText);
};
