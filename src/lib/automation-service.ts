import { Prisma } from '@prisma/client';

import { db } from '@/lib/db';

type _AutomationTriggerType = 'PROPERTY_CHANGE';
type _AutomationActionType = 'UPDATE_PROPERTY';

interface TriggerConfig {
  propertyId: string;
  to?: string;
  from?: string;
}

interface ActionConfig {
  propertyId: string;
  value: unknown;
}

export async function checkAndRunAutomations(
  databaseId: string,
  rowId: string,
  changeContext: {
    propertyId: string;
    newValue: unknown;
    oldValue?: unknown;
  }
) {
  const automations = await db.databaseAutomation.findMany({
    where: { databaseId },
  });

  if (automations.length === 0) return;

  const matchingAutomations = automations.filter((automation) => {
    if (automation.triggerType !== 'PROPERTY_CHANGE') return false;

    const config = automation.triggerConfig as unknown as TriggerConfig;

    if (config.propertyId !== changeContext.propertyId) return false;

    if (config.to !== undefined) {
      const newValue = normalizeValue(changeContext.newValue);
      const targetValue = normalizeValue(config.to);
      if (newValue !== targetValue) return false;
    }

    if (config.from !== undefined) {
      const oldValue = normalizeValue(changeContext.oldValue);
      const fromValue = normalizeValue(config.from);
      if (oldValue !== fromValue) return false;
    }

    return true;
  });

  for (const automation of matchingAutomations) {
    if (automation.actionType === 'UPDATE_PROPERTY') {
      await executeUpdatePropertyAction(
        rowId,
        automation.actionConfig as unknown as ActionConfig
      );
    }
  }
}

async function executeUpdatePropertyAction(
  rowId: string,
  config: ActionConfig
) {
  const property = await db.property.findUnique({
    where: { id: config.propertyId },
  });

  if (!property) return;

  let valueToSet = config.value;

  if (
    (valueToSet === 'today' || valueToSet === 'now') &&
    property.type === 'DATE'
  ) {
    valueToSet = new Date().toISOString();
  }

  await updateCellDirectly(config.propertyId, rowId, valueToSet);
}

async function updateCellDirectly(
  propertyId: string,
  rowId: string,
  value: unknown
) {
  await db.cell.upsert({
    where: {
      propertyId_rowId: {
        propertyId,
        rowId,
      },
    },
    update: { value: value as Prisma.InputJsonValue },
    create: {
      propertyId,
      rowId,
      value: value as Prisma.InputJsonValue,
    },
  });
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return String((value as { value: unknown }).value);
  }
  return String(value);
}
