import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Flex Living – Reviews Dashboard</h1>
      <p className="text-muted-foreground">
        Navigate to the manager dashboard to review, analyze and approve reviews, or open a
        property page to see website-visible reviews.
      </p>
      <div className="flex gap-3">
        <Link className="btn" href="/dashboard">
          Open Dashboard
        </Link>
      </div>
    </div>
  )
}

