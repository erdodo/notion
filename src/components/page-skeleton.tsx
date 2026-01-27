import { Skeleton } from '@/components/ui/skeleton';

export const PageSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col max-w-4xl mx-auto px-12 pt-12">
        {}
        <div className="space-y-4 mb-8">
          {}
          <Skeleton className="h-16 w-16 rounded-md group" />
          {}
          <Skeleton className="h-12 w-3/4 font-bold" />
        </div>

        {}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        {}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
      </div>
    </div>
  );
};
