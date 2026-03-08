"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@applyingmyself/convex-client";
import {
  Shield,
  Users,
  CreditCard,
  Plus,
  ShieldCheck,
  ShieldOff,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@applyingmyself/ui/components/card";
import { Button } from "@applyingmyself/ui/components/button";
import { Badge } from "@applyingmyself/ui/components/badge";

type UserRow = {
  _id: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
  isAdmin: boolean;
  createdAt: number;
  subscriptionStatus?: string;
};

const planColors: Record<string, string> = {
  none: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  starter: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  hired: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default function AdminPage() {
  const isAdmin = useQuery(api.userHelpers.isCurrentUserAdmin);
  const allUsers = useQuery(api.userHelpers.getAllUsers, isAdmin ? {} : "skip");

  const grantAdmin = useMutation(api.userHelpers.grantAdminAccess);
  const revokeAdmin = useMutation(api.userHelpers.revokeAdminAccess);
  const addCredits = useMutation(api.userHelpers.adminAddCredits);
  const setPlan = useMutation(api.userHelpers.adminSetUserPlan);

  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("100");
  const [creditReason, setCreditReason] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [planEmail, setPlanEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"none" | "starter" | "pro" | "hired">("pro");

  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Shield className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-sm">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const handleAddCredits = async () => {
    if (!creditEmail || !creditAmount) return;
    setLoading("credits");
    try {
      const result = await addCredits({
        targetUserEmail: creditEmail,
        amount: parseInt(creditAmount, 10),
        reason: creditReason || undefined,
      });
      showFeedback("success", result.message);
      setCreditEmail("");
      setCreditAmount("100");
      setCreditReason("");
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to add credits");
    } finally {
      setLoading(null);
    }
  };

  const handleGrantAdmin = async (email: string) => {
    setLoading(`grant-${email}`);
    try {
      const result = await grantAdmin({ userEmail: email });
      showFeedback("success", result.message);
      setAdminEmail("");
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to grant admin");
    } finally {
      setLoading(null);
    }
  };

  const handleRevokeAdmin = async (email: string) => {
    setLoading(`revoke-${email}`);
    try {
      const result = await revokeAdmin({ userEmail: email });
      showFeedback("success", result.message);
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to revoke admin");
    } finally {
      setLoading(null);
    }
  };

  const handleSetPlan = async () => {
    if (!planEmail) return;
    setLoading("plan");
    try {
      const result = await setPlan({ targetUserEmail: planEmail, plan: selectedPlan });
      showFeedback("success", result.message);
      setPlanEmail("");
    } catch (err) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to set plan");
    } finally {
      setLoading(null);
    }
  };

  const users: UserRow[] = allUsers ?? [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl text-foreground">
              Admin Panel<span className="text-primary">.</span>
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Manage users, credits, and access controls.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Add Credits */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Grant Credits
            </CardTitle>
            <CardDescription>Add credits to any user account for testing or support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">User Email</label>
              <input
                type="email"
                value={creditEmail}
                onChange={(e) => setCreditEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-end gap-2">
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCreditAmount(String(amt))}
                    className={`px-2 py-2 text-xs rounded-md border transition-colors ${
                      creditAmount === String(amt)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium block mb-1">Reason (optional)</label>
              <input
                type="text"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g. Testing, support compensation"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button
              onClick={handleAddCredits}
              disabled={!creditEmail || !creditAmount || loading === "credits"}
              className="w-full"
            >
              {loading === "credits" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Credits
            </Button>
          </CardContent>
        </Card>

        {/* Admin & Plan Management */}
        <div className="space-y-6">
          {/* Grant/Revoke Admin */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Admin Access
              </CardTitle>
              <CardDescription>Grant or revoke admin privileges by email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  onClick={() => handleGrantAdmin(adminEmail)}
                  disabled={!adminEmail || loading?.startsWith("grant")}
                  size="sm"
                >
                  {loading?.startsWith("grant") ? <Loader2 className="w-4 h-4 animate-spin" /> : "Grant"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Set User Plan */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Set User Plan
              </CardTitle>
              <CardDescription>Override a user&apos;s subscription plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="email"
                value={planEmail}
                onChange={(e) => setPlanEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-2">
                {(["none", "starter", "pro", "hired"] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border capitalize transition-colors ${
                      selectedPlan === plan
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSetPlan}
                disabled={!planEmail || loading === "plan"}
                className="w-full"
                variant="outline"
              >
                {loading === "plan" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Update Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Users
          </CardTitle>
          <CardDescription>{users.length} registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Credits</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={planColors[user.plan] || planColors.none}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-foreground">{user.credits}</td>
                    <td className="py-3 px-3">
                      {user.isAdmin && (
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/20">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setCreditEmail(user.email);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                          title="Add credits"
                        >
                          <Plus className="w-3 h-3 inline mr-1" />
                          Credits
                        </button>
                        {user.isAdmin ? (
                          <button
                            onClick={() => handleRevokeAdmin(user.email)}
                            disabled={loading === `revoke-${user.email}`}
                            className="px-2 py-1 text-xs rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                            title="Revoke admin"
                          >
                            {loading === `revoke-${user.email}` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShieldOff className="w-3 h-3 inline" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrantAdmin(user.email)}
                            disabled={loading === `grant-${user.email}`}
                            className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                            title="Grant admin"
                          >
                            {loading === `grant-${user.email}` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3 h-3 inline" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
