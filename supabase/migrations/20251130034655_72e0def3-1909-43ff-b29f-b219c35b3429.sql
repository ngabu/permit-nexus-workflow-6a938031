-- Function to clear old system logs
CREATE OR REPLACE FUNCTION clear_old_system_logs(days_threshold INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Clear old entries from audit_log table (system-level logs)
  DELETE FROM audit_log
  WHERE changed_at < NOW() - (days_threshold || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;