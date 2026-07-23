package com.example.backend.repository;

import com.example.backend.entity.CodingSubmission;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.*;
import java.util.List;

public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    @EntityGraph(attributePaths = "problem")
    List<CodingSubmission> findByUserOrderBySubmittedAtDesc(User user);
    long countByUserAndPassed(User user, boolean passed);
}
