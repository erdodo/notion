
import {
    Type,
    AlignLeft,
    Hash,
    ChevronDown,
    List,
    Calendar,
    CheckSquare,
    Link,
    Mail,
    Phone,
    Clock,
    RefreshCw,
    ArrowUpRight,
    Calculator,
    Sigma,
    LucideIcon
} from "lucide-react"
import { PropertyType } from "@prisma/client"

export const propertyTypeIcons: Record<PropertyType, LucideIcon> = {
    TITLE: Type,
    TEXT: AlignLeft,
    NUMBER: Hash,
    SELECT: ChevronDown,
    MULTI_SELECT: List,
    DATE: Calendar,
    CHECKBOX: CheckSquare,
    URL: Link,
    EMAIL: Mail,
    PHONE: Phone,
    CREATED_TIME: Clock,
    UPDATED_TIME: RefreshCw,
    RELATION: ArrowUpRight,
    ROLLUP: Calculator,
    FORMULA: Sigma,
}

interface PropertyTypeIconProps {
    type: PropertyType
    className?: string
}

export function PropertyTypeIcon({ type, className }: PropertyTypeIconProps) {
    const Icon = propertyTypeIcons[type]
    return <Icon className={className} />
}
