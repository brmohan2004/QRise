# Security Architecture

The QRise Admin Panel is designed with a defense-in-depth strategy to protect sensitive platform data.

## 1. Authentication Layers
Access to the admin panel requires passing 4 distinct gates:
1. **Infrastructure Gate:** Vercel Deployment Protection (Username/Password).
2. **Session Gate:** Valid Supabase Auth session (via Magic Link/OAuth).
3. **Identity Gate:** Email must be present in the `ADMIN_EMAIL_ALLOWLIST` environment variable.
4. **Database Gate:** User record must have `is_admin: true` and `is_suspended: false`.

## 2. Session Integrity
- **Timeout:** Sessions are checked for age. Any session older than **8 hours** is rejected, forcing a fresh login.
- **Service Role:** All sensitive database mutations use the Supabase `service_role` key. This key is never sent to the browser and exists only in secure server-side API routes.

## 3. Auditing & Traceability
- **Action Logs:** Every POST, PATCH, and DELETE request in the admin panel is logged to the `admin_audit_log` table.
- **Payloads:** Logs include the admin ID, the action taken, the target ID, and the IP address of the requester.

## 4. Impersonation Safety
- **Isolation:** Impersonation works by setting a temporary session cookie. It does NOT grant the admin the user's password.
- **Visual Indicator:** A persistent "Impersonating User" banner is shown in the main app whenever an admin is logged in as a user.
- **Logging:** Starting and stopping impersonation is a logged administrative action.

## 5. Sandboxed Competition Files
- **Execution:** Custom `.tsx` files uploaded for competitions are stored as raw text/code snippets. They are never executed on the Admin Panel server.
- **Sandboxing:** When rendered in the main SaaS app, these should be handled within an `iframe` or a restricted React environment to prevent XSS.
