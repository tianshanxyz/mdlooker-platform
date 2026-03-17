---
name: "code-analyzer"
description: "Analyzes code for syntax errors, style issues, performance problems, and duplicate code. Invoke when user asks for code review, quality check, or optimization suggestions."
---

# Code Analyzer

This skill performs comprehensive code analysis to identify issues and provide optimization recommendations.

## Capabilities

1. **Syntax Error Detection**: Identifies syntax errors, type mismatches, and compilation issues
2. **Code Style Check**: Validates against coding standards and best practices
3. **Performance Analysis**: Detects performance bottlenecks and inefficient patterns
4. **Duplicate Code Detection**: Finds redundant or duplicated code blocks
5. **Optimization Suggestions**: Provides actionable recommendations for improvement

## When to Use

- User asks for code review or quality check
- Before committing or merging code
- When refactoring or optimizing existing code
- When user wants to improve code maintainability

## Analysis Process

1. **Scan the codebase** using appropriate tools (Grep, Glob, SearchCodebase)
2. **Identify syntax errors** by checking for common mistake patterns
3. **Check code style** against language-specific conventions
4. **Analyze performance** by looking for inefficient loops, unnecessary operations
5. **Detect duplicates** by finding similar code blocks
6. **Generate recommendations** with specific fixes

## Output Format

Provide analysis results in this structure:

```markdown
## Code Analysis Report

### 1. Syntax Errors
- [File:Line] Description of error
- [File:Line] Description of error

### 2. Code Style Issues
- [File:Line] Issue description → Suggested fix

### 3. Performance Issues
- [File:Line] Problem description → Optimization suggestion

### 4. Duplicate Code
- [Location1] and [Location2] - Similar code blocks → Refactoring suggestion

### 5. Optimization Recommendations
- Priority: High/Medium/Low
- Issue: Description
- Solution: Specific fix
- Expected benefit: What improves
```

## Language-Specific Checks

### JavaScript/TypeScript
- Unused imports and variables
- Missing type annotations
- Async/await misuse
- Memory leak patterns
- Inefficient array operations

### Python
- PEP 8 compliance
- Unused imports
- Mutable default arguments
- List comprehension opportunities
- Exception handling issues

### CSS/SCSS
- Unused selectors
- Duplicate properties
- Specificity issues
- Performance-impacting patterns

### General
- Hardcoded values
- Magic numbers
- Comment quality
- Function length
- Nesting depth
