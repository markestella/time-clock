'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '../auth/SignOutButton';
import { LogIn, LogOut, Coffee, User, Briefcase, History } from 'lucide-react';
import Link from 'next/link';
import { ClockEvent } from '@prisma/client';

interface UserDashboardClientProps {
  user: Session['user'];
  initialLastEvent: string | undefined;
  activityLog: ClockEvent[]; 
}

const getActivityDetails = (type: string) => {
  switch (type) {
    case 'IN':
      return { text: 'Clocked In', Icon: LogIn };
    case 'OUT':
      return { text: 'Clocked Out', Icon: LogOut };
    case 'BREAK_START':
      return { text: 'Started Break', Icon: Coffee };
    case 'BREAK_END':
      return { text: 'Ended Break', Icon: Briefcase };
    default:
      return { text: 'Unknown', Icon: History };
  }
};

export function UserDashboardClient({ user, initialLastEvent, activityLog }: UserDashboardClientProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastEvent, setLastEvent] = useState(initialLastEvent);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockAction = async (type: string, clockOutMessage?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: clockOutMessage }),
      });

      if (!res.ok) throw new Error('Action failed');

      toast.success(`Successfully Clocked ${type.replace('_', ' ').toLowerCase()}!`);

      if (type === 'BREAK_END') {
        setLastEvent('IN');
      } else {
        setLastEvent(type);
      }

      if (isDialogOpen) setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = () => {
    switch (lastEvent) {
      case 'IN':
      case 'BREAK_END':
        return { text: 'Clocked In', color: 'text-green-500' };
      case 'BREAK_START':
        return { text: 'On Break', color: 'text-yellow-500' };
      default:
        return { text: 'Clocked Out', color: 'text-red-500' };
    }
  };

  const statusInfo = getStatusInfo();

  const isCurrentlyWorking = lastEvent === 'IN' || lastEvent === 'BREAK_END';

  const showClockIn = !lastEvent || lastEvent === 'OUT';
  const showClockOut = isCurrentlyWorking;
  const showBreakStart = isCurrentlyWorking;
  const showBreakEnd = lastEvent === 'BREAK_START';

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground">Davao City, Philippines</p>
        </div>
        <SignOutButton />
      </div>

      <Card className="w-full text-center mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Your Current Status</CardTitle>
          <CardDescription className={`text-xl font-bold ${statusInfo.color}`}>
            {statusInfo.text}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-semibold font-mono tracking-wider">
            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
          </p>
          <p className="text-muted-foreground mt-2">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Control Panel</CardTitle>
          <CardDescription>Manage your time and breaks here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {showClockIn && (
              <Button onClick={() => handleClockAction('IN')} disabled={isLoading} size="lg">
                <LogIn className="mr-2 h-4 w-4" /> Clock In
              </Button>
            )}

            {showClockOut && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="lg">
                    <LogOut className="mr-2 h-4 w-4" /> Clock Out
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Daily Summary</DialogTitle>
                  </DialogHeader>
                  <Textarea placeholder="Enter a brief summary of what you did today..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                  <Button onClick={() => handleClockAction('OUT', message)} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Confirm Clock Out'}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
            
            {showBreakStart && (
              <Button onClick={() => handleClockAction('BREAK_START')} disabled={isLoading} variant="secondary">
                <Coffee className="mr-2 h-4 w-4" /> Start Break
              </Button>
            )}
            
            {showBreakEnd && (
              <Button onClick={() => handleClockAction('BREAK_END')} disabled={isLoading} variant="outline">
                <Briefcase className="mr-2 h-4 w-4" /> End Break
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your last 10 time clock events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLog.length > 0 ? (
              activityLog.map((event) => {
                const { text, Icon } = getActivityDetails(event.type);
                return (
                  <div key={event.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
                      <p className="font-medium">{text}</p>
                    </div>
                    <p className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">
                No activity to show yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}