import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

// ============================================================
// 1. СПИСОК IP-АДРЕСОВ ЮKASSA
// ============================================================
const YOOKASSA_NETWORKS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32',
]

// ============================================================
// 2. ТИПЫ ДЛЯ ТЕЛА ВЕБХУКА
// ============================================================
interface YooKassaMetadata {
  order_id?: string
  user_id?: string
}

interface YooKassaPaymentObject {
  id?: string
  status?: string
  metadata?: YooKassaMetadata
}

interface YooKassaWebhookBody {
  event?: string
  action?: string
  object?: YooKassaPaymentObject
  // Поля старого API (form-urlencoded)
  order_id?: string
  user_id?: string
  payment_id?: string
  // Поля для MD5-подписи
  md5?: string
  shopId?: string
  invoiceId?: string
  orderSumAmount?: string
  orderSumCurrencyPaycash?: string
  orderSumBankPaycash?: string
  customerNumber?: string
  shopPassword?: string
}

// ============================================================
// 3. ПРОВЕРКА IP ПО CIDR
// ============================================================
function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

function isIpInCidr(ip: string, cidr: string): boolean {
  if (cidr.includes(':')) {
    return ip.startsWith(cidr.split('/')[0].split(':').slice(0, 3).join(':'))
  }

  const [network, bits] = cidr.split('/')
  if (!bits) {
    return ip === network
  }

  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1) >>> 0
  return (ipToLong(ip) & mask) === (ipToLong(network) & mask)
}

function isYooKassaIp(ip: string): boolean {
  return YOOKASSA_NETWORKS.some((cidr) => isIpInCidr(ip, cidr))
}

// ============================================================
// 4. ПРОВЕРКА MD5-ПОДПИСИ
// ============================================================
function verifyMd5Signature(body: YooKassaWebhookBody, secretWord: string): boolean {
  const { md5 } = body
  if (!md5) return false

  const order = [
    'action',
    'orderSumAmount',
    'orderSumCurrencyPaycash',
    'orderSumBankPaycash',
    'shopId',
    'invoiceId',
    'customerNumber',
    'shopPassword',
  ] as const

  const stringToHash = order
    .map((key) => String(body[key] ?? ''))
    .join(';')

  const expected = createHash('md5')
    .update(`${stringToHash};${secretWord}`, 'utf8')
    .digest('hex')
    .toUpperCase()

  return expected === md5.toUpperCase()
}

// ============================================================
// 5. ОСНОВНОЙ ОБРАБОТЧИК ВЕБХУКА
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // --- Проверка IP ---
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp =
      request.headers.get('cf-connecting-ip') ??
      forwardedFor?.split(',')[0]?.trim()

    if (!clientIp) {
      console.warn('Вебхук: не удалось определить IP отправителя')
      return NextResponse.json({ error: 'Missing IP' }, { status: 403 })
    }

    if (!isYooKassaIp(clientIp)) {
      console.warn(`Вебхук: запрос с неразрешённого IP: ${clientIp}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // --- Парсинг тела ---
    const contentType = request.headers.get('content-type') ?? ''
    let body: YooKassaWebhookBody

    if (contentType.includes('application/json')) {
      body = (await request.json()) as YooKassaWebhookBody
    } else {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries()) as YooKassaWebhookBody
    }

    // --- Проверка MD5-подписи ---
    const secretWord = process.env.YOOKASSA_SECRET_WORD
    if (secretWord && !verifyMd5Signature(body, secretWord)) {
      console.warn('Вебхук: неверная MD5-подпись')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // --- Обработка события ---
    const event = body.event ?? body.action

    if (event !== 'payment.succeeded') {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ✅ Теперь payment имеет правильный тип
    const payment: YooKassaPaymentObject = body.object ?? {}

    const orderId = payment.metadata?.order_id ?? body.order_id
    const userId = payment.metadata?.user_id ?? body.user_id
    const paymentId = payment.id ?? body.payment_id

    if (!orderId || !userId) {
      console.error('Вебхук: отсутствуют метаданные заказа')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // --- Обновление заказа ---
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'succeeded',
        yookassa_payment_id: paymentId,
      })
      .eq('id', orderId)
      .eq('user_id', userId)

    if (error) {
      console.error('Ошибка обновления заказа:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('Ошибка обработки вебхука:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}