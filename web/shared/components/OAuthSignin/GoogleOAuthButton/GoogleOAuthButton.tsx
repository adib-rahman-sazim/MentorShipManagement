import { FaGoogle } from "react-icons/fa";

import { cn } from "@/lib/utils";
import CustomButton from "@/shared/components/Form/CustomButton";
import { AUTH_CALLBACK_ROUTE } from "@/shared/constants/routes.constants";
import { signIn } from "@/shared/lib/auth-client";

const GoogleOAuthButton: React.FC<{
  label: string;
  className?: string;
}> = ({ label, className }) => {
  const handleGoogleSignIn = async () => {
    const callbackURL = `${window.location.origin}${AUTH_CALLBACK_ROUTE}`;
    await signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  return (
    <CustomButton
      variant="default"
      className={cn("w-full text-sm bg-red-500 hover:bg-red-600 text-white", className)}
      onClick={handleGoogleSignIn}
    >
      <FaGoogle />
      {label}
    </CustomButton>
  );
};

export default GoogleOAuthButton;
