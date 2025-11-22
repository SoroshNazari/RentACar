-- Initial Schema for RentACar Backend
-- This migration creates all base tables

-- Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    branch_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    driver_license VARCHAR(500),  -- Encrypted
    address VARCHAR(1000),        -- Encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price Configurations Table
CREATE TABLE IF NOT EXISTS price_configurations (
    id UUID PRIMARY KEY,
    vehicle_type VARCHAR(50) NOT NULL UNIQUE,
    base_price DECIMAL(10, 2) NOT NULL,
    price_per_km DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    pickup_branch_id UUID NOT NULL,
    return_branch_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_booking_pickup_branch FOREIGN KEY (pickup_branch_id) REFERENCES branches(id),
    CONSTRAINT fk_booking_return_branch FOREIGN KEY (return_branch_id) REFERENCES branches(id)
);

-- Rentals Table
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE,
    vehicle_id UUID NOT NULL,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    final_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rental_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_rental_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Handover Protocols Table
CREATE TABLE IF NOT EXISTS handover_protocols (
    id UUID PRIMARY KEY,
    rental_id UUID NOT NULL,
    protocol_type VARCHAR(50) NOT NULL,
    mileage INTEGER NOT NULL,
    fuel_level INTEGER NOT NULL,
    damages TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_protocol_rental FOREIGN KEY (rental_id) REFERENCES rentals(id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP NOT NULL,
    old_value TEXT,
    new_value TEXT
);

-- Create Indexes for Performance
CREATE INDEX idx_vehicles_branch ON vehicles(branch_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_rentals_booking ON rentals(booking_id);
CREATE INDEX idx_rentals_vehicle ON rentals(vehicle_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
