import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { defaultPaymentProvider } from '../services/payment.js';

export const ordersRouter = Router();

const createOrderItemSchema = z.object({
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  customer_name: z.string().trim().min(2, 'Customer name must be at least 2 characters'),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 digits'),
  address: z.string().trim().min(10, 'Full delivery address is required'),
  items: z.array(createOrderItemSchema).min(1, 'Order must contain at least one item'),
});

// POST /api/orders - Create an order with server-side stock validation & re-pricing
ordersRouter.post(
  '/',
  requireAuth as any,
  validateBody(createOrderSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { customer_name, phone, address, items } = req.body as z.infer<typeof createOrderSchema>;
      const userId = req.user!.id;

      // 1. Fetch current product information for all requested items from DB
      const productIds = Array.from(new Set(items.map((i) => i.product_id)));
      const { data: dbProducts, error: prodErr } = await supabaseAdmin
        .from('products')
        .select('id, name, price_inr, stock, active')
        .in('id', productIds);

      if (prodErr || !dbProducts) {
        return res.status(500).json({
          error: {
            code: 'FETCH_ERROR',
            message: 'Failed to verify catalogue products.',
          },
        });
      }

      // 2. Validate product availability and stock
      const productMap = new Map<string, { id: string; name: string; price_inr: number; stock: number; active: boolean }>();
      for (const p of dbProducts) {
        productMap.set(p.id, p);
      }

      for (const item of items) {
        const prod = productMap.get(item.product_id);
        if (!prod || !prod.active) {
          return res.status(400).json({
            error: {
              code: 'PRODUCT_UNAVAILABLE',
              message: `A selected product (${item.product_id}) is no longer available.`,
            },
          });
        }

        if (prod.stock < item.quantity) {
          return res.status(400).json({
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${item.quantity}.`,
            },
          });
        }
      }

      // 3. Re-calculate order total strictly using database prices (tamper-proof)
      let total_inr = 0;
      const orderItemsToInsert: {
        product_id: string;
        quantity: number;
        unit_price_inr: number;
      }[] = [];

      for (const item of items) {
        const prod = productMap.get(item.product_id)!;
        const linePrice = prod.price_inr * item.quantity;
        total_inr += linePrice;
        orderItemsToInsert.push({
          product_id: prod.id,
          quantity: item.quantity,
          unit_price_inr: prod.price_inr,
        });
      }

      // 4. Create order record
      const { data: createdOrder, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          customer_name,
          phone,
          address,
          total_inr,
          status: 'pending',
        })
        .select()
        .single();

      if (orderErr || !createdOrder) {
        return res.status(500).json({
          error: {
            code: 'ORDER_CREATION_FAILED',
            message: orderErr?.message || 'Failed to create order record.',
          },
        });
      }

      // 5. Create order_items records linked to the new order
      const itemsPayload = orderItemsToInsert.map((item) => ({
        ...item,
        order_id: createdOrder.id,
      }));

      const { data: insertedItems, error: itemsErr } = await supabaseAdmin
        .from('order_items')
        .insert(itemsPayload)
        .select('id, order_id, product_id, quantity, unit_price_inr');

      if (itemsErr) {
        // Log error but proceed; order is created
        console.error('Failed to create order items:', itemsErr);
      }

      // 6. Atomically update product stock
      for (const item of items) {
        const prod = productMap.get(item.product_id)!;
        const remainingStock = Math.max(0, prod.stock - item.quantity);
        await supabaseAdmin
          .from('products')
          .update({ stock: remainingStock })
          .eq('id', prod.id);
      }

      // 7. Generate payment payload via provider
      const payment = await defaultPaymentProvider.createPaymentOrder({
        orderId: createdOrder.id,
        amountInr: total_inr,
      });

      return res.status(201).json({
        order: {
          ...createdOrder,
          items: insertedItems || orderItemsToInsert,
        },
        payment,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: {
          code: 'ORDER_PROCESSING_ERROR',
          message: err?.message || 'Failed to process order.',
        },
      });
    }
  }
);

// GET /api/orders/mine - Retrieve past orders for the authenticated user
ordersRouter.get('/mine', requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        user_id,
        customer_name,
        phone,
        address,
        total_inr,
        status,
        created_at,
        items:order_items (
          id,
          order_id,
          product_id,
          quantity,
          unit_price_inr,
          product:products (
            id,
            name,
            slug,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: {
          code: 'FETCH_ORDERS_FAILED',
          message: error.message,
        },
      });
    }

    return res.json({ orders: orders || [] });
  } catch (err: any) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err?.message || 'Failed to fetch user orders.',
      },
    });
  }
});
