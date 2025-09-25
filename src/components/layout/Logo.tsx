import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <BrainCircuit className="h-7 w-7 text-primary" />
      <span className="font-headline text-xl font-bold text-foreground">
        KnowledgeVerse
      </span>
    </div>
  );
}
