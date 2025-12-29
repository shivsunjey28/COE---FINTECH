# Database Fix Instructions

## Issue
The "Add Student" feature is failing because the database is missing an INSERT policy for the `students` table. This prevents adding new students due to Row-Level Security (RLS) restrictions.

## Solution
You need to add an INSERT policy to allow admins to add students. Here are two ways to fix this:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/irgsdtpvoilhhvbpuxpg
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the following SQL:

```sql
CREATE POLICY "Admins can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

5. Click **Run** to execute the query
6. Refresh your application and try adding a student again

### Option 2: Via Migration File (Already Created)

I've created a migration file at:
`supabase/migrations/20251224_add_student_insert_policy.sql`

To apply it:
1. Install Supabase CLI if you haven't: `npm install -g supabase`
2. Link your project: `npx supabase link --project-ref irgsdtpvoilhhvbpuxpg`
3. Push the migration: `npx supabase db push`

## What This Does
This policy allows users with the 'admin' role to insert new student records into the database while maintaining security for other users.
