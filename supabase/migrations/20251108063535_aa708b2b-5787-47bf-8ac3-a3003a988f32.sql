-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Ensure the table is in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;