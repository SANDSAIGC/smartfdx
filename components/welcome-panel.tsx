"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import { useUser, getUserDisplayName, getTimeGreeting } from "@/lib/contexts/user-context";

interface WelcomePanelProps {
  className?: string;
}

export function WelcomePanel({ className }: WelcomePanelProps) {
  const { user } = useUser();
  const currentTime = new Date();

  // 获取用户显示名称和问候语
  const greeting = getTimeGreeting();
  const userDisplayName = getUserDisplayName(user);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {greeting}，
            </h3>
            <p className="text-lg font-semibold">
              {userDisplayName}
            </p>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{currentTime.toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{currentTime.toLocaleTimeString('zh-CN', { hour12: false })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
