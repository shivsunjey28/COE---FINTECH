-- Ensure INSERT policy exists for students table
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;

-- Create INSERT policy for students table to allow admins to add students
CREATE POLICY "Admins can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also add UPDATE and DELETE policies for students if they don't exist
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
CREATE POLICY "Admins can update students"
ON public.students FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can delete students"
ON public.students FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
