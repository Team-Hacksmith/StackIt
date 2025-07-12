"use client";

import { useNotifications, useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const hasUnread = notifications?.data?.some(n => !n.is_read);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {hasUnread && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            disabled={markAllAsRead.isPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications?.data?.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No notifications to show
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications?.data?.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${
                !notification.is_read ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex flex-col space-y-2">
                <p className={`${!notification.is_read ? "font-medium" : "text-gray-600"}`}>
                  {notification.message}
                </p>
                {notification.created_at && (
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at))} ago
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
