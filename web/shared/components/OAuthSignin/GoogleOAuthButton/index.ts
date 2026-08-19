import dynamic from "next/dynamic";

const GoogleOAuthButton = dynamic(() => import("./GoogleOAuthButton"), {
  ssr: false,
});

export default GoogleOAuthButton;
