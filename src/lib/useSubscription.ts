"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import { useAuth } from "./useAuth";

export interface SubscriptionState {
  status: "active" | "inactive" | "loading";
  stripeCustomerId: string | null;
}

export function useSubscription(): SubscriptionState {
  const { user, loading } = useAuth();
  const [state, setState] = useState<SubscriptionState>({ status: "loading", stripeCustomerId: null });

  useEffect(() => {
    if (loading) return;
    if (!user) { setState({ status: "inactive", stripeCustomerId: null }); return; }

    const supabase = getSupabase();
    supabase
      .from("profiles")
      .select("subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setState({
          status: data?.subscription_status === "active" ? "active" : "inactive",
          stripeCustomerId: data?.stripe_customer_id ?? null,
        });
      });
  }, [user, loading]);

  return state;
}
