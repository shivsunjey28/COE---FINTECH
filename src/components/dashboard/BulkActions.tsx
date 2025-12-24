import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Zap, CheckCheck, XCircle, Download, Loader2 } from 'lucide-react';
import { AttendanceStatus } from '@/lib/types';

interface BulkActionsProps {
    studentCount: number;
    onMarkAll: (status: AttendanceStatus) => Promise<void>;
    onExport: () => void;
    disabled?: boolean;
}

export function BulkActions({ studentCount, onMarkAll, onExport, disabled }: BulkActionsProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ status: AttendanceStatus; label: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBulkAction = (status: AttendanceStatus, label: string) => {
        setPendingAction({ status, label });
        setShowConfirmDialog(true);
    };

    const confirmBulkAction = async () => {
        if (!pendingAction) return;

        setIsProcessing(true);
        try {
            await onMarkAll(pendingAction.status);
            setShowConfirmDialog(false);
            setPendingAction(null);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                        disabled={disabled || studentCount === 0}
                    >
                        <Zap className="w-4 h-4" />
                        Quick Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Bulk Attendance</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => handleBulkAction('present', 'Mark All as Present')}
                        className="gap-2 cursor-pointer"
                    >
                        <CheckCheck className="w-4 h-4 text-success" />
                        <span>Mark All as Present</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleBulkAction('absent', 'Mark All as Absent')}
                        className="gap-2 cursor-pointer"
                    >
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span>Mark All as Absent</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onExport} className="gap-2 cursor-pointer">
                        <Download className="w-4 h-4" />
                        <span>Export Attendance</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction && (
                                <>
                                    Are you sure you want to <strong>{pendingAction.label.toLowerCase()}</strong>?
                                    <br />
                                    <br />
                                    This will affect <strong>{studentCount} students</strong> and cannot be undone.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBulkAction} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
