import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Zap, Calendar, Sparkles, TrendingUp, BarChart3,
  Check, ArrowRight, Video, MessageCircle, Globe,
  Brain, Flame, Star, ChevronRight
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

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-gradient">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-[#1e2a3a]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-display)] gradient-text">LazyPost</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-[#8a9bb0] hover:text-[#f0f4f8] transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-[#8a9bb0] hover:text-[#f0f4f8] transition-colors">Pricing</Link>
              <Link href="#testimonials" className="text-sm text-[#8a9bb0] hover:text-[#f0f4f8] transition-colors">Reviews</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="default" className="mb-6 text-xs">
            <Flame className="w-3 h-3 mr-1" /> Powered by open-source AI · Llama 3.3 + Replicate
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-[family-name:var(--font-display)]">
            Post less.{' '}
            <span className="gradient-text">Grow more.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#8a9bb0] max-w-2xl mx-auto mb-10 leading-relaxed">
            LazyPost schedules, generates, and auto-posts viral Twitter content for you.
            Stay visible without being glued to your phone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" className="w-full sm:w-auto glow-accent">
                Start for free — no card needed
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                See how it works
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">
            7-day free trial on paid plans · No credit card for Free tier
          </p>
        </div>

        {/* Stats */}
        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Posts scheduled', value: '2.4M+' },
            { label: 'Avg. follower growth', value: '+340%' },
            { label: 'Active creators', value: '12K+' },
            { label: 'Viral posts generated', value: '89K+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl border border-[#1e2a3a] bg-[#0d1117]/50">
              <div className="text-2xl sm:text-3xl font-bold gradient-text font-[family-name:var(--font-display)]">{stat.value}</div>
              <div className="text-xs text-[#8a9bb0] mt-1 font-[family-name:var(--font-mono)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-[family-name:var(--font-mono)] text-indigo-400 uppercase tracking-widest">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)]">
              Everything you need to{' '}
              <span className="gradient-text">dominate Twitter</span>
            </h2>
            <p className="mt-4 text-[#8a9bb0] max-w-2xl mx-auto">
              From smart scheduling to viral video generation — LazyPost covers every angle of your Twitter growth strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <Card key={feature.title} className="p-5 md:p-6 card-hover relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 group-hover:from-indigo-600/3 transition-all duration-300 pointer-events-none rounded-2xl" />
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[#f0f4f8] font-[family-name:var(--font-display)]">{feature.title}</h3>
                  {feature.badge && (
                    <Badge variant="agency" className="text-[10px] shrink-0">{feature.badge}</Badge>
                  )}
                </div>
                <p className="text-sm text-[#8a9bb0] leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-[#1e2a3a]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-[family-name:var(--font-mono)] text-indigo-400 uppercase tracking-widest">How It Works</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">Set it up in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {[
              { step: '01', icon: Globe, title: 'Connect your X account', description: 'Securely link your Twitter/X account with OAuth. We never store passwords.' },
              { step: '02', icon: Sparkles, title: 'Generate or compose', description: 'Use AI to generate post ideas or write your own. Schedule for the best time.' },
              { step: '03', icon: TrendingUp, title: 'Watch your numbers grow', description: 'LazyPost handles posting, engagement, and analytics while you focus on other things.' },
            ].map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                {i < 2 && <ChevronRight className="hidden md:block absolute -right-3 top-8 w-6 h-6 text-[#1e2a3a]" />}
                <div className="w-16 h-16 rounded-2xl bg-[#13181f] border border-[#1e2a3a] flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <span className="text-xs font-[family-name:var(--font-mono)] text-indigo-400 mb-2">{step.step}</span>
                <h3 className="font-semibold text-[#f0f4f8] mb-2 font-[family-name:var(--font-display)]">{step.title}</h3>
                <p className="text-sm text-[#8a9bb0]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-[family-name:var(--font-mono)] text-indigo-400 uppercase tracking-widest">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)]">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-[#8a9bb0]">Pay in USD or ZWG (Zimbabwe Gold). Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 md:p-6 flex flex-col card-hover ${
                  plan.highlight
                    ? 'border-indigo-500/60 bg-[#0d1117] glow-accent'
                    : 'border-[#1e2a3a] bg-[#0d1117]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant={plan.highlight ? 'default' : 'warning'} className="text-[10px]">{plan.badge}</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold font-[family-name:var(--font-display)]">{plan.name}</h3>
                  <p className="text-xs text-[#8a9bb0] mt-0.5">{plan.description}</p>
                </div>
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-[family-name:var(--font-display)]">
                      {plan.priceUsd === 0 ? 'Free' : `$${plan.priceUsd}`}
                    </span>
                    {plan.priceUsd > 0 && <span className="text-[#8a9bb0] text-sm">/mo</span>}
                  </div>
                  {plan.priceZwg > 0 && (
                    <p className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)] mt-0.5">
                      ZWG {plan.priceZwg.toLocaleString()}/mo
                    </p>
                  )}
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-[#8a9bb0]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${plan.id}`}>
                  <Button variant={plan.highlight ? 'default' : 'outline'} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#4a5568] font-[family-name:var(--font-mono)] mt-8">
            All plans include SSL encryption · GDPR compliant · Payments via Stripe or PayNow Zimbabwe
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#1e2a3a]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-[family-name:var(--font-mono)] text-indigo-400 uppercase tracking-widest">Reviews</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">Creators love LazyPost</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <Card key={t.handle} className="p-5 md:p-6 card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">{t.handle}</div>
                  </div>
                  <Badge variant="default" className="ml-auto text-[10px]">{t.plan}</Badge>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#8a9bb0] leading-relaxed">{t.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl border border-indigo-500/30 bg-[#0d1117] p-10 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent pointer-events-none" />
            <div className="relative">
              <Zap className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-[family-name:var(--font-display)]">
                Ready to grow on autopilot?
              </h2>
              <p className="text-[#8a9bb0] mb-8 text-base sm:text-lg">
                Join thousands of creators using LazyPost to build their audience while focusing on their work.
              </p>
              <Link href="/signup">
                <Button size="xl" className="glow-accent">
                  Create your free account <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2a3a]/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold font-[family-name:var(--font-display)] gradient-text">LazyPost</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {['Privacy', 'Terms', 'Support'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-xs text-[#4a5568] hover:text-[#8a9bb0] transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#4a5568] font-[family-name:var(--font-mono)]">© 2026 LazyPost</p>
        </div>
      </footer>
    </div>
  )
}
