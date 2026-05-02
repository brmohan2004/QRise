
-- Allow public (anonymous) read access to the plans table
-- This is required for the pricing page to display available plans

ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to plans"
ON "plans"
FOR SELECT
TO anon
USING (is_publicly_visible = true);

-- Also allow authenticated users to see visible plans
CREATE POLICY "Allow authenticated read access to plans"
ON "plans"
FOR SELECT
TO authenticated
USING (is_publicly_visible = true);
