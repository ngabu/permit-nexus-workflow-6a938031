-- Create function to handle assessment status changes and send notifications
CREATE OR REPLACE FUNCTION handle_assessment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    application_record RECORD;
    notification_title TEXT;
    notification_message TEXT;
    application_status TEXT;
BEGIN
    -- Get the permit application details
    SELECT pa.*, u.email as user_email
    INTO application_record
    FROM permit_applications pa
    JOIN auth.users u ON u.id = pa.user_id
    WHERE pa.id = NEW.permit_application_id;

    -- Determine notification content and application status based on assessment status
    CASE NEW.assessment_status
        WHEN 'passed' THEN
            notification_title := 'Assessment Passed - Application Proceeding';
            notification_message := 'Your permit application "' || application_record.title || '" has passed the initial assessment and is proceeding to technical review.';
            application_status := 'under_assessment';
        WHEN 'failed' THEN
            notification_title := 'Assessment Failed - Application Rejected';
            notification_message := 'Your permit application "' || application_record.title || '" has been rejected during initial assessment. Reason: ' || COALESCE(NEW.assessment_notes, 'No specific reason provided.');
            application_status := 'rejected';
        WHEN 'requires_clarification' THEN
            notification_title := 'Clarification Required for Your Application';
            notification_message := 'Your permit application "' || application_record.title || '" requires clarification. Please review the feedback and resubmit. Feedback: ' || COALESCE(NEW.feedback_provided, NEW.assessment_notes, 'Please contact the office for details.');
            application_status := 'clarification_required';
        ELSE
            -- For pending or other statuses, don't send notification
            RETURN NEW;
    END CASE;

    -- Update permit application status
    UPDATE permit_applications 
    SET 
        status = application_status,
        updated_at = NOW()
    WHERE id = NEW.permit_application_id;

    -- Insert user notification
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        related_permit_id,
        is_read,
        created_at
    ) VALUES (
        application_record.user_id,
        notification_title,
        notification_message,
        'assessment_update',
        NEW.permit_application_id,
        false,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assessment status changes
DROP TRIGGER IF EXISTS trigger_assessment_status_change ON initial_assessments;
CREATE TRIGGER trigger_assessment_status_change
    AFTER UPDATE OF assessment_status ON initial_assessments
    FOR EACH ROW
    WHEN (OLD.assessment_status IS DISTINCT FROM NEW.assessment_status)
    EXECUTE FUNCTION handle_assessment_status_change();

-- Add clarification_required status to permit applications if not exists
DO $$
BEGIN
    -- Check if the constraint allows clarification_required
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'permit_applications_status_check' 
        AND consrc LIKE '%clarification_required%'
    ) THEN
        -- Drop the existing constraint
        ALTER TABLE permit_applications DROP CONSTRAINT IF EXISTS permit_applications_status_check;
        
        -- Add the new constraint with clarification_required
        ALTER TABLE permit_applications ADD CONSTRAINT permit_applications_status_check 
        CHECK (status IN ('draft', 'submitted', 'under_review', 'under_assessment', 'approved', 'rejected', 'clarification_required'));
    END IF;
END $$;