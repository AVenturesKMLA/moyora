import NavBar from '@/components/NavBar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <NavBar />
            <main className="container mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12 space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex space-x-4 overflow-hidden">
                        <Skeleton className="h-40 w-[300px] shrink-0 rounded-xl" />
                        <Skeleton className="h-40 w-[300px] shrink-0 rounded-xl" />
                        <Skeleton className="h-40 w-[300px] shrink-0 rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    );
}
