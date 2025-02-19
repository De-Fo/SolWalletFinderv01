import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { apiRequest } from "@/lib/queryClient";

interface LoginFormData {
  accessCode: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema.omit({ deviceFingerprint: true })),
    defaultValues: {
      accessCode: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { accessCode: string, deviceFingerprint: string }) => {
      console.log("Attempting login with:", data);
      const res = await apiRequest("POST", "/api/login", data);
      const result = await res.json();
      console.log("Login response:", result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  });

  const onSubmit = async (values: LoginFormData) => {
    if (loading) return;

    try {
      setLoading(true);
      console.log("Starting login process with values:", values);

      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      console.log("Got device fingerprint:", visitorId);

      await loginMutation.mutateAsync({
        accessCode: values.accessCode,
        deviceFingerprint: visitorId
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Solana Wallet Finder</h1>
          <p className="text-muted-foreground text-center mt-2">
            Enter your access code to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your access code"
                {...form.register("accessCode")}
                disabled={loading}
              />
              {form.formState.errors.accessCode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.accessCode.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}