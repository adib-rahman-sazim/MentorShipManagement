# Backend Project Structure

```
core-platform-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/           # Shared reusable code
│   ├── modules/          # Feature modules
│   ├── db/               # Database configuration
│   │   ├── db.config.ts
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── prod-seeder.ts
│   │       ├── dev-seeder.ts
│   │       └── core-seeders/   # Timestamped folders; each has seeder + constants/types/helpers
│   ├── utils/            # Utility functions
│   │   └── __tests__/
│   └── index.d.ts
├── infra/                # Infrastructure (dockerfiles, nginx, entrypoints)
├── scripts/              # Build and utility scripts
├── test/                 # Test files (unit, integration, e2e)
├── certs/                # SSL certificates
├── volume/               # Docker volumes
└── logs/                 # Application logs
```

## Technology Stack

- **Framework**: NestJS 11
- **ORM**: MikroORM 6 with PostgreSQL
- **Testing**: Vitest with supertest
- **Authentication**: Better Auth (See `src/modules/auth`)
- **Validation**: class-validator + class-transformer
- **Logging**: Winston with daily rotation

## Authorization (CASL)

Full guide: [docs/features/casl-authorization.md](docs/features/casl-authorization.md)

- Use **CASL permission checks** for all Nest route and interactor authorization. Never gate on role slugs in guards.
- Better Auth org AC (`permissions.constants.ts`) is for the org plugin only. Nest authz uses the CASL catalog + `user_roles`.
- Roles are assignment-only (`EUserRole`):
  - **System** (`super_admin`, `manager`): `user_roles.organization = null`, no org required
  - **Org-bound** (`customer` only): `user_roles.organization = <orgId>` + Better Auth `Member.role = customer`
- Multi-role: effective permissions = **union** of all assigned roles, **deduplicated by permission code**
- Decorators: `@Permissions([createPermission(EResource.X, EPermission.Y)], { requireActiveOrganization?: true })` + `CaslPermissionsGuard`
- `requireActiveOrganization`: reject missing active org unless caller already has the ability (e.g. `all:manage`) or holds a system-level role
- Do not substitute role-slug checks for `@Permissions` on Nest routes. `resolveEffectiveRole` is for priority, `CaslAbilityFactory`, guard org-requirement exceptions, and invite/service policy, not route permission grants.
- Invites: `INVITATION_PERMISSION_MATRIX`; system signup uses `x-invitation-token`; org accept goes through Better Auth hooks into `user_roles`
- Page access uses `page_view`; API uses `list` / `read` / `create` / `update` / `delete` / `cancel`
- Catalog + seeders: `permissions.catalog.constants.ts`; core seeders under `src/db/seeders/core-seeders/`; orchestrators `DevSeeder` / `ProdSeeder`
- Redis: use `RedisModule` / `RedisService`; CASL cache goes through `CaslCacheService` (`REDIS_*`, `CASL_CACHE_TTL_SECONDS`). After **service-layer** role mutations, call `CaslCacheService.invalidateUser`
- Declare new feature flag keys in `EFeatureFlagKey` (`feature-flags.enums.ts`); they're exposed to the FE via swagger so the literal stays single-sourced

## DO's

- Use enums over string literal union types
- Extract magic values to constants (SNAKE_CASE_CAPS)
- Follow NestJS conventions (Controller → Service → Repository pattern)
- Use MikroORM custom repositories extending `CustomSQLBaseRepository`
- Use `dayjs` for date manipulation
- Define entities in `src/common/entities` with `CustomBaseEntity` extension
- Use Swagger decorators with `@ApiProperty({ enum: EMyEnum, enumName: "EMyEnum" })` on enum properties so OpenAPI deduplicates them under the shared `E*` name
- Extend `AbstractBaseSerializer` for response transformation
- Write unit tests with `vitest-mock-extended` (`mockDeep`) and test data factories (`@mikro-orm/seeder` Factory for entities; plain builders for DTO/session payloads). Never hand-roll shallow `{ method: vi.fn() }` mocks when a deep mock or factory fits.

## DONT's

- **DON'T** Add useless comments
- **DON'T** Skip tests when modifying features
- **DON'T** Use `any` type; use `unknown` if structure unknown
- **DON'T** Call `flush()` inside repositories; call in service layer
- **DON'T** Directly use MikroORM entity manager; use custom repositories
- **DON'T** Use string literal union types; use enums
- **DON'T** Put constants in types files; keep in helpers or constants file
- **DON'T** Forget `@ApiProperty({ enum: EMyEnum, enumName: "EMyEnum" })` on enum properties (without `enumName`, FE codegen emits DTO-scoped names like `UpdateUserDtoStateEnum` instead of `EUserState`)
- **DON'T** Use Better Auth org AC (`permissions.constants.ts`) for Nest authorization; use CASL + catalog
- **DON'T** Skip `CaslCacheService.invalidateUser` after service-layer role mutations

## Naming Conventions

| Type         | Convention            | Example            |
| ------------ | --------------------- | ------------------ |
| Entities     | Singular, PascalCase  | `User`             |
| Entity Files | Plural, kebab-case    | `users.entity.ts`  |
| Classes      | PascalCase            | `UsersService`     |
| DTOs         | [Action][Entity]Dto   | `CreateUserDto`    |
| Responses    | PascalCase + Response | `UserResponse`     |
| Interfaces   | IPascalCase           | `IUser`            |
| Types        | TPascalCase           | `TUser`            |
| Enums        | EPascalCase           | `ERoles`           |
| Constants    | SNAKE_CASE_CAPS       | `MAX_USERS`        |
| Functions    | camelCase             | `helperFunction()` |

## Module Structure

Each feature module follows this pattern:

```
module-name/
├── module-name.module.ts
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.repository.ts
├── module-name.dtos.ts
├── module-name.interfaces.ts
├── module-name.helpers.ts
├── module-name.constants.ts
└── adapters/   # External service adapters (optional)
```

## Testing Structure

```
test/
├── module-name/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
└── utils/
    ├── factories/      # MikroORM seeder factories + payload builders
    └── helpers/        # Shared test helpers
```

- Unit tests: `mockDeep` from `vitest-mock-extended` for collaborators; factories/builders for input data
- E2E tests: prefer factories over inline entity construction where practical
