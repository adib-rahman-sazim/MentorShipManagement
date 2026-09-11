import { APP_NAME } from "@/shared/constants/app.constants";

import { SignInForm } from "../components/SignInForm";
import { SIGN_IN_HEADING, SIGN_IN_SUBHEADING } from "../components/SignInForm/SignInForm.constants";

const SignInContainer = () => (
  <section className="w-full max-w-[24rem]">
    <header className="mb-8 flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{APP_NAME}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{SIGN_IN_HEADING}</h1>
      <p className="text-sm text-muted-foreground">{SIGN_IN_SUBHEADING}</p>
    </header>

    <SignInForm />
  </section>
);

export default SignInContainer;
