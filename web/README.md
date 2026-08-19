# Next.js Shadcn/UI Starter Template

Frontend starter built with Next.js (Pages Router), shadcn/ui, RTK Query, and related integrations for Sazim projects.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Defining New Environment Variables](#defining-new-environment-variables)
- [Run](#run)
- [Tests](#tests)
- [Build Actions (Local)](#build-actions-local)
- [Features](#features)
- [Community Shadcn/UI Components](#community-shadcnui-components)
- [Conventions](#conventions)
- [Commit Convention](#commit-convention)

## Installation

Make sure you have `nvm` installed. Then, run the following commands:

```bash
$ nvm use
```

We use Node v22.21.0 by default.

Corepack comes packed with node v22. So, Enable corepack to use the project's package manager (pnpm) without global installation:

```bash
$ corepack enable && corepack prepare
```

### Troubleshooting Corepack

If your terminal cannot find `pnpm`, make sure you're using the same Node.js version required for the project, or run `nvm use` to switch to the preferred version. Then run the following commands to prepare the package manager defined in `package.json`:

```bash
$ corepack enable && corepack prepare
```

Install dependencies:

```bash
$ pnpm install
```

## Environment Variables

For local development and testing, please create the following files at the root of the project directory:

- `.env.development.local`
- `.env.test.local`

You can follow `.env.example` to specify which env variables are needed for the project as a guideline, and the above two files can be created based off of this file.

## Defining New Environment Variables

Traditionally, Next.js deployments using Docker need to be managed per environment (development, staging, production) because they only allow you to define the environment variables at build time. In order to get around that, we use [`next-runtime-env`](https://github.com/expatfile/next-runtime-env/tree/1.x) package which allows us to dynamically inject environment variables at runtime to the Docker image.

If you add any new environment variables, please do the following:

1. Update `.env.example`
2. Update `shared/constants/env.constants.ts` and export the environment variable from the file. Note that we use the `env()` helper function from `next-runtime-env`.
3. After that, you can use your environment variables in application code using the variables you exported in (2).

**Important note:** Only a specific version of `next-runtime-env` works with Next.js Pages Router. For Next.js Pages router applications, that version is v1.7.4. For Next.js App router applications, it is v3.2.1.

## Run

### RUN dev server

```bash
pnpm start:dev
```

### BUILD compiled

```bash
pnpm build
```

### START on production server

```bash
pnpm start
```

## Tests

- If you create any helper functions, please write unit tests for them.

```bash
# unit tests
$ pnpm test
```

## Build Actions (Local)

### Running Build Actions with the Script

- We have included a script (`build-test-lint.sh`) in the root directory to streamline the process of building, linting, and testing the project.
- To use the script, follow these steps:

  1. Ensure the script is executable. If not, make it executable by running:
     ```bash
     chmod +x ./build-test-lint.sh
     ```
  2. If you don't use tmux, skip to the next step.
     - If you do use tmux, make sure you run this script outside any other tmux sessions
  3. Run the script:
     ```bash
     ./build-test-lint.sh
     ```
     This will:
       - Start a new tmux session named `build-test-lint`.
       - Open three panes:
         - Pane 1: Builds the project.
         - Pane 2: Runs lint checks.
         - Pane 3: Executes tests.
  4. Once the actions are complete, you can:
     - Manually check the output in each pane for any errors or failures.
     - If necessary, take screenshot of the screen and attach the screenshot to your pull request (PR).

## Features

- **i18n:** next-i18next, page namespaces. [Guide](docs/features/i18n.md)
- **API codegen:** swagger-typescript-api from BE. [Guide](docs/features/swagger-codegen.md)
- **Feature flags:** PostHog-backed rollouts via `useFeatureFlag`. [Guide](docs/features/feature-flags.md)
- **Stripe (pricing/billing):** FE checkout flow. [Guide](docs/features/stripe-payments.md)
- **Nuqs:** typed query params. [Guide](docs/features/nuqs.md)
- **CASL authorization:** Permission-based UI gates, AbilityProvider, invites. [Guide](docs/features/casl-authorization.md)
- **Component examples:** Home page shows a gold-standard zod + react-hook-form form and a `DataTableShell` demo. Feature list pages (users, organizations, billing, org detail) use the same `DataTableShell` + `Table` pattern from `shared/components/DataTableShell/`.

## Community Shadcn/UI Components

For shadcn/ui-compatible components and community resources, see [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui).

### Nested dialogs (`DialogContent` overlay props)

Base UI does not render a backdrop for nested dialogs by default. When opening a dialog from inside another dialog, pass both props on the nested `DialogContent`:

- `shouldForceRenderOverlay`: forces the nested backdrop to render (needed for blur/dim). Defaults to `true`.
- `overlayClassName`: set a higher `z-*` (and blur styles if needed) so the nested overlay stacks above the parent dialog

Example:

```tsx
<DialogContent
  className="z-[70]"
  overlayClassName="z-[69] bg-black/25 backdrop-blur-md"
  shouldForceRenderOverlay
>
```

### Select labels (`SelectValue` `renderValue`)

`SelectValue` can fall back to the raw selected value when option labels are not registered yet (for example while the dropdown portal is closed). Always pass `renderValue` when you have a known options list so the trigger shows the human-readable label.

Example:

```tsx
<SelectValue
  placeholder="Select a role"
  renderValue={(value) =>
    ROLE_OPTIONS.find((opt) => opt.value === value)?.label ?? String(value)
  }
/>
```

## Conventions

Please refer to [this document](https://docs.google.com/document/d/1BVaXGcIUM_FET4XZWtSHLVjaZv1z6fp2HZ3eW1uBKlA/edit) for conventions for this repository.

Please pay special attention to [RTK-Query and Shared types folder structure](https://docs.google.com/document/d/1BVaXGcIUM_FET4XZWtSHLVjaZv1z6fp2HZ3eW1uBKlA/edit##heading=h.1jtw5xnt6dsd).

For agent and contributor coding rules (project structure, DO/DONT), see [AGENTS.md](AGENTS.md).

## Commit Convention

``subject(ticket-code): message``

Valid subjects:
``build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test``
