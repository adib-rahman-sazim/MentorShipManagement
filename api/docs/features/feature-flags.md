# Feature Flags

PostHog-backed feature flags for gradual rollouts. We use IFeatureFlagsStrategy to switch between providers, with FeatureFlagsService serving as the single common point of reference everywhere.

## Environment setup

Backend (`.env`):

```env
POSTHOG_API_KEY=phc_your_project_key
POSTHOG_HOST=https://us.i.posthog.com
```

- `POSTHOG_API_KEY` is optional. When empty, the app still starts but logs a warning.
- `POSTHOG_HOST` defaults to `https://us.i.posthog.com` when omitted.

Frontend (`.env`):

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

When PostHog is not configured, flag evaluation fails fast:

- Backend: `FeatureFlagsService.isEnabled()` throws `FeatureFlagsNotConfiguredError`
- Frontend: `useFeatureFlag()` throws `FeatureFlagsNotConfiguredError`

`GET /api/v1/feature-flags/keys` always works (enum-only, no PostHog call).

## Adding a flag

1. Add the key to `EFeatureFlagKey` in `src/modules/feature-flags/feature-flags.enums.ts`
2. Create a matching flag in the PostHog dashboard (same string value)
3. Run `pnpm swagger-codegen` in the Next.js template so the FE picks up the new enum value

## Backend usage

Inject `FeatureFlagsService` anywhere (module is `@Global()`):

```typescript
import { EFeatureFlagKey } from "@/modules/feature-flags/feature-flags.enums";
import { FeatureFlagsService } from "@/modules/feature-flags/feature-flags.service";

const isEnabled = await this.featureFlagsService.isEnabled(
  EFeatureFlagKey.MY_FLAG,
  userId,
  { personProperties: { role: "customer" } },
);
```

## Frontend usage

Use `useFeatureFlag` inside components wrapped by `FeatureFlagsProvider`:

```typescript
import { useFeatureFlag } from "@/shared/providers/FeatureFlagsProvider";
import { EFeatureFlagKey } from "@/shared/typedefs/api";

const isMyFlagEnabled = useFeatureFlag(EFeatureFlagKey.MY_FLAG);
```

Never hand-write flag key strings on the frontend. Import from swagger codegen.

## Testing

**Unit tests:** mock `FeatureFlagsService` with `mockDeep<FeatureFlagsService>()`.

**E2E tests:** override `FEATURE_FLAGS_STRATEGY` in `test/utils/bootstrap.ts` with `ControllableFeatureFlagsStrategy`:

```typescript
featureFlagsStrategy.setFlag(EFeatureFlagKey.MY_FLAG, false);
// ... exercise gated branch ...
featureFlagsStrategy.reset();
```
