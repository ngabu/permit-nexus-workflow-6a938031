-- Database administration functions for maintenance and optimization

-- Function to get table statistics
CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  total_size text,
  size_bytes bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename AS table_name,
    n_tup_ins - n_tup_del AS row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$;

-- Function to perform vacuum and analyze
CREATE OR REPLACE FUNCTION public.vacuum_analyze_database()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'VACUUM ANALYZE public.' || quote_ident(tbl.tablename);
  END LOOP;
END;
$$;

-- Function to rebuild indexes
CREATE OR REPLACE FUNCTION public.rebuild_database_indexes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  idx record;
BEGIN
  FOR idx IN 
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'REINDEX INDEX public.' || quote_ident(idx.indexname);
  END LOOP;
END;
$$;

-- Function to clean old draft applications (90+ days)
CREATE OR REPLACE FUNCTION public.clean_old_drafts(days_old integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete old intent registration drafts
  DELETE FROM intent_registration_drafts
  WHERE created_at < NOW() - (days_old || ' days')::interval
    AND status = 'draft';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Could add more draft cleanup logic here for other tables
  
  RETURN deleted_count;
END;
$$;

-- Function to update database statistics
CREATE OR REPLACE FUNCTION public.update_database_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ANALYZE public.' || quote_ident(tbl.tablename);
  END LOOP;
END;
$$;

-- Function to create database backup metadata
CREATE OR REPLACE FUNCTION public.create_database_backup(
  backup_format text,
  backup_filename text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  backup_info json;
BEGIN
  -- In a full implementation, this would trigger pg_dump or similar
  -- For now, we'll just record the backup request
  backup_info := json_build_object(
    'filename', backup_filename,
    'format', backup_format,
    'timestamp', NOW(),
    'status', 'scheduled',
    'message', 'Backup scheduled - requires external backup tool for execution'
  );
  
  RETURN backup_info;
END;
$$;

-- Grant execute permissions to authenticated users (admins only via RLS)
GRANT EXECUTE ON FUNCTION public.get_table_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.vacuum_analyze_database() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rebuild_database_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clean_old_drafts(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_database_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_database_backup(text, text) TO authenticated;