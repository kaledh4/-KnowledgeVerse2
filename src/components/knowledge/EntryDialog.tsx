'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EntryForm from './EntryForm';
import type { KnowledgeEntry } from '@/lib/types';

type EntryDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry?: KnowledgeEntry;
  onSuccess: () => void;
};

export default function EntryDialog({ isOpen, setIsOpen, entry, onSuccess }: EntryDialogProps) {
  
  const handleSuccess = () => {
    onSuccess();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">
            {entry ? 'Edit Knowledge' : 'Add to Vault'}
          </DialogTitle>
          <DialogDescription>
            {entry ? 'Update the details of this entry.' : 'Paste text or a URL to add a new piece of knowledge.'}
          </DialogDescription>
        </DialogHeader>
        <EntryForm 
          entry={entry} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
