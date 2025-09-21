import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

/* ========= Create Invoice ========= */

const ItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive(),
});

const CreateSchema = z.object({
  date: z.string().min(1), // YYYY-MM-DD
  customerName: z.string().min(1),
  salespersonName: z.string().min(1),
  notes: z.string().optional().nullable(),
  items: z.array(ItemSchema).min(1),
});

router.post('/', async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid payload',
        details: parsed.error.flatten(),
      },
    });
  }

  const { date, customerName, salespersonName, notes, items } = parsed.data;

  try {
    // Validate product existence & stock
    const ids = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    if (products.length !== ids.length) {
      const found = new Set(products.map((p) => p.id));
      const missingIds = ids.filter((id) => !found.has(id));
      return res.status(400).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'One or more products not found',
          details: { missingIds },
        },
      });
    }
    for (const it of items) {
      const p = products.find((p) => p.id === it.productId)!;
      if (p.stock < it.qty) {
        return res
          .status(400)
          .json({ error: { code: 'OUT_OF_STOCK', message: `Insufficient stock for ${p.name}` } });
      }
    }

    const jsDate = new Date(`${date}T00:00:00`);

    const result = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: { date: jsDate, customerName, salespersonName, notes: notes ?? null },
      });

      let totalCents = 0;
      for (const it of items) {
        const p = products.find((p) => p.id === it.productId)!;
        totalCents += p.priceCents * it.qty;

        await tx.invoiceItem.create({
          data: {
            invoiceId: inv.id,
            productId: p.id,
            qty: it.qty,
            priceCentsAtSale: p.priceCents,
          },
        });

        await tx.product.update({
          where: { id: p.id },
          data: { stock: p.stock - it.qty },
        });
      }

      return { inv, totalCents };
    });

    return res.status(201).json({
      id: result.inv.id,
      date: result.inv.date.toISOString(),
      customerName,
      salespersonName,
      notes: notes ?? null,
      totalCents: result.totalCents,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

/* ========= List Invoices ========= */
router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? ''), 10) || 10, 1), 50);
  const cursorRaw = req.query.cursor as string | undefined;
  const cursor = cursorRaw ? Number(cursorRaw) : undefined;

  const where = cursor ? { id: { lt: cursor } } : undefined;

  try {
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        items: { select: { qty: true, priceCentsAtSale: true } },
      },
    });

    const nodes = invoices.map((inv) => {
      const totalCents = inv.items.reduce((s, it) => s + it.qty * it.priceCentsAtSale, 0);
      return {
        id: inv.id,
        date: inv.date.toISOString(),
        customerName: inv.customerName,
        salespersonName: inv.salespersonName,
        notes: inv.notes,
        totalCents,
      };
    });

    const nextCursor = nodes.length === limit ? nodes[nodes.length - 1].id : null;

    return res.json({ nodes, nextCursor });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

export default router;
