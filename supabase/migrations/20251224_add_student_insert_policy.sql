-- Add INSERT policy for students table to allow admins to add students
CREATE POLICY "Admins can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
