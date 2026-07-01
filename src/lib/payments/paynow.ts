import crypto from 'crypto'
import axios from 'axios'

const PAYNOW_BASE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction'

interface PaynowInitOptions {
  reference: string
  amount: number
  email: string
  phone?: string
  info: string
  returnUrl: string
  resultUrl: string
}

interface PaynowResponse {
  status: string
  browserurl?: string
  pollurl?: string
  paynowreference?: string
  hash?: string
  error?: string
}

function buildPaynowFields(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

function hashPaynowRequest(fields: Record<string, string>, integrationKey: string): string {
  const values = Object.values(fields).join('')
  return crypto
    .createHash('sha512')
    .update(values + integrationKey)
    .digest('hex')
    .toUpperCase()
}

export async function createPaynowSession(options: PaynowInitOptions): Promise<PaynowResponse> {
  const { reference, amount, email, phone, info, returnUrl, resultUrl } = options

  const fields: Record<string, string> = {
    id: process.env.PAYNOW_INTEGRATION_ID!,
    reference,
    amount: amount.toFixed(2),
    additionalinfo: info,
    returnurl: returnUrl,
    resulturl: resultUrl,
    status: 'Message',
    authemail: email,
  }

  if (phone) fields.phone = phone

  const hash = hashPaynowRequest(fields, process.env.PAYNOW_INTEGRATION_KEY!)
  fields.hash = hash

  const body = buildPaynowFields(fields)

  const response = await axios.post<string>(PAYNOW_BASE_URL, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const result: Record<string, string> = {}
  const parts = response.data.split('&')
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key && value) {
      result[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  }

  return result as unknown as PaynowResponse
}

export async function pollPaynowStatus(pollUrl: string): Promise<{
  status: string
  paynowReference?: string
  amount?: string
  paid: boolean
}> {
  const response = await axios.post<string>(pollUrl, '', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const result: Record<string, string> = {}
  const parts = response.data.split('&')
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (key && value) result[decodeURIComponent(key)] = decodeURIComponent(value)
  }

  return {
    status: result.status || 'unknown',
    paynowReference: result.paynowreference,
    amount: result.amount,
    paid: result.status === 'Paid' || result.status === 'Awaiting Delivery',
  }
}

export function verifyPaynowCallback(fields: Record<string, string>): boolean {
  const receivedHash = fields.hash
  if (!receivedHash) return false

  const { hash: _hash, ...rest } = fields
  const computedHash = hashPaynowRequest(rest, process.env.PAYNOW_INTEGRATION_KEY!)

  return computedHash === receivedHash.toUpperCase()
}
