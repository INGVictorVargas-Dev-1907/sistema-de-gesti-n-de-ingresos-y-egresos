import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AlertConfirmationDialogProps {
    title?: string;
    description?: string;
    onConfirm: () => void;
    trigger: React.ReactNode;
}

export function AlertConfirmationDialog({
    title = '¿Estás seguro?',
    description = 'Esta acción no se puede deshacer.',
    onConfirm,
    trigger,
}: AlertConfirmationDialogProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirm}>Eliminar</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}