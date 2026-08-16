# SaaS Portal Requirements

## 1. Purpose

Build a multi-tenant SaaS control plane that allows customers to register, create an organization, start a trial, and receive an isolated, production-ready application environment.

The portal must treat cloud vendors as replaceable infrastructure implementations. Product and control-plane code must operate using business concepts such as region, capacity, product, and release—not vendor-specific concepts such as Droplets, EC2, or RDS.

## 2. Technical Stack

| Layer | Technology |
| --- | --- |
| Customer and admin web apps | Vue 3, TypeScript, Vite |
| UI styling | Tailwind CSS |
| State management | Pinia |
| Routing | Vue Router |
| Backend API and workers | NestJS, TypeScript |
| Database | PostgreSQL 17 |
| ORM and migrations | TypeORM |
| API style | REST/JSON with OpenAPI documentation |
| Background jobs | Redis-backed queue (BullMQ) |
| Authentication | Email/password with secure HTTP-only cookie or short-lived JWT plus refresh token |
| Application packaging | Docker images with immutable version tags |

## 3. Architecture Principles

The solution consists of four logical layers:

1. **Portal UI** — customer onboarding, environment status, trial details, backups, and internal administration.
2. **Control plane** — tenants, provisioning, deployments, operations, backup orchestration, monitoring, trials, and subscriptions.
3. **Infrastructure abstraction** — capability-based interfaces for compute, database, storage, DNS, networking, secrets, and backups.
4. **Provider adapters** — DigitalOcean for the MVP, with AWS and Alibaba Cloud adapters possible later.

The following rules are mandatory:

- Controllers and domain services must not call a cloud SDK directly.
- Vendor-specific IDs and metadata must remain inside provider adapters and the infrastructure resource registry.
- Public provisioning requests must use `product`, `region`, `size`, `database`, and `release`; they must not expose a cloud provider or vendor product.
- DNS, secrets, and payment integrations must use independent abstractions.
- Every infrastructure-changing action must run asynchronously and be recorded as an operation.
- Provisioning and retryable infrastructure steps must be idempotent.

## 4. Roles and Access

### 4.1 Customer roles

- **Organization Owner** — manages the organization, members, trial/subscription, and environment.
- **Organization Admin** — manages members and environment operations except ownership transfer and billing-sensitive actions.
- **Organization Member** — views the environment and opens the hosted application.

### 4.2 Internal roles

- **Platform Admin** — manages all tenants, environments, jobs, releases, infrastructure, and operational retries.
- **Platform Support** — has read access to tenant diagnostics and may retry approved failed operations.

Authorization must be enforced by the API. Hiding UI controls is not sufficient access control.

## 5. Core Domain Model

```text
User
  └── Organization Membership
        └── Organization (Tenant)
              ├── Subscription / Trial
              └── Environment
                    ├── Domain
                    ├── Application Release
                    ├── Infrastructure Resources
                    ├── Operations
                    └── Backups
```

An organization is the tenant boundary. The MVP supports one production environment per organization, while the data model must allow multiple environments later.

### 5.1 Required lifecycle states

Tenant/environment states:

```text
PENDING | PROVISIONING | ACTIVE | SUSPENDED | TRIAL_EXPIRED |
FAILED | DELETING | DELETED
```

Operation states:

```text
QUEUED | RUNNING | SUCCESS | FAILED | CANCELLED
```

Health states:

```text
HEALTHY | DEGRADED | DOWN | UNKNOWN
```

State transitions must be validated by the backend and recorded in the audit log.

## 6. MVP Functional Requirements

### 6.1 Registration and authentication

The system shall:

- Allow registration with name, email, and password.
- Require unique, normalized email addresses.
- Verify email ownership before provisioning starts.
- Support login, logout, forgotten-password, and password-reset flows.
- Rate-limit authentication and password-reset endpoints.
- Store passwords using Argon2id or bcrypt with an appropriate work factor.
- Invalidate active sessions after a password reset or account security action.

### 6.2 Organization onboarding

The onboarding flow shall be:

```text
Register → Verify Email → Create Organization → Choose Subdomain
→ Choose Region → Accept Terms → Start Trial → Provision Environment
```

The system shall:

- Collect the organization name and derive an editable URL-safe slug.
- Validate subdomain format and uniqueness.
- Let the customer choose a business-facing region such as Singapore, Malaysia, or Tokyo.
- Keep the underlying provider and vendor region private.
- Store the accepted terms version, timestamp, user, and IP address.
- Create the tenant, trial, environment, and initial provisioning operation atomically before enqueuing work.
- Prevent multiple trial environments from being created through repeated submissions.

### 6.3 Trial lifecycle

- The default trial duration shall be configurable and initially set to 30 days.
- The portal shall display the trial expiry date and days remaining.
- Notifications shall be scheduled for 7 days remaining, 3 days remaining, expiry, and pre-deletion.
- At expiry, the environment shall become `TRIAL_EXPIRED` and then `SUSPENDED` according to configurable policy.
- Trial data shall be retained for a configurable period, initially 30 days after suspension.
- Automatic deletion must require an auditable retention job and must not run before `retention_until`.

### 6.4 Environment dashboard

The customer dashboard shall display:

- Organization and environment name.
- Environment status and summarized health.
- Application URL.
- Product and installed application version.
- Selected region.
- Creation date.
- Trial or subscription status.
- Last successful backup time.

The primary MVP action is **Open Application**. Restart, customer-triggered restore, upgrade, and downgrade are out of scope unless explicitly enabled later.

### 6.5 Provisioning engine

Starting a trial shall enqueue a `PROVISION_TENANT` job and return immediately. The worker shall perform these logical steps:

1. Resolve a deployment profile from product, region, size, database type, and release channel.
2. Allocate compute.
3. Create the PostgreSQL database and credentials.
4. Create required storage.
5. Deploy the selected application Docker image.
6. Configure encrypted environment variables and secrets.
7. Run database migrations.
8. Create the initial tenant administrator in the hosted application.
9. Configure DNS.
10. Configure TLS.
11. Run application and database health checks.
12. Mark the environment `ACTIVE` only after all checks pass.

Each step shall:

- Have a stable idempotency key.
- Record start, completion, provider reference, and sanitized error information.
- Detect an existing successfully created resource and skip duplicate creation on retry.
- Have bounded retries, timeouts, and exponential backoff where appropriate.

If a required step fails, the environment shall become `FAILED`; existing resource records must be retained for diagnosis and cleanup. Secrets must never appear in logs or error messages.

### 6.6 Infrastructure provider abstraction

The backend shall define small capability interfaces rather than one large vendor service:

```ts
interface ComputeProvider {
  create(input: CreateComputeInput): Promise<ProviderResource>;
  delete(resourceId: string): Promise<void>;
  getStatus(resourceId: string): Promise<ResourceStatus>;
}

interface DatabaseProvider { /* create, delete, status */ }
interface StorageProvider { /* create, delete, status */ }
interface DnsProvider { /* createRecord, deleteRecord */ }
interface BackupProvider { /* create, restore, delete, status */ }
interface SecretProvider { /* put, getReference, rotate, delete */ }
```

The MVP shall implement a DigitalOcean adapter. AWS and Alibaba Cloud are explicitly deferred. Internal resource names shall be generic (`compute_resource_id`, not `droplet_id`).

### 6.7 Resource registry

Every created external resource shall be registered with:

- Tenant and environment IDs.
- Provider and capability/resource type.
- Provider resource ID.
- Internal idempotency key.
- Region and current status.
- Non-secret JSON metadata.
- Created, updated, and deleted timestamps.

The registry shall be the authoritative mapping between control-plane entities and provider resources.

### 6.8 Application releases and database migrations

- Application artifacts shall be versioned Docker images with immutable tags or digests.
- A release shall record its semantic version, image reference, status, release time, and minimum database schema version.
- An environment shall independently record application version and database schema version.
- Only platform admins may initiate upgrades in the MVP.
- An upgrade shall create a pre-upgrade backup, deploy the new release, run migrations, and perform health checks.
- Failed migrations shall stop the workflow and set an explicit failure state; destructive automatic database rollback is prohibited unless the migration is declared reversible.
- Customer-initiated downgrade is out of scope.

### 6.9 Backups

- The system shall create scheduled automatic logical PostgreSQL backups to object storage.
- Backup metadata shall include tenant, environment, type, status, application version, database schema version, storage provider/key, size, checksum, timestamps, and expiry.
- Backup types shall include `AUTOMATIC`, `MANUAL`, and `PRE_UPGRADE`.
- Backups shall be encrypted in transit and at rest.
- Retention shall be configurable by plan or deployment profile.
- The system shall verify backup completion and checksum and expose the last successful backup in the portal.
- Customer-triggered restore is deferred; platform-admin restore must be audited.

### 6.10 Monitoring and health

- Workers shall periodically check application reachability, database connectivity, TLS validity, disk utilization, and last successful backup.
- The customer portal shall show only the summarized environment health state and essential checks.
- Monitoring history and provider detail shall be available to platform admins.
- Building a custom metrics platform is out of scope; integrations may be added later.

### 6.11 Internal admin portal

The admin portal shall provide:

- Tenant and environment search/filtering.
- Tenant status, region, provider, trial/subscription, and health views.
- Provisioning jobs and step-level diagnostics.
- Operations, backups, releases, infrastructure resources, and sanitized errors.
- Retry for failed idempotent operations.
- Suspend, resume, and delete workflows with confirmation and audit entries.
- Role-protected access separate from ordinary customer permissions.

### 6.12 Audit and operation history

All security-sensitive or infrastructure-changing actions shall write an immutable audit event containing:

- Actor type and actor ID.
- Action and target type/ID.
- Tenant and environment IDs where applicable.
- Request/correlation ID.
- Timestamp and source IP.
- Result and sanitized error code.
- Non-secret change metadata.

Operations shall additionally record their type, status, progress/step, start/completion time, retry count, and error information.

## 7. Data Requirements

The initial PostgreSQL schema shall include at least:

- `users`
- `user_sessions`
- `email_verifications`
- `organizations`
- `organization_users`
- `terms_acceptances`
- `products`
- `plans`
- `trials`
- `subscriptions`
- `environments`
- `domains`
- `deployment_profiles`
- `cloud_accounts`
- `infrastructure_resources`
- `application_releases`
- `environment_versions`
- `provisioning_jobs`
- `provisioning_steps`
- `operations`
- `backups`
- `audit_logs`
- `notification_deliveries`

Requirements for persistence:

- Use UUIDs or ULIDs for externally visible identifiers.
- Use UTC for stored timestamps and convert only in the UI.
- Add unique constraints for normalized email, organization slug, full domain, provider resource mapping, and idempotency keys.
- Use foreign keys and transactions for control-plane consistency.
- Use soft deletion only where retention or auditing requires it; external infrastructure deletion must still be explicit and tracked.
- JSON metadata must not contain credentials, tokens, private keys, or database passwords.
- Database changes must use version-controlled TypeORM migrations; production schema synchronization must be disabled.

## 8. API Requirements

- All endpoints shall be namespaced under `/api/v1`.
- OpenAPI documentation shall be generated from NestJS decorators.
- Inputs shall use DTO validation, transformation, allowlists, and size limits.
- Error responses shall use stable application error codes and a correlation ID.
- List endpoints shall support pagination and appropriate filtering.
- Mutating requests that can be repeated shall accept or generate an idempotency key.
- Provisioning endpoints shall return `202 Accepted` with an operation ID.
- Environment and operation status may initially use polling; WebSocket/SSE updates are optional.
- Health endpoints shall distinguish liveness from dependency readiness.

Example provisioning request:

```json
{
  "tenantId": "01JEXAMPLE",
  "product": "inventory",
  "region": "singapore",
  "size": "starter",
  "database": "postgresql",
  "release": "stable"
}
```

## 9. Security and Privacy Requirements

- Enforce TLS for all production traffic.
- Encrypt cloud credentials and application secrets with a master key stored separately from PostgreSQL.
- Access secrets by opaque reference wherever possible.
- Apply least-privilege credentials per provider capability and environment.
- Protect browser sessions against CSRF, XSS, fixation, and token theft.
- Configure secure, HTTP-only, SameSite cookies when cookies are used.
- Apply rate limits to authentication, onboarding, and infrastructure actions.
- Redact secrets and personal data from logs.
- Validate tenant ownership on every tenant-scoped query to prevent cross-tenant access.
- Record privileged data access and all admin actions.
- Define configurable data retention and deletion policies.
- Back up the control-plane database and regularly test recovery.

## 10. Non-Functional Requirements

### 10.1 Reliability

- API instances and workers must be independently deployable and horizontally scalable.
- Jobs must survive worker restarts without being silently lost.
- Duplicate job delivery must not create duplicate infrastructure.
- External calls must use explicit timeouts and retry policies.
- A failed workflow must remain diagnosable and safely retryable.

### 10.2 Performance

- Typical authenticated API reads should complete within 500 ms at the 95th percentile, excluding third-party calls.
- User-facing pages should provide responsive loading and error states.
- Provisioning duration is provider-dependent; the portal must show current progress and never hold an HTTP request open for completion.

### 10.3 Observability

- Emit structured logs with request, operation, tenant, and environment correlation IDs.
- Capture API error rate, queue depth, job duration/failure, provisioning step duration, and environment health.
- Alert operators on repeated provisioning failures, queue stalls, backup failures, and control-plane dependency outages.

### 10.4 Maintainability

- Keep Vue features organized by domain and keep NestJS modules aligned with domain boundaries.
- Provider adapters must pass a shared contract test suite.
- Business services must be testable using provider fakes without network access.
- Use linting, formatting, strict TypeScript, unit tests, integration tests, and migration checks in CI.

### 10.5 Accessibility and responsiveness

- Customer and admin portals shall support current desktop and mobile browsers.
- Core workflows shall meet WCAG 2.1 AA expectations for keyboard access, labels, focus, contrast, and error feedback.

## 11. MVP Scope

### Included

- Registration, login, email verification, and password reset.
- Organization and membership foundation.
- Terms acceptance, unique subdomain, and region selection.
- Configurable free trial.
- Asynchronous, idempotent tenant provisioning.
- DigitalOcean provider adapter.
- Isolated application, PostgreSQL database, DNS/TLS, and health check.
- Docker-based releases and platform-controlled migrations.
- Automatic logical backups.
- Environment dashboard and Open Application action.
- Suspend and delete lifecycle.
- Admin portal, audit log, and operation history.

### Deferred

- Full payment and invoicing engine.
- Customer-triggered restore, restart, upgrade, or downgrade.
- AWS and Alibaba Cloud adapters.
- Multi-environment organizations.
- Marketplace integrations.
- Advanced monitoring dashboards.
- Terraform/OpenTofu orchestration; the first adapter may use provider APIs directly.

The database may include minimal `plans` and `subscriptions` structures for future billing, but payment processing is not part of MVP acceptance.

## 12. MVP Acceptance Criteria

The MVP is accepted when all of the following are demonstrated in a staging environment:

1. A new user can register, verify email, create an organization, accept terms, select an available subdomain and region, and start a trial.
2. Starting a trial returns promptly with an operation ID and creates exactly one asynchronous provisioning workflow.
3. The workflow creates an isolated application and PostgreSQL database, configures DNS/TLS, runs migrations, creates the initial tenant admin, passes health checks, and marks the environment `ACTIVE`.
4. Retrying a workflow after an injected late-stage failure does not duplicate already-created infrastructure.
5. The customer can view status, health, URL, version, trial expiry, and last backup, then open the application.
6. An automatic encrypted logical backup is created, verified, registered, and shown in the portal.
7. A platform admin can find the tenant, inspect every provisioning step, see sanitized errors, and retry a failed operation.
8. Expiring a trial triggers notifications and transitions the environment according to the configured suspension and retention policy.
9. Suspending or deleting an environment is asynchronous, authorized, idempotent, and auditable.
10. Cross-tenant API access tests fail, secrets do not appear in logs or metadata, and all privileged operations produce audit events.
11. The backend test suite covers state transitions, authorization, provider contracts, job idempotency, and critical onboarding flows.
12. The frontend passes its production build, linting, and core end-to-end onboarding and dashboard tests.

## 13. Future Extension Rules

New cloud providers must be introduced through capability adapters and deployment-profile configuration. Supporting a new provider must not require changes to public onboarding requests or core tenant services.

Billing providers, DNS providers, and secret stores must follow the same rule: integrations are replaceable implementations behind stable domain interfaces.
