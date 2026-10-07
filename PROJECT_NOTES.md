## Submission notes

Suggested demo input:
"I want a phone under $500 with a good camera and long battery life."

Expected behavior:
1. User submits the preference.
2. React sends the preference and catalog to `/api/recommend`.
3. The server calls OpenAI when `OPENAI_API_KEY` is present.
4. AI returns only catalog product IDs, scores, and short reasons.
5. React filters the catalog using those IDs and displays the matching products.

If the API key is absent, the backend uses the fallback matcher. This is intentional so the project can be demonstrated locally without exposing credentials.
