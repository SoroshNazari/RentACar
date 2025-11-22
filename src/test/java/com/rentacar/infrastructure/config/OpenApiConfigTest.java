package com.rentacar.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenApiConfigTest {

    @Test
    void customOpenAPI_shouldReturnConfiguredOpenAPI() {
        // Given
        OpenApiConfig config = new OpenApiConfig();

        // When
        OpenAPI openAPI = config.customOpenAPI();

        // Then
        assertThat(openAPI).isNotNull();
        assertThat(openAPI.getInfo().getTitle()).isEqualTo("RentACar API");
        assertThat(openAPI.getComponents().getSecuritySchemes()).containsKey("bearerAuth");
    }
}
