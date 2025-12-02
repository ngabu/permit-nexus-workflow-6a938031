-- Enable automatic activity logging for all user actions
-- This migration sets up comprehensive audit logging triggers

-- Create function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  action_val TEXT;
BEGIN
  -- Get current user ID
  user_id_val := auth.uid();
  
  -- Determine action type
  IF (TG_OP = 'DELETE') THEN
    action_val := 'DELETE_' || TG_TABLE_NAME;
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
    VALUES (user_id_val, action_val, TG_TABLE_NAME, OLD.id::TEXT, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    action_val := 'UPDATE_' || TG_TABLE_NAME;
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
    VALUES (user_id_val, action_val, TG_TABLE_NAME, NEW.id::TEXT, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    action_val := 'CREATE_' || TG_TABLE_NAME;
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
    VALUES (user_id_val, action_val, TG_TABLE_NAME, NEW.id::TEXT, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for critical tables
-- Permit Applications
DROP TRIGGER IF EXISTS audit_permit_applications ON permit_applications;
CREATE TRIGGER audit_permit_applications
  AFTER INSERT OR UPDATE OR DELETE ON permit_applications
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Entities
DROP TRIGGER IF EXISTS audit_entities ON entities;
CREATE TRIGGER audit_entities
  AFTER INSERT OR UPDATE OR DELETE ON entities
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Compliance Assessments
DROP TRIGGER IF EXISTS audit_compliance_assessments ON compliance_assessments;
CREATE TRIGGER audit_compliance_assessments
  AFTER INSERT OR UPDATE OR DELETE ON compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Fee Payments
DROP TRIGGER IF EXISTS audit_fee_payments ON fee_payments;
CREATE TRIGGER audit_fee_payments
  AFTER INSERT OR UPDATE OR DELETE ON fee_payments
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Intent Registrations
DROP TRIGGER IF EXISTS audit_intent_registrations ON intent_registrations;
CREATE TRIGGER audit_intent_registrations
  AFTER INSERT OR UPDATE OR DELETE ON intent_registrations
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Profiles (user updates)
DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Documents
DROP TRIGGER IF EXISTS audit_documents ON documents;
CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Inspections
DROP TRIGGER IF EXISTS audit_inspections ON inspections;
CREATE TRIGGER audit_inspections
  AFTER INSERT OR UPDATE OR DELETE ON inspections
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Initial Assessments
DROP TRIGGER IF EXISTS audit_initial_assessments ON initial_assessments;
CREATE TRIGGER audit_initial_assessments
  AFTER INSERT OR UPDATE OR DELETE ON initial_assessments
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Compliance Reports
DROP TRIGGER IF EXISTS audit_compliance_reports ON compliance_reports;
CREATE TRIGGER audit_compliance_reports
  AFTER INSERT OR UPDATE OR DELETE ON compliance_reports
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Function to backup audit logs older than specified days
CREATE OR REPLACE FUNCTION backup_old_audit_logs(days_threshold INTEGER DEFAULT 30)
RETURNS TABLE(
  backup_count INTEGER,
  backup_file TEXT
) AS $$
DECLARE
  log_count INTEGER;
  backup_timestamp TEXT;
BEGIN
  -- Get count of logs to backup
  SELECT COUNT(*) INTO log_count
  FROM audit_logs
  WHERE created_at < NOW() - (days_threshold || ' days')::INTERVAL;
  
  -- Generate backup timestamp
  backup_timestamp := to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
  
  -- Return results
  RETURN QUERY SELECT log_count, 'audit_logs_backup_' || backup_timestamp || '.json';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear old audit logs
CREATE OR REPLACE FUNCTION clear_old_audit_logs(days_threshold INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete old audit logs
  WITH deleted AS (
    DELETE FROM audit_logs
    WHERE created_at < NOW() - (days_threshold || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION backup_old_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION clear_old_audit_logs TO authenticated;