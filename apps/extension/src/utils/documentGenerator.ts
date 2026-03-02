// Document generation utilities for cover letters and resumes
// These functions match the ones used in the web app

export interface DocumentData {
    title: string;
    company?: string;
    content: string;
    createdAt: number;
    filename?: string;
}

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
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // Title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(data.title, margin, 30);

        let currentY = 45;

        // Company
        if (data.company) {
            pdf.setFontSize(14);
            pdf.text(data.company, margin, currentY);
            currentY += 15;
        }

        // Date
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Generated on ${new Date(data.createdAt).toLocaleDateString()}`, margin, currentY);
        currentY += 20;

        // Content
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const lines = pdf.splitTextToSize(data.content, maxWidth);
        pdf.text(lines, margin, currentY);

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