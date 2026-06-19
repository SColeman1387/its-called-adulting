"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/profile";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Tip {
  id: string;
  tip: string;
  location: string | null;
  is_location_specific: boolean;
  created_at: string;
}

export default function CommunityTips({ taskId, userLocation: propLocation }: { taskId: string; userLocation?: string }) {
  const [tips, setTips] = useState<Tip[]>([]);
  const userLocation = propLocation ?? getProfile()?.city ?? undefined;

  useEffect(() => {
    supabase
      .from("community_tips")
      .select("id, tip, location, is_location_specific, created_at")
      .eq("task_id", taskId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        // Show non-location-specific tips + tips matching user's location
        const filtered = data.filter((t: Tip) => {
          if (!t.is_location_specific) return true;
          if (!userLocation || !t.location) return true;
          return t.location.toLowerCase().includes(userLocation.toLowerCase()) ||
            userLocation.toLowerCase().includes(t.location.toLowerCase());
        });
        setTips(filtered);
      });
  }, [taskId, userLocation]);

  if (tips.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-4">
      <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-3">
        🌟 Community Tips ({tips.length})
      </h3>
      <ul className="space-y-3">
        {tips.map((t) => (
          <li key={t.id} className="text-sm text-yellow-900">
            <span className="font-medium">•</span> {t.tip}
            {t.location && (
              <span className="ml-2 text-xs bg-yellow-200 text-yellow-700 px-1.5 py-0.5 rounded-full">
                📍 {t.location}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
