Google Reviews Integration – Findings
====================================

Summary
-------

- Endpoint: `GET /api/reviews/google?placeId=...` is implemented and normalizes reviews to the same schema (5★ → 10/10 scale).
- If `GOOGLE_PLACES_API_KEY` is missing, it returns `{ status: "disabled", reason: "Missing GOOGLE_PLACES_API_KEY" }` without failing the app.

Feasibility & Constraints
-------------------------

- Quotas: The Places Details API has per‑day and per‑minute quotas. Production usage likely needs billing enabled and monitoring.
- Pricing: Places Details is billable beyond free tier. See Google Cloud pricing docs.
- Data availability: API typically returns a limited set (e.g., most recent 5) of reviews per place.
- Freshness: Reviews are not guaranteed to be complete or comprehensive; caching recommended.
- Terms: Attribution is required. Review content usage should follow Google Maps Platform Terms of Service.

Recommendations
---------------

- Cache responses server‑side (e.g., daily) and store normalized reviews to DB for analytics alongside other channels.
- Respect rate limits; batch requests with backoff.
- Provide admin UI to link `placeId` to each listing.

