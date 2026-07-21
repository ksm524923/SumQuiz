package com.example.backend.service;

import com.example.backend.dto.CodingProblemDraft;
import com.example.backend.dto.CodingReviewResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Service
public class JavaCodeExecutionService {
    private static final long COMPILE_TIMEOUT_SECONDS = 10;
    private static final long RUN_TIMEOUT_SECONDS = 3;
    private static final int MAX_SOURCE_LENGTH = 50_000;
    private static final int MAX_OUTPUT_BYTES = 32_768;
    private static final Pattern MAIN_CLASS = Pattern.compile("\\bpublic\\s+class\\s+Main\\b");
    private static final Pattern SOLUTION_CLASS = Pattern.compile("\\bpublic\\s+class\\s+Solution\\b");
    private static final Pattern BLOCKED_API = Pattern.compile(
        "\\b(package|ProcessBuilder|Runtime\\s*\\.|System\\s*\\.\\s*(exit|getenv|getProperties|getProperty|load|loadLibrary)|java\\s*\\.\\s*(io|nio|net|lang\\s*\\.\\s*reflect)|ClassLoader)\\b"
    );
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CodingReviewResponse execute(CodingProblemDraft problem, String sourceCode) {
        if (problem.methodName() != null && !problem.methodName().isBlank()) {
            return executeSolution(problem, sourceCode);
        }
        return executeMain(problem, sourceCode);
    }

    private CodingReviewResponse executeMain(CodingProblemDraft problem, String sourceCode) {
        validateSource(sourceCode, MAIN_CLASS, "기본 실행 코드가 손상되었습니다. 코드 초기화 버튼을 누른 뒤 solution 메서드 내부만 수정해 주세요.");
        Path workDirectory = null;
        try {
            workDirectory = Files.createTempDirectory("hwv-java-");
            Files.writeString(workDirectory.resolve("Main.java"), sourceCode, StandardCharsets.UTF_8);

            ProcessResult compilation = runProcess(
                List.of(javaCommand("javac"), "-encoding", "UTF-8", "Main.java"),
                workDirectory, "", COMPILE_TIMEOUT_SECONDS
            );
            if (compilation.timedOut()) {
                return failedAll(problem, "컴파일 시간이 초과되었습니다.", compilation.output());
            }
            if (compilation.exitCode() != 0) {
                return failedAll(problem, "컴파일 오류를 수정해 주세요.", compilation.output());
            }

            List<CodingReviewResponse.TestResult> results = new ArrayList<>();
            for (CodingProblemDraft.TestCase test : problem.tests()) {
                ProcessResult execution = runProcess(
                    List.of(javaCommand("java"), "-Xmx64m", "-XX:MaxMetaspaceSize=64m", "-cp", ".", "Main"),
                    workDirectory, test.input(), RUN_TIMEOUT_SECONDS
                );
                String actual = execution.output().trim();
                String expected = test.expected().trim();
                boolean passed = !execution.timedOut()
                    && execution.exitCode() == 0
                    && normalize(actual).equals(normalize(expected));
                String reason = passed
                    ? "실제 실행 결과가 기대 출력과 일치합니다."
                    : execution.timedOut()
                        ? "실행 제한 시간 3초를 초과했습니다."
                        : execution.exitCode() != 0
                            ? "실행 중 오류가 발생했습니다."
                            : "실제 출력이 기대 출력과 다릅니다.";
                results.add(new CodingReviewResponse.TestResult(
                    test.id(), test.name(), passed ? "passed" : "failed",
                    test.input(), test.expected(), actual, reason
                ));
            }

            boolean allPassed = results.stream().allMatch(test -> "passed".equals(test.status()));
            return new CodingReviewResponse(
                allPassed ? "passed" : "failed",
                allPassed ? "모든 테스트를 통과했습니다." : "입력 처리와 출력 형식을 다시 확인해 주세요.",
                allPassed ? "실제 Java 실행 결과가 모든 기대 출력과 일치합니다." : "실패한 테스트의 실제 출력과 기대 출력을 비교해 수정해 주세요.",
                results
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Java 실행 환경을 준비하지 못했습니다.", exception);
        } finally {
            deleteDirectory(workDirectory);
        }
    }

    private CodingReviewResponse executeSolution(CodingProblemDraft problem, String sourceCode) {
        validateSource(sourceCode, SOLUTION_CLASS, "기본 Solution 클래스가 손상되었습니다. 코드 초기화 버튼을 누른 뒤 solution 메서드 내부만 수정해 주세요.");
        Path workDirectory = null;
        try {
            workDirectory = Files.createTempDirectory("hwv-solution-");
            Files.writeString(workDirectory.resolve("Solution.java"), sourceCode, StandardCharsets.UTF_8);
            Files.writeString(workDirectory.resolve("Main.java"), buildHarness(problem), StandardCharsets.UTF_8);
            ProcessResult compilation = runProcess(
                List.of(javaCommand("javac"), "-encoding", "UTF-8", "Solution.java", "Main.java"),
                workDirectory, "", COMPILE_TIMEOUT_SECONDS
            );
            if (compilation.timedOut()) return failedAll(problem, "컴파일 시간이 초과되었습니다.", compilation.output());
            if (compilation.exitCode() != 0) return failedAll(problem, "solution 메서드의 컴파일 오류를 수정해 주세요.", compilation.output());

            List<CodingReviewResponse.TestResult> results = new ArrayList<>();
            for (int index = 0; index < problem.tests().size(); index++) {
                CodingProblemDraft.TestCase test = problem.tests().get(index);
                ProcessResult execution = runProcess(
                    List.of(javaCommand("java"), "-Xmx64m", "-XX:MaxMetaspaceSize=64m", "-cp", ".", "Main", String.valueOf(index)),
                    workDirectory, "", RUN_TIMEOUT_SECONDS
                );
                String actual = execution.output().trim();
                boolean passed = !execution.timedOut() && execution.exitCode() == 0
                    && normalize(actual).equals(normalize(test.expected().trim()));
                String reason = passed ? "solution 반환값이 기대값과 일치합니다."
                    : execution.timedOut() ? "실행 제한 시간 3초를 초과했습니다."
                    : execution.exitCode() != 0 ? "solution 실행 중 오류가 발생했습니다."
                    : "solution 반환값이 기대값과 다릅니다.";
                results.add(new CodingReviewResponse.TestResult(test.id(), test.name(), passed ? "passed" : "failed",
                    test.input(), test.expected(), actual, reason));
            }
            boolean allPassed = results.stream().allMatch(test -> "passed".equals(test.status()));
            return new CodingReviewResponse(allPassed ? "passed" : "failed",
                allPassed ? "모든 테스트를 통과했습니다." : "실패한 테스트의 반환값을 확인해 주세요.",
                allPassed ? "solution 반환값이 모든 기대값과 일치합니다." : "실제 반환값과 기대값을 비교해 solution 메서드를 수정해 주세요.", results);
        } catch (IOException exception) {
            throw new IllegalStateException("Java 실행 환경을 준비하지 못했습니다.", exception);
        } finally {
            deleteDirectory(workDirectory);
        }
    }

    private void validateSource(String sourceCode, Pattern requiredClass, String classError) {
        if (sourceCode == null || sourceCode.isBlank()) throw new IllegalArgumentException("실행할 Java 코드를 입력해 주세요.");
        if (sourceCode.length() > MAX_SOURCE_LENGTH) throw new IllegalArgumentException("Java 코드는 50,000자 이하로 입력해 주세요.");
        if (!requiredClass.matcher(sourceCode).find()) throw new IllegalArgumentException(classError);
        if (BLOCKED_API.matcher(sourceCode).find()) throw new IllegalArgumentException("파일, 네트워크 또는 외부 프로세스 접근 코드는 실행할 수 없습니다.");
    }

    private String buildHarness(CodingProblemDraft problem) {
        if (problem.parameterTypes() == null || problem.parameterTypes().isEmpty()) {
            throw new IllegalArgumentException("문제의 solution 매개변수 정보가 없습니다.");
        }
        StringBuilder cases = new StringBuilder();
        for (int i = 0; i < problem.tests().size(); i++) {
            CodingProblemDraft.TestCase test = problem.tests().get(i);
            if (test.arguments() == null || test.arguments().size() != problem.parameterTypes().size()) {
                throw new IllegalArgumentException("테스트 인자 정보가 올바르지 않습니다.");
            }
            List<String> arguments = new ArrayList<>();
            for (int j = 0; j < problem.parameterTypes().size(); j++) {
                arguments.add(javaLiteral(problem.parameterTypes().get(j), test.arguments().get(j)));
            }
            cases.append("case \"").append(i).append("\" -> solution.")
                .append(problem.methodName()).append("(").append(String.join(", ", arguments)).append(");\n");
        }
        return """
            import java.lang.reflect.Array;
            public class Main {
                private static String format(Object value) {
                    if (value == null) return "null";
                    if (!value.getClass().isArray()) return String.valueOf(value);
                    StringBuilder result = new StringBuilder("[");
                    for (int i = 0; i < Array.getLength(value); i++) {
                        if (i > 0) result.append(", ");
                        result.append(String.valueOf(Array.get(value, i)));
                    }
                    return result.append(']').toString();
                }
                public static void main(String[] args) {
                    Solution solution = new Solution();
                    Object result = switch (args[0]) {
                        %s
                        default -> throw new IllegalArgumentException("unknown test");
                    };
                    System.out.print(format(result));
                }
            }
            """.formatted(cases);
    }

    private String javaLiteral(String type, String rawValue) {
        try {
            if (type.endsWith("[]")) {
                String elementType = type.substring(0, type.length() - 2);
                JsonNode values = objectMapper.readTree(rawValue);
                if (!values.isArray()) throw new IllegalArgumentException("배열 인자는 JSON 배열 형식이어야 합니다.");
                List<String> elements = new ArrayList<>();
                values.forEach(value -> elements.add(javaLiteral(elementType, value.asText())));
                return "new " + elementType + "[]{" + String.join(", ", elements) + "}";
            }
            return switch (type) {
                case "int" -> String.valueOf(Integer.parseInt(rawValue.trim()));
                case "long" -> Long.parseLong(rawValue.trim()) + "L";
                case "double" -> Double.toString(Double.parseDouble(rawValue.trim()));
                case "boolean" -> {
                    if (!"true".equals(rawValue) && !"false".equals(rawValue)) throw new IllegalArgumentException("boolean 인자가 올바르지 않습니다.");
                    yield rawValue;
                }
                case "String" -> objectMapper.writeValueAsString(rawValue);
                default -> throw new IllegalArgumentException("지원하지 않는 매개변수 타입입니다: " + type);
            };
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("테스트 인자를 Java 값으로 변환하지 못했습니다.", exception);
        }
    }

    private ProcessResult runProcess(List<String> command, Path directory, String input, long timeoutSeconds) throws IOException {
        Process process = new ProcessBuilder(command)
            .directory(directory.toFile())
            .redirectErrorStream(true)
            .start();
        process.getOutputStream().write(input.getBytes(StandardCharsets.UTF_8));
        process.getOutputStream().close();

        boolean finished;
        try {
            finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            throw new IllegalStateException("Java 실행이 중단되었습니다.", exception);
        }
        if (!finished) process.destroyForcibly();
        try {
            process.waitFor(1, TimeUnit.SECONDS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
        byte[] output = process.getInputStream().readNBytes(MAX_OUTPUT_BYTES + 1);
        String text = new String(output, 0, Math.min(output.length, MAX_OUTPUT_BYTES), StandardCharsets.UTF_8);
        if (output.length > MAX_OUTPUT_BYTES) text += "\n[출력이 너무 길어 중단되었습니다.]";
        return new ProcessResult(finished ? process.exitValue() : -1, text, !finished);
    }

    private CodingReviewResponse failedAll(CodingProblemDraft problem, String message, String actual) {
        List<CodingReviewResponse.TestResult> tests = problem.tests().stream()
            .map(test -> new CodingReviewResponse.TestResult(test.id(), test.name(), "failed", test.input(), test.expected(), actual, message))
            .toList();
        return new CodingReviewResponse("failed", message, actual, tests);
    }

    private String javaCommand(String name) {
        String executable = System.getProperty("os.name").toLowerCase().contains("win") ? name + ".exe" : name;
        return Path.of(System.getProperty("java.home"), "bin", executable).toString();
    }

    private String normalize(String value) {
        return value.replace("\r\n", "\n").stripTrailing();
    }

    private void deleteDirectory(Path directory) {
        if (directory == null || !Files.exists(directory)) return;
        try (var paths = Files.walk(directory)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try { Files.deleteIfExists(path); } catch (IOException ignored) { }
            });
        } catch (IOException ignored) { }
    }

    private record ProcessResult(int exitCode, String output, boolean timedOut) { }
}
