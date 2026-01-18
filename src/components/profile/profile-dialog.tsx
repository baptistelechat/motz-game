import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileForm } from "@/components/profile/profile-form";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 w-full h-full max-w-none md:max-w-md md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden gap-0"
      >
        <DialogHeader className="p-6 pb-0 shrink-0">
          <DialogTitle className="font-display text-theme text-xl text-center">
            MON PROFIL
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ProfileForm onSaved={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
