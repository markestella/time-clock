'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function QuoteManager() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (date) {
      setIsLoading(true);
      const dateString = format(date, 'yyyy-MM-dd');
      fetch(`/api/admin/quote?date=${dateString}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setQuote(data.quote);
            setAuthor(data.author);
          } else {
            setQuote('');
            setAuthor('');
          }
        }).finally(() => setIsLoading(false));
    }
  }, [date]);
  
  const handleSave = async () => {
    if (!date || !quote || !author) {
      toast.error("Please select a date and fill out both quote and author fields.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, quote, author }),
      });
      if (res.ok) {
        toast.success(`Quote for ${format(date, 'MMMM dd')} has been saved!`);
      } else {
        throw new Error("Failed to save quote");
      }
    } catch (error) {
      toast.error("An error occurred while saving the quote.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quote of the Day Manager</CardTitle>
        <CardDescription>Select a date to add or update its quote.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote-text">Quote</Label>
            <Input id="quote-text" placeholder="The only way to do great work..." value={quote} onChange={(e) => setQuote(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="quote-author">Author</Label>
            <Input id="quote-author" placeholder="Steve Jobs" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}