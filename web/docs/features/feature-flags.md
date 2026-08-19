# Feature Flags

PostHog-backed feature flags for gradual rollouts. Separate from CASL permissions: permissions answer "can this user do X?", feature flags answer "is this feature enabled?".

## Environment setup

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

- `NEXT_PUBLIC_POSTHOG_KEY` is optional. When empty, the app still starts but logs a warning in the browser console.
- `NEXT_PUBLIC_POSTHOG_HOST` defaults to `https://us.i.posthog.com` when omitted.

When PostHog is not configured, `useFeatureFlag()` throws `FeatureFlagsNotConfiguredError`.

Backend env vars (`POSTHOG_API_KEY`, `POSTHOG_HOST`) are documented in the NestJS template's [feature flags guide](../../nestjs-mikro-orm-starter-template/docs/features/feature-flags.md).

## Adding a flag

1. Add the key to `EFeatureFlagKey` in the NestJS `feature-flags.enums.ts`
2. Run `pnpm swagger-codegen` so `EFeatureFlagKey` updates in `shared/typedefs/api.ts`
3. Create a matching flag in the PostHog dashboard (same string value)

## Frontend usage

`FeatureFlagsProvider` is mounted in `pages/_app.page.tsx` inside `AuthProvider`. Use the hook in any child component:

```typescript
import { useFeatureFlag } from "@/shared/providers/FeatureFlagsProvider";
import { EFeatureFlagKey } from "@/shared/typedefs/api";

const isMyFlagEnabled = useFeatureFlag(EFeatureFlagKey.MY_FLAG);
```

Never hand-write flag key strings. Import from swagger codegen.

On sign-in, the provider identifies the user with PostHog (`userId`, `email`, `organizationId`, `role`).

## Backend usage

See the NestJS template [feature flags guide](../../nestjs-mikro-orm-starter-template/docs/features/feature-flags.md).

## Testing

Mock the strategy via `FeatureFlagsContext.Provider` in component tests, or mock `useFeatureFlag` at the module boundary.

When testing unconfigured behavior, assert that `useFeatureFlag` throws `FeatureFlagsNotConfiguredError` with a `null` context value.

## Health check flag

`HEALTH_CHECK` (`health_check`) is infrastructure-only. The PostHog strategy uses it to log "feature flags service is healthy" once on init. Do not gate product features on it.
