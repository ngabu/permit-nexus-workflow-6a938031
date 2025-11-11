/**
 * Browser Push Notification Service
 * Handles browser push notifications for important user events
 */

export type NotificationPermission = 'default' | 'granted' | 'denied';

interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

class BrowserNotificationService {
  private static instance: BrowserNotificationService;
  private enabled: boolean = false;

  private constructor() {
    // Check if notifications are supported
    if ('Notification' in window) {
      this.enabled = localStorage.getItem('browserNotificationsEnabled') === 'true';
    }
  }

  static getInstance(): BrowserNotificationService {
    if (!BrowserNotificationService.instance) {
      BrowserNotificationService.instance = new BrowserNotificationService();
    }
    return BrowserNotificationService.instance;
  }

  /**
   * Check if browser notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current notification permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Browser notifications not supported');
      return 'denied';
    }

    if (this.getPermission() === 'granted') {
      this.setEnabled(true);
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.setEnabled(true);
      }
      return permission as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Enable browser notifications
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('browserNotificationsEnabled', String(enabled));
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.getPermission() === 'granted';
  }

  /**
   * Show a browser notification
   */
  async show(options: BrowserNotificationOptions): Promise<void> {
    if (!this.isEnabled()) {
      console.log('Browser notifications not enabled');
      return;
    }

    try {
      // Don't show notification if the page is visible
      if (document.visibilityState === 'visible') {
        console.log('Page is visible, skipping browser notification');
        return;
      }

      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/lovable-uploads/1c17e20d-e536-4799-8b20-f3c776c58b25.png',
        badge: options.badge || '/lovable-uploads/1c17e20d-e536-4799-8b20-f3c776c58b25.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Auto-close after 5 seconds if not require interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  /**
   * Show notification for specific event types
   */
  async showForNotification(type: string, title: string, message: string): Promise<void> {
    const notificationOptions: BrowserNotificationOptions = {
      title,
      body: message,
      tag: type,
    };

    // Customize based on notification type
    switch (type) {
      case 'registry_assessment_passed':
      case 'assessment_passed':
      case 'application_approved':
        notificationOptions.requireInteraction = true;
        break;
      
      case 'registry_assessment_failed':
      case 'assessment_failed':
      case 'application_rejected':
        notificationOptions.requireInteraction = true;
        break;
      
      case 'registry_clarification_required':
      case 'clarification_required':
      case 'technical_clarification_required':
        notificationOptions.requireInteraction = true;
        break;
      
      default:
        notificationOptions.requireInteraction = false;
    }

    await this.show(notificationOptions);
  }
}

// Export singleton instance
export const browserNotifications = BrowserNotificationService.getInstance();
