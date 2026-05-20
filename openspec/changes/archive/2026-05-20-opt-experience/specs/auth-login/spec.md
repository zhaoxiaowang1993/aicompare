## ADDED Requirements

### Requirement: Login Feedback Typography Matches Design
The login page SHALL render transient loading and invalid-credential feedback messages using the normal text weight specified by `design/pages/oauth-login.pen`. These messages MUST NOT appear bold or semibold.

#### Scenario: Loading message uses normal weight
- **GIVEN** a user submits the login form
- **WHEN** the login page displays `正在验证账号并签发访问令牌...`
- **THEN** the message text is rendered with normal font weight
- **AND** the styling remains consistent with the OAuth login design

#### Scenario: Invalid credential message uses normal weight
- **GIVEN** the login API returns `AUTH_INVALID_CREDENTIALS`
- **WHEN** the login page displays `账号或密码错误，请重新输入。`
- **THEN** the message text is rendered with normal font weight
- **AND** the styling remains consistent with the OAuth login design
