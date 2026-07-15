package com.example.backend.dto;

public class CodingProblemRequest {
    private Long userId;
    private String code;
    public Long getUserId() { return userId; } public void setUserId(Long value) { userId = value; }
    public String getCode() { return code; } public void setCode(String value) { code = value; }
}
