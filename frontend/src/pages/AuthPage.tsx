import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarArt } from "@/components/CarArt";
import { useAuth } from "@/lib/auth";

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-5">
      {mode === "register" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="reg-name">Full name</Label>
          <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-email`}>Email</Label>
        <Input id={`${mode}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-password`}>Password</Label>
        <Input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "login" ? "Enter your password" : "Create a password"}
        />
        {mode === "register" && <span className="text-sm text-muted-foreground">Use at least 8 characters.</span>}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <section className="hidden flex-col justify-between gap-12 bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M12 4v5.5M12 14.5V20M4.5 9.5l5 1.8M14.5 12.7l5 1.8" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">Showroom</span>
        </div>
        <div className="flex max-w-md flex-col gap-4">
          <h2 className="text-4xl font-extrabold tracking-tight">Every vehicle and every count, in one place.</h2>
          <p className="opacity-75">
            Sign in to browse live stock and purchase vehicles. Admins can add, update, restock and remove inventory.
          </p>
        </div>
        <CarArt category="Sedan" className="w-full max-w-md opacity-35" />
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Your account</CardTitle>
            <CardDescription>Sign in, or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="w-full">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <AuthForm mode="login" />
              </TabsContent>
              <TabsContent value="register">
                <AuthForm mode="register" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}