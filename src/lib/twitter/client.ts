import { TwitterApi } from 'twitter-api-v2'

// OAuth 2.0 user client — built from the stored access token
export function getTwitterUserClient(accessToken: string, _accessSecret?: string) {
  return new TwitterApi(accessToken)
}

// App-only client using bearer token (for read-only operations)
export function getTwitterAppClient() {
  return new TwitterApi(process.env.TWITTER_BEARER_TOKEN!)
}

export async function postTweet(client: TwitterApi, content: string, mediaIds?: string[]) {
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
    if (replyToId) tweetData.reply = { in_reply_to_tweet_id: replyToId }
    const result = await client.v2.tweet(tweetData)
    replyToId = result.data.id
    results.push(result)
  }

  return results
}

export async function uploadMedia(client: TwitterApi, buffer: Buffer, mimeType: string) {
  return client.v1.uploadMedia(buffer, { mimeType })
}

export async function uploadVideoMedia(client: TwitterApi, buffer: Buffer) {
  return client.v1.uploadMedia(buffer, { mimeType: 'video/mp4', longVideo: true })
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
