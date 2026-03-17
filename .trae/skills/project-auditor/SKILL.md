---
name: "project-auditor"
description: "Audits project status by analyzing requirements, code progress, test coverage, and tasks. Invoke when user asks for project status, completion report, or risk assessment."
---

# Project Auditor

This skill performs comprehensive project audits to track progress, identify risks, and generate completion reports.

## Capabilities

1. **Requirements Analysis**: Reviews PRD, spec documents, and feature requirements
2. **Code Progress Tracking**: Analyzes implemented features vs planned features
3. **Test Coverage Assessment**: Evaluates test coverage across the codebase
4. **Task Management Review**: Checks TODOs, FIXMEs, and pending tasks
5. **Risk Identification**: Highlights blockers, delays, and potential issues
6. **Completion Reporting**: Generates overall project completion percentage

## When to Use

- User asks for project status or progress report
- Before sprint planning or milestone reviews
- When identifying project risks and blockers
- For weekly/monthly project health checks
- Before releases or deployments

## Audit Process

1. **Discover Project Structure**
   - Find README, PRD, spec documents
   - Identify project configuration files
   - Map out source code directories

2. **Analyze Requirements**
   - Read PRD/spec documents
   - Extract feature list and acceptance criteria
   - Identify must-have vs nice-to-have features

3. **Track Code Progress**
   - Search for implemented features
   - Check for feature flags or incomplete implementations
   - Compare against requirements

4. **Assess Test Coverage**
   - Find test files and test configurations
   - Calculate coverage metrics
   - Identify untested critical paths

5. **Review Tasks**
   - Search for TODO, FIXME, XXX comments
   - Check for open issues or tasks
   - Review pending pull requests

6. **Generate Report**
   - Calculate completion percentage
   - Identify high/medium/low risks
   - Provide actionable recommendations

## Output Format

```markdown
# Project Audit Report

## Executive Summary
- **Project Name**: [Name]
- **Audit Date**: [Date]
- **Overall Completion**: [X]%
- **Status**: [On Track / At Risk / Delayed]

## 1. Requirements Analysis

### Documented Requirements
| Feature | Priority | Status | Progress |
|---------|----------|--------|----------|
| Feature A | High | In Progress | 70% |
| Feature B | Medium | Complete | 100% |
| Feature C | High | Not Started | 0% |

### Requirements Coverage
- **Total Features**: X
- **Completed**: X (X%)
- **In Progress**: X (X%)
- **Not Started**: X (X%)

## 2. Code Implementation Status

### Core Modules
| Module | Lines of Code | Test Coverage | Status |
|--------|---------------|---------------|--------|
| Module A | 1,234 | 85% | ✅ Complete |
| Module B | 567 | 45% | ⚠️ Partial |
| Module C | 890 | 0% | ❌ Missing |

### Code Quality Metrics
- **Total Source Files**: X
- **Total Lines of Code**: X
- **Average File Size**: X lines
- **Code Duplication**: X%

## 3. Test Coverage Analysis

### Coverage by Category
- **Unit Tests**: X%
- **Integration Tests**: X%
- **E2E Tests**: X%
- **Overall Coverage**: X%

### Untested Critical Paths
- [File:Function] - Critical business logic
- [File:Function] - API endpoint

## 4. Pending Tasks

### TODOs/FIXMEs Found: X
| Location | Type | Description | Priority |
|----------|------|-------------|----------|
| file.ts:42 | TODO | Implement validation | High |
| file.ts:88 | FIXME | Fix memory leak | Critical |

### Open Tasks
- [ ] Task 1
- [ ] Task 2

## 5. Risk Assessment

### 🔴 High Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Missing test coverage | High | High | Add unit tests |
| Incomplete feature X | Medium | High | Prioritize completion |

### 🟡 Medium Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Technical debt | Medium | Medium | Schedule refactoring |

### 🟢 Low Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Minor code smells | Low | Low | Address in next sprint |

## 6. Recommendations

### Immediate Actions (This Week)
1. [Action 1]
2. [Action 2]

### Short-term (Next Sprint)
1. [Action 1]
2. [Action 2]

### Long-term (Next Quarter)
1. [Action 1]
2. [Action 2]

## 7. Next Milestone

**Target**: [Milestone Name]  
**Date**: [Target Date]  
**Completion Required**: X%  
**Current Trajectory**: [On Track / At Risk]
```

## Key Files to Check

### Requirements Documents
- `README.md`
- `PRD.md`, `SPEC.md`
- `docs/requirements/`
- `.trae/plans/`
- `features/`

### Project Configuration
- `package.json` (dependencies, scripts)
- `tsconfig.json`, `jsconfig.json`
- Test config files (`jest.config.js`, `vitest.config.ts`)

### Task Tracking
- `TODO.md`, `ROADMAP.md`
- GitHub Issues/Projects references
- Inline TODO/FIXME comments

### Test Files
- `**/*.test.ts`, `**/*.spec.ts`
- `tests/`, `__tests__/`
- Coverage reports (`coverage/`)
