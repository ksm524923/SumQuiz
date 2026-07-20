package com.example.backend.dto;

import java.util.List;

public record GeneratedLearningContent(
        JavaAnalysisResponse analysis,
        List<CodingProblemDraft> codingProblems) {
}
