UPDATE intent_registrations 
SET status = 'approved', updated_at = now() 
WHERE status = 'pending'