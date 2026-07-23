package com.example.backend.dto;

import java.util.List;

public record JavaAnalysisResponse(String summary, List<Grammar> grammars, String sourceCode) {
    public record Grammar(String name, String description, int rating, String evidence) {}
}
