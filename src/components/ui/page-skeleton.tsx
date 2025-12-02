import { Skeleton } from "@/components/ui/skeleton";

export const PageSkeleton = () => {
    return (
        <div className="p-6 space-y-6 w-full max-w-7xl mx-auto animate-pulse">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>

            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    );
};
