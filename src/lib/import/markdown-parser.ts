
export interface Block {
    type: string;
    props?: Record<string, any>;
    content?: any[];
    children?: Block[];
}

export function parseMarkdownToBlocks(markdown: string): Block[] {
    const lines = markdown.split('\n');
    const blocks: Block[] = [];

    let inCodeBlock = false;
    let codeContent = "";
    let codeLanguage = "";

    // Helper to process inline styles (bold, links, etc.)
    // For now, we return simple text blocks, but we can expand this to support rich text.
    // Helper to process inline styles (bold, links, etc.)
    // For now, we return simple text blocks, but we can expand this to support rich text.
    // NOTE: Image detection has been moved to main loop to avoid invalid nesting (Image Block inside Paragraph content).
    const processInline = (text: string) => {
        // TODO: Add Bold/Italic/Link parsing here if needed.
        return [{ type: "text", text: text, styles: {} }];
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code Block Handling
        if (line.trim().startsWith("```")) {
            if (inCodeBlock) {
                blocks.push({
                    type: "codeBlock",
                    props: { language: codeLanguage },
                    content: [{ type: "text", text: codeContent.trim(), styles: {} }]
                });
                inCodeBlock = false;
                codeContent = "";
                codeLanguage = "";
            } else {
                inCodeBlock = true;
                codeLanguage = line.trim().substring(3);
            }
            continue;
        }

        if (inCodeBlock) {
            codeContent += line + "\n";
            continue;
        }

        const trimmed = line.trim();
        if (!trimmed) continue;

        // --- Block Type Detection ---

        // Headings
        if (trimmed.startsWith("# ")) {
            blocks.push({ type: "heading", props: { level: 1 }, content: processInline(trimmed.substring(2)) });
        } else if (trimmed.startsWith("## ")) {
            blocks.push({ type: "heading", props: { level: 2 }, content: processInline(trimmed.substring(3)) });
        } else if (trimmed.startsWith("### ")) {
            blocks.push({ type: "heading", props: { level: 3 }, content: processInline(trimmed.substring(4)) });
        }
        // Lists
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            blocks.push({ type: "bulletListItem", content: processInline(trimmed.substring(2)) });
        } else if (/^\d+\.\s/.test(trimmed)) {
            blocks.push({ type: "numberedListItem", content: processInline(trimmed.replace(/^\d+\.\s/, "")) });
        }
        // Quote
        else if (trimmed.startsWith("> ")) {
            blocks.push({ type: "quote", content: processInline(trimmed.substring(2)) });
        }
        // Callouts (custom syntax like <aside>)
        // We will simplify: if it starts with <aside>, we treat the next lines as callout content until </aside>
        // For this first pass, let's treat HTML tags as paragraph text or strip them, 
        // BUT the template specifically uses <aside> for callouts.
        else if (trimmed.startsWith("<aside>")) {
            // Start a callout block. 
            // We need to look ahead or manage state.
            // For simplicity in this loop, let's just create a "callout" block and append subsequent lines to it?
            // Or, we can just treat it as a Start Marker.
            // Let's implement a simple state machine for Callouts.
            blocks.push({
                type: "callout",
                props: { type: "info" },
                content: [] // Will fill in next iterations?
                // Actually BlockNote structure for callout content is... content: [Blocks] or [InlineContent]?
                // It's content: [InlineContent].
                // So we need to accumulate text.
            });
            // We'll mark the last block as "active callout"
        }
        else if (trimmed.startsWith("</aside>")) {
            // Close callout.
        }
        // Images (Markdown syntax)
        else if (trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)) {
            const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (match) {
                blocks.push({
                    type: "image",
                    props: {
                        url: match[2],
                        caption: match[1],
                        previewWidth: 512
                    },
                    children: [] // Images usually don't have children in BlockNote
                });
            }
        }
        // Paragraph
        else {
            // Check if we are inside a callout (last block is callout and empty/open?)
            // This is a bit hacky for a single pass parser.
            // Better to handle the <aside> block accumulation.

            // Re-visiting the logic: simpler to just treat everything else as paragraph.
            // If the template has HTML, we might need a better parser later.
            // But for now, let's handle the specific <aside> format seen in the file.

            const lastBlock = blocks[blocks.length - 1];
            if (lastBlock && lastBlock.type === "callout" && !trimmed.includes("</aside>")) {
                // Check if it's an image inside callout?
                if (trimmed.startsWith("<img")) {
                    // Icon for the callout?
                    // <img src="..." width="40px" />
                    // Let's try to extract src for icon.
                    const srcMatch = trimmed.match(/src="(.*?)"/);
                    if (srcMatch) {
                        lastBlock.props = { ...lastBlock.props, icon: srcMatch[1] };
                    }
                } else {
                    // Append to content.
                    // Last block content is array of InlineContent.
                    // We Add a text object.
                    if (!lastBlock.content) lastBlock.content = [];
                    // Use processInline to allow basic text processing inside callouts
                    lastBlock.content.push(...processInline(trimmed + " "));
                }
            } else {
                if (!trimmed.includes("<aside") && !trimmed.includes("</aside>")) {
                    blocks.push({ type: "paragraph", content: processInline(trimmed) });
                }
            }
        }
    }

    return blocks;
}
