# Audit Logging

Audit Logging is available as a feature in this repository. All database create/update/delete actions are logged in the `audit_logs` table. For this to work, we adopt the following approach:

1. We control whether audit logging is enabled by using `ENABLE_AUDIT_LOGGING` environment variable.

2. `AuditLoggingSubscriber` is an event subscriber for Mikro ORM that listens for `onFlush` events. This is added to the `src/app.module.ts` file.

3. `AuditLoggingSubscriberCreatorInterceptor` is registered as one of the global interceptors in `main.ts`, which is responsible for setting the logged in user in the `AuditLoggingSubscriber` context. Interceptors resolve after middlewares and guards resolve, and in our application, guards are responsible for attaching the user object to the request object after validating the access token.
