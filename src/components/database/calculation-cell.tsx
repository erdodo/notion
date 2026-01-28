import { Property, DatabaseRow, Cell } from '@prisma/client';
import { Row } from '@tanstack/react-table';

interface CalculationCellProperties {
  property: Property;
  rows: Row<DatabaseRow & { cells?: Cell[] }>[];
}

export function CalculationCell({ property, rows }: CalculationCellProperties) {
  const type = property.type;

  const calculate = () => {
    const validValues = rows
      .map((r) => {
        const cell = r.original.cells?.find(
          (c: Cell) => c.propertyId === property.id
        );
        return cell?.value;
      })
      .filter((v) => v !== null && v !== undefined && v !== '');

    if (type === 'TITLE') {
      return rows.length;
    }

    if (type === 'NUMBER') {
      const sum = validValues.reduce(
        (accumulator: number, value_: unknown) =>
          accumulator + (Number(value_) || 0),
        0
      );

      return `SUM ${new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }).format(sum)}`;
    }

    return '';
  };

  return (
    <div className="w-full h-full min-h-[33px] flex items-center justify-end px-2 text-xs text-muted-foreground border-t border-border/50 text-right">
      {calculate()}
    </div>
  );
}
