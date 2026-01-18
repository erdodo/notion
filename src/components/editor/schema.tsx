import {
    BlockNoteSchema,
    defaultBlockSpecs,
    defaultInlineContentSpecs,
    defaultStyleSpecs,
    createStyleSpec
} from "@blocknote/core"
import { CalloutBlock } from "./blocks/callout-block"
import { DividerBlock } from "./blocks/divider-block"
import { QuoteBlock } from "./blocks/quote-block"
import { TOCBlock } from "./blocks/toc-block"
import { ToggleBlock } from "./blocks/toggle-block"
import { BookmarkBlock } from "./blocks/bookmark-block"
import { ImageBlock } from "./blocks/image-block"
import { VideoBlock } from "./blocks/video-block"
import { AudioBlock } from "./blocks/audio-block"
import { FileBlock } from "./blocks/file-block"
import { EmbedBlock } from "./blocks/embed-block"
import { PageMentionBlock } from "./blocks/page-mention-block"
import { InlineDatabaseBlock } from "./blocks/inline-database-block"

// Custom style specs for text formatting
const customStyleSpecs = {
    ...defaultStyleSpecs,
    // Inline code style
    code: createStyleSpec(
        {
            type: "code",
            propSchema: "boolean",
        },
        {
            render: () => {
                const code = document.createElement("code")
                code.className = "bn-inline-code"
                return {
                    dom: code,
                }
            },
        }
    ),
    // Text color
    textColor: createStyleSpec(
        {
            type: "textColor",
            propSchema: "string",
        },
        {
            render: (value) => {
                const span = document.createElement("span")
                span.setAttribute("data-text-color", value || "default")
                return {
                    dom: span,
                }
            },
        }
    ),
    // Background/Highlight color
    backgroundColor: createStyleSpec(
        {
            type: "backgroundColor",
            propSchema: "string",
        },
        {
            render: (value) => {
                const span = document.createElement("span")
                span.setAttribute("data-background-color", value || "default")
                return {
                    dom: span,
                }
            },
        }
    ),
}

// Note: backgroundColor will be handled via CSS and block metadata
// BlockNote doesn't support runtime prop schema modification easily
export const schema = BlockNoteSchema.create({
    blockSpecs: {
        // Standard blocks
        ...defaultBlockSpecs,

        // Custom blocks
        callout: CalloutBlock(),
        divider: DividerBlock(),
        quote: QuoteBlock(),
        toc: TOCBlock(),
        toggle: ToggleBlock(),
        bookmark: BookmarkBlock(),
        image: ImageBlock(),
        video: VideoBlock(),
        audio: AudioBlock(),
        file: FileBlock(),
        embed: EmbedBlock(),

        // New block
        pageMention: PageMentionBlock(),
        inlineDatabase: InlineDatabaseBlock(),
    },
    inlineContentSpecs: defaultInlineContentSpecs,
    styleSpecs: customStyleSpecs,
})
