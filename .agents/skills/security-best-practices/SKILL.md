---
name: security-best-practices
description: Comprehensive security hardening for web applications. Covers HTTPS, input validation, authentication, OWASP Top 10, rate limiting, security headers, CSRF protection, and secrets management.
metadata:
  version: 1.0.0
  author: supercent-io
---

# Security Best Practices

## Step 1: Security Headers & HTTPS
- Configure Helmet middleware for CSP, HSTS, X-Frame-Options
- Enforce HTTPS redirects in production
- Rate limiting: 100 req/15min general, 5 req/15min for auth endpoints

## Step 2: Input Validation & Injection Prevention
- Validate all inputs with schemas (Joi/Zod)
- Use parameterized database queries (prevent SQL injection)
- Sanitize output to prevent XSS

## Step 3: CSRF Protection
- CSRF tokens on all state-changing requests (POST, PUT, DELETE)

## Step 4: Secrets Management
- Environment variables for all secrets
- Never hardcode DB credentials, JWT secrets, API keys
- Never commit .env files

## Step 5: Authentication
- JWT with short-lived access tokens (15min)
- Refresh token rotation (7 days)
- Bcrypt password hashing

## MUST Rules
1. HTTPS mandatory in production
2. Secrets via environment variables
3. Validate all user input
4. Parameterized queries only
5. Rate limiting for DDoS prevention

## MUST NOT
1. No eval() (code injection risk)
2. No direct innerHTML (XSS risk)
3. Never commit secrets to version control

## OWASP Top 10 Checklist
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Data Integrity Failures
9. Logging Failures
10. SSRF
