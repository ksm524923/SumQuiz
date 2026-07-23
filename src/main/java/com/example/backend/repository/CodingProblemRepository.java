package com.example.backend.repository;

import com.example.backend.entity.CodingProblem;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    List<CodingProblem> findByUserOrderByCreatedAtDesc(User user);
    Optional<CodingProblem> findByIdAndUser(Long id, User user);
    long countByUser(User user);
}
