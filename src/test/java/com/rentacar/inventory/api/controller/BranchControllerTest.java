package com.rentacar.inventory.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentacar.inventory.api.dto.BranchDto;
import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.service.BranchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BranchController.class)
@AutoConfigureMockMvc(addFilters = false)
class BranchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BranchService branchService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void createBranch_shouldReturnCreatedBranch() throws Exception {
        // Given
        BranchDto.CreateRequest request = new BranchDto.CreateRequest();
        request.setName("Hamburg Branch");
        request.setAddress("Hauptstraße 1, 20095 Hamburg");

        Branch branch = Branch.builder()
                .name("Hamburg Branch")
                .address("Hauptstraße 1, 20095 Hamburg")
                .build();
        branch.setId(UUID.randomUUID());

        when(branchService.createBranch(any(Branch.class))).thenReturn(branch);

        // When & Then
        mockMvc.perform(post("/api/v1/branches")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Hamburg Branch"))
                .andExpect(jsonPath("$.address").value("Hauptstraße 1, 20095 Hamburg"));

        verify(branchService).createBranch(any(Branch.class));
    }

    @Test
    @WithMockUser
    void getBranch_shouldReturnBranch() throws Exception {
        // Given
        UUID branchId = UUID.randomUUID();
        Branch branch = Branch.builder()
                .name("Hamburg Branch")
                .address("Hauptstraße 1, 20095 Hamburg")
                .build();
        branch.setId(branchId);

        when(branchService.getBranch(branchId)).thenReturn(branch);

        // When & Then
        mockMvc.perform(get("/api/v1/branches/{id}", branchId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(branchId.toString()))
                .andExpect(jsonPath("$.name").value("Hamburg Branch"));

        verify(branchService).getBranch(branchId);
    }

    @Test
    @WithMockUser
    void getAllBranches_shouldReturnPagedBranches() throws Exception {
        // Given
        Branch branch1 = Branch.builder()
                .name("Hamburg Branch")
                .address("Hauptstraße 1, 20095 Hamburg")
                .build();
        branch1.setId(UUID.randomUUID());

        Branch branch2 = Branch.builder()
                .name("Berlin Branch")
                .address("Unter den Linden 1, 10117 Berlin")
                .build();
        branch2.setId(UUID.randomUUID());

        Page<Branch> page = new PageImpl<>(List.of(branch1, branch2), PageRequest.of(0, 10), 2);
        when(branchService.getAllBranches(any(Pageable.class))).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/branches")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Hamburg Branch"))
                .andExpect(jsonPath("$.content[1].name").value("Berlin Branch"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(branchService).getAllBranches(any(Pageable.class));
    }
}
