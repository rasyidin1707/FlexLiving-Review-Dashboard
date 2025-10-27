import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-[70vh] flex items-center">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        <h1
          className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent transition-transform duration-150 ease-out will-change-transform transform-gpu hover:scale-[1.005]"
        >
          Flex Living – Reviews Dashboard
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-xl">
          Navigate to the manager dashboard to review, analyze and approve reviews, or open a
          property page to see website‑visible reviews.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-all"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
