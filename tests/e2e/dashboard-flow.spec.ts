import { test, expect } from '@playwright/test'

test('dashboard approve flow and property page', async ({ page }) => {
  await page.goto('/dashboard')
  // Accept any heading containing "Dashboard" (exact title may vary)
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible()

  // Wait for the reviews table to render at least one row
  await expect(page.locator('table tbody tr').first()).toBeVisible()

  // Approve first visible review via the toggle button (aria-checked reflects state)
  const firstRow = page.locator('table tbody tr').first()
  const approve = firstRow.getByRole('switch', { name: /Approve / })
  const current = await approve.getAttribute('aria-checked')
  await approve.click()
  await expect(approve).toHaveAttribute('aria-checked', current === 'true' ? 'false' : 'true')

  // Navigate to the first listing's public page
  const firstListingId = await page.evaluate(async () => {
    const res = await fetch('/api/listings')
    const data = await res.json()
    const first = (data.items && data.items[0]) || (data.listings && data.listings[0])
    return first?.listingId || first?.id
  })
  if (firstListingId) {
    await page.goto(`/properties/${firstListingId}`)
    await expect(page.getByRole('heading', { name: /Guest Reviews/i })).toBeVisible()
  } else {
    throw new Error('No listings returned from /api/listings')
  }
})
