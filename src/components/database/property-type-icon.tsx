import { PropertyType } from '@prisma/client';
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
  User,
  UserCheck,
  LucideIcon,
  CheckCircle2,
} from 'lucide-react';

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
  CREATED_BY: User,
  LAST_EDITED_BY: UserCheck,
  STATUS: CheckCircle2,
};

interface PropertyTypeIconProperties {
  type: PropertyType;
  className?: string;
}

export function PropertyTypeIcon({
  type,
  className,
}: PropertyTypeIconProperties) {
  const Icon = propertyTypeIcons[type];
  return <Icon className={className} />;
}
