---
name: "security-auditor"
description: "Audits code for security vulnerabilities including SQL injection, XSS, CSRF, data encryption, and access control. Invoke when user asks for security review, vulnerability scan, or before production deployment."
---

# Security Auditor

This skill performs comprehensive security audits to identify vulnerabilities and provide remediation strategies.

## Capabilities

1. **SQL Injection Detection**: Identifies unsafe SQL query construction
2. **XSS Prevention**: Checks for cross-site scripting vulnerabilities
3. **CSRF Protection**: Validates cross-site request forgery defenses
4. **Sensitive Data Protection**: Ensures encryption of passwords, tokens, PII
5. **Access Control Review**: Validates authentication and authorization mechanisms
6. **Dependency Security**: Checks for vulnerable dependencies
7. **Configuration Security**: Reviews security headers and settings

## When to Use

- User asks for security review or vulnerability scan
- Before production deployment
- After major feature additions
- During security compliance audits
- When handling sensitive data or authentication

## Security Audit Process

1. **Input Validation Analysis**
   - Check for unsanitized user inputs
   - Validate input sanitization patterns
   - Identify missing validation logic

2. **SQL Injection Scan**
   - Find string concatenation in SQL queries
   - Check for parameterized query usage
   - Identify ORM misuse patterns

3. **XSS Vulnerability Check**
   - Review output encoding practices
   - Check for dangerous HTML insertion
   - Validate Content Security Policy

4. **CSRF Protection Review**
   - Verify CSRF token implementation
   - Check SameSite cookie settings
   - Validate state-changing request protection

5. **Authentication & Authorization**
   - Review password storage (hashing)
   - Check session management
   - Validate permission checks
   - Review JWT implementation

6. **Sensitive Data Handling**
   - Find hardcoded secrets
   - Check encryption at rest
   - Validate encryption in transit (HTTPS/TLS)
   - Review PII handling

7. **Dependency Audit**
   - Check for known vulnerable packages
   - Review outdated dependencies
   - Identify unnecessary dependencies

## Output Format

```markdown
# Security Audit Report

## Executive Summary
- **Audit Date**: [Date]
- **Risk Level**: [Critical / High / Medium / Low]
- **Total Issues**: X (Critical: X, High: X, Medium: X, Low: X)
- **Overall Security Score**: X/100

## Critical Vulnerabilities 🔴

### 1. [Vulnerability Name]
- **Severity**: Critical
- **Location**: [File:Line]
- **Description**: [Detailed description]
- **Impact**: [What could happen if exploited]
- **Remediation**: [Specific fix with code example]

## High Risk Issues 🟠

### 2. [Vulnerability Name]
- **Severity**: High
- **Location**: [File:Line]
- **Description**: [Detailed description]
- **Impact**: [Potential damage]
- **Remediation**: [Fix with code example]

## Medium Risk Issues 🟡

### 3. [Vulnerability Name]
- **Severity**: Medium
- **Location**: [File:Line]
- **Description**: [Detailed description]
- **Remediation**: [Fix recommendation]

## Low Risk Issues 🟢

### 4. [Vulnerability Name]
- **Severity**: Low
- **Location**: [File:Line]
- **Description**: [Detailed description]
- **Remediation**: [Fix recommendation]

## Security Checklist Results

| Category | Status | Details |
|----------|--------|---------|
| SQL Injection Protection | ✅/❌ | [Details] |
| XSS Prevention | ✅/❌ | [Details] |
| CSRF Protection | ✅/❌ | [Details] |
| Password Hashing | ✅/❌ | [Details] |
| HTTPS Enforcement | ✅/❌ | [Details] |
| Input Validation | ✅/❌ | [Details] |
| Authentication | ✅/❌ | [Details] |
| Authorization | ✅/❌ | [Details] |
| Secrets Management | ✅/❌ | [Details] |
| Security Headers | ✅/❌ | [Details] |

## Remediation Priority

### Immediate (Fix Today)
1. [Critical Issue 1]
2. [Critical Issue 2]

### This Week
1. [High Priority Issue 1]
2. [High Priority Issue 2]

### Next Sprint
1. [Medium Priority Issues]

## Best Practices Recommendations

### Input Handling
- Always validate and sanitize user inputs
- Use allowlists rather than blocklists
- Implement proper input length limits

### Output Encoding
- Encode all dynamic content before rendering
- Use framework-provided escaping functions
- Implement Content Security Policy headers

### Authentication
- Use strong password hashing (bcrypt, Argon2)
- Implement multi-factor authentication
- Use secure session management

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Never log sensitive information
```

## Vulnerability Patterns to Check

### SQL Injection
```javascript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ Safe
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### XSS
```javascript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Safe
element.textContent = userInput;
```

### Hardcoded Secrets
```javascript
// ❌ Vulnerable
const API_KEY = 'sk-1234567890abcdef';

// ✅ Safe
const API_KEY = process.env.API_KEY;
```

### Insecure Authentication
```javascript
// ❌ Vulnerable
if (password === storedPassword) { ... }

// ✅ Safe
const match = await bcrypt.compare(password, hashedPassword);
```

## Key Files to Audit

### Backend/API
- Database query files
- API route handlers
- Authentication middleware
- Session management

### Frontend
- Form handlers
- URL parameter processing
- LocalStorage/SessionStorage usage
- Dynamic content rendering

### Configuration
- Environment variables
- Security headers
- CORS settings
- Cookie settings

### Dependencies
- package.json / requirements.txt
- Lock files
- Known vulnerability databases
