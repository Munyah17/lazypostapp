import { TwitterApi } from 'twitter-api-v2'

export function getTwitterAppClient() {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
  })
}

export function getTwitterUserClient(accessToken: string, accessSecret?: string) {
  if (accessSecret) {
    return new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken,
      accessSecret,
    })
  }
  return new TwitterApi(accessToken)
}

export async function postTweet(
  client: TwitterApi,
  content: string,
  mediaIds?: string[]
) {
  const tweetData: Parameters<typeof client.v2.tweet>[0] = { text: content }
  if (mediaIds?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tweetData.media = { media_ids: mediaIds as any }
  }
  return client.v2.tweet(tweetData)
}

export async function postThread(client: TwitterApi, tweets: string[]) {
  const results = []
  let replyToId: string | undefined

  for (const text of tweets) {
    const tweetData: Parameters<typeof client.v2.tweet>[0] = { text }
    if (replyToId) {
      tweetData.reply = { in_reply_to_tweet_id: replyToId }
    }
    const result = await client.v2.tweet(tweetData)
    replyToId = result.data.id
    results.push(result)
  }

  return results
}

export async function uploadMedia(
  client: TwitterApi,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mediaId = await client.v1.uploadMedia(buffer, { mimeType })
  return mediaId
}

export async function uploadVideoMedia(
  client: TwitterApi,
  buffer: Buffer
): Promise<string> {
  const mediaId = await client.v1.uploadMedia(buffer, {
    mimeType: 'video/mp4',
    longVideo: true,
  })
  return mediaId
}

export async function getTwitterUserProfile(client: TwitterApi, userId: string) {
  return client.v2.user(userId, {
    'user.fields': ['public_metrics', 'profile_image_url', 'verified', 'description'],
  })
}

export async function getRecentMentions(client: TwitterApi, userId: string, maxResults = 10) {
  return client.v2.userMentionTimeline(userId, {
    max_results: maxResults,
    'tweet.fields': ['public_metrics', 'author_id', 'created_at'],
    'user.fields': ['username', 'profile_image_url'],
    expansions: ['author_id'],
  })
}

export async function likeTweet(client: TwitterApi, userId: string, tweetId: string) {
  return client.v2.like(userId, tweetId)
}

export async function retweetTweet(client: TwitterApi, userId: string, tweetId: string) {
  return client.v2.retweet(userId, tweetId)
}

export async function replyToTweet(client: TwitterApi, tweetId: string, content: string) {
  return client.v2.tweet({ text: content, reply: { in_reply_to_tweet_id: tweetId } })
}
