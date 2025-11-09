package com.healthcare.equipment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableJpaAuditing
@EntityScan(basePackages = "com.healthcare.equipment.entity")
@EnableJpaRepositories(basePackages = "com.healthcare.equipment.repository")
public class EquipmentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EquipmentServiceApplication.class, args);
    }
}
