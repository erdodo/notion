import { Skeleton } from "@/components/ui/skeleton";

export const PageSkeleton = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Cover Image Skeleton */}
      <Skeleton className="h-[35vh] w-full" />
      
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* Icon Skeleton */}
        <div className="pt-4 pl-8 flex items-center gap-x-2">
          <Skeleton className="h-16 w-16 rounded-md" />
        </div>

        {/* Title Skeleton */}
        <div className="pl-8 pt-4">
          <Skeleton className="h-12 w-full" />
        </div>

        {/* Toolbar Skeleton */}
        <div className="pl-8 pt-4 flex items-center gap-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Editor Content Skeleton */}
        <div className="pl-8 pr-8 pt-8 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
};
