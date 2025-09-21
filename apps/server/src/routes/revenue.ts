import { Router } from 'express';
import { prisma } from '../../lib/prisma';

const router = Router();

// Granularity: daily | weekly | monthly
// Query: /api/revenue?granularity=daily&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req, res) => {
  const g = String(req.query.granularity || 'daily') as 'daily' | 'weekly' | 'monthly';

  const now = new Date();
  const to = req.query.to ? new Date(String(req.query.to) + 'T23:59:59') : now;
  const from = (() => {
    if (req.query.from) return new Date(String(req.query.from) + 'T00:00:00');
    const d = new Date(to);
    if (g === 'daily') d.setDate(d.getDate() - 29); // last 30 days
    if (g === 'weekly') d.setDate(d.getDate() - 7 * 25); // last 26 weeks
    if (g === 'monthly') d.setMonth(d.getMonth() - 11); // last 12 months
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  try {
    let rows: { bucket: string; total: bigint | number }[] = [];

    if (g === 'daily') {
      // Group by DATE(i.date)
      rows = await prisma.$queryRaw<{ bucket: string; total: bigint | number }[]>`
        SELECT DATE(i.date) AS bucket,
               SUM(ii.qty * ii.priceCentsAtSale) AS total
        FROM Invoice i
        JOIN InvoiceItem ii ON ii.invoiceId = i.id
        WHERE i.date >= ${from} AND i.date < ${new Date(to.getTime() + 1000)}
        GROUP BY DATE(i.date)
        ORDER BY DATE(i.date) ASC
      `;
    } else if (g === 'weekly') {
      // Group by Monday of each ISO week
      rows = await prisma.$queryRaw<{ bucket: string; total: bigint | number }[]>`
        SELECT DATE_SUB(DATE(i.date), INTERVAL WEEKDAY(i.date) DAY) AS bucket,
               SUM(ii.qty * ii.priceCentsAtSale) AS total
        FROM Invoice i
        JOIN InvoiceItem ii ON ii.invoiceId = i.id
        WHERE i.date >= ${from} AND i.date < ${new Date(to.getTime() + 1000)}
        GROUP BY DATE_SUB(DATE(i.date), INTERVAL WEEKDAY(i.date) DAY)
        ORDER BY bucket ASC
      `;
    } else {
      // monthly → first day of month
      rows = await prisma.$queryRaw<{ bucket: string; total: bigint | number }[]>`
        SELECT DATE_FORMAT(i.date, '%Y-%m-01') AS bucket,
               SUM(ii.qty * ii.priceCentsAtSale) AS total
        FROM Invoice i
        JOIN InvoiceItem ii ON ii.invoiceId = i.id
        WHERE i.date >= ${from} AND i.date < ${new Date(to.getTime() + 1000)}
        GROUP BY DATE_FORMAT(i.date, '%Y-%m-01')
        ORDER BY bucket ASC
      `;
    }

    const points = rows.map((r) => ({
      at: new Date(r.bucket).toISOString(),
      total: Number(r.total || 0),
    }));

    return res.json(points);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

export default router;
