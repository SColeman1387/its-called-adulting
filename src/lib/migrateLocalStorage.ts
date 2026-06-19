import { SupabaseClient } from "@supabase/supabase-js";

const MIGRATED_KEY = "ica_migrated";

export async function migrateLocalStorageToSupabase(supabase: SupabaseClient, userId: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATED_KEY) === userId) return;

  const migrations: PromiseLike<unknown>[] = [];

  // 1. Completed tasks → task_completions
  try {
    const raw = localStorage.getItem("ica_completed_tasks");
    if (raw) {
      const taskIds: string[] = JSON.parse(raw);
      if (taskIds.length > 0) {
        migrations.push(
          supabase.from("task_completions").upsert(
            taskIds.map((task_id) => ({ user_id: userId, task_id, completed_at: new Date().toISOString() })),
            { onConflict: "user_id,task_id", ignoreDuplicates: true }
          ).then(() => null)
        );
      }
    }
  } catch { /* ignore */ }

  // 2. Points ledger → points_ledger
  try {
    const raw = localStorage.getItem("ica_points_ledger");
    if (raw) {
      const events: { id: string; type: string; points: number; label: string; ts: string; refId?: string }[] = JSON.parse(raw);
      if (events.length > 0) {
        migrations.push(
          supabase.from("points_ledger").upsert(
            events.map((e) => ({
              id: e.id,
              user_id: userId,
              type: e.type,
              points: e.points,
              label: e.label,
              ref_id: e.refId ?? null,
              created_at: e.ts,
            })),
            { onConflict: "id", ignoreDuplicates: true }
          ).then(() => null)
        );
      }
    }
  } catch { /* ignore */ }

  // 3. Profile (car, home setup) → profiles table
  try {
    const raw = localStorage.getItem("adulting_profile");
    if (raw) {
      const p = JSON.parse(raw);
      migrations.push(
        supabase.from("profiles").update({
          home_type: p.homeType ?? null,
          has_car: p.hasCar ?? false,
          car_year: p.carYear ?? null,
          car_make: p.carMake ?? null,
          current_mileage: p.currentMileage ?? null,
          last_oil_change_mileage: p.lastOilChangeMileage ?? null,
          oil_change_interval: p.oilChangeInterval ?? null,
          preferred_oil_shop: p.preferredOilShop ?? null,
          preferred_oil_shop_phone: p.preferredOilShopPhone ?? null,
          has_pool: p.hasPool ?? false,
          has_yard: p.hasYard ?? false,
          has_pets: p.hasPets ?? false,
          city: p.city ?? null,
          setup_complete: p.setupComplete ?? false,
        }).eq("id", userId).then(() => null)
      );
    }
  } catch { /* ignore */ }

  await Promise.allSettled(migrations.map((m) => Promise.resolve(m)));
  localStorage.setItem(MIGRATED_KEY, userId);
}
