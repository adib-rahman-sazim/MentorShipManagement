# Code Generation

In the Nest.js backend repo, we use Swagger to generate API schema definitions. In order to synchronize the BE and FE type definitions, we use a code generation tool ([`swagger-typescript-api`](https://www.npmjs.com/package/swagger-typescript-api/v/8.0.1)) that introspects the BE schema and generates the types in the FE. To do this:

1. Run the BE server locally
2. Update the `swagger-codegen.ts` file's `swaggerUrl` variable to point to the correct BE port in your local setup.
3. Run `pnpm swagger-codegen`

However, if you wish to manually define types, you can do that as well in the respective module(s) under `shared/redux/rtk-apis` folder and use it in the application code from there. But, this is generally discouraged because BE and FE typing gets out of sync in this way, and you end up with a lot of transformer functions to transform data between either form.
