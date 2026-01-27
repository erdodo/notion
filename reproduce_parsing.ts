
import path from "path";
import fs from "fs";

// Mock DB
const db = {
    page: {
        create: async (data: any) => ({ id: "mock-id" }),
        update: async (data: any) => { }
    }
};

// Copy paste logic from factory
function stripTags(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(html: string) {
    return html.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x27;/g, "'");
}

function extractCodeBlock(html: string) {
    if (html.includes('<code')) {
        const match = html.match(/<code class="language-(.*?)"[^>]*>(.*?)<\/code>/s);
        if (match) {
            const lang = match[1];
            const code = decodeHtml(match[2]);
            return {
                type: "codeBlock",
                props: { language: lang.toLowerCase() },
                content: [{ type: "text", text: code, styles: {} }]
            };
        }
    }
    return null;
}

function extractTopLevelDivs(html: string): string[] {
    const chunks: string[] = [];
    let depth = 0;
    let start = -1;
    let i = 0;

    // Debug log
    // console.log("Scanning HTML:", html.substring(0, 100) + "...");

    while (i < html.length) {
        if (html.substring(i).startsWith("<div")) {
            // Check if it is the specific display:contents div and we are at depth 0
            const isTarget = html.substring(i).startsWith('<div style="display:contents"');

            if (depth === 0 && isTarget) {
                start = i;
            }
            depth++;
            // Advance past <div
            i += 4;
        } else if (html.substring(i).startsWith("</div>")) {
            depth--;
            if (depth === 0 && start !== -1) {
                // Found the end of the block
                const end = i + 6; // </div>
                chunks.push(html.substring(start, end));
                start = -1;
            }
            i += 6;
        } else {
            i++;
        }
    }

    return chunks;
}

async function parseHtmlToBlocks(html: string) {
    const blocks: any[] = [];

    const bodyStartTag = '<div class="page-body">';
    const bodyStart = html.indexOf(bodyStartTag);

    if (bodyStart === -1) {
        console.log("BODY START NOT FOUND");
        return [{ type: "paragraph", content: [] }];
    }

    const contentStart = bodyStart + bodyStartTag.length;
    const bodyContent = html.substring(contentStart);

    console.log("Body Content Start:", bodyContent.substring(0, 100));

    const chunks = extractTopLevelDivs(bodyContent);
    console.log("Chunks found:", chunks.length);

    if (chunks.length === 0) {
        // Let's print why.
        console.log("No chunks found. Dumping first 500 chars of bodyContent:");
        console.log(bodyContent.substring(0, 500));
    }

    for (const chunk of chunks) {
        const innerContentMatch = chunk.match(/<div[^>]*>(.*)<\/div>/s);
        if (!innerContentMatch) continue;

        let inner = innerContentMatch[1].trim();

        // 1. Heading
        const hMatch = inner.match(/^<h([1-3])\b[^>]*>(.*?)<\/h\1>/s);
        if (hMatch) {
            const level = parseInt(hMatch[1]);
            const text = stripTags(hMatch[2]);
            blocks.push({ type: "heading", text });
            continue;
        }

        // ... simplified check
        blocks.push({ type: "other", inner: inner.substring(0, 50) });
    }

    if (blocks.length === 0) {
        blocks.push({ type: "paragraph", content: [] });
    }

    return blocks;
}

// Read actual file
const filePath = "public/templates/Dökümanlar/Dökümanlar Sitesi 1426d7d7e05f8030804ae8d680182512.html";
if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    parseHtmlToBlocks(content).then(blocks => {
        console.log("Total Blocks:", blocks.length);
        console.log(JSON.stringify(blocks, null, 2));
    });
} else {
    console.log("File not found:", filePath);
}
