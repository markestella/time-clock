'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageWithRelations } from './AdminDashboardClient';

interface Props {
  messages: MessageWithRelations[];
  onViewMessage: (message: MessageWithRelations) => void;
}

export function RecentMessages({ messages, onViewMessage }: Props) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Clock-Out Messages</CardTitle>
        <CardDescription>Click a message to read and respond.</CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground">No new messages.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div 
                key={message.id}
                onClick={() => onViewMessage(message)}
                className="flex items-start space-x-4 p-2 rounded-lg hover:bg-accent cursor-pointer"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{message.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1.5 flex-1">
                  <p className="text-sm font-semibold leading-none">{message.user.username}</p>
                  <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                </div>
                {message._count.questions > 0 && (
                  <div className="flex items-center h-full">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">{message._count.questions}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}