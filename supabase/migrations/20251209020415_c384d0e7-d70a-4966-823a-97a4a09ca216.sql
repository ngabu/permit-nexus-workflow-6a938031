-- Add RLS policy for revenue staff to delete invoices created from revenue dashboard
CREATE POLICY "Revenue staff can delete revenue invoices"
ON public.invoices
FOR DELETE
USING (
  source_dashboard = 'revenue' 
  AND (is_revenue_staff_user() OR is_admin_or_super_admin_user())
);