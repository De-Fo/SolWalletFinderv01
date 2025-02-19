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
      const res = await apiRequest("POST", "/api/login", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/dashboard");
    },
    onError: async (error: any) => {
      console.error("Login error:", error);
      let errorMessage = "Failed to log in. Please try again.";

      // Try to get the error message from the response
      if (error.message) {
        try {
          const response = JSON.parse(error.message.split(': ')[1]);
          errorMessage = response.message || errorMessage;
        } catch {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setLoading(false);
    }
  });

  const onSubmit = async (values: LoginFormData) => {
    if (loading) return;

    try {
      setLoading(true);

      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();

      await loginMutation.mutateAsync({
        accessCode: values.accessCode,
        deviceFingerprint: visitorId
      });
    } catch (error) {
      console.error("Login submission error:", error);
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
              disabled={loading || loginMutation.isPending}
            >
              {loading || loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}