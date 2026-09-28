package com.clientpilot.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interaction {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties("interactions")
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private InteractionType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "interaction_date", nullable = false)
    private ZonedDateTime interactionDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}
