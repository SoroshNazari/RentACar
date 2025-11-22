-- Add Vehicle Images Table
-- This migration adds support for vehicle images

CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_image_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create Index for Vehicle Lookups
CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
