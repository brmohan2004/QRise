-- RPC to get platform summary efficiently in a single call
CREATE OR REPLACE FUNCTION get_platform_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers', (SELECT count(*) FROM users),
    'totalQRs', (SELECT count(*) FROM qr_codes),
    'totalScans', (SELECT count(*) FROM scan_events),
    'scansToday', (SELECT count(*) FROM scan_events WHERE scanned_at >= CURRENT_DATE),
    'activeCompetitions', (SELECT count(*) FROM competitions WHERE is_public = true),
    'revenue', 0
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get scan trends efficiently with grouping
CREATE OR REPLACE FUNCTION get_scans_trend(start_date TIMESTAMP)
RETURNS TABLE (date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT date_trunc('day', scanned_at)::DATE as date, count(*) as count
  FROM scan_events
  WHERE scanned_at >= start_date
  GROUP BY 1
  ORDER BY 1 ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get geographic breakdown efficiently with grouping
CREATE OR REPLACE FUNCTION get_geo_breakdown()
RETURNS TABLE (name TEXT, value BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT country as name, count(*) as value
  FROM scan_events
  WHERE country IS NOT NULL
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get device split efficiently
CREATE OR REPLACE FUNCTION get_device_split()
RETURNS TABLE (name TEXT, value BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT device_type as name, count(*) as value
  FROM scan_events
  WHERE device_type IS NOT NULL
  GROUP BY 1
  ORDER BY 2 DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get user growth efficiently
CREATE OR REPLACE FUNCTION get_user_growth(start_date TIMESTAMP)
RETURNS TABLE (date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT date_trunc('day', created_at)::DATE as date, count(*) as count
  FROM users
  WHERE created_at >= start_date
  GROUP BY 1
  ORDER BY 1 ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
