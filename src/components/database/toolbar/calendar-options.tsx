'use client';
import { Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function CalendarOptions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Options
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Calendar Options</h4>
          <p className="text-sm text-muted-foreground">
            Configure calendar settings.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
