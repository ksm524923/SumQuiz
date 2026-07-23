package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "source_hash"}))
public class JavaAnalysisCache {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private User user;
    @Column(name = "source_hash", nullable = false, length = 64) private String sourceHash;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") private String summary;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") private String grammarsJson;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") private String sourceCode;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") private String problemIdsJson;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User value) { user = value; }
    public String getSourceHash() { return sourceHash; }
    public void setSourceHash(String value) { sourceHash = value; }
    public String getSummary() { return summary; }
    public void setSummary(String value) { summary = value; }
    public String getGrammarsJson() { return grammarsJson; }
    public void setGrammarsJson(String value) { grammarsJson = value; }
    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String value) { sourceCode = value; }
    public String getProblemIdsJson() { return problemIdsJson; }
    public void setProblemIdsJson(String value) { problemIdsJson = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
