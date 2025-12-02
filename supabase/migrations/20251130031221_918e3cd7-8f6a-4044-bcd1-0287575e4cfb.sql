-- Drop and recreate the get_table_statistics function with correct implementation
DROP FUNCTION IF EXISTS public.get_table_statistics();

CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS TABLE(
  table_name text,
  row_count bigint,
  total_size text,
  size_bytes bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (c.table_schema || '.' || c.table_name)::text AS table_name,
    COALESCE(s.n_live_tup, 0)::bigint AS row_count,
    pg_size_pretty(pg_total_relation_size('"' || c.table_schema || '"."' || c.table_name || '"'))::text AS total_size,
    pg_total_relation_size('"' || c.table_schema || '"."' || c.table_name || '"')::bigint AS size_bytes
  FROM information_schema.tables c
  LEFT JOIN pg_stat_user_tables s ON s.schemaname = c.table_schema AND s.relname = c.table_name
  WHERE c.table_schema = 'public'
    AND c.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size('"' || c.table_schema || '"."' || c.table_name || '"') DESC;
END;
$$;