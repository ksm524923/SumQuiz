package com.example.backend.dto;

public class CodingSubmissionRequest {
    private Long userId;
    private Long problemId;
    private String sourceCode;
    private String language;
    public Long getUserId() { return userId; } public void setUserId(Long value) { userId = value; }
    public Long getProblemId() { return problemId; } public void setProblemId(Long value) { problemId = value; }
    public String getSourceCode() { return sourceCode; } public void setSourceCode(String value) { sourceCode = value; }
    public String getLanguage() { return language; } public void setLanguage(String value) { language = value; }
}
