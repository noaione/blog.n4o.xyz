import Skeleton from './Skeleton';

export default function SpotifyHubSkeleton() {
  return (
    <div className="flex flex-col items-center md:flex-row md:items-start gap-4">
      <div className="relative">
        <Skeleton className="skeleton-loader !w-96 !h-96 block !shadow-lg ring-4 ring-offset-green-500 ring-green-500" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="skeleton-wrap">
          <Skeleton className="h-8 md:h-9 lg:h-10 mx-auto md:mx-0 block" />
        </div>
        <div className="skeleton-wrap">
          <Skeleton className="h-5 md:h-7 !w-4/5 mx-auto md:mx-0 block" />
        </div>
        <div className="skeleton-wrap">
          <Skeleton className="h-4 md:h-5 !w-3/5 mx-auto md:mx-0 block" />
        </div>
      </div>
    </div>
  );
}
