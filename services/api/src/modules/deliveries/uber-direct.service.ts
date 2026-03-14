import { Injectable, Logger } from '@nestjs/common';

export interface UberDeliveryRequest {
  pickup: { name: string; address: string; phone: string };
  dropoff: { name: string; address: string; phone: string };
  items: { name: string; quantity: number; price: number }[];
  apiKey: string;
}

/**
 * Uber Direct API integration.
 * Each restaurant provides their own Uber Fleet API key (stored encrypted on the location).
 */
@Injectable()
export class UberDirectService {
  private readonly logger = new Logger(UberDirectService.name);
  private readonly baseUrl = 'https://api.uber.com/v1/deliveries';

  async createDelivery(req: UberDeliveryRequest) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${req.apiKey}`,
      },
      body: JSON.stringify({
        pickup: req.pickup,
        dropoff: req.dropoff,
        items: req.items,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      this.logger.error(`Uber Direct error: ${response.status} ${text}`);
      throw new Error(`Uber Direct API error: ${response.status}`);
    }

    return response.json();
  }

  async getDeliveryStatus(deliveryId: string, apiKey: string) {
    const response = await fetch(`${this.baseUrl}/${deliveryId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) throw new Error(`Uber Direct status error: ${response.status}`);
    return response.json();
  }

  async cancelDelivery(deliveryId: string, apiKey: string) {
    const response = await fetch(`${this.baseUrl}/${deliveryId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) throw new Error(`Uber Direct cancel error: ${response.status}`);
    return response.json();
  }
}
