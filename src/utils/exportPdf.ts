import { jsPDF } from 'jspdf';
import { useStore } from '../store/useStore';

export const downloadPdf = async (filename: string) => {
  const state = useStore.getState();
  
  if (!state.explanationText) {
    alert("No explanation generated to export yet!");
    return;
  }
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'letter'
  });
  
  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(`Topic: ${state.topic}`, 40, 50);
  
  // Meta tags
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Level Component: ${state.level}`, 40, 75);
  pdf.text(`Interest Analogy: ${state.interest}`, 220, 75);
  
  // Body Text
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(11);
  // Break text down to fit standard letter width
  const textLines = pdf.splitTextToSize(state.explanationText, 380);
  
  // Clean custom pagination if the AI generated an exceedingly long format
  let cursorY = 110;
  textLines.forEach((line: string) => {
      if (cursorY > 550) {
          pdf.addPage();
          cursorY = 50;
      }
      pdf.text(line, 40, cursorY);
      cursorY += 14; // Line height
  });
  
  pdf.save(`${filename}.pdf`);
};
