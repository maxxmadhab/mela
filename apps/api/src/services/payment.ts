export interface CreatePaymentParams {
  orderId: string;
  amountInr: number;
  currency?: string;
  receipt?: string;
}

export interface PaymentOrderResult {
  paymentOrderId: string;
  amountInr: number;
  currency: string;
  provider: 'mock' | 'razorpay';
  keyId?: string;
}

export interface PaymentProvider {
  createPaymentOrder(params: CreatePaymentParams): Promise<PaymentOrderResult>;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPaymentOrder(params: CreatePaymentParams): Promise<PaymentOrderResult> {
    return {
      paymentOrderId: `pay_mock_${params.orderId.replace(/-/g, '').slice(0, 12)}`,
      amountInr: params.amountInr,
      currency: params.currency || 'INR',
      provider: 'mock',
    };
  }

  async verifyPaymentSignature(_orderId: string, _paymentId: string, _signature: string): Promise<boolean> {
    return true;
  }
}

export const defaultPaymentProvider = new MockPaymentProvider();
