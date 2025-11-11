package com.healthcare.doctor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {
    private Integer id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    private Boolean active = true;
}

