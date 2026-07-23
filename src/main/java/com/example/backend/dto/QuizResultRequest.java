package com.example.backend.dto;

import java.util.List;

public class QuizResultRequest {
    private Long userId;
    private List<Answer> answers;
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<Answer> getAnswers() { return answers; }
    public void setAnswers(List<Answer> answers) { this.answers = answers; }
    public static class Answer {
        private Long quizId;
        private Integer selectedAnswer;
        public Long getQuizId() { return quizId; }
        public void setQuizId(Long quizId) { this.quizId = quizId; }
        public Integer getSelectedAnswer() { return selectedAnswer; }
        public void setSelectedAnswer(Integer selectedAnswer) { this.selectedAnswer = selectedAnswer; }
    }
}
