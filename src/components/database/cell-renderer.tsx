
import { PropertyType } from "@prisma/client"
import { TitleCell } from "./cells/title-cell"
import { TextCell } from "./cells/text-cell"
import { NumberCell } from "./cells/number-cell"
import { SelectCell } from "./cells/select-cell"
import { DateCell } from "./cells/date-cell"
import { CheckboxCell } from "./cells/checkbox-cell"
import { UrlCell } from "./cells/url-cell"
import { CreatedTimeCell, UpdatedTimeCell } from "./cells/time-cells"
import { RelationCell } from "./cells/relation-cell"
import { RollupCell } from "./cells/rollup-cell"
import { FormulaCell } from "./cells/formula-cell"
import { CellProps } from "./cells/types"
import { RelationConfig } from "@/lib/relation-service"
import { RollupConfig } from "@/lib/rollup-service"
import { MultiSelectCell } from "./cells/multi-select-cell"

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
        case 'MULTI_SELECT': return <MultiSelectCell {...props} />
        case 'DATE': return <DateCell {...props} />
        case 'CHECKBOX': return <CheckboxCell {...props} />
        case 'URL': return <UrlCell {...props} />
        case 'EMAIL': return <PlaceholderCell {...props} /> // Use text for now
        case 'PHONE': return <PlaceholderCell {...props} />
        case 'CREATED_TIME': return <CreatedTimeCell {...props} />
        case 'UPDATED_TIME': return <UpdatedTimeCell {...props} />
        case 'RELATION':
            return <RelationCell
                propertyId={props.propertyId}
                rowId={props.rowId}
                value={props.cell?.value}
                config={(props.column.columnDef.meta as any)?.property?.relationConfig as unknown as RelationConfig}
            />
        case 'ROLLUP':
            return <RollupCell
                propertyId={props.propertyId}
                rowId={props.rowId}
                config={(props.column.columnDef.meta as any)?.property?.rollupConfig as unknown as RollupConfig}
            />
        case 'FORMULA':
            return <FormulaCell
                propertyId={props.propertyId}
                rowId={props.rowId}
                config={(props.column.columnDef.meta as any)?.property?.formulaConfig}
            />
        default: return <TextCell {...props} />
    }
}
