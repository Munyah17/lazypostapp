import { TwitterApi } from 'twitter-api-v2'

export async function getOAuthLink(state: string) {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
  })

  const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(
    process.env.TWITTER_CALLBACK_URL!,
    { linkMode: 'authorize' }
  )

  return { url, oauth_token, oauth_token_secret }
}

export async function handleOAuthCallback(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string
) {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: oauthToken,
    accessSecret: oauthTokenSecret,
  })

  const { accessToken, accessSecret, client: loggedClient } = await client.login(oauthVerifier)
  const me = await loggedClient.v2.me({
    'user.fields': ['public_metrics', 'profile_image_url', 'verified'],
  })

  return {
    accessToken,
    accessSecret,
    user: me.data,
  }
}
