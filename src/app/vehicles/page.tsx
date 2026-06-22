"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, saveProfile, Vehicle, getLatestMileage, getOilChangeStatusV2, SERVICE_LABELS } from "@/lib/profile";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const p = getProfile();
    if (p) setVehicles(p.vehicles ?? []);
  }, []);

  const totalServiceRecords = vehicles.reduce((n, v) => n + v.serviceHistory.length, 0);

  return (
    <main className="max-w-lg mx-auto px-4 pb-24">
      <div className="pt-8 pb-4">
        <Link href="/home" className="text-sm text-orange-600 font-medium mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
        <p className="text-gray-400 text-sm mt-1">
          {totalServiceRecords > 0
            ? `${totalServiceRecords} service record${totalServiceRecords !== 1 ? "s" : ""} logged across ${vehicles.length} vehicle${vehicles.length !== 1 ? "s" : ""}`
            : "Log service records to build your maintenance history."}
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🚗</div>
          <p className="font-semibold text-gray-600 mb-1">No vehicles set up yet</p>
          <p className="text-sm mb-6">Add your vehicles during setup to start tracking.</p>
          <Link href="/setup" className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm">
            Go to Setup →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => {
            const latestMileage = getLatestMileage(v);
            const oilStatus = getOilChangeStatusV2(v);
            const lastService = v.serviceHistory.length > 0
              ? [...v.serviceHistory].sort((a, b) => b.date.localeCompare(a.date))[0]
              : null;

            return (
              <Link
                key={v.id}
                href={`/vehicles/${v.id}`}
                className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🚗</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-900">{v.nickname || v.make || "Vehicle"}</h2>
                      {oilStatus === "overdue" && (
                        <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Oil overdue</span>
                      )}
                      {oilStatus === "due-soon" && (
                        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">Oil due soon</span>
                      )}
                    </div>
                    {(v.year || v.make) && (
                      <p className="text-sm text-gray-400 mt-0.5">{[v.year, v.make].filter(Boolean).join(" ")}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {latestMileage && (
                        <div>
                          <p className="text-xs text-gray-400">Mileage</p>
                          <p className="text-sm font-semibold text-gray-700">{latestMileage.toLocaleString()} mi</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400">Service records</p>
                        <p className="text-sm font-semibold text-gray-700">{v.serviceHistory.length}</p>
                      </div>
                      {lastService && (
                        <div>
                          <p className="text-xs text-gray-400">Last service</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {SERVICE_LABELS[lastService.serviceType]} · {new Date(lastService.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 text-xl shrink-0">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
