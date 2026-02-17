"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Lottie from "lottie-react";
import loginAnimation from "../../public/assets/login.json";
import { Button } from "../components/ui/button";
import "./login.css";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/home" });
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Boas vindas a <br />
              <span className="text-gradient-shimmer">Plannfly.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Teste gratuitamente entrando com a sua conta Google para começar a aproveitar nossa plataforma.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-medium rounded-none border-2 border-foreground hover:bg-muted/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-login-google"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Conectando..." : "Entrar com o Google"}
          </Button>

          <p className="text-sm text-muted-foreground pt-4">
            Criando uma conta, você concorda com todos os nossos{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
              termos e condições
            </a>
            .
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-background overflow-hidden relative">
        <Lottie
          animationData={loginAnimation}
          loop
          className="w-[80%] h-auto"
        />
      </div>
    </div>
  );
}
