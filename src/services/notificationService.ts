
// This is a simplified notification service for the web
// In a real Android app, you would use Firebase Cloud Messaging or similar

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'reminder' | 'update' | 'info';
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  constructor() {
    // In a real app, you'd initialize from storage
    this.loadFromStorage();
    
    // Set up background checking
    setInterval(() => this.checkReminders(), 60000);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  addReminder(
    caseId: string, 
    caseNumber: string, 
    reminderDate: Date, 
    courtName: string
  ) {
    const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      title: `Reminder: Case ${caseNumber}`,
      message: `You have a hearing for case ${caseNumber} at ${courtName} on ${reminderDate.toLocaleDateString()}.`,
      timestamp: reminderDate.getTime(),
      read: false,
      type: 'reminder'
    };

    this.notifications.push(notification);
    this.saveToStorage();
    this.notifyListeners();
    
    return id;
  }

  addNotification(title: string, message: string, type: 'update' | 'info' = 'info') {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      type
    };

    this.notifications.push(notification);
    this.saveToStorage();
    this.notifyListeners();
    
    // Show browser notification if permission granted
    this.showBrowserNotification(title, message);
    
    return id;
  }

  private checkReminders() {
    const now = Date.now();
    const reminderNotifications = this.notifications.filter(
      n => n.type === 'reminder' && n.timestamp > now && n.timestamp - now <= 24 * 60 * 60 * 1000 // Within 24 hours
    );
    
    reminderNotifications.forEach(notification => {
      if (!notification.read) {
        this.showBrowserNotification(notification.title, notification.message);
      }
    });
  }

  private showBrowserNotification(title: string, message: string) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body: message });
          }
        });
      }
    }
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const notifications = this.getNotifications();
    this.listeners.forEach(listener => listener(notifications));
  }
}

export const notificationService = new NotificationService();
