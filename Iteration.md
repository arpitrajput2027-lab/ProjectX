# Project Iteration & Improvements

Here is an analysis of what is currently wrong, what should be added or removed, and how to improve the overall architecture and code quality of the AI Career OS project.

## ❌ What is Wrong?
*   **OS-Specific Scripts:** The `start_servers.bat` file is strictly for Windows. It will fail on macOS/Linux.
*   **Fragile Job Search:** `jobs_search_pipeline.py` relies heavily on DuckDuckGo HTML scraping (`ddgs`), which is prone to rate limits and structural changes. It frequently fails silently.
*   **Lack of Error Handling:** The backend services (like `ats_service.py`) use basic `try/except` with `print()` statements. If an API fails, it falls back to Gemini, but there is no robust error logging to monitor these failures.
*   **Synchronous AI Calls:** Generating ATS scores or customizing resumes makes synchronous calls to LLMs which can take many seconds, potentially causing HTTP timeouts on the frontend.
*   **No Dependency Locking in Backend:** The `requirements.txt` has mostly unpinned versions (e.g., `fastapi`, `uvicorn`), which can lead to "it works on my machine" issues when packages update.

## 🗑️ What Should be Removed?
*   Remove the reliance on raw DuckDuckGo scraping if SerpApi fails. Rely strictly on robust APIs to ensure data quality.
*   Remove hardcoded configurations (like `allow_origins=["*"]` in CORS) for production readiness.
*   Remove `.env` credentials tracking (ensure `.gitignore` is properly configured, though it seems okay right now).

## ➕ What Should be Added?
*   **Dockerization:** Add `Dockerfile` for both frontend and backend, and a `docker-compose.yml` at the root. This replaces `start_servers.bat` and ensures cross-platform compatibility.
*   **Dependency Management:** Use `poetry` or `pip-tools` for the backend to lock dependency versions, similar to `package-lock.json` in the frontend.
*   **Database Migrations:** Use `Alembic` for SQLAlchemy to manage database schema changes programmatically instead of relying on manual Supabase SQL execution.
*   **Testing:** Add `pytest` for backend unit/integration tests and `Jest`/`Playwright` for the frontend.
*   **Structured Logging:** Replace `print()` with Python's `logging` module or `loguru` to track API latency and LLM failures properly.

## 🚀 How to Improve & Scale (Next Steps)
*   **Implement Caching (Redis):** Job searches and ATS parsing results for identical resumes/queries should be cached to reduce expensive LLM API costs and drastically improve response times.
*   **Asynchronous Processing (Celery/RabbitMQ):** Resume processing, ATS scoring, and live job scraping take time. These should be background tasks. The frontend can poll for results or use WebSockets/Server-Sent Events (SSE) to get the final payload.
*   **Rate Limiting:** Implement rate limiting on the FastAPI backend using `slowapi` to prevent abuse, especially on routes hitting expensive LLM endpoints.
*   **Frontend State Management:** Instead of raw Next.js state, integrate **React Query (TanStack Query)** to cache API responses, handle loading states, and automatically retry failed requests on the frontend.
