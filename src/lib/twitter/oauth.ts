import { TwitterApi } from 'twitter-api-v2'

const SCOPES = [
  'tweet.read',
  'tweet.write',
  'tweet.moderate.write',
  'users.read',
  'follows.read',
  'follows.write',
  'offline.access',
  'like.read',
  'like.write',
]

function getClient() {
  return new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  })
}

export async function getOAuthLink(_state: string) {
  const callbackUrl = process.env.TWITTER_CALLBACK_URL!
  const client = getClient()

  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(callbackUrl, {
    scope: SCOPES,
  })

  return { url, codeVerifier, state }
}

export async function handleOAuthCallback(
  code: string,
  codeVerifier: string,
) {
  const callbackUrl = process.env.TWITTER_CALLBACK_URL!
  const client = getClient()

  const { client: authedClient, accessToken, refreshToken, expiresIn } =
    await client.loginWithOAuth2({ code, codeVerifier, redirectUri: callbackUrl })

  const { data: user } = await authedClient.v2.me({
    'user.fields': ['public_metrics', 'profile_image_url', 'verified'],
  })

  return {
    accessToken,
    refreshToken: refreshToken ?? null,
    expiresIn: expiresIn ?? null,
    user,
  }
}
