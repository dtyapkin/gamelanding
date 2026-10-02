"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSafeInternalPath } from "@/lib/dal";

/**
 * Вход, регистрация и выход.
 *
 * ЗАЧЕМ НУЖЕН ПАРАМЕТР `next`
 * ----------------------------
 * Страница /download защищена. Неавторизованного посетителя requireUser()
 * отправляет на /login?next=%2Fdownload. После успешного входа мы возвращаем
 * его обратно на страницу покупок — иначе пришлось бы кликать руками.
 *
 * Параметр `next` приходит из браузера, поэтому его обязательно проверяем
 * (isSafeInternalPath): иначе через нашу форму можно было бы отправить
 * пользователя на любой чужой сайт (так называемая open redirect уязвимость).
 */

function safeNext(formData: FormData, fallback: string): string {
  const value = formData.get("next");
  return isSafeInternalPath(value) ? value : fallback;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData, "/download");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Не говорим пользователю, существует ли такой email (user enumeration).
    const params = new URLSearchParams({ error: "Неверный email или пароль", email });
    redirect(`/login?${params.toString()}`);
  }

  // Ошибок нет — cookie с сессией уже установлена клиентом Supabase,
  // можно уводить пользователя дальше.
  redirect(next);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Адрес, на который Supabase отправит письмо со ссылкой подтверждения.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/login`,
    },
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message, email });
    redirect(`/login?${params.toString()}`);
  }

  // Если в Supabase выключено подтверждение email, пользователь уже залогинен.
  // Тогда ведём его сразу на покупки, а не просим ждать письмо.
  if (data.session) {
    redirect(safeNext(formData, "/download"));
  }

  redirect(
    "/login?" +
      new URLSearchParams({
        message: "Аккаунт создан. Проверьте почту и перейдите по ссылке из письма.",
        email,
      }).toString(),
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}