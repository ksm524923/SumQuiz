package com.example.backend.service;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class JavaSyntaxDetector {
    public record Detected(String name, String evidence) {}
    private record Rule(String name, Pattern pattern) {}
    private static final List<Rule> RULES = List.of(
        new Rule("예외 처리", Pattern.compile("\\b(try|catch|finally|throw|throws)\\b")),
        new Rule("제네릭", Pattern.compile("<[A-Za-z][^;{}()]*>")),
        new Rule("컬렉션", Pattern.compile("\\b(List|ArrayList|Set|HashSet|Map|HashMap|Collection)\\b")),
        new Rule("Stream API", Pattern.compile("\\.(stream|filter|map|collect|forEach)\\s*\\(")),
        new Rule("람다 표현식", Pattern.compile("->")),
        new Rule("향상된 for문", Pattern.compile("for\\s*\\([^;:]+:[^)]+\\)")),
        new Rule("for문", Pattern.compile("\\bfor\\s*\\(")),
        new Rule("조건문", Pattern.compile("\\b(if|switch)\\s*\\(")),
        new Rule("상속과 인터페이스", Pattern.compile("\\b(extends|implements|interface)\\b")),
        new Rule("메서드 선언", Pattern.compile("(?:public|protected|private|static|final|synchronized|native|abstract|\\s)+[\\w<>\\[\\]]+\\s+\\w+\\s*\\([^)]*\\)\\s*(?:throws[^\\{]+)?\\{")),
        new Rule("배열", Pattern.compile("\\w+\\s*\\[\\s*]")),
        new Rule("클래스 선언", Pattern.compile("\\bclass\\s+\\w+")),
        new Rule("객체 생성", Pattern.compile("\\bnew\\s+[A-Z]\\w*\\s*\\(")),
        new Rule("변수 선언", Pattern.compile("\\b(?:byte|short|int|long|float|double|boolean|char|String)\\s+\\w+"))
    );

    public List<Detected> detect(String code) {
        if (code == null || code.isBlank()) throw new IllegalArgumentException("Java 코드가 비어 있습니다.");
        String codeWithoutComments = removeComments(code);
        List<Detected> found = new ArrayList<>();
        for (Rule rule : RULES) {
            var matcher = rule.pattern.matcher(codeWithoutComments);
            if (matcher.find()) {
                String evidence = matcher.group();
                found.add(new Detected(rule.name, evidence.length() > 80 ? evidence.substring(0, 80) : evidence));
            }
            if (found.size() == 3) break;
        }
        if (found.size() < 3) throw new IllegalArgumentException("서로 다른 Java 문법을 3개 이상 포함한 파일을 업로드해 주세요.");
        return found;
    }

    private String removeComments(String code) {
        StringBuilder result = new StringBuilder(code.length());
        boolean lineComment = false;
        boolean blockComment = false;
        boolean stringLiteral = false;
        boolean charLiteral = false;
        boolean escaped = false;

        for (int i = 0; i < code.length(); i++) {
            char current = code.charAt(i);
            char next = i + 1 < code.length() ? code.charAt(i + 1) : '\0';

            if (lineComment) {
                if (current == '\n') {
                    lineComment = false;
                    result.append(current);
                } else {
                    result.append(' ');
                }
                continue;
            }
            if (blockComment) {
                if (current == '*' && next == '/') {
                    result.append("  ");
                    i++;
                    blockComment = false;
                } else {
                    result.append(current == '\n' ? '\n' : ' ');
                }
                continue;
            }
            if (!stringLiteral && !charLiteral && current == '/' && next == '/') {
                result.append("  ");
                i++;
                lineComment = true;
                continue;
            }
            if (!stringLiteral && !charLiteral && current == '/' && next == '*') {
                result.append("  ");
                i++;
                blockComment = true;
                continue;
            }

            result.append(current);
            if (escaped) {
                escaped = false;
            } else if ((stringLiteral || charLiteral) && current == '\\') {
                escaped = true;
            } else if (!charLiteral && current == '"') {
                stringLiteral = !stringLiteral;
            } else if (!stringLiteral && current == '\'') {
                charLiteral = !charLiteral;
            }
        }
        return result.toString();
    }
}
