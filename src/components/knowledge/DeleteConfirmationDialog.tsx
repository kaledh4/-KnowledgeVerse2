'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import type { KnowledgeEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ApiClient } from '@/lib/api-client';
import { Spinner } from '../ui/spinner';

type DeleteConfirmationDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: KnowledgeEntry;
  onSuccess: () => void;
};

export default function DeleteConfirmationDialog({
  isOpen,
  setIsOpen,
  entry,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await ApiClient.deleteKnowledgeEntry(entry.id);
      toast({
        title: 'Entry Deleted',
        description: 'The entry has been removed from your vault.',
      });
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the entry. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the entry
            <span className="font-semibold text-foreground"> "{entry.title}" </span> 
            and remove its data from all synchronized services.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Button variant="destructive">
              {isLoading && <Spinner className="mr-2" />}
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
