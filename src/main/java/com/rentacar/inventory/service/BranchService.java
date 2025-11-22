package com.rentacar.inventory.service;

import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.repository.BranchRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    @Transactional
    public @NonNull Branch createBranch(@NonNull Branch branch) {
        return branchRepository.save(branch);
    }

    @Transactional(readOnly = true)
    public @NonNull Branch getBranch(@NonNull UUID id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Branch> getAllBranches(
            org.springframework.data.domain.Pageable pageable) {
        return branchRepository.findAll(pageable);
    }
}
