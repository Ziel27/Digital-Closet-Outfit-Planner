import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';

export const OutfitSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted grid grid-cols-2 gap-1 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-full rounded" />
        ))}
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export const OutfitSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <OutfitSkeleton key={i} />
      ))}
    </div>
  );
};

