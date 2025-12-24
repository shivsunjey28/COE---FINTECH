import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AddStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStudentAdded: () => void;
}

export function AddStudentDialog({ open, onOpenChange, onStudentAdded }: AddStudentDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        register_number: '',
        department: '',
        hostel_or_dayscolar: '',
        section: '',
        email: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.register_number || !formData.department || !formData.hostel_or_dayscolar) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.from('students').insert({
                name: formData.name,
                register_number: formData.register_number,
                department: formData.department,
                hostel_or_dayscolar: formData.hostel_or_dayscolar,
                email: formData.email || `${formData.register_number}@student.edu`,
            });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Student added successfully',
            });

            // Reset form
            setFormData({
                name: '',
                register_number: '',
                department: '',
                hostel_or_dayscolar: '',
                section: '',
                email: '',
            });

            onStudentAdded();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add student',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                        Enter the student details below. All fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Student Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Student Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter student name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Register Number */}
                        <div className="grid gap-2">
                            <Label htmlFor="register_number">
                                Roll Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="register_number"
                                placeholder="Enter roll number"
                                value={formData.register_number}
                                onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Department */}
                        <div className="grid gap-2">
                            <Label htmlFor="department">
                                Department <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.department}
                                onValueChange={(value) => setFormData({ ...formData, department: value })}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSE">CSE - Computer Science</SelectItem>
                                    <SelectItem value="AIML">AIML - AI & Machine Learning</SelectItem>
                                    <SelectItem value="ECE">ECE - Electronics</SelectItem>
                                    <SelectItem value="EEE">EEE - Electrical</SelectItem>
                                    <SelectItem value="MECH">MECH - Mechanical</SelectItem>
                                    <SelectItem value="CIVIL">CIVIL - Civil Engineering</SelectItem>
                                    <SelectItem value="IT">IT - Information Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section */}
                        <div className="grid gap-2">
                            <Label htmlFor="section">Section</Label>
                            <Input
                                id="section"
                                placeholder="Enter section (e.g., A, B, C)"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Hostel/Dayscholar */}
                        <div className="grid gap-2">
                            <Label htmlFor="hostel_or_dayscolar">
                                Type <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.hostel_or_dayscolar}
                                onValueChange={(value) => setFormData({ ...formData, hostel_or_dayscolar: value })}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="hostel_or_dayscolar">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hostel">Hostel</SelectItem>
                                    <SelectItem value="Dayscholar">Dayscholar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Email (Optional) */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Student
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
