package com.clientpilot.repository;

import com.clientpilot.model.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, String> {
    List<Interaction> findByClientIdOrderByInteractionDateAsc(String clientId);
    List<Interaction> findByClientIdOrderByInteractionDateDesc(String clientId);
    long countByClientId(String clientId);
}
