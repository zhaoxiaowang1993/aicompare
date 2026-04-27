## ADDED Requirements

### Requirement: Password Login and Token Issuance
The system MUST authenticate users with username/password and SHALL issue access token, refresh token, token type, expiry metadata, and basic user role information on successful login.

#### Scenario: Login succeeds with valid credentials
- **GIVEN** an active user account exists with matching username and password
- **WHEN** the client calls `POST /api/auth/login` with valid credentials
- **THEN** the API returns `200` with `access_token`, `refresh_token`, `expires_in`, `refresh_expires_in`, and user role payload

#### Scenario: Login fails with invalid credentials
- **GIVEN** the submitted username or password is invalid
- **WHEN** the client calls `POST /api/auth/login`
- **THEN** the API returns `401 AUTH_INVALID_CREDENTIALS` without revealing which field failed

### Requirement: Refresh Token Renewal
The system MUST support access token renewal by refresh token and SHALL reject invalid or expired refresh tokens with `401` error semantics.

#### Scenario: Refresh succeeds with valid refresh token
- **GIVEN** a non-revoked and non-expired refresh token
- **WHEN** the client calls `POST /api/auth/refresh`
- **THEN** the API returns `200` with a new access token and refresh token pair

#### Scenario: Refresh fails with invalid or expired token
- **GIVEN** a malformed, revoked, or expired refresh token
- **WHEN** the client calls `POST /api/auth/refresh`
- **THEN** the API returns `401 AUTH_INVALID_REFRESH_TOKEN` or `401 AUTH_REFRESH_TOKEN_EXPIRED`

### Requirement: Current User Identity Query
The system SHALL provide an authenticated identity endpoint and MUST return current user id, username, role, and active status.

#### Scenario: Read current user profile
- **GIVEN** a valid Bearer access token is present
- **WHEN** the client calls `GET /api/auth/me`
- **THEN** the API returns `200` with `id`, `username`, `role`, and `is_active`

#### Scenario: Missing or invalid token on protected endpoint
- **GIVEN** no token or an invalid token is provided
- **WHEN** the client calls a protected endpoint including `GET /api/auth/me`
- **THEN** the API returns `401 AUTH_UNAUTHORIZED`

### Requirement: Role-based Authorization Boundary
The system MUST enforce role-based access control and SHALL return `403 FORBIDDEN` when authenticated users call endpoints not permitted for their role.

#### Scenario: Operator accesses admin-only endpoint
- **GIVEN** an authenticated operator user
- **WHEN** the client calls `/api/admin/*` endpoints
- **THEN** the API returns `403 FORBIDDEN`
