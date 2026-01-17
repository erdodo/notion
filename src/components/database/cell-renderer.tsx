
import { PropertyType } from "@prisma/client"
import { TitleCell } from "./cells/title-cell"
import { TextCell } from "./cells/text-cell"
import { NumberCell } from "./cells/number-cell"
import { SelectCell } from "./cells/select-cell"
import { DateCell } from "./cells/date-cell"
import { CheckboxCell } from "./cells/checkbox-cell"
import { UrlCell } from "./cells/url-cell"
import { CreatedTimeCell, UpdatedTimeCell } from "./cells/time-cells"
import { CellProps } from "./cells/types"

// Map other types to TextCell for now if implementation missing
const PlaceholderCell = TextCell

export function CellRenderer(props: CellProps) {
    // We need to know the type.
    // We can get it from column meta.
    const type = (props.column.columnDef.meta as any)?.property?.type as PropertyType

    switch (type) {
        case 'TITLE': return <TitleCell {...props} />
        case 'TEXT': return <TextCell {...props} />
        case 'NUMBER': return <NumberCell {...props} />
        case 'SELECT': return <SelectCell {...props} />
        case 'MULTI_SELECT': return <PlaceholderCell {...props} /> // TODO
        case 'DATE': return <DateCell {...props} />
        case 'CHECKBOX': return <CheckboxCell {...props} />
        case 'URL': return <UrlCell {...props} />
        case 'EMAIL': return <PlaceholderCell {...props} /> // Use text for now
        case 'PHONE': return <PlaceholderCell {...props} />
        case 'CREATED_TIME': return <CreatedTimeCell {...props} />
        case 'UPDATED_TIME': return <UpdatedTimeCell {...props} />
        default: return <TextCell {...props} />
    }
}
