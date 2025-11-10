import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const API_BASE = "/api";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="hero"
              className="w-full"
              onClick={() => {
                const params = new URLSearchParams({
                  client_id: "healthcare-frontend",
                  response_type: "code",
                  scope: "openid profile email",
                  redirect_uri: `${window.location.origin}/oauth2/callback/own`,
                  state: Math.random().toString(36).substring(7),
                });
                window.location.href = `${API_BASE}/oauth2/authorize?${params.toString()}`;
              }}
            >
              <Activity className="mr-2 h-4 w-4" />
              Sign in with HealthCare+ Account
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

