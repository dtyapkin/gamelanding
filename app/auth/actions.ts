"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSafeInternalPath } from "@/lib/dal";
import { reserveConfirmationResend } from "@/lib/email-resend-limit";

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
    // Вкладка входа: человек уже пробовал войти, и после ошибки ожидает
    // увидеть ту же форму, а не регистрацию.
    const params = new URLSearchParams({ error: "Неверный email или пароль", email, tab: "login" });
    redirect(`/login?${params.toString()}`);
  }

  // Ошибок нет — cookie с сессией уже установлена клиентом Supabase,
  // можно уводить пользователя дальше.
  redirect(next);
}

/**
 * Переводит технический текст ошибки Supabase на понятный человеку.
 *
 * ЗАЧЕМ: Supabase отдаёт английские сообщения, часть из которых вообще
 * ничего не значит для покупателя. Например, «Error sending confirmation
 * email» — это не вина пользователя, а неработающая отправка писем на
 * сервере. Показывать это как есть — значит пугать посетителя чужой
 * ошибкой вместо помощи.
 */
function humanSignupError(message: string): string {
  const text = message.toLowerCase();

  if (text.includes("sending confirmation email")) {
    return "Сейчас не удаётся отправить письмо для подтверждения — почта на сервере временно не настроена. Попробуйте зарегистрироваться чуть позже или напишите нам.";
  }
  if (text.includes("email rate limit") || text.includes("rate limit")) {
    return "Слишком много попыток регистрации с одного адреса. Подождите несколько минут и попробуйте снова.";
  }
  // Реальная формулировка GoTrue при частых отправках. Раньше она проваливалась
  // в общий случай, и человек видел английский текст вроде
  // «For security purposes, you can only request this after 59 seconds».
  if (text.includes("only request this after") || text.includes("too many emails")) {
    return "Письмо уже отправлено недавно. Подождите минуту и попробуйте ещё раз — так защищаемся от почтового спама.";
  }
  if (text.includes("already registered") || text.includes("already been registered")) {
    return "Аккаунт с такой почтой уже есть. Попробуйте войти.";
  }
  if (text.includes("password should be") || text.includes("at least")) {
    return "Пароль слишком короткий — нужно минимум 6 символов.";
  }
  if (text.includes("unable to validate email") || text.includes("invalid email")) {
    return "Такой адрес почты не похож на настоящий. Проверьте его.";
  }

  // На всякий случай сохраняем введённый адрес в форме, чтобы человеку
  // не пришлось вводить его заново после ошибки.
  return `Не удалось создать аккаунт: ${message}`;
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
    const params = new URLSearchParams({
      error: humanSignupError(error.message),
      email,
      // Возвращаем человека на вкладку регистрации: он только что
      // регистрировался, и ждать пароля ещё не от чего. Без этого
      // параметра форма откроет вход — и человек подумает, что зарегистрировался.
      tab: "signup",
    });
    redirect(`/login?${params.toString()}`);
  }

  // Если в Supabase выключено подтверждение email, пользователь уже залогинен.
  // Тогда ведём его сразу на покупки, а не просим ждать письмо.
  if (data.session) {
    redirect(safeNext(formData, "/download"));
  }

  // Подтверждение по почте включено: аккаунт создан, но войти ещё нельзя.
  // Отправляем на вкладку входа — вводить пароль, который человек уже знает.
  redirect(
    "/login?" +
      new URLSearchParams({
        message: "Аккаунт создан. Проверьте почту и перейдите по ссылке из письма.",
        email,
        tab: "login",
      }).toString(),
  );
}
export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Повторная отправка письма подтверждения адреса.
 *
 * ЗАЧЕМ ЭТО НУЖНО. С подтверждением по почте человек оказывается заперт,
 * если письмо не дошло: войти нельзя (Supabase отвечает «Email not
 * confirmed»), зарегистрироваться заново нельзя (адрес уже занят), пароль
 * сбросить нельзя (его ещё нет). Без этой кнопки единственный выход был бы
 * один — мы правим аккаунт вручную через админку.
 *
 * Ограничение частоты живёт в lib/email-resend-limit.ts.
 */
export async function resendConfirmation(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    redirect(
      `/login?${new URLSearchParams({
        error: "Введите адрес почты, на который отправлялось письмо.",
      }).toString()}`,
    );
  }

  const decision = reserveConfirmationResend(email);

  if (!decision.allowed) {
    const minutes = Math.max(1, Math.ceil(decision.retryAfterSeconds / 60));
    redirect(
      `/login?${new URLSearchParams({
        error: `Письмо уже отправлялось недавно. Попробуйте ещё раз через ${minutes} ${
          minutes === 1 ? "минуту" : "минуты"
        } — так защищаемся от почтового спама.`,
        email,
      }).toString()}`,
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/login`,
    },
  });

  if (error) {
    // Про «такого адреса нет» сообщаем так же, как об успехе: иначе форма
    // превращается в способ проверить, какие адреса зарегистрированы на
    // сайте. А вот о поломке отправки говорим прямо — это наша ошибка,
    // и человек должен знать, что помочь письмом сейчас не получится.
    const isUnknownAddress =
      error.message.toLowerCase().includes("not found") ||
      error.message.toLowerCase().includes("unable to validate");

    if (!isUnknownAddress) {
      console.error("Не удалось отправить письмо повторно:", error.message);
      redirect(
        `/login?${new URLSearchParams({
          error: humanSignupError(error.message),
          email,
        }).toString()}`,
      );
    }
  }

  redirect(
    `/login?${new URLSearchParams({
      message:
        "Если такой адрес зарегистрирован и ещё не подтверждён — мы отправили письмо повторно. Проверьте также папку «Спам».",
      email,
    }).toString()}`,
  );
}