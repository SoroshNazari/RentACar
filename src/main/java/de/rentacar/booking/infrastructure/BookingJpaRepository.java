package de.rentacar.booking.infrastructure;

import de.rentacar.booking.domain.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * JPA Repository Implementation (Infrastructure Layer)
 */
@Repository
public interface BookingJpaRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByVehicleId(Long vehicleId);
    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle WHERE b.customerId = :customerId")
    List<Booking> findByCustomerIdWithVehicle(@Param("customerId") Long customerId);
    
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status = 'BESTÄTIGT' " +
           "AND ((b.pickupDate <= :endDate AND b.returnDate >= :startDate))")
    List<Booking> findOverlappingBookings(@Param("vehicleId") Long vehicleId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND (b.status = 'ANFRAGE' OR b.status = 'BESTÄTIGT')")
    List<Booking> findActiveBookingsByVehicle(@Param("vehicleId") Long vehicleId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle v WHERE b.status = de.rentacar.booking.domain.BookingStatus.BESTÄTIGT AND b.pickupDate = :date")
    List<Booking> findConfirmedByPickupDateWithVehicle(@Param("date") java.time.LocalDate date);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle v WHERE b.status = de.rentacar.booking.domain.BookingStatus.BESTÄTIGT AND b.returnDate = :date")
    List<Booking> findConfirmedByReturnDateWithVehicle(@Param("date") java.time.LocalDate date);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle v WHERE (b.status = de.rentacar.booking.domain.BookingStatus.ANFRAGE OR b.status = de.rentacar.booking.domain.BookingStatus.BESTÄTIGT) AND b.pickupDate = :date")
    List<Booking> findActiveByPickupDateWithVehicle(@Param("date") java.time.LocalDate date);

    @Query("SELECT b FROM Booking b JOIN FETCH b.vehicle v WHERE b.status = de.rentacar.booking.domain.BookingStatus.ANFRAGE AND b.pickupDate = :date")
    List<Booking> findRequestsByPickupDateWithVehicle(@Param("date") java.time.LocalDate date);
}
