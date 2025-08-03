"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import {
  useMarkAllNotificationsAsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { Bell, Check, LogOut, Plus, User } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const { data: user } = useMe();
  const { data: notifications } = useNotifications();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const logout = useLogout();

  const unreadCount =
    notifications?.data?.filter((n) => !n.is_read).length || 0;

  const handleLogout = () => {
    logout.mutate();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              StackIt
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Questions
              </Link>
              <Link href="/tags" className="text-gray-700 hover:text-gray-900">
                Tags
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user?.data ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/posts/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={handleMarkAllAsRead}
                            disabled={markAllAsRead.isPending}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark all as read
                          </Button>
                        )}
                      </div>
                      {notifications?.data?.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-2">
                          No notifications
                        </p>
                      ) : (
                        <>
                          <div className="space-y-2 mt-2">
                            {notifications?.data
                              ?.slice(0, 5)
                              .map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`p-2 rounded text-sm ${
                                    notification.is_read
                                      ? "text-gray-600"
                                      : "text-gray-900 bg-blue-50"
                                  }`}
                                >
                                  {notification.message}
                                </div>
                              ))}
                          </div>
                          {(notifications?.data?.length || 0) > 5 && (
                            <div className="mt-2 pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-sm"
                                asChild
                              >
                                <Link href="/notifications">
                                  View all notifications
                                </Link>
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {user.data.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block">
                        {user.data.username}
                      </span>
                      <Badge variant="secondary" className="hidden md:block">
                        {user.data.karma || 0}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.data.id}`}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
