"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { User, Lock, TriangleAlert } from "lucide-react";
import { LOGO, LOGO_BLACK, SITE_NAME } from "@/config";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");

  const { resolvedTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const background = isDark
    ? "radial-gradient(125% 125% at 50% 100%, #000000 40%, #350136 100%)"
    : "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #ec4899 100%)";

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center"
      style={{ background }}
      suppressHydrationWarning
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggleButton />
      </div>

      <div className="flex items-center justify-center min-h-screen w-full max-w-sm">
        <Card className="w-full max-w-md rounded-2xl shadow-2xl">
          <CardHeader className="pb-2">
            <div className="flex flex-col items-start mb-2">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src={isDark ? LOGO : LOGO_BLACK}
                  alt="logo"
                  className="h-16 w-16"
                />

                <div className="flex flex-col items-start">
                  <span className="text-2xl font-bold tracking-tight">
                    {SITE_NAME}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    Admin felület
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col gap-5 mb-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError("");

                const formData = new FormData(e.currentTarget);

                const res = await signIn("credentials", {
                  redirect: false,
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  callbackUrl: "/dashboard",
                });

                setLoading(false);

                if (res?.error) {
                  setError("Wrong email or password.");
                } else if (res?.ok) {
                  toast.success("Sikeres bejelentkezés!");
                  router.push("/dashboard");
                } else {
                  setError("Ismeretlen hiba történt.");
                }
              }}
            >
              {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                  <TriangleAlert />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email
                </Label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User size={18} />
                  </span>

                  <Input
                    id="email"
                    name="email"
                    disabled={loading}
                    type="email"
                    placeholder="Email"
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block">
                  Jelszó
                </Label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </span>

                  <Input
                    id="password"
                    name="password"
                    disabled={loading}
                    type="password"
                    placeholder="Jelszó"
                    className="pl-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />

                <Label htmlFor="remember" className="text-sm font-normal">
                  Jelszó megjegyzése
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold rounded-lg py-2 transition-all duration-200 shadow"
                disabled={loading}
              >
                {loading ? "Belépés..." : "Belépés"}
              </Button>
            </form>

            <div className="flex flex-row gap-2">
              <Button
                type="button"
                className="flex-1 bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-semibold rounded-lg py-2 transition-all duration-200 shadow"
                disabled={loading}
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M21.456 10.154c.123.659.19 1.348.19 2.067c0 5.624-3.764 9.623-9.449 9.623A9.841 9.841 0 0 1 2.353 12a9.841 9.841 0 0 1 9.844-9.844c2.658 0 4.879.978 6.583 2.566l-2.775 2.775V7.49c-1.033-.984-2.344-1.489-3.808-1.489c-3.248 0-5.888 2.744-5.888 5.993c0 3.248 2.64 5.999 5.888 5.999c2.947 0 4.953-1.686 5.365-4h-5.365v-3.839z"
                  />
                </svg>
              </Button>

              <Button
                type="button"
                className="flex-1 bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-semibold rounded-lg py-2 transition-all duration-200 shadow"
                disabled={loading}
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <g fill="none">
                    <g clipPath="url(#akarIconsGithubFill0)">
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12"
                        clipRule="evenodd"
                      />
                    </g>
                    <defs>
                      <clipPath id="akarIconsGithubFill0">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </g>
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}