## Project Structure

```
core-platform-web/
├── modules/          # Feature modules (auth, dashboard, forgot-password, invite, reset-password, settings, sign-in, sign-up, users)
├── shared/           # Shared code across modules
│   ├── components/   # Reusable UI components
│   ├── constants/    # Application constants
│   ├── hocs/         # Higher-order components (e.g. withPermissionGuard)
│   ├── hooks/        # Custom React hooks
│   ├── layouts/      # Layout components
│   ├── lib/          # Library configurations and utilities
│   ├── oauth/        # OAuth related code
│   ├── providers/    # React context providers (AuthProvider, AbilityProvider)
│   ├── redux/        # Redux store, slices, and thunks
│   ├── typedefs/     # TypeScript type definitions
│   └── utils/        # Utility functions
├── pages/            # Next.js pages (using .page.tsx convention)
├── lib/              # Core library utilities
├── infra/            # Infrastructure (dockerfiles)
├── styles/           # Global styles (globals.css)
├── scripts/          # Build and utility scripts
└── public/           # Static assets
```

## Authorization (CASL)

Full guide: [docs/features/casl-authorization.md](docs/features/casl-authorization.md)

- App authz is **permission-based**, never role-slug checks in guards/UI gates.
- Roles (`EUserRole`) are assignment/display only:

| Slug           | Kind      | Needs org? |
| -------------- | --------- | ---------- |
| `super_admin`  | System    | No         |
| `manager`      | System    | No         |
| `customer`     | Org-bound | Yes        |

- Better Auth client (`AuthProvider`) owns session/org APIs. Nest CASL rules (`AbilityProvider` → `GET /permissions/my`) own UI authz.
- Prefer `useCan`, `ability.can`, and `withPermissionGuard` for UI checks (`Can` / `useCanForAnyResource` exist but are not required).
- Page access: `EPermission.PAGE_VIEW` + resource (`dashboard`, `user`, `ai_chat`, …).
- Wire pages with `withPermissionGuard(ProtectedRoute, EPermission.PAGE_VIEW, EResource.X)`.
- `ProtectedRoute` is auth-only (signed-in). Permission gating belongs in `AuthorizationGuard` / HOC.
- Ability cache key is `userId:orgId|none` (org change refetches). Invalidate `Permissions` after invite accept / explicit org activate where already done.
- Sidebar filters menu items by `page_view` via local `ability.can`.
- Superuser UI (e.g. dashboard variant): `all:manage` or `organization:delete`, not role slug.
- Invites: `/invite/accept` (org, token = invitation id) vs `/invite/system/accept` (system, token = hex proof + signup `x-invitation-token`).
- Do not hand-author enums/types that can be obtained through Swagger from the backend. Keep code DRY via `pnpm swagger-codegen`.
- Read feature flags with `useFeatureFlag(EFeatureFlagKey.X)` from `@/shared/providers/FeatureFlagsProvider`; flag keys come from the BE via swagger codegen, never hand-written

## DO's

- Use self-documenting code - code should explain itself without comments
- Use ternary operators (`condition ? doX() : doY()`) over boolean short-circuit (`condition && doX()`)
- Prefix new interfaces with `I`, types with `T` and enums with `E`
- Always use `rem` units as opposed to `px` units
- Prefer aliased imports over multi-layer relative imports
- Extract magic values to constants
- Keep types, form helpers, constants and components in separate files. E.g.
  - `Component.tsx`
  - `Component.types.ts`
  - `Component.helpers.ts`
  - `Component.constants.ts`
  - `index.ts` (barrel file for exporting everything)
- Use aliased imports.
- Use barrel files (index.ts) to export from folders.
- When nesting dialogs (a dialog opened from inside another dialog), always pass both `shouldForceRenderOverlay` and `overlayClassName` on the nested `DialogContent`. `shouldForceRenderOverlay` defaults to `true`, but still set it explicitly on nested dialogs for clarity. Base UI skips nested backdrops unless force-render is on, so without it the nested dialog loses its blur/dim overlay. Pair it with a higher `z-*` on `overlayClassName` (and usually on `className` for the content) so the nested overlay sits above the parent dialog.
- Always pass `renderValue` on `SelectValue` when the select has a known options list. Map the selected value to its display label (for example via `OPTIONS.find((opt) => opt.value === value)?.label`). Item labels may not be registered yet when the portal is closed, so without `renderValue` the trigger can show the raw value instead of the label.
- For Zod string fields in form validation schemas, use `.trim()` then `.min()` / `.max()` (or `.length()` when fixed-width). Put min/max values in the matching `*.constants.ts` file and reference those constants in the schema. Apply `.trim()` before length checks so whitespace-only input fails `min`. Example: `z.string().trim().min(FULL_NAME_MIN_LENGTH, "...").max(FULL_NAME_MAX_LENGTH, "...")`. Skip `.trim()` on passwords (leading/trailing spaces can be intentional); still enforce min/max.

## DONT's

- **DON'T** Gate UI or routes on role slugs (`super_admin` / `manager` / `customer`); use CASL permissions
- **DON'T** Use `ProtectedRoute` alone as a permission gate; use `withPermissionGuard` / `AuthorizationGuard`
- **DON'T** Rely on `activeOrganizationRole` for authz; gate on CASL abilities
- **DON'T** Add useless comments
- **DON'T** Skip tests when modifying components/hooks/reducers
- **DON'T** Use inline styles; use TailwindCSS
- **DON'T** Use absolute paths without configured aliases
- **DON'T** Use `yarn build` to verify changes. Use `npx tsc --noEmit` instead.
- **DON'T** Use relative imports, fix existing issues in files that are being worked on.
- **DON'T** Use `any` type in new functions/files. Use `unknown` if the structure is actually not known.
- **DON'T** Use string literal union types. Use enums instead.
- **DON'T** Use hardcoded color values like `text-[#eeeeee]`. Always extend Tailwind theme and use the color through variable.
- **DON'T** Put constants (e.g., initial values) in types files. Keep them in helpers or a separate constants file.
- **DON'T** Use only one of `shouldForceRenderOverlay` or `overlayClassName` on nested dialogs. Use both together so the overlay both renders and stacks correctly.
- **DON'T** Rely on Select item children alone for the closed trigger label. Always provide `renderValue` on `SelectValue` for static option lists so the correct label always displays.
- **DON'T** Validate form strings with bare `z.string().min(1)` (or hardcoded length literals) when a min/max bound applies. Prefer `.trim().min(...).max(...)` with named constants; do not omit max on free-text fields that have a known upper limit.
