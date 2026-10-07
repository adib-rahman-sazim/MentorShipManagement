export interface IMentorshipGraphToolbarProps {
  canCreateDraft: boolean;
  canReadDrafts: boolean;
  onNewDraft: () => void;
  onOpenDraft: (draftId: string) => void;
}
