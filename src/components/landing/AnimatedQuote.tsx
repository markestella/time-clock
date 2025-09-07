'use client';

interface AnimatedQuoteProps {
  quote: {
    quote: string;
    author: string;
  };
}

export function AnimatedQuote({ quote }: AnimatedQuoteProps) {
  return (
    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <blockquote className="text-lg md:text-xl lg:text-2xl font-medium">
        “{quote.quote}”
      </blockquote>
      <p className="mt-4 text-muted-foreground">— {quote.author}</p>
    </div>
  );
}