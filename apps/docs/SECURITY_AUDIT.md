# Security Audit

## Running Security Audits

### pnpm Audit

To check for security vulnerabilities:

```bash
pnpm audit
```

### Fixing Vulnerabilities

To automatically fix vulnerabilities:

```bash
pnpm audit --fix
```

### Manual Review

For critical vulnerabilities, review and update packages manually:

```bash
pnpm outdated
pnpm update [package-name]
```

## Last Audit

- **Date**: To be run manually
- **Command**: `pnpm audit`
- **Status**: Pending

## Notes

- Run `pnpm audit` regularly (monthly recommended)
- Review and fix high/critical severity issues immediately
- Keep dependencies up to date
- Use `pnpm audit --fix` for automatic fixes when safe

