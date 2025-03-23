
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, CheckCircle, Clock, Info } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";
import { PageTransition } from "@/components/PageTransition";
import { notificationService } from "@/services/notificationService";
import { staggeredListVariants, listItemVariants } from "@/utils/animations";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'reminder' | 'update' | 'info';
}

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(newNotifications => {
      setNotifications(newNotifications.sort((a, b) => b.timestamp - a.timestamp));
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };
  
  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };
  
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-5 w-5 text-neon-blue" />;
      case 'update':
        return <Info className="h-5 w-5 text-neon-purple" />;
      case 'info':
      default:
        return <Bell className="h-5 w-5 text-neon-pink" />;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <NeonButton
                variant="blue"
                size="sm"
                onClick={() => navigate("/home")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </NeonButton>
              <h1 className="text-2xl font-bold neon-text text-neon-blue">Notifications</h1>
            </div>
            
            {notifications.length > 0 && (
              <NeonButton
                variant="blue"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark all as read
              </NeonButton>
            )}
          </header>
          
          {notifications.length > 0 ? (
            <motion.div
              className="space-y-4"
              variants={staggeredListVariants}
              initial="hidden"
              animate="visible"
            >
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={listItemVariants}
                  className={`glass-card p-4 rounded-lg border transition-all duration-300 ${
                    notification.read
                      ? "border-gray-700 opacity-70"
                      : "border-neon-blue"
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{notification.title}</h3>
                        <span className="text-xs text-gray-400">
                          {getRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="glass-card p-8 rounded-lg border border-gray-700 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-medium mb-2">No Notifications</h3>
              <p className="text-gray-400">
                You don't have any notifications yet. When you add cases or set reminders, 
                they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Notifications;
