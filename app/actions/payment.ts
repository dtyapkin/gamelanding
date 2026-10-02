'use server'

import { YooKassa, CurrencyEnum } from '@webzaytsev/yookassa-ts-sdk'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'

const yookassa = YooKassa({
  shop_id: process.env.YOOKASSA_SHOP_ID!,
  secret_key: process.env.YOOKASSA_SECRET_KEY!,
})

export async function createPayment(productId: string, amount: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Создаём заказ со статусом "pending"
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      amount,
      product_id: productId,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Ошибка создания заказа:', orderError)
    throw new Error('Не удалось создать заказ')
  }

  try {
    // 2. Создаём платёж в YooKassa
    const payment = await yookassa.payments.create(
      {
        amount: {
          value: amount.toFixed(2),
          currency: CurrencyEnum.RUB,
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/download`,
        },
        capture: true,
        description: `Покупка: ${productId}`,
        metadata: {
          order_id: order.id,
          user_id: user.id,
        },
      },
      randomUUID()
    )

    // 3. Проверяем тип confirmation ПЕРЕД доступом к confirmation_url
    if (payment.confirmation?.type !== 'redirect') {
      throw new Error('YooKassa вернула неожиданный тип подтверждения')
    }

    const confirmationUrl = payment.confirmation.confirmation_url

    if (!confirmationUrl) {
      throw new Error('YooKassa не вернула URL для оплаты')
    }

    // 4. Сохраняем ID платежа YooKassa в заказ
    await supabase
      .from('orders')
      .update({ yookassa_payment_id: payment.id })
      .eq('id', order.id)

    // 5. Перенаправляем на страницу оплаты YooKassa
    redirect(confirmationUrl)
  } catch (error) {
    console.error('Ошибка создания платежа:', error)

    // Откатываем заказ при ошибке
    await supabase.from('orders').delete().eq('id', order.id)

    throw new Error('Не удалось создать платёж')
  }
}