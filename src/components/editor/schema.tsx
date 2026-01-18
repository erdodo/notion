import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core"
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
})
