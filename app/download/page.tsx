import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DownloadPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ищем успешный заказ пользователя.
  // RLS автоматически отфильтрует заказы других пользователей.
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <h1 className="text-2xl font-bold text-yellow-800 mb-4">
            Заказ не найден или не оплачен
          </h1>
          <p className="text-yellow-700 mb-6">
            Пожалуйста, убедитесь, что вы оплатили заказ.
          </p>
          <Link
            href="/"
            className="inline-block text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  // Генерируем подписанную ссылку на файл (живёт 1 час)
  const filePath = `paid/${user.id}/ebook.pdf`;

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("private-files")
    .createSignedUrl(filePath, 3600);

  if (signedUrlError || !signedUrl) {
    console.error("Ошибка генерации ссылки:", signedUrlError);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Ошибка доступа к файлу
          </h1>
          <p className="text-red-700 mb-6">
            Не удалось получить ссылку на файл. Обратитесь в поддержку.
          </p>
          <Link
            href="/"
            className="inline-block text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Оплата прошла успешно!
          </h1>
          <p className="text-gray-600">
            Заказ №{order.id.slice(0, 8)} готов к скачиванию.
          </p>
        </div>

        <a
          href={signedUrl.signedUrl}
          download
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Скачать файл
        </a>

        <p className="mt-4 text-sm text-gray-500">
          Ссылка действительна в течение 1 часа.
        </p>
      </div>
    </div>
  );
}
