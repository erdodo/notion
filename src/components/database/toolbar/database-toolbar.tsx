import { Database, Property, DatabaseView } from '@prisma/client';
import {
  Search,
  Maximize2,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { FilterPopover } from './filter-popover';
import { SortPopover } from './sort-popover';
import { ViewSettingsMenu } from './view-settings-menu';
import { ViewSwitcher } from './view-switcher';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDatabase } from '@/hooks/use-database';

interface DatabaseToolbarProperties {
  database: Database & { properties: Property[]; views?: DatabaseView[] };
}

export function DatabaseToolbar({ database }: DatabaseToolbarProperties) {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    sorts,
    removeFilter,
    removeSort,
  } = useDatabase();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullPage, setIsFullPage] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {}
      <div className="flex items-center justify-between px-2 py-2 border-b gap-4">
        <div className="flex items-center gap-2">
          {}
          <ViewSwitcher database={database} />
        </div>

        {}
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <>
              <FilterPopover properties={database.properties} />
              <SortPopover properties={database.properties} />

              {}
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="end">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Search
                    </div>
                    <Input
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      className="h-8"
                      autoFocus
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs w-full"
                        onClick={() => {
                          setSearchQuery('');
                        }}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Automations"
                onClick={() => toast.info('Automations coming soon!')}
              >
                <Zap className="h-4 w-4" />
              </Button>

              {}
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 ${isFullPage ? 'text-primary' : ''}`}
                title={isFullPage ? 'Exit full page' : 'Full page'}
                onClick={() => {
                  setIsFullPage(!isFullPage);
                  toast.info(
                    isFullPage
                      ? 'Exited full page mode'
                      : 'Entered full page mode'
                  );
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </>
          )}

          {}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title={isCollapsed ? 'Show toolbar' : 'Hide toolbar'}
            onClick={() => {
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <ViewSettingsMenu
            databaseId={database.id}
            views={database.views || []}
            database={database}
          />

          <Button
            size="sm"
            className="h-7 text-xs bg-[#2383e2] hover:bg-[#1d70c2] text-white ml-2 border-none px-3"
            onClick={() => {
              const event = new CustomEvent('database-add-row');
              globalThis.dispatchEvent(event);
            }}
          >
            New
          </Button>
        </div>
      </div>

      {}
      {(filters.length > 0 || sorts.length > 0) && (
        <div className="flex items-center gap-2 px-2 pb-2">
          {filters.map((filter, index) => {
            const property = database.properties.find(
              (p) => p.id === filter.propertyId
            );
            return (
              <Badge
                key={index}
                variant="secondary"
                className="gap-1 pr-1 text-xs h-6"
              >
                <span className="font-normal">
                  {property?.name}: {String(filter.value || filter.operator)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    removeFilter(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}

          {sorts.map((sort, index) => {
            const property = database.properties.find(
              (p) => p.id === sort.propertyId
            );
            return (
              <Badge
                key={index}
                variant="secondary"
                className="gap-1 pr-1 text-xs h-6"
              >
                <span className="font-normal">
                  {property?.name}: {sort.direction === 'asc' ? '↑' : '↓'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    removeSort(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
