import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRANDING_NAME_FA } from "@/const/branding";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto h-full px-6 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 font-bold text-4xl text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            مدیریت هوشمند{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {BRANDING_NAME_FA}
            </span>
          </h1>

          <p className="mb-8 text-gray-600 text-xl sm:text-2xl dark:text-gray-300">
            کنترل کامل بر دارایی‌ها و تراکنش‌های خود با رابط کاربری ساده و قدرتمند
          </p>

          <div className="mb-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-3 text-3xl">💰</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                پیگیری حساب‌ها
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                مدیریت همه حساب‌های بانکی و کیف پول‌های دیجیتال در یک مکان
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-3 text-3xl">📊</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                تحلیل تراکنش‌ها
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                مشاهده گزارش‌های دقیق و نمودارهای مالی برای تصمیم‌گیری بهتر
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-800/80">
              <div className="mb-3 text-3xl">🔒</div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                امنیت کامل
              </h3>
              <p className="text-gray-600 text-sm dark:text-gray-300">
                محافظت از داده‌های مالی شما با رمزگذاری پیشرفته
              </p>
            </div>
          </div>

          <div className="mb-12">
            <p className="mb-6 text-gray-700 text-lg dark:text-gray-300">
              آماده شروع مدیریت هوشمندانه مالی خود هستید؟
            </p>
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3 font-semibold text-lg">
                شروع رایگان {BRANDING_NAME_FA}
              </Button>
            </Link>
          </div>

          <div className="rounded-xl bg-white/60 p-8 shadow-lg backdrop-blur-sm dark:bg-gray-800/60">
            <h2 className="mb-4 font-bold text-2xl text-gray-900 dark:text-white">
              چرا {BRANDING_NAME_FA} را انتخاب کنید؟
            </h2>
            <div className="grid gap-4 text-right sm:grid-cols-2">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  رابط کاربری ساده و کاربرپسند
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  پشتیبان‌گیری خودکار داده‌ها
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  دسترسی از همه دستگاه‌ها
                </li>
              </ul>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  گزارش‌های مالی هوشمند
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  دسته‌بندی خودکار تراکنش‌ها
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  پشتیبانی ۲۴ ساعته
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-gray-200 border-t bg-white/50 py-8 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © ۱۴۰۳ {BRANDING_NAME_FA}. تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
}
