package com.aws.pojo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "admin_profile")
public class AdminProfile {

    @Id
    @Column(name = "account_uuid")
    private UUID accountUuid;

    @Column(length = 100)
    private String department;

    @Column(columnDefinition = "jsonb")
    private String permissions;
}
