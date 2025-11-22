import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';

export const ClothingSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ClothingSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ClothingSkeleton key={i} />
      ))}
    </div>
  );
};

