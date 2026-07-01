export type UserRole = 'super_admin' | 'admin' | 'user'
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
export type PostType = 'regular' | 'thread' | 'viral' | 'ai_generated' | 'viral_video'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired' | 'incomplete'
export type PaymentProvider = 'stripe' | 'paynow'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'expired'
export type BillingCycle = 'monthly' | 'yearly'

export interface Plan {
  id: string
  name: string
  description: string | null
  price_monthly_usd: number
  price_yearly_usd: number
  price_monthly_zwg: number
  price_yearly_zwg: number
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  features: string[]
  limits: PlanLimits
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface PlanLimits {
  posts_per_month: number
  twitter_accounts: number
  ai_generations: number
  team_members: number
  auto_post: boolean
  ai_generate: boolean
  viral_post: boolean
  engagement: boolean
  analytics: 'basic' | 'standard' | 'advanced' | 'enterprise'
  viral_video: boolean
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  role: UserRole
  plan_id: string
  bio: string | null
  timezone: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  paynow_poll_url: string | null
  billing_cycle: BillingCycle
  cancel_at_period_end: boolean
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface TwitterAccount {
  id: string
  user_id: string
  twitter_user_id: string
  username: string
  display_name: string | null
  profile_image_url: string | null
  access_token: string
  access_token_secret: string | null
  refresh_token: string | null
  token_expires_at: string | null
  followers_count: number
  following_count: number
  tweet_count: number
  verified: boolean
  is_active: boolean
  last_synced_at: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  twitter_account_id: string | null
  content: string
  thread_content: string[] | null
  media_urls: string[]
  hashtags: string[]
  status: PostStatus
  post_type: PostType
  scheduled_at: string | null
  published_at: string | null
  twitter_post_id: string | null
  error_message: string | null
  ai_prompt: string | null
  viral_video_prompt: string | null
  engagement_stats: PostEngagementStats
  is_viral_candidate: boolean
  created_at: string
  updated_at: string
}

export interface PostEngagementStats {
  likes: number
  retweets: number
  replies: number
  impressions: number
  bookmarks: number
}

export interface EngagementRule {
  id: string
  user_id: string
  twitter_account_id: string
  is_active: boolean
  auto_like: boolean
  auto_retweet: boolean
  auto_reply: boolean
  reply_templates: string[]
  target_keywords: string[]
  target_hashtags: string[]
  excluded_keywords: string[]
  daily_like_limit: number
  daily_retweet_limit: number
  daily_reply_limit: number
  engagement_hours: { start: number; end: number }
  created_at: string
  updated_at: string
}

export interface AnalyticsSnapshot {
  id: string
  user_id: string
  twitter_account_id: string
  snapshot_date: string
  followers_count: number
  following_count: number
  tweet_count: number
  impressions: number
  profile_visits: number
  mentions: number
  likes_received: number
  retweets_received: number
  replies_received: number
  created_at: string
}

export interface PaymentTransaction {
  id: string
  user_id: string
  plan_id: string
  amount: number
  currency: string
  payment_provider: PaymentProvider
  provider_session_id: string | null
  provider_transaction_id: string | null
  status: PaymentStatus
  billing_cycle: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface UserSettings {
  user_id: string
  auto_post_enabled: boolean
  auto_post_times: string[]
  timezone: string
  notification_email: boolean
  notification_browser: boolean
  posting_frequency: 'light' | 'moderate' | 'heavy'
  ai_tone: string
  ai_topics: string[]
  created_at: string
  updated_at: string
}

export interface ViralVideoQueue {
  id: string
  user_id: string
  post_id: string
  prompt: string
  style: string
  status: 'pending' | 'generating' | 'uploading' | 'posted' | 'failed'
  twitter_media_id: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface EngagementActivity {
  id: string
  user_id: string
  twitter_account_id: string
  action_type: 'like' | 'retweet' | 'reply'
  target_tweet_id: string | null
  target_user_id: string | null
  content: string | null
  performed_at: string
}

export interface PostAnalytics {
  id: string
  post_id: string
  user_id: string
  recorded_at: string
  likes: number
  retweets: number
  replies: number
  impressions: number
  bookmarks: number
  quote_tweets: number
  engagement_rate: number
}

export interface Invitation {
  id: string
  email: string
  invited_by: string
  role: UserRole
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      plans:                { Row: Plan;                Insert: Partial<Plan>;                Update: Partial<Plan>;                Relationships: [] }
      profiles:             { Row: Profile;             Insert: Partial<Profile>;             Update: Partial<Profile>;             Relationships: [] }
      subscriptions:        { Row: Subscription;        Insert: Partial<Subscription>;        Update: Partial<Subscription>;        Relationships: [] }
      twitter_accounts:     { Row: TwitterAccount;      Insert: Partial<TwitterAccount>;      Update: Partial<TwitterAccount>;      Relationships: [] }
      posts:                { Row: Post;                Insert: Partial<Post>;                Update: Partial<Post>;                Relationships: [] }
      engagement_rules:     { Row: EngagementRule;      Insert: Partial<EngagementRule>;      Update: Partial<EngagementRule>;      Relationships: [] }
      engagement_activity:  { Row: EngagementActivity;  Insert: Partial<EngagementActivity>;  Update: Partial<EngagementActivity>;  Relationships: [] }
      analytics_snapshots:  { Row: AnalyticsSnapshot;   Insert: Partial<AnalyticsSnapshot>;   Update: Partial<AnalyticsSnapshot>;   Relationships: [] }
      post_analytics:       { Row: PostAnalytics;       Insert: Partial<PostAnalytics>;       Update: Partial<PostAnalytics>;       Relationships: [] }
      payment_transactions: { Row: PaymentTransaction;  Insert: Partial<PaymentTransaction>;  Update: Partial<PaymentTransaction>;  Relationships: [] }
      user_settings:        { Row: UserSettings;        Insert: Partial<UserSettings>;        Update: Partial<UserSettings>;        Relationships: [] }
      viral_video_queue:    { Row: ViralVideoQueue;     Insert: Partial<ViralVideoQueue>;     Update: Partial<ViralVideoQueue>;     Relationships: [] }
      invitations:          { Row: Invitation;          Insert: Partial<Invitation>;          Update: Partial<Invitation>;          Relationships: [] }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
