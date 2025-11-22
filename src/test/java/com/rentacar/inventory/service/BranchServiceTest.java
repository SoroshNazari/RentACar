package com.rentacar.inventory.service;

import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.repository.BranchRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BranchServiceTest {

    @Mock
    private BranchRepository branchRepository;

    @InjectMocks
    private BranchService branchService;

    @Test
    void createBranch_shouldSaveBranch() {
        // Given
        Branch branch = Branch.builder()
                .name("Hamburg Branch")
                .address("Hauptstraße 1")
                .build();

        when(branchRepository.save(branch)).thenReturn(branch);

        // When
        Branch result = branchService.createBranch(branch);

        // Then
        assertThat(result).isEqualTo(branch);
        verify(branchRepository).save(branch);
    }

    @Test
    void getBranch_shouldReturnBranch() {
        // Given
        UUID branchId = UUID.randomUUID();
        Branch branch = Branch.builder()
                .name("Hamburg Branch")
                .address("Hauptstraße 1")
                .build();
        branch.setId(branchId);

        when(branchRepository.findById(branchId)).thenReturn(Optional.of(branch));

        // When
        Branch result = branchService.getBranch(branchId);

        // Then
        assertThat(result).isEqualTo(branch);
        assertThat(result.getId()).isEqualTo(branchId);
    }

    @Test
    void getBranch_whenNotFound_shouldThrowException() {
        // Given
        UUID branchId = UUID.randomUUID();
        when(branchRepository.findById(branchId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> branchService.getBranch(branchId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllBranches_shouldReturnPagedBranches() {
        // Given
        Branch branch1 = Branch.builder()
                .name("Hamburg Branch")
                .address("Hauptstraße 1")
                .build();

        Branch branch2 = Branch.builder()
                .name("Berlin Branch")
                .address("Unter den Linden 1")
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Branch> page = new PageImpl<>(List.of(branch1, branch2), pageable, 2);

        when(branchRepository.findAll(pageable)).thenReturn(page);

        // When
        Page<Branch> result = branchService.getAllBranches(pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).containsExactly(branch1, branch2);
    }
}
