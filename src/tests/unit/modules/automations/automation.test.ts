import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkAndRunAutomations } from '@/lib/automation-service'

// Mock DB
const { mockDb } = vi.hoisted(() => {
    return {
        mockDb: {
            databaseAutomation: {
                findMany: vi.fn(),
            },
            property: {
                findUnique: vi.fn(),
            },
            cell: {
                upsert: vi.fn(),
            }
        }
    }
})

vi.mock('@/lib/db', () => ({
    db: mockDb
}))

vi.mock('@/app/(main)/_actions/database', () => ({
    updateCell: vi.fn()
}))

describe('Automation Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('runs action when trigger matches', async () => {
        // Setup automation config
        const automation = {
            id: 'auto-1',
            triggerType: 'PROPERTY_CHANGE',
            triggerConfig: { propertyId: 'prop-1', to: 'Done' },
            actionType: 'UPDATE_PROPERTY',
            actionConfig: { propertyId: 'prop-2', value: 'Completed' },
            databaseId: 'db-1'
        }

        mockDb.databaseAutomation.findMany.mockResolvedValue([automation] as any)
        mockDb.property.findUnique.mockResolvedValue({ id: 'prop-2', type: 'TEXT' } as any)

        // Trigger change
        await checkAndRunAutomations('db-1', 'row-1', {
            propertyId: 'prop-1',
            newValue: 'Done',
            oldValue: 'In Progress'
        })

        // Check verification
        expect(mockDb.cell.upsert).toHaveBeenCalledWith({
            where: { propertyId_rowId: { propertyId: 'prop-2', rowId: 'row-1' } },
            update: { value: 'Completed' },
            create: { propertyId: 'prop-2', rowId: 'row-1', value: 'Completed' }
        })
    })

    it('ignores when values do not match trigger', async () => {
        const automation = {
            id: 'auto-1',
            triggerType: 'PROPERTY_CHANGE',
            triggerConfig: { propertyId: 'prop-1', to: 'Done' },
            databaseId: 'db-1'
        }
        mockDb.databaseAutomation.findMany.mockResolvedValue([automation] as any)

        await checkAndRunAutomations('db-1', 'row-1', {
            propertyId: 'prop-1',
            newValue: 'Pending' // Mismatch
        })

        expect(mockDb.cell.upsert).not.toHaveBeenCalled()
    })
})
