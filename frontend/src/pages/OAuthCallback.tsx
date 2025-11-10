import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface User {
  username: string;
  email: string;
  roles: string[];
}

const API_BASE = "/api";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(errorParam);
        navigate("/login?error=oauth_failed");
        return;
      }

      if (location.pathname === "/oauth2/callback/own" && code) {
        try {
          const response = await fetch(`${API_BASE}/oauth2/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa("healthcare-frontend:frontend-secret")}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: code,
              redirect_uri: `${window.location.origin}/oauth2/callback/own`,
            }),
          });

          if (!response.ok) {
            throw new Error("Token exchange failed");
          }

          const data = await response.json();
          const accessToken = data.access_token;

          const userInfoResponse = await fetch(`${API_BASE}/oauth2/userinfo`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!userInfoResponse.ok) {
            throw new Error("Failed to fetch user info");
          }

          const userInfo = await userInfoResponse.json();
          const roles = userInfo.roles || [];
          const user: User = {
            username: userInfo.username || userInfo.email,
            email: userInfo.email,
            roles: Array.isArray(roles) ? roles : [roles],
          };

          loginWithToken(accessToken, user);
          navigate("/dashboard");
        } catch (err) {
          console.error("OAuth callback error:", err);
          setError(err instanceof Error ? err.message : "Authentication failed");
          navigate("/login?error=oauth_failed");
        }
      } else {
        setError("Invalid callback parameters");
        navigate("/login?error=oauth_failed");
      }
    };

    handleCallback();
  }, [searchParams, location.pathname, navigate, loginWithToken]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Authentication failed: {error}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}

