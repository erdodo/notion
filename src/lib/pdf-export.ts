'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(
  pageId: string,
  title: string
): Promise<void> {
  const response = await fetch(`/api/export/pdf?pageId=${pageId}`);
  const data = await response.json();

  if (!response.ok || !data.html) {
    throw new Error('Failed to generate PDF content');
  }

  const container = document.createElement('div');
  container.innerHTML = data.html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  document.body.append(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 800,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${data.filename || title}.pdf`);
  } finally {
    container.remove();
  }
}
