import { Logo } from "@/src/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <article className="w-full max-w-[320px] sm:max-w-lg mx-auto">
        <header className="flex flex-col items-center mb-6 sm:mb-8">
          <Logo className="w-auto h-10 sm:h-14 mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold">CMS for MY Projects</h1>
        </header>
        <section className="w-full min-h-[320px] flex flex-col justify-center rounded-lg bg-background p-6 sm:p-8 shadow">
          {children}
        </section>
      </article>
    </main>
  );
}
