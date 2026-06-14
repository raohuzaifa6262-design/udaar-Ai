'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ArrowRight, BookOpen, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Khushamdeed! 🎉 Ledger khulja!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Network error. Check your connection.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-brand-mesh px-4 py-10 transition-colors duration-300">

      {/* ── Dot grid pattern overlay ── */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-60 dark:opacity-30" />

      {/* ── Ambient glow orbs ── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/8 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-7">

        {/* ── Logo Mark ── */}
        <div className="flex flex-col items-center text-center space-y-3 animate-float-up">
          {/* Icon container */}
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl glow-emerald animate-brand-pulse">
              <BookOpen className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
            </div>
            {/* AI badge */}
            <span className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </div>

          {/* Wordmark */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Udhaar<span className="text-primary">AI</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-medium">
              آپ کا ڈیجیٹل حساب کتاب —{' '}
              <span className="text-primary font-semibold">مفت اور محفوظ</span>
            </p>
          </div>
        </div>

        {/* ── Login Card ── */}
        <Card className="glass border border-border/60 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md">
          <CardHeader className="pt-6 pb-5 text-center border-b border-border/40 space-y-1">
            <CardTitle className="text-xl font-bold text-foreground">
              Login / لاگ ان
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your email and password to open your ledger.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 pt-6">

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                >
                  Email / ای میل
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="shopkeeper@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 text-base bg-background/60 border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Password / پاس ورڈ
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Bhool gaye? / Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base bg-background/60 border-border focus-visible:ring-primary focus-visible:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-target"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-7 pt-2 px-6">
              {/* Primary CTA */}
              <Button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-base shadow-lg glow-emerald transition-all duration-200 group"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing in...</>
                ) : (
                  <>
                    Khaata Kholein / کھاتہ کھولیں
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Account nahi hai?{' '}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  Banayein — It&apos;s Free!
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* ── Trust strip ── */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground font-medium">
          <span>🔒 Safe & Secure</span>
          <span>📱 Mobile-First</span>
          <span>✅ Free Forever</span>
        </div>

      </div>
    </div>
  )
}
