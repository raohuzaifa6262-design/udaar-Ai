import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-12">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg bg-emerald-500/20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Top Greeting Card Skeleton */}
        <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden relative">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-64 sm:w-80" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-12 w-36 rounded-2xl" />
              <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>
          </div>
        </Card>

        {/* 4 Stats Cards Skeleton Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <CardHeader className="pb-1 pt-4 px-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-1">
                <Skeleton className="h-8 w-24 sm:w-28" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Recent Transactions List Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 sm:w-36" />
                      <Skeleton className="h-3 w-16 sm:w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-2 w-10 ml-auto" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </main>
    </div>
  )
}
