import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") || undefined,
      email: form.get("email"),
      password: form.get("password"),
      confirm: form.get("confirm") || undefined,
    };

    if (!isLogin && payload.password !== payload.confirm) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? 
        `${API_BASE}/api/auth/login` : 
        `${API_BASE}/api/auth/register`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          ...(isLogin ? {} : { name: payload.name })
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Auth failed" }));
        throw new Error(err.message || "Auth failed");
      }

      const data = await res.json();
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      alert(isLogin ? "Login successful" : "Registered successfully");
      
      // Check if user is admin and redirect accordingly
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/agent");
      }
    } catch (err) {
      alert(err.message || "Authentication error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Form Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-base font-semibold text-gray-800">
                {isLogin ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                {isLogin ? "Sign in to your account" : "Join us today"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-medium text-gray-600">Full Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        className="pl-8 h-8 text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium text-gray-600">Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="pl-8 h-8 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium text-gray-600">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="pl-8 h-8 text-sm"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <Label htmlFor="confirm" className="text-xs font-medium text-gray-600">Confirm Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <Input
                        id="confirm"
                        type="password"
                        name="confirm"
                        placeholder="Confirm your password"
                        className="pl-8 h-8 text-sm"
                        required
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium shadow-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs">{isLogin ? "Signing In..." : "Creating Account..."}</span>
                    </div>
                  ) : (
                    <span className="text-sm">{isLogin ? "Sign In" : "Create Account"}</span>
                  )}
                </Button>
              </form>

              {/* Toggle Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <Button
                    variant="link"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 hover:text-blue-700 font-medium p-0 h-auto text-xs"
                  >
                    {isLogin ? "Sign up here" : "Sign in here"}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-gray-400 text-xs">
            <p>© 2024 Balaji Lorry Service. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Brand */}
      <div className="w-1/2 bg-blue-600 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            BALAJI LORRY SERVICE
          </h1>
          <p className="text-blue-100 text-sm mb-4">Logistics Management System</p>
          <p className="text-blue-200 text-xs">on track on time</p>
        </div>
      </div>
    </div>
  );
}
