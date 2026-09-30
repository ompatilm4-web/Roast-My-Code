"""
Intelligent heuristic roast generator.
Used as a resilient, instant fallback whenever Groq API is unavailable, unauthenticated,
or rate-limited, guaranteeing that user requests NEVER crash with 502/500 errors.
"""
import random
import re
from app.schemas import RoastLLMOutput


def generate_heuristic_roast(system_prompt: str, user_content: str, target_type: str = "snippet") -> RoastLLMOutput:
    content_lower = user_content.lower()

    if "resume" in target_type.lower() or "resume" in system_prompt.lower():
        return _roast_resume(user_content, content_lower)
    elif "github" in target_type.lower() or "repo" in target_type.lower() or "repository" in system_prompt.lower():
        return _roast_repo(user_content, content_lower)
    else:
        return _roast_snippet(user_content, content_lower)


def _roast_snippet(code: str, lower: str) -> RoastLLMOutput:
    issues = []
    tips = []

    # Detect specific code smells
    has_eval = "eval(" in code
    has_var = bool(re.search(r"\bvar\s+", code))
    has_any = ": any" in code or ":any" in code
    has_console = "console.log" in code or "print(" in code
    has_todo = "todo" in lower or "fixme" in lower
    has_nested_loops = bool(re.search(r"for\b.*[\r\n]+.*for\b", code)) or bool(re.search(r"while\b.*[\r\n]+.*while\b", code))
    has_magic_numbers = bool(re.search(r"[^a-zA-Z0-9_](86400|3600|999|1337|42|10000)[^a-zA-Z0-9_]", code))
    single_char_vars = len(re.findall(r"\b(let|const|var)\s+[a-z]\s*=", code))
    lines_count = len(code.strip().splitlines())

    if has_eval:
        issues.append("you're literally running `eval()` in production like security was just a suggestion")
        tips.append("Immediately purge `eval()` and replace dynamic execution with static mapping or a safe parser.")
    if has_var:
        issues.append("`var` declarations straight from 2012 that make scope hoisting cry")
        tips.append("Migrate all legacy `var` declarations to block-scoped `const` and `let`.")
    if has_any:
        issues.append("generous usage of `: any` which turns TypeScript into Expensive JavaScript™")
        tips.append("Replace `: any` with strict interfaces or unknown with type narrowing.")
    if has_console:
        issues.append("debugging print statements left in place like breadcrumbs of desperation")
        tips.append("Rip out informal stdout/console statements and integrate a structured logger.")
    if has_todo:
        issues.append("TODO comments that have probably been collecting digital dust for two quarters")
        tips.append("Convert pending TODO comments into tracked GitHub issues or solve them now.")
    if has_nested_loops:
        issues.append("O(n³) loop nesting that will melt the cloud server the moment your dataset hits 1,000 rows")
        tips.append("Flatten nested iterations using hash maps, sets, or vectorized operations.")
    if single_char_vars > 1:
        issues.append(f"{single_char_vars} cryptic single-letter variable names that look like algebra homework")
        tips.append("Rename cryptic variables to intention-revealing, domain-specific identifiers.")

    if not issues:
        issues.append("naming conventions that appear to have been chosen by a random number generator")
        issues.append("absence of proper edge-case guarding or defensive error boundaries")
        tips.append("Add explicit type annotations and defensive validation for all function parameters.")
        tips.append("Wrap external side-effects in structured error handling with domain exceptions.")

    roast_intro = random.choice([
        "I looked at this code and my CPU fan started spinning out of pure existential dread.",
        "This looks like it was written during a 3 AM Red Bull binge right before a sprint demo.",
        "Calling this 'software engineering' is a violation of the Geneva Conventions.",
        "A fascinating piece of architectural archeology that manages to challenge modern programming standards.",
    ])

    issue_sentence = f" We found {', along with '.join(issues[:3])}."
    roast_outro = random.choice([
        " It works until someone actually looks at it with their eyes open.",
        " It's not technical debt anymore; it's a technical mortgage with compound interest.",
        " Treat your linters with respect before they organize a union against you.",
    ])

    roast_text = f"{roast_intro}{issue_sentence}{roast_outro}"

    # Score calculation
    penalty = len(issues) * 12 + (15 if lines_count > 60 else 5)
    quality = max(24, min(88, 85 - penalty))
    docs = max(20, min(85, 75 - (15 if not has_todo and "//" not in code and "#" not in code else 5)))
    arch = max(25, min(90, 80 - (20 if has_nested_loops or has_eval else 8)))

    if len(tips) < 3:
        tips.append("Decompose complex multi-responsibility functions into single-purpose modular units.")
        tips.append("Introduce automated unit tests covering the boundary cases and error branches.")

    return RoastLLMOutput(
        roast=roast_text,
        code_quality_score=quality,
        documentation_score=docs,
        architecture_score=arch,
        constructive_blueprint=tips[:4],
    )


def _roast_repo(user_content: str, lower: str) -> RoastLLMOutput:
    repo_name = "this repository"
    match = re.search(r"Repo:\s*([^\s\n]+)", user_content)
    if match:
        repo_name = match.group(1)

    has_tests = "test" in lower or "pytest" in lower or "jest" in lower
    has_readme = "readme" in lower
    has_docker = "docker" in lower

    roast_parts = [
        f"Inspecting `{repo_name}` feels like opening an abandoned attic: you suspect there's treasure, but mostly you find cobwebs and questionable architecture.",
    ]

    tips = []
    if not has_tests:
        roast_parts.append("Testing is apparently treated as an optional philosophical exercise that production users will perform for you.")
        tips.append("Establish an automated CI testing suite (e.g. pytest / vitest) with at least 80% coverage on core paths.")
    else:
        roast_parts.append("There are tests, but they look suspiciously like smoke tests that pass as long as the machine is plugged in.")
        tips.append("Expand test fixtures to stress edge-cases, mock external APIs, and assert boundary conditions.")

    if not has_readme or "readme is empty" in lower or "missing readme" in lower:
        roast_parts.append("The documentation appears to be transmitted purely through telepathy.")
        tips.append("Author an exhaustive README with installation prerequisites, environment setup, and architecture diagrams.")
    else:
        tips.append("Add interactive API documentation or OpenAPI/Swagger specs directly to the repository docs.")

    if not has_docker:
        tips.append("Containerize the runtime using multi-stage Docker builds to prevent 'works on my machine' syndrome.")
    else:
        tips.append("Optimize container image layering and introduce healthcheck probes for orchestrators.")

    tips.append("Implement automated linting and pre-commit hooks (Ruff / ESLint / Prettier) in your CI pipeline.")

    roast_text = " ".join(roast_parts)
    return RoastLLMOutput(
        roast=roast_text,
        code_quality_score=random.randint(48, 68),
        documentation_score=random.randint(35, 62),
        architecture_score=random.randint(45, 72),
        constructive_blueprint=tips[:4],
    )


def _roast_resume(user_content: str, lower: str) -> RoastLLMOutput:
    buzzwords = []
    for word in ["passionate", "rockstar", "ninja", "guru", "hardworking", "synergy", "spearheaded", "results-driven"]:
        if word in lower:
            buzzwords.append(word)

    has_metrics = bool(re.search(r"\b\d+%\b|\$\d+|\b\d+x\b", user_content))

    roast_parts = [
        "This resume reads like an AI prompt was asked to summarize LinkedIn's greatest corporate cliches.",
    ]

    tips = []
    if buzzwords:
        roast_parts.append(f"You used terms like {', '.join(buzzwords[:3])} which make recruiters instinctively reach for the delete key.")
        tips.append(f"Delete fluff words ({', '.join(buzzwords[:2])}) and replace them with concrete engineering scope.")
    else:
        roast_parts.append("The bullet points describe job attendance rather than engineering leverage.")

    if not has_metrics:
        roast_parts.append("There is not a single quantifiable dollar, percentage, or latency metric in sight — did anything you build actually move the needle?")
        tips.append("Apply the Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]' across every bullet point.")
    else:
        tips.append("Group your achievements by measurable business and latency impact rather than task lists.")

    tips.append("Include live links to public GitHub repos, deployed demos, or technical blog posts.")
    tips.append("Tailor your tech stack section to prioritize modern production frameworks over legacy tools.")

    roast_text = " ".join(roast_parts)
    return RoastLLMOutput(
        roast=roast_text,
        code_quality_score=random.randint(42, 65),  # Impact & Specificity
        documentation_score=random.randint(48, 70),  # Clarity & Formatting
        architecture_score=random.randint(38, 62),  # Structure & Relevance
        constructive_blueprint=tips[:4],
    )
