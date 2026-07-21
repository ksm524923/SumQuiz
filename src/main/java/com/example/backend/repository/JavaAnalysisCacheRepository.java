package com.example.backend.repository;

import com.example.backend.entity.JavaAnalysisCache;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JavaAnalysisCacheRepository extends JpaRepository<JavaAnalysisCache, Long> {
    Optional<JavaAnalysisCache> findByUserAndSourceHash(User user, String sourceHash);
}
