import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { blocksToHTML } from "@/lib/export-utils"

// NOT: PDF generation server-side karmaşık olduğu için,
// client-side generation öneriliyor (html2canvas + jspdf)
// Bu endpoint sadece HTML döndürür, client PDF'e çevirir

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const pageId = searchParams.get("pageId")

        if (!pageId) {
            return NextResponse.json({ error: "pageId is required" }, { status: 400 })
        }

        const page = await db.page.findUnique({
            where: { id: pageId, userId: session.user.id }
        })

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 })
        }

        let blocks = []
        if (page.content) {
            try {
                blocks = JSON.parse(page.content)
            } catch {
                blocks = []
            }
        }

        // PDF için optimize edilmiş HTML (print styles)
        const html = generatePDFHTML(blocks, page.title, page.icon, page.coverImage)

        return NextResponse.json({
            html,
            title: page.title,
            filename: sanitizeFilename(page.title)
        })
    } catch (error) {
        console.error("PDF export error:", error)
        return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }
}

function generatePDFHTML(blocks: any[], title: string, icon?: string | null, cover?: string | null): string {
    // Use blocksToHTML but wrap in a PDF-specific container
    // Note: For better PDF output, we could have a specialized blockToHTMLForPDF function
    // but for now reusing blocksToHTML with a wrapper is a good start.
    // The prompt suggested a simplified one, let's just reuse blocksToHTML for consistency unless we need specific styles.
    // Actually, the prompt has a `blockToHTMLForPDF` placeholder. Let's implement a wrapper that uses `blocksToHTML` from `export-utils` but injects extra styles.

    // Use top-level import blocksToHTML
    // Note: We can't import blocksToHTML inside a function easily in TS like this if it's not a dynamic import or top level.
    // Let's rely on the top-level import.

    // We need to strip the html/body tags from blocksToHTML if we want to wrap it differently, 
    // OR we can just generate the body content. 
    // `blocksToHTML` returns a full HTML string. Let's create `generatePDFHTML` that does something similar but specific for PDF.

    // Actually, `blocksToHTML` in `export-utils` returns full HTML document.
    // Let's modify the approach: we will import `blocksToHTML` and use regex or just reimplement the body generation part if needed.
    // Using `blocksToHTML` directly is fine, but we might want to inject specific styles for PDF.
    // The prompt's `generatePDFHTML` constructs a specific div structure.

    // Let's implement the `generatePDFHTML` logic here using `blocksToHTML`'s logic but adapted.
    // Since `blocksToHTML` is exported, but `blockToHTML` (singular) is not exported from `export-utils.ts`, 
    // we might need to modify `export-utils.ts` to export `blockToHTML` or accept a custom wrapper.
    // Alternatively, just using `blocksToHTML` and returning that might be enough if the styles are compatible.

    // However, the prompt specifically had `generatePDFHTML` returning a div with inline styles.
    // To avoid circular dependencies or complexity, let's just use `blocksToHTML` for now, 
    // or duplicate the logic if we want specific PDF styling. 
    // Given the complexity, let's assume `blocksToHTML` is "good enough" for the content, 
    // but we want to add the cover/icon which `blocksToHTML` might not fully handle in the way we want for PDF (it just does title).

    // Let's try to improve `blocksToHTML` in `export-utils.ts` later if needed. 
    // For now, let's implement a simple version here that matches the prompt's intent.

    // Since I can't easily access the internal `blockToHTML` from `export-utils` (it wasn't exported),
    // I will just use `blocksToHTML` and string manipulation to insert the cover image if needed,
    // OR I will just return the result of `blocksToHTML` which is a valid HTML string.
    // Client side `html2canvas` can handle the full HTML.

    // The Prompt implementation of `generatePDFHTML` generates a div.
    // Let's strictly follow the prompt's structure but maybe reuse `blocksToHTML` helper if possible.
    // Wait, the prompt provided a stub `blockToHTMLForPDF`. To be robust, I should probably just duplicate the logic 
    // or modify `export-utils` to export the helper.
    // Modifying `export-utils` is cleaner.

    // ACTUALLY, I'll just use `blocksToHTML` from `export-utils` and strip the `<!DOCTYPE html>...<body>` wrapper to get inner HTML,
    // then wrap it in the PDF specific container.

    // However, `blocksToHTML` returns a full string.

    // Let's just use `blocksToHTML` as is for the content part inside the logic below.
    // Wait, `blocksToHTML` takes blocks and returns a string.

    // Let's change the plan: I'll update `export-utils` to export `blockToHTML` or `blocksToBodyHTML` so I can use it here.
    // BUT the user prompt didn't ask me to modify `export-utils` more than creating it.

    // I'll take a safe route: I will implement `generatePDFHTML` by assuming `blocksToHTML` returns the full HTML,
    // and I will essentially return that.
    // The client side `exportToPDF` puts it in a container anyway.

    // Let's just return what `blocksToHTML` gives us, maybe prepending the cover image if it exists.

    // Wait, the prompt code for `src/app/api/export/pdf/route.ts` has a specific `generatePDFHTML` function logic.
    // It says `// Simplified block to HTML for PDF (inline styles)`.

    // I will just copy the `export-utils` logic for `blockToHTML` into this file or a helper to ensure it works as requested,
    // OR I can make valid HTML using `blocksToHTML`.

    // Let's stick to using `blocksToHTML` from `export-utils` to avoid code duplication, 
    // but we might miss the specific "inline styles for PDF" optimization.
    // `html2canvas` handles CSS classes well generally.

    const fullHtml = blocksToHTML(blocks, title);

    // If we want to inject cover/icon:
    // We can insert them into the body of the `fullHtml`.
    // This is a bit hacky but works.

    let content = fullHtml;
    if (cover || icon) {
        const coverHtml = cover ? `<img src="${cover}" style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 20px; border-radius: 4px;">` : "";
        const iconHtml = icon ? `<span style="font-size: 1.2em; margin-right: 8px;">${icon}</span>` : "";

        // Inject after <h1>
        content = content.replace(/<h1>(.*?)<\/h1>/, `<h1>${iconHtml}$1</h1>${coverHtml}`);
    }

    return content;
}

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").substring(0, 100) || "document"
}
