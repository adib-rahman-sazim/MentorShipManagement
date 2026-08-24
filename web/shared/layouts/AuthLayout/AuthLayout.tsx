import { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <main className="flex flex-1 items-center justify-center px-6 py-12">{children}</main>
  </div>
);

export default AuthLayout;
