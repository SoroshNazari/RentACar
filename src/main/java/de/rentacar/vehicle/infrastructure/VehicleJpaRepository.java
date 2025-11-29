package de.rentacar.vehicle.infrastructure;

import de.rentacar.booking.domain.BookingStatus;
import de.rentacar.vehicle.domain.Vehicle;
import de.rentacar.vehicle.domain.VehicleStatus;
import de.rentacar.vehicle.domain.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository Implementation (Infrastructure Layer)
 */
@Repository
public interface VehicleJpaRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlateValue(String licensePlate);
    
    List<Vehicle> findByType(VehicleType type);
    
    List<Vehicle> findByStatus(VehicleStatus status);
    
    List<Vehicle> findByLocation(String location);
    
    @Query("SELECT v FROM Vehicle v WHERE v.status = :status " +
           "AND v.type = :type AND UPPER(v.location) = UPPER(:location) " +
           "AND v.id NOT IN " +
           "(SELECT b.vehicle.id FROM de.rentacar.booking.domain.Booking b " +
           "WHERE b.status = :bookingStatus " +
           "AND ((b.pickupDate <= :endDate AND b.returnDate >= :startDate)))")
    List<Vehicle> findAvailableVehicles(@Param("type") VehicleType type,
                                        @Param("location") String location,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate,
                                        @Param("status") VehicleStatus status,
                                        @Param("bookingStatus") BookingStatus bookingStatus);
}

