'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Link as LinkIcon, FileText } from 'lucide-react';
import type { KnowledgeEntry, Tag } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import EntryDialog from './EntryDialog';
import ViewEntryDialog from './ViewEntryDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { cn } from '@/lib/utils';

type KnowledgeCardProps = {
  entry: KnowledgeEntry;
  onUpdate: () => void;
  onDelete: () => void;
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

export default function KnowledgeCard({ entry, onUpdate, onDelete }: KnowledgeCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const Icon = entry.contentType === 'TEXT' ? FileText : LinkIcon;
  const timeAgo = formatDistanceToNow(entry.createdAt, { addSuffix: true });

  const handleCardClick = () => {
    setIsViewDialogOpen(true);
  };

  return (
    <>
      <EntryDialog 
        isOpen={isEditDialogOpen} 
        setIsOpen={setIsEditDialogOpen} 
        entry={entry}
        onSuccess={onUpdate}
      />
      <ViewEntryDialog 
        isOpen={isViewDialogOpen} 
        setIsOpen={setIsViewDialogOpen} 
        entry={entry}
      />
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entry={entry}
        onSuccess={onDelete}
      />
      <Card 
        className="flex h-full transform-gpu flex-col bg-card/70 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="font-headline text-lg font-bold leading-tight line-clamp-2">
              {entry.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDialogOpen(true);
                }}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="flex items-center pt-1 text-xs text-muted-foreground">
            <Icon className="mr-2 h-3 w-3" />
            <span>Added {timeAgo}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-foreground/80 line-clamp-3">
            {entry.textForEmbedding}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
              <Badge key={tag} variant="outline" className={cn(getTagClasses(tag))}>
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
