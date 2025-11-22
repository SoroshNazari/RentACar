package com.rentacar.rental.repository;

import com.rentacar.rental.domain.model.HandoverProtocol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HandoverProtocolRepository extends JpaRepository<HandoverProtocol, UUID> {
    List<HandoverProtocol> findByBookingId(UUID bookingId);
}
