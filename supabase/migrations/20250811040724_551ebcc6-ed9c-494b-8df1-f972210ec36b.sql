-- Create trigger to handle permit application submissions
CREATE OR REPLACE TRIGGER trigger_handle_new_submission
  AFTER UPDATE ON public.permit_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_submission();