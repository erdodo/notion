import { db } from "@/lib/db";
import { updateCell } from "@/app/(main)/_actions/database";
import { PropertyType, Property } from "@prisma/client";

type AutomationTriggerType = "PROPERTY_CHANGE";
type AutomationActionType = "UPDATE_PROPERTY";

interface TriggerConfig {
    propertyId: string;
    to?: string; // Value to match (e.g., "Done")
    from?: string; // Previous value (optional, for specific transitions)
}

interface ActionConfig {
    propertyId: string;
    value: any; // Value to set (e.g., "today", "now", or specific value)
}

export async function checkAndRunAutomations(
    databaseId: string,
    rowId: string,
    changeContext: {
        propertyId: string;
        newValue: any;
        oldValue?: any;
    }
) {
    // 1. Fetch automations for this database
    const automations = await db.databaseAutomation.findMany({
        where: { databaseId },
    });

    if (automations.length === 0) return;

    // 2. Filter matching triggers
    const matchingAutomations = automations.filter((automation) => {
        if (automation.triggerType !== "PROPERTY_CHANGE") return false;

        const config = automation.triggerConfig as unknown as TriggerConfig;

        // Check if the changed property matches the trigger property
        if (config.propertyId !== changeContext.propertyId) return false;

        // Check 'to' value match
        if (config.to !== undefined) {
            const newValue = normalizeValue(changeContext.newValue);
            const targetValue = normalizeValue(config.to);
            if (newValue !== targetValue) return false;
        }

        // Check 'from' value match (if configured)
        if (config.from !== undefined) {
            const oldValue = normalizeValue(changeContext.oldValue);
            const fromValue = normalizeValue(config.from);
            if (oldValue !== fromValue) return false;
        }

        return true;
    });

    // 3. Execute actions
    for (const automation of matchingAutomations) {
        if (automation.actionType === "UPDATE_PROPERTY") {
            await executeUpdatePropertyAction(rowId, automation.actionConfig as unknown as ActionConfig);
        }
    }
}

async function executeUpdatePropertyAction(rowId: string, config: ActionConfig) {
    // Fetch property to know its type (basic validation/handling)
    const property = await db.property.findUnique({
        where: { id: config.propertyId }
    });

    if (!property) return;

    let valueToSet = config.value;

    // Handle dynamic values like "today"
    if (valueToSet === "today" || valueToSet === "now") {
        if (property.type === "DATE") {
            valueToSet = new Date().toISOString();
        }
    }

    // For Select properties, we might receive the ID or the Name. 
    // updateCell generally expects the format needed for that cell type.
    // Assuming 'updateCell' handles bare values or we format them here.
    // For MVP, passing the value directly.

    // We need to find the cellId to call updateCell, OR we use a helper that finds it.
    // database.ts has updateCell(cellId, ...) and updateCellByPosition(propId, rowId, ...)
    // logic is in database.ts which is a server action. 
    // We should import updateCellByPosition from database actions if possible, 
    // OR standard database calls. 
    // Since this service runs on server, we can call db directly or reuse actions.
    // Using updateCellByPosition is safer as it handles upsert.

    // However, importing server actions here might cause circular deps if database.ts imports this service.
    // Ideally this service should be called BY database.ts, but valid to call logic back?
    // Circular dependency: database.ts -> automation-service.ts -> database.ts
    // Solution: Duplicate update logic or move core update logic to a shared lib, or just use db primitive here.
    // I will use db primitive here to avoid circular dep.

    await updateCellDirectly(config.propertyId, rowId, valueToSet);
}

// Helper to avoid circular dependency with server actions
async function updateCellDirectly(propertyId: string, rowId: string, value: any) {
    // Basic Cell Update Logic from database.ts
    // We can assume the cell exists or upsert it.

    // Wrap primitive values if needed based on property type? 
    // Notion clone usually stores { value: ... } or raw?
    // Looking at database.ts: updateCellByPosition uses `data: { value }`.
    // And `value` is passed as `any`.

    // Check specific types handling
    // Date: { date: ..., includeTime: ... } usually? Or just ISO string?
    // If simplistic:

    await db.cell.upsert({
        where: {
            propertyId_rowId: {
                propertyId,
                rowId
            }
        },
        update: { value },
        create: {
            propertyId,
            rowId,
            value
        }
    });
}

function normalizeValue(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "object" && val.value) return String(val.value); // Handle { value: "..." } wrappers
    return String(val);
}
