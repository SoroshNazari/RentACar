package de.rentacar.vehicle.web;

import de.rentacar.vehicle.application.VehicleManagementService;
import de.rentacar.shared.infrastructure.DataInitializer;
import de.rentacar.vehicle.domain.Vehicle;
import de.rentacar.vehicle.domain.VehicleType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * REST Controller für Fahrzeugverwaltung
 */
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleManagementService vehicleManagementService;
    private final DataInitializer dataInitializer;

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<Vehicle> addVehicle(@RequestBody CreateVehicleRequest request,
                                             Authentication authentication,
                                             HttpServletRequest httpRequest) {
        Vehicle vehicle = vehicleManagementService.addVehicle(
                request.licensePlate(),
                request.brand(),
                request.model(),
                request.type(),
                request.year(),
                request.mileage(),
                request.location(),
                request.dailyPrice(),
                request.imageUrl(),
                request.imageGallery(),
                authentication.getName(),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicle);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id,
                                                @RequestBody UpdateVehicleRequest request,
                                                Authentication authentication,
                                                HttpServletRequest httpRequest) {
        Vehicle vehicle = vehicleManagementService.updateVehicle(
                id,
                request.brand(),
                request.model(),
                request.type(),
                request.year(),
                request.location(),
                request.dailyPrice(),
                request.imageUrl(),
                request.imageGallery(),
                authentication.getName(),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/{id}/out-of-service")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ResponseEntity<Void> setOutOfService(@PathVariable Long id,
                                               Authentication authentication,
                                               HttpServletRequest httpRequest) {
        vehicleManagementService.setVehicleOutOfService(
                id,
                authentication.getName(),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleManagementService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleManagementService.getVehicleById(id));
    }

    @PostMapping("/admin/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetVehicles(Authentication authentication, HttpServletRequest httpRequest) {
        dataInitializer.resetVehicles();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/admin/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetVehiclesGet(Authentication authentication, HttpServletRequest httpRequest) {
        dataInitializer.resetVehicles();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    public record CreateVehicleRequest(
            String licensePlate,
            String brand,
            String model,
            VehicleType type,
            Integer year,
            Long mileage,
            String location,
            Double dailyPrice,
            String imageUrl,
            List<String> imageGallery
    ) {}

    public record UpdateVehicleRequest(
            String brand,
            String model,
            VehicleType type,
            Integer year,
            String location,
            Double dailyPrice,
            String imageUrl,
            List<String> imageGallery
    ) {}
}
