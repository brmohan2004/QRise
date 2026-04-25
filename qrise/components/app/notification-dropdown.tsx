"use client";

import { useState } from "react";
import { Bell, Check, Clock, Info, Shield, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type NotificationType = "info" | "success" | "warning" | "error" | "feature";

interface Notification {
  id: string;
  title: string;
  message: string;
  detail: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New Feature: Form Studio",
    message: "Create beautiful forms and collect responses directly from your QR codes.",
    detail: "We've just launched Form Studio! Now you can create custom forms, surveys, and contact sheets. Link them to your dynamic QR codes and track responses in real-time. This feature is included in all premium plans.",
    type: "feature",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
  },
  {
    id: "2",
    title: "QR Code Scan Alert",
    message: "Your 'Marketing Campaign' QR code just reached 1,000 scans!",
    detail: "Congratulations! Your QR code 'Marketing Campaign' has reached a milestone of 1,000 scans. Check your analytics dashboard to see detailed insights about your audience, including location and device types.",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    title: "Security Update",
    message: "We've added two-factor authentication to your account settings.",
    detail: "To keep your account secure, we've implemented two-factor authentication (2FA). You can now enable it in your account settings under the Security tab. We highly recommend all users to enable this feature.",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
    
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <Info className="h-4 w-4 text-amber-500" />;
      case "error":
        return <Info className="h-4 w-4 text-rose-500" />;
      case "feature":
        return <Zap className="h-4 w-4 text-indigo-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 text-emerald-500";
      case "warning":
        return "bg-amber-500/10 text-amber-500";
      case "error":
        return "bg-rose-500/10 text-rose-500";
      case "feature":
        return "bg-indigo-500/10 text-indigo-500";
      default:
        return "bg-blue-500/10 text-blue-500";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="relative flex items-center justify-center h-10 w-10 rounded-xl hover:bg-muted/50 transition-all outline-none text-muted-foreground hover:text-foreground border border-transparent hover:border-muted-foreground/10 group"
          aria-label={`View ${unreadCount} notifications`}
        >
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" aria-hidden="true" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-[380px] p-0 overflow-hidden rounded-xl border-muted/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="p-4 flex items-center justify-between bg-muted/30 border-b border-muted/20">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}
                className="text-xs h-7 px-2 hover:bg-primary/10 hover:text-primary font-bold"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="max-h-[450px] overflow-y-auto py-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <Bell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-4 p-4 cursor-pointer focus:bg-muted/50 transition-all border-l-2",
                    notification.read ? "border-transparent opacity-70" : "border-primary bg-primary/5 focus:border-primary"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm",
                    getTypeStyles(notification.type)
                  )}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-bold truncate", !notification.read && "text-foreground")}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
          <DropdownMenuSeparator className="m-0" />
          <div className="p-3 bg-muted/30">
            <Button variant="ghost" className="w-full text-xs font-bold h-9 hover:bg-primary/10 hover:text-primary transition-all">
              View all activity
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 border-none shadow-2xl rounded-2xl">
          {selectedNotification && (
            <>
              <div className={cn(
                "h-2 w-full",
                getTypeStyles(selectedNotification.type)
              )} />
              <div className="p-8">
                <DialogHeader className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      getTypeStyles(selectedNotification.type)
                    )}>
                      {getTypeIcon(selectedNotification.type)}
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full",
                      getTypeStyles(selectedNotification.type)
                    )}>
                      {selectedNotification.type}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                    {selectedNotification.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {selectedNotification.timestamp.toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="bg-muted/30 rounded-xl p-5 border border-muted/20 mb-8">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedNotification.detail}
                  </p>
                </div>

                <DialogFooter>
                  <Button 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full h-11 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    Got it, thanks!
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
