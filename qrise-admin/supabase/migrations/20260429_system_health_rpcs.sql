-- RPCs for System Health Monitoring
CREATE OR REPLACE FUNCTION get_db_size()
RETURNS TEXT AS $$
BEGIN
  RETURN pg_size_pretty(pg_database_size(current_database()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_active_connections()
RETURNS INT AS $$
BEGIN
  -- Count total connections to this database
  RETURN (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
