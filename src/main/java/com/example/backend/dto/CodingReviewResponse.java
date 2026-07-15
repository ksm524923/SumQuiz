package com.example.backend.dto;

import java.util.List;

public record CodingReviewResponse(String status, String hint, String improvement, List<TestResult> tests) {
    public record TestResult(int id, String name, String status, String input, String expected,
                             String actual, String reason) {}
}
