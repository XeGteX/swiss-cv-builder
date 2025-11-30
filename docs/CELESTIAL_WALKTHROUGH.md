
# Celestial Walkthrough 🌌

Follow these steps to verify the new capabilities of the Swiss CV Builder.

## 1. The Laboratory (Feature Flags) 🧪
**Goal**: Verify you can toggle experimental features.

1.  Open your browser to `http://localhost:5173/labs`.
2.  You should see the **Labs Dashboard**.
3.  Toggle the "Generative UI Engine" checkbox.
4.  Notice the state persists (try refreshing the page).

## 2. Business Intelligence (BI) 💎
**Goal**: See the strategic insights.

1.  Stay on `http://localhost:5173/labs`.
2.  Scroll down to the **Business Intelligence** section.
3.  Check the **Pricing Advisor** card. It should show a suggested price of `$12.99` with a reasoning.
4.  Check the **Revenue Projection** card.

## 3. Deep Health Check 🏥
**Goal**: Verify the system is monitoring itself.

1.  Open a new terminal or use your browser.
2.  Navigate to `http://localhost:3000/api/health/deep`.
3.  You should see a JSON response like:
    ```json
    {
      "status": "healthy",
      "database": { "status": "connected", "latencyMs": 12 },
      "memory": { "rss": "150MB", ... }
    }
    ```

## 4. Event Bus & Profiler ⚡
**Goal**: Verify backend logs.

1.  Look at your running terminal where `npm run dev:all` is active.
2.  **Profiler**: Make a few requests (refresh the page). You should see logs like:
    `⚡ [Profiler] GET /api/health/deep - 12.50ms`
3.  **Event Bus**: If you register a new user or log in, look for:
    `📢 [EventBus] Emitting: USER_REGISTERED`

## 5. Generative UI (The "Wow" Factor) 🎨
**Goal**: See the dynamic template engine in action.

1.  Go to the Editor (`/editor`).
2.  Select the **Modern** template.
3.  The template now uses the `TemplateEngine` under the hood.
4.  *(Advanced)*: To see the variations, we would need to expose a UI control to change the `TemplateConfig` passed to `ModernTemplate`. For now, it uses the `DEFAULT_THEME`.

---
**Enjoy your new Creator Platform!** 🚀
