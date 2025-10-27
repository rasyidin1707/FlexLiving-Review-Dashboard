// Relies on html2canvas + jspdf (present in package.json)
export async function exportDashboardToPDF(elementId: string, filename = "dashboard.pdf") {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);
  const html2canvas = (await import("html2canvas")).default;
  // @ts-ignore dynamic import
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20; // margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 10;
  pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  while (position + imgHeight > pageHeight - 10) {
    pdf.addPage();
    position = 10 - (pageHeight - imgHeight - 10);
  }
  pdf.save(filename);
}

