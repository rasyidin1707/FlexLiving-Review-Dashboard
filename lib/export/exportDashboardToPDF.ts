// Relies on html2canvas + jspdf (present in package.json)
export async function exportDashboardToPDF(elementId: string, filename = "dashboard.pdf") {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);
  const html2canvas = (await import("html2canvas")).default;
  // @ts-ignore dynamic import
  const { jsPDF } = await import("jspdf");

  try {
    // Use CORS to avoid tainted canvas issues in production
    const canvas = await html2canvas(el as HTMLElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: document.documentElement.clientWidth,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // If one page is enough
    if (imgHeight <= pageHeight - margin * 2) {
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      pdf.save(filename);
      return;
    }

    // Multi-page: slice the canvas vertically
    const pageCanvas = document.createElement("canvas");
    const ctx = pageCanvas.getContext("2d")!;
    const ratio = imgWidth / canvas.width;
    const pagePixelHeight = Math.floor((pageHeight - margin * 2) / ratio);
    pageCanvas.width = canvas.width;
    pageCanvas.height = pagePixelHeight;

    let renderedHeight = 0;
    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pagePixelHeight, canvas.height - renderedHeight);
      // Clear and draw slice
      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        sliceHeight,
        0,
        0,
        pageCanvas.width,
        sliceHeight
      );

      const imgData = pageCanvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, (sliceHeight * imgWidth) / canvas.width);
      renderedHeight += sliceHeight;
      if (renderedHeight < canvas.height) pdf.addPage();
    }
    pdf.save(filename);
  } catch (e) {
    console.error("PDF export failed; falling back to simple text summary.", e);
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.text("Flex Living - Dashboard", 20, 20);
    pdf.text("Could not snapshot charts in this environment.", 20, 30);
    pdf.save(filename);
  }
}
