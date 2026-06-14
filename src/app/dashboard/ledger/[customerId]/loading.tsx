import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CustomerLedgerLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-28 sm:pb-16">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Customer Profile Box Skeleton */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-36 sm:w-48" />
                <div className="flex gap-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </div>
            </div>
            
            {/* Quick Actions Shortcuts Skeleton */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-11 flex-1 sm:w-24 rounded-xl" />
              <Skeleton className="h-11 flex-1 sm:w-32 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards Skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl">
              <CardHeader className="pb-1 pt-3 px-3">
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <Skeleton className="h-6 w-14 sm:w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline Log Book Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-44" />
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Table Header (Desktop) */}
            <div className="hidden sm:grid grid-cols-[1fr_120px_120px_130px_50px] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-850/30">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-16 ml-auto" />
              <Skeleton className="h-3.5 w-16 ml-auto" />
              <Skeleton className="h-3.5 w-16 ml-auto" />
              <div />
            </div>

            {/* List entries */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_120px_130px_50px] gap-3 sm:gap-4 px-5 py-4 items-center">
                  <div className="space-y-2 min-w-0">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4.5 w-44 sm:w-64" />
                    <Skeleton className="h-3.5 w-10 sm:hidden rounded-full" />
                  </div>
                  <Skeleton className="h-4.5 w-16 sm:hidden ml-auto" />
                  
                  {/* Desktop columns placeholder */}
                  <Skeleton className="hidden sm:block h-4.5 w-16 ml-auto" />
                  <Skeleton className="hidden sm:block h-4.5 w-16 ml-auto" />
                  <Skeleton className="hidden sm:block h-4.5 w-16 ml-auto font-black" />
                  <Skeleton className="w-8 h-8 rounded-lg ml-auto" />
                </div>
              ))}
            </div>
          </Card>
        </div>

      </main>

      {/* Sticky footer skeleton buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 flex gap-3 z-30 shadow-2xl">
        <Skeleton className="h-14 flex-1 rounded-xl" />
        <Skeleton className="h-14 flex-1 rounded-xl" />
      </div>
    </div>
  )
}
