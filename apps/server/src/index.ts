import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import invoicesRouter from './routes/invoices';
import revenueRouter from './routes/revenue';

const app = express();

const origins = process.env.CORS_ORIGIN?.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins && origins.length ? origins : '*',
  }),
);

app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api/invoices', invoicesRouter);
app.use('/api/revenue', revenueRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API on :${port}`);
});
