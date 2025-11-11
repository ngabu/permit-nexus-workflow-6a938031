-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.manager_notifications 
DROP CONSTRAINT IF EXISTS fk_related_id;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE public.manager_notifications 
ADD CONSTRAINT fk_related_id 
FOREIGN KEY (related_id) 
REFERENCES public.permit_applications(id) 
ON DELETE CASCADE;