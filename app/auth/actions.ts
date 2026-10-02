'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Важно: кодируем и сообщение, и email, чтобы вернуть их в форму
    const params = new URLSearchParams({
      error: error.message,
      email,
    })
    redirect(`/login?${params.toString()}`)
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    const params = new URLSearchParams({ error: error.message, email })
    redirect(`/login?${params.toString()}`)
  }

  // Показываем сообщение о необходимости подтвердить email
  redirect('/login?message=' + encodeURIComponent(
    'Регистрация успешна. Проверьте почту и перейдите по ссылке в письме.'
  ))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}