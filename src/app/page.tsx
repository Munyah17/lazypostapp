import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Zap, Calendar, Sparkles, TrendingUp, BarChart3,
  Check, ArrowRight, Video, MessageCircle, Globe,
  Brain, Flame, Star, ChevronRight,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    description: 'Queue posts for the perfect time. Visual calendar view, timezone support, and bulk scheduling.',
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
  },
  {
    icon: Brain,
    title: 'AI Content Generator',
    description: 'Powered by Llama 3.3 (open-source). Generate tweets, threads, and captions in your voice.',
    color: 'text-violet-400',
    bg: 'bg-violet-900/20',
  },
  {
    icon: Flame,
    title: 'Viral Post Optimizer',
    description: 'AI analyzes your content for viral potential. Score, strengthen, and time your posts to trend.',
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
  },
  {
    icon: Video,
    title: 'Viral Video Generator',
    description: 'Generate short-form videos using open-source AI. Post directly to X — never stored on our servers.',
    color: 'text-pink-400',
    bg: 'bg-pink-900/20',
    badge: 'Agency',
  },
  {
    icon: MessageCircle,
    title: 'Auto Engagement',
    description: 'Intelligently like, retweet, and reply to followers. Stay present without being present.',
    color: 'text-green-400',
    bg: 'bg-green-900/20',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track follower growth, impressions, engagement rates, and your best-performing content.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20',
  },
]

const plans = [
  {
    id: 'free',
    name: 'Free',
    priceUsd: 0,
    priceZwg: 0,
    description: 'Get a feel for LazyPost',
    features: ['5 posts per month', 'Manual posting', 'Basic dashboard', '1 Twitter account'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    priceUsd: 9,
    priceZwg: 324,
    description: 'For creators getting serious',
    features: ['50 posts per month', 'Post scheduling', 'AI content hints (10/mo)', 'Basic analytics', '7-day free trial'],
    cta: 'Start Trial',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 29,
    priceZwg: 1044,
    description: 'For power users & influencers',
    features: [
      'Unlimited posts',
      'Full AI generation',
      'Viral post optimizer',
      'Auto-engagement',
      'Advanced analytics',
      '3 Twitter accounts',
    ],
    cta: 'Go Pro',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'agency',
    name: 'Agency',
    priceUsd: 99,
    priceZwg: 3564,
    description: 'For agencies & power brands',
    features: [
      'Everything in Pro',
      '10 Twitter accounts',
      '5 team members',
      'Viral video generation',
      'Enterprise analytics',
      'Priority support',
    ],
    cta: 'Go Agency',
    highlight: false,
    badge: 'Best Value',
  },
]

const testimonials = [
  {
    name: 'Rudo M.',
    handle: '@rudotweets',
    avatar: 'RM',
    text: 'Went from 2k to 18k followers in 3 months. The AI generator actually sounds like me — not generic at all.',
    plan: 'Pro',
  },
  {
    name: 'Takudzwa F.',
    handle: '@takutech',
    avatar: 'TF',
    text: 'As an agency, managing 8 client accounts used to be a nightmare. LazyPost makes it feel effortless.',
    plan: 'Agency',
  },
  {
    name: 'Simba K.',
    handle: '@simbabuilds',
    avatar: 'SK',
    text: 'The viral score feature is insane. It told me my post would blow up — it got 500K impressions.',
    plan: 'Pro',
  },
]

const STATS = [
  { value: '2.4M+', label: 'Posts scheduled' },
  { value: '+340%', label: 'Avg. follower growth' },
  { value: '12K+',  label: 'Active creators' },
  { value: '89K+',  label: 'Viral posts generated' },
]

const STEPS = [
  {
    step: '01',
    icon: Globe,
    title: 'Connect your X account',
    description: 'Securely link your Twitter/X account with OAuth. We never store your password.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Generate or compose',
    description: 'Use AI to generate post ideas, or write your own and schedule for the best time.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Watch your numbers grow',
    description: 'LazyPost handles posting, engagement, and analytics while you focus on other things.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-gradient">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 glass border-b border-[#1e2a3a]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-display gradient-text">LazyPost</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {['#features', '#pricing', '#testimonials'].map((href, i) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-[#8a9bb0] hover:text-[#f0f4f8] transition-colors duration-150"
                >
                  {['Features', 'Pricing', 'Reviews'][i]}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="inline-flex mb-8">
            <Badge variant="default" className="gap-1.5 px-3 py-1 text-xs">
              <Flame className="w-3 h-3" />
              Powered by open-source AI · Llama 3.3 + Replicate
            </Badge>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1.1] mb-6">
            Post less.{' '}
            <span className="gradient-text">Grow more.</span>
          </h1>

          <p className="font-body text-base sm:text-lg md:text-xl text-[#8a9bb0] max-w-2xl mx-auto mb-10 leading-relaxed">
            LazyPost schedules, generates, and auto-posts viral Twitter content for you.
            Stay visible without being glued to your phone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="xl" className="w-full sm:w-auto glow-accent">
                Start for free — no card needed
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                See how it works
              </Button>
            </Link>
          </div>

          <p className="mt-5 font-mono text-xs text-[#4a5568]">
            7-day free trial on paid plans · No credit card required for Free tier
          </p>
        </div>

        {/* Stats */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center py-5 px-3 rounded-2xl border border-[#1e2a3a] bg-[#0d1117]/70 backdrop-blur-sm"
              >
                <div className="font-display text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="font-mono text-[11px] text-[#8a9bb0] mt-1.5 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <p className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
              Everything you need to{' '}
              <span className="gradient-text">dominate Twitter</span>
            </h2>
            <p className="mt-4 text-[#8a9bb0] max-w-xl mx-auto text-base leading-relaxed">
              From smart scheduling to viral video generation — LazyPost covers every angle of your growth strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f) => (
              <Card
                key={f.title}
                className="relative p-5 sm:p-6 card-hover overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 group-hover:from-indigo-600/[0.03] transition-all duration-300 rounded-2xl pointer-events-none" />
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display font-semibold text-[#f0f4f8]">{f.title}</h3>
                  {f.badge && (
                    <Badge variant="agency" className="text-[10px] shrink-0">{f.badge}</Badge>
                  )}
                </div>
                <p className="font-body text-sm text-[#8a9bb0] leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-[#1e2a3a]/40">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <p className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Set it up in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-7 w-6 h-6 text-[#1e2a3a]" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-[#13181f] border border-[#1e2a3a] flex items-center justify-center mb-4 shadow-lg">
                  <s.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <p className="font-mono text-xs text-indigo-400 mb-2">{s.step}</p>
                <h3 className="font-display font-semibold text-[#f0f4f8] mb-2">{s.title}</h3>
                <p className="font-body text-sm text-[#8a9bb0] leading-relaxed max-w-[220px] mx-auto">{s.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">
            <p className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-[#8a9bb0] text-base">
              Pay in USD or ZWG (Zimbabwe Gold). Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 sm:p-6 flex flex-col card-hover ${
                  plan.highlight
                    ? 'border-indigo-500/60 bg-[#0d1117] glow-accent'
                    : 'border-[#1e2a3a] bg-[#0d1117]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge
                      variant={plan.highlight ? 'default' : 'warning'}
                      className="text-[10px] whitespace-nowrap shadow"
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="mb-4 mt-1">
                  <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                  <p className="font-body text-xs text-[#8a9bb0] mt-0.5">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold">
                      {plan.priceUsd === 0 ? 'Free' : `$${plan.priceUsd}`}
                    </span>
                    {plan.priceUsd > 0 && (
                      <span className="font-body text-sm text-[#8a9bb0]">/mo</span>
                    )}
                  </div>
                  {plan.priceZwg > 0 && (
                    <p className="font-mono text-xs text-[#4a5568] mt-1">
                      ZWG {plan.priceZwg.toLocaleString()}/mo
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="font-body text-[#8a9bb0]">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/signup?plan=${plan.id}`}>
                  <Button
                    variant={plan.highlight ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center font-mono text-xs text-[#4a5568] mt-8">
            All plans include SSL encryption · GDPR compliant · Payments via Stripe or PayNow Zimbabwe
          </p>

        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#1e2a3a]/40">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <p className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Creators love LazyPost</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t) => (
              <Card key={t.handle} className="p-5 sm:p-6 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-white text-xs font-bold font-display shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="font-body text-sm font-semibold truncate">{t.name}</div>
                    <div className="font-mono text-xs text-[#4a5568] truncate">{t.handle}</div>
                  </div>
                  <Badge variant="default" className="ml-auto text-[10px] shrink-0">{t.plan}</Badge>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[0,1,2,3,4].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-body text-sm text-[#8a9bb0] leading-relaxed">{t.text}</p>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border border-indigo-500/30 bg-[#0d1117] p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-indigo-900/5 pointer-events-none" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Ready to grow on autopilot?
              </h2>
              <p className="font-body text-[#8a9bb0] mb-8 text-base sm:text-lg max-w-md mx-auto">
                Join thousands of creators using LazyPost to build their audience while focusing on their work.
              </p>
              <Link href="/signup">
                <Button size="xl" className="glow-accent">
                  Create your free account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e2a3a]/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold gradient-text">LazyPost</span>
          </div>

          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Support'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="font-body text-xs text-[#4a5568] hover:text-[#8a9bb0] transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <p className="font-mono text-xs text-[#4a5568]">© 2026 LazyPost</p>

        </div>
      </footer>

    </div>
  )
}
