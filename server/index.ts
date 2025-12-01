
import { app } from './app';
import { env } from './config/env';
import { initializeOlympus } from './routes/system.routes';

const PORT = env.PORT;

// Initialize Olympus Core before starting server
initializeOlympus();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${env.NODE_ENV} mode`);
    console.log(`🌌 OLYMPUS Neural Core: ACTIVE`);
});
