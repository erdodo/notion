
import { useEffect, useRef } from 'react'
import { useDatabase } from './use-database'
import { updateDatabaseView } from '@/actions/database-view'
import { useDebounce } from './use-debounce'
import { Property } from '@prisma/client'

export function useViewPersistence(properties: Property[]) {
    const {
        currentViewId,
        filters,
        sorts,
        groupByProperty,
        visibleProperties,
        boardGroupByProperty,
    } = useDatabase()

    const isFirstRun = useRef(true)

    // Use ref for properties to access current value in effect without triggering it
    const propertiesRef = useRef(properties)
    useEffect(() => {
        propertiesRef.current = properties
    }, [properties])

    // Debounce the config to avoid too many requests
    const config = useDebounce({
        filters,
        sorts,
        groupByProperty,
        visibleProperties,
        boardGroupByProperty
    }, 1000)

    const prevStateJson = useRef<string>("")

    useEffect(() => {
        // Skip first run to avoid overwriting server state with initial default state
        if (isFirstRun.current) {
            isFirstRun.current = false
            // Initialize prev state with current config to allow comparison
            prevStateJson.current = JSON.stringify(config)
            return
        }

        if (!currentViewId) return

        const configJson = JSON.stringify(config)
        if (configJson === prevStateJson.current) return

        const save = async () => {
            try {
                // Update prev state immediately to prevent double saves
                prevStateJson.current = configJson

                // Map store state to DatabaseView model fields
                // ...

                // Calculate hidden properties
                // hidden = all - visible
                // If visibleProperties is empty, maybe we mean ALL hidden? Or store has default "all visible"?
                // Notion default: new props are visible?
                // Let's assume visibleProperties contains IDs of visible.

                const hiddenProperties = propertiesRef.current
                    .filter(p => !config.visibleProperties.includes(p.id))
                    .map(p => p.id)

                await updateDatabaseView(currentViewId, {
                    filter: config.filters as any,
                    sort: config.sorts as any,
                    group: config.groupByProperty ? { propertyId: config.groupByProperty } : (
                        config.boardGroupByProperty ? { propertyId: config.boardGroupByProperty } : null
                    ),
                    hiddenProperties: hiddenProperties as any,
                })
            } catch (error) {
                console.error("Failed to save view config", error)
            }
        }

        save()
    }, [config, currentViewId])
}
