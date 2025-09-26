'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Link as LinkIcon, ExternalLink, Copy } from 'lucide-react';
import type { KnowledgeEntry, Tag } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ViewEntryDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: KnowledgeEntry;
};

const getTagClasses = (tag: Tag): string => {
    switch (tag) {
        case 'Important':
            return 'border-red-500/40 bg-red-900/50 text-red-300 hover:bg-red-900/80';
        case 'To Do Research On':
            return 'border-yellow-500/40 bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/80';
        case 'Learning':
            return 'border-blue-500/40 bg-blue-900/50 text-blue-300 hover:bg-blue-900/80';
        case 'AI':
            return 'border-purple-500/40 bg-purple-900/50 text-purple-300 hover:bg-purple-900/80';
        case 'Investing':
            return 'border-green-500/40 bg-green-900/50 text-green-300 hover:bg-green-900/80';
        default:
            return 'border-accent/30 bg-accent/20 text-accent-foreground hover:bg-accent/30';
    }
}

export default function ViewEntryDialog({ isOpen, setIsOpen, entry }: ViewEntryDialogProps) {
  const Icon = entry.contentType === 'TEXT' ? FileText : LinkIcon;
  const timeAgo = formatDistanceToNow(entry.createdAt, { addSuffix: true });
  const { toast } = useToast();

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(entry.textForEmbedding);
      toast({
        title: 'Content Copied',
        description: 'The content has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy content to clipboard.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Icon className="h-6 w-6" />
            {entry.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Added {timeAgo}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Content</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="flex items-center gap-2"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <div className="rounded-md border bg-muted/30 p-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-foreground whitespace-pre-wrap select-text leading-relaxed">
                {entry.textForEmbedding}
              </p>
            </div>
          </div>

          {/* URL if it's a link */}
          {entry.contentType === 'URL' && entry.url && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">URL</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(entry.url, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Link
                </Button>
                <span className="text-xs text-muted-foreground truncate select-text">
                  {entry.url}
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <Badge key={tag} variant="outline" className={cn(getTagClasses(tag))}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}