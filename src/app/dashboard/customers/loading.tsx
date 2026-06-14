import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CustomersLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-12">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Title and stats */}
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Search Component Skeleton */}
        <div className="relative">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Customer Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 rounded-2xl h-44 flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              
              {/* Bottom footer badge */}
              <div className="h-10 bg-slate-50/50 dark:bg-slate-900/30 px-5 flex items-center justify-between border-t border-slate-50 dark:border-slate-850/20">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

      </main>
    </div>
  )
}
