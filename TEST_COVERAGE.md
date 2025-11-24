# Test Coverage Report

## Overall Coverage: **90.20%**

Generated from JaCoCo report.

### Package: `com.rentacar` (37.50%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| RentACarApplication | 37.50% | 3 | 5 |

### Package: `com.rentacar.booking.api.controller` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BookingController | 100.00% | 72 | 0 |
| PriceConfigurationController | 100.00% | 62 | 0 |

### Package: `com.rentacar.booking.api.dto` (0.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BookingDto | 0.00% | 0 | 3 |
| PriceConfigurationDto | 0.00% | 0 | 3 |

### Package: `com.rentacar.booking.domain.model` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| Booking | 100.00% | 4 | 0 |
| BookingStatus | 100.00% | 44 | 0 |

### Package: `com.rentacar.booking.service` (99.17%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BookingService | 98.68% | 150 | 2 |
| PriceConfigurationService | 100.00% | 88 | 0 |

### Package: `com.rentacar.customer.api.controller` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| CustomerController | 100.00% | 80 | 0 |

### Package: `com.rentacar.customer.api.dto` (0.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| CustomerDto | 0.00% | 0 | 3 |

### Package: `com.rentacar.customer.infrastructure.security` (90.54%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| AttributeEncryptor | 90.54% | 67 | 7 |

### Package: `com.rentacar.customer.service` (71.43%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| CustomerService | 71.43% | 50 | 20 |

### Package: `com.rentacar.infrastructure.audit` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| AuditLogEvent | 100.00% | 16 | 0 |
| AuditLogListener | 100.00% | 21 | 0 |

### Package: `com.rentacar.infrastructure.config` (86.52%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| AsyncConfig | 100.00% | 3 | 0 |
| MockConfig | 100.00% | 8 | 0 |
| MockConfig.new StorageService() {...} | 33.33% | 6 | 12 |
| OpenApiConfig | 100.00% | 60 | 0 |

### Package: `com.rentacar.infrastructure.email` (87.15%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BookingEmailListener | 100.00% | 62 | 0 |
| EmailService | 90.32% | 112 | 12 |
| EmailTemplateService | 75.49% | 77 | 25 |

### Package: `com.rentacar.infrastructure.exception` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| GlobalExceptionHandler | 100.00% | 78 | 0 |
| GlobalExceptionHandler.ErrorResponse | 100.00% | 12 | 0 |

### Package: `com.rentacar.infrastructure.multitenancy` (96.41%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| HibernateTenantFilterManager | 94.12% | 48 | 3 |
| TenantContext | 88.46% | 23 | 3 |
| TenantEntityListener | 100.00% | 59 | 0 |
| TenantFilter | 100.00% | 31 | 0 |

### Package: `com.rentacar.infrastructure.ratelimit` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| RateLimitFilter | 100.00% | 92 | 0 |

### Package: `com.rentacar.infrastructure.security` (90.37%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| CustomUserDetailsService | 100.00% | 51 | 0 |
| JwtAuthenticationFilter | 83.33% | 75 | 15 |
| JwtService | 75.90% | 126 | 40 |
| SecurityConfig | 100.00% | 264 | 0 |

### Package: `com.rentacar.infrastructure.security.api` (97.03%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| AuthController | 97.03% | 98 | 3 |

### Package: `com.rentacar.infrastructure.security.api.dto` (0.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| AuthDto | 0.00% | 0 | 3 |

### Package: `com.rentacar.infrastructure.storage` (79.25%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| FileStorageService | 77.12% | 91 | 27 |
| LocalFileStorageService | 82.11% | 101 | 22 |
| S3StorageService | 78.81% | 186 | 50 |

### Package: `com.rentacar.inventory.api.controller` (90.40%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BranchController | 100.00% | 55 | 0 |
| InventoryController | 100.00% | 95 | 0 |
| VehicleImageController | 80.92% | 123 | 29 |

### Package: `com.rentacar.inventory.api.dto` (0.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BranchDto | 0.00% | 0 | 3 |
| VehicleDto | 0.00% | 0 | 3 |

### Package: `com.rentacar.inventory.domain.model` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| VehicleStatus | 100.00% | 44 | 0 |
| VehicleType | 100.00% | 44 | 0 |

### Package: `com.rentacar.inventory.service` (81.25%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| BranchService | 75.61% | 31 | 10 |
| VehicleService | 83.19% | 99 | 20 |

### Package: `com.rentacar.rental.api.controller` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| RentalController | 100.00% | 18 | 0 |

### Package: `com.rentacar.rental.api.dto` (0.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| RentalDto | 0.00% | 0 | 3 |

### Package: `com.rentacar.rental.domain.model` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| HandoverType | 100.00% | 24 | 0 |

### Package: `com.rentacar.rental.service` (91.12%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| RentalService | 91.12% | 154 | 15 |

### Package: `com.rentacar.reporting.api.controller` (100.00%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| ReportingController | 100.00% | 4 | 0 |

### Package: `com.rentacar.reporting.service` (98.09%)

| Class | Coverage | Instructions Covered | Instructions Missed |
|---|---|---|---|
| ReportingService | 98.09% | 154 | 3 |

