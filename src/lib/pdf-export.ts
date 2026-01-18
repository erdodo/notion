"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function exportToPDF(pageId: string, title: string): Promise<void> {
    // Get PDF HTML from API
    const response = await fetch(`/api/export/pdf?pageId=${pageId}`)
    const data = await response.json()

    if (!response.ok || !data.html) {
        throw new Error("Failed to generate PDF content")
    }

    // Create temporary container
    const container = document.createElement("div")
    container.innerHTML = data.html
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.width = "800px"
    document.body.appendChild(container)

    try {
        // Convert to canvas
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 800
        })

        // Create PDF
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        })

        const imgWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        let position = 0

        // Add first page
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }

        // Save
        pdf.save(`${data.filename || title}.pdf`)
    } finally {
        document.body.removeChild(container)
    }
}
