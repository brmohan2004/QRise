# Implementation Plan - QR Code Management Enhancements

This plan outlines the steps to implement Soft Delete with Auto Suspension and Bulk QR Management UI in the QRise SaaS.

## Feature 1: Soft Delete with Auto Suspension

### 1. Database Schema Update
- Modify `qr_codes` table in `qrise/lib/db/schema/qr-codes.ts`:
    - Add `status` field (varchar, default: 'active', values: 'active', 'suspended', 'deleted').
    - Add `deletedAt` field (timestamp, optional).
- Keep `isActive` and `isDeleted` for backward compatibility or migrate them if preferred. (Recommendation: Migrate to `status` for clarity).

### 2. Update Redirection Logic
- Modify `qrise/app/s/[code]/page.tsx`:
    - Check if `qr.status !== 'active'`.
    - If suspended or deleted, show the "QR Code Inactive" page.

### 3. Update Delete/Suspend Actions
- Update the API handlers that handle QR deletion and status changes.
- Instead of hard deleting or just setting `isDeleted`, update the `status` to `suspended` or `deleted`.

## Feature 2: Bulk QR Management UI (Admin Panel)

### 1. Backend: Data Fetching
- Create or update a query to fetch QR codes grouped by `bulk_job_id`.
- If `bulk_job_id` is present, treat it as a "Bulk QR Batch".
- Individual QR codes (where `bulk_job_id` is null) are shown as single items.

### 2. Frontend: Admin UI Components
- **BulkGroupCard**: A card that summarizes a batch (e.g., "Batch #123 - 50 QRs").
- **BatchDetailView**: A view (modal or new page) that lists all QRs within a specific batch.
- **BulkActions**: Ability to suspend or delete an entire batch at once.

### 3. API Endpoints
- `GET /api/admin/qr-codes/grouped`: Fetches grouped QR list.
- `PATCH /api/admin/bulk-jobs/:id/status`: Bulk update status for all QRs in a job.

---

## Technical Details

### Database Migration (Conceptual)
```sql
ALTER TABLE qr_codes ADD COLUMN status VARCHAR(20) DEFAULT 'active';
ALTER TABLE qr_codes ADD COLUMN deleted_at TIMESTAMP;

-- Populate status from existing flags
UPDATE qr_codes SET status = 'deleted' WHERE is_deleted = true;
UPDATE qr_codes SET status = 'suspended' WHERE is_active = false AND is_deleted = false;
```

### Next.js Component Breakdown
- `QRManagementPage`: Main dashboard.
- `QRTable`: Displays both single QRs and Bulk Groups.
- `BulkQRCard`: Collapsible or expandable view for batches.
