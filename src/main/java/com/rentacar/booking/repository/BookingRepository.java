package com.rentacar.booking.repository;

import com.rentacar.booking.domain.model.Booking;
import com.rentacar.booking.domain.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

        List<Booking> findByCustomerId(UUID customerId);

        List<Booking> findByStatus(BookingStatus status);

        Long countByStatus(BookingStatus status);

        List<Booking> findByStatusAndStartTimeAfter(BookingStatus status, LocalDateTime startTime);

        @Query("SELECT b FROM Booking b WHERE b.vehicleId = :vehicleId " +
                        "AND b.status = 'BESTAETIGT' " +
                        "AND ((b.startTime <= :endTime AND b.endTime >= :startTime))")
        List<Booking> findOverlappingBookings(@Param("vehicleId") UUID vehicleId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT b.vehicleId FROM Booking b WHERE " +
                        "b.status = 'BESTAETIGT' " +
                        "AND ((b.startTime <= :endTime AND b.endTime >= :startTime))")
        List<UUID> findBookedVehicleIds(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);
}
