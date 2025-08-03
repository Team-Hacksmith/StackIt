"use client";

import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/services/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail } from "lucide-react";

interface UserProfileProps {
  userId: number;
}

export function UserProfile({ userId }: UserProfileProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersAPI.getUser(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !user?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">User not found.</p>
      </div>
    );
  }

  const userData = user.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-2xl">
                {userData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-600">@{userData.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">
                  {userData.karma || 0} reputation
                </Badge>
                <Badge
                  variant={userData.role === "admin" ? "default" : "outline"}
                >
                  {userData.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{userData.email}</span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm capitalize">{userData.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Activity</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This user&apos;s recent activity will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
