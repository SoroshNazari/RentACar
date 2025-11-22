-- Add tenant_id column to all main tables
ALTER TABLE branches ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE price_configurations ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE handover_protocols ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) NOT NULL DEFAULT 'default';

-- Create indexes for tenant_id for better query performance
CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rentals_tenant ON rentals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_price_configurations_tenant ON price_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_handover_protocols_tenant ON handover_protocols(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_tenant ON vehicle_images(tenant_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_status ON vehicles(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_status ON bookings(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_rentals_tenant_status ON rentals(tenant_id, status);
