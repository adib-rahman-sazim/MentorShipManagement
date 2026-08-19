import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { Menu } from "lucide-react";
import { FaSignInAlt } from "react-icons/fa";

import { LanguageSelector } from "@/shared/components/LanguageSelector";
import SignedInUserAvatarAndMenu from "@/shared/components/NavigationBar/components/SignedInUserAvatarAndMenu";
import { Button } from "@/shared/components/shadui/button";
import { Separator } from "@/shared/components/shadui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/shadui/sheet";
import { HOME_ROUTE, PRICING_ROUTE, SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";
import { useAuth } from "@/shared/providers/AuthProvider";

const NavigationBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { isLoading, user } = useAuth();

  let authActions: React.ReactNode = null;
  if (!isLoading) {
    authActions = user ? (
      <SignedInUserAvatarAndMenu user={user} />
    ) : (
      <Button className="hidden md:inline-flex" onClick={() => router.push(SIGN_IN_ROUTE)}>
        <FaSignInAlt />
        Sign In
      </Button>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={HOME_ROUTE} className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">My Website</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/about">About</Link>
            <Link href="/products">Products</Link>
            <Link href="/contact">Contact</Link>
            <Link href={PRICING_ROUTE}>Pricing</Link>
          </nav>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="mr-2 inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="pr-8">
            <Link href={HOME_ROUTE} className="flex items-center" onClick={() => setIsOpen(false)}>
              <span className="font-bold">My Website</span>
            </Link>
            <Separator className="my-4" />
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <LanguageSelector />
            </div>
            <Separator className="my-4" />
            <nav className="flex flex-col space-y-4">
              <Link
                href="/about"
                className="block px-2 py-1 text-lg"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/products"
                className="block px-2 py-1 text-lg"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="block px-2 py-1 text-lg"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 hidden md:block md:w-auto md:flex-none">
            <LanguageSelector />
          </div>
          <div className="w-full flex-1 flex justify-end md:w-auto md:flex-none">{authActions}</div>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
