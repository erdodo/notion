import { Property } from '@prisma/client';
import { useEffect, useRef } from 'react';

import { useDatabase } from './use-database';
import { useDebounce } from './use-debounce';

import { updateDatabaseView } from '@/actions/database-view';

export function useViewPersistence(properties: Property[]) {
  const {
    currentViewId,
    filters,
    sorts,
    groupByProperty,
    visibleProperties,
    boardGroupByProperty,
  } = useDatabase();

  const isFirstRun = useRef(true);

  const propertiesReference = useRef(properties);
  useEffect(() => {
    propertiesReference.current = properties;
  }, [properties]);

  const config = useDebounce(
    {
      filters,
      sorts,
      groupByProperty,
      visibleProperties,
      boardGroupByProperty,
    },
    1000
  );

  const previousStateJson = useRef<string>('');

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;

      previousStateJson.current = JSON.stringify(config);
      return;
    }

    if (!currentViewId) return;

    const configJson = JSON.stringify(config);
    if (configJson === previousStateJson.current) return;

    const save = async () => {
      try {
        previousStateJson.current = configJson;

        const hiddenProperties = propertiesReference.current
          .filter((p) => !config.visibleProperties.includes(p.id))
          .map((p) => p.id);

        await updateDatabaseView(currentViewId, {
          filter: config.filters as never,
          sort: config.sorts as never,
          group: (config.groupByProperty
            ? { propertyId: config.groupByProperty }
            : config.boardGroupByProperty
              ? { propertyId: config.boardGroupByProperty }
              : null) as never,
          hiddenProperties: hiddenProperties as string[],
        });
      } catch (error) {
        console.error('Failed to save view config', error);
      }
    };

    save();
  }, [config, currentViewId]);
}
