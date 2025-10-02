import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  static subscribeToOrders(clientId: string, callback: (payload: any) => void): () => void {
    const channelName = `orders:${clientId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('Order update received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  static subscribeToInvoices(clientId: string, callback: (payload: any) => void): () => void {
    const channelName = `invoices:${clientId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('Invoice update received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Invoices subscription status:', status);
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  static subscribeToServices(callback: (payload: any) => void): () => void {
    const channelName = 'services:public';
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log('Services update received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Services subscription status:', status);
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  static subscribeToPaymentStatus(clientId: string, callback: (payload: any) => void): () => void {
    const channelName = `payment_status:${clientId}`;
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          // Only trigger callback for status changes
          if (payload.new.status !== payload.old?.status) {
            console.log('Payment status update:', payload);
            callback(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log('Payment status subscription status:', status);
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  static unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  // Notification system for real-time updates
  static showNotification(title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
    // Dispatch custom event for notification component
    const event = new CustomEvent('realtime-notification', {
      detail: { title, message, type }
    });
    window.dispatchEvent(event);
  }
}