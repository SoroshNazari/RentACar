package com.rentacar.inventory.api.controller;

import com.rentacar.inventory.api.dto.BranchDto;
import com.rentacar.inventory.domain.model.Branch;
import com.rentacar.inventory.service.BranchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
@Tag(name = "Branch", description = "Branch Management API")
public class BranchController {

    private final BranchService branchService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new branch")
    public BranchDto.Response createBranch(@Valid @RequestBody BranchDto.CreateRequest request) {
        Branch branch = Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .build();

        Branch saved = branchService.createBranch(branch);
        return mapToResponse(saved);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get branch by ID")
    public BranchDto.Response getBranch(@PathVariable UUID id) {
        Branch branch = branchService.getBranch(id);
        return mapToResponse(branch);
    }

    @GetMapping
    @Operation(summary = "Get all branches with pagination")
    public Page<BranchDto.Response> getAllBranches(Pageable pageable) {
        Page<Branch> branches = branchService.getAllBranches(pageable);
        return branches.map(this::mapToResponse);
    }

    private BranchDto.Response mapToResponse(Branch branch) {
        BranchDto.Response response = new BranchDto.Response();
        response.setId(branch.getId());
        response.setName(branch.getName());
        response.setAddress(branch.getAddress());
        return response;
    }
}
