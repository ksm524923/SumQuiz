package com.example.backend.dto;

import java.util.List;

public record CodingProblemDraft(String grammarName, String title, String description,
                                 List<String> requirements, String inputExample, String outputExample,
                                 String starterCode, String difficulty, List<TestCase> tests) {
    public record TestCase(int id, String name, String input, String expected) {}
}
