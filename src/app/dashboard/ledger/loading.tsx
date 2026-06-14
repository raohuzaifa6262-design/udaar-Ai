import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LedgerLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-12">
      {/* Header Skeleton */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Title and stats */}
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64 sm:w-80" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* 3 Stats Summary Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4">
              <Skeleton className="h-3.5 w-24" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
          <Card className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4">
              <Skeleton className="h-3.5 w-24" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
          <Card className="col-span-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl">
            <CardHeader className="pb-1 pt-4 px-4">
              <Skeleton className="h-3.5 w-36" />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summaries Header and Grid Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-12 ml-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Logs Feed Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />

          {/* Grouped Month accordions */}
          {[1, 2].map((m) => (
            <div key={m} className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              {/* Accordion header */}
              <div className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/50 dark:bg-slate-850/30 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Accordion item rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[1, 2, 3].map((r) => (
                  <div key={r} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-2 w-8 ml-auto" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
