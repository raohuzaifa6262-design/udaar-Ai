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
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Bell,
} from 'lucide-react'

const FEATURES = [
  { icon: TrendingUp,  label: 'Smart Balance Tracking' },
  { icon: Bell,        label: 'Payment Reminders' },
  { icon: ShieldCheck, label: 'Safe & Free Forever' },
]

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]     = useState(false)

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', 'bg-red-500', 'bg-amber-400', 'bg-primary']

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success('Account bana liya! 🎉 UdhaarAI mein Khushamdeed!')
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
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/8 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-6">

        {/* ── Logo Mark ── */}
        <div className="flex flex-col items-center text-center space-y-3 animate-float-up">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl glow-emerald animate-brand-pulse">
              <BookOpen className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </div>
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

        {/* ── Feature pills ── */}
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground bg-secondary border border-border/60 rounded-full px-3 py-1"
            >
              <Icon className="w-3 h-3 text-primary" />
              {label}
            </span>
          ))}
        </div>

        {/* ── Signup Card ── */}
        <Card className="glass border border-border/60 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md">
          <CardHeader className="pt-6 pb-5 text-center border-b border-border/40 space-y-1">
            <CardTitle className="text-xl font-bold text-foreground">
              Account Banayein / اکاؤنٹ بنائیں
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Setup your shop ledger in seconds — it&apos;s free!
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4 pt-6">

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Full Name / پورا نام
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="e.g. Muhammad Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 text-base bg-background/60 border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Password / پاس ورڈ
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level
                              ? strengthColor[passwordStrength]
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-bold ${
                      passwordStrength === 1 ? 'text-red-500' :
                      passwordStrength === 2 ? 'text-amber-500' : 'text-primary'
                    }`}>
                      {strengthLabel[passwordStrength]} password
                    </p>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-7 pt-2 px-6">
              <Button
                type="submit"
                id="signup-submit-btn"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-base shadow-lg glow-emerald transition-all duration-200 group"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating account...</>
                ) : (
                  <>
                    Shuru Karein / شروع کریں
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign in
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
