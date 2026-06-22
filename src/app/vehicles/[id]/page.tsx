"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getProfile, saveProfile, Vehicle, ServiceRecord,
  ServiceType, SERVICE_LABELS, getLatestMileage,
} from "@/lib/profile";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

const SERVICE_TYPES: ServiceType[] = [
  "oil_change", "tire_rotation", "brakes", "tires", "battery",
  "air_filter", "transmission", "coolant", "inspection", "other",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<{
    date: string;
    serviceType: ServiceType;
    mileage: string;
    cost: string;
    shop: string;
    notes: string;
    receiptUrl: string;
    receiptFile: File | null;
  }>({
    date: new Date().toISOString().slice(0, 10),
    serviceType: "oil_change",
    mileage: "",
    cost: "",
    shop: "",
    notes: "",
    receiptUrl: "",
    receiptFile: null,
  });

  useEffect(() => {
    const p = getProfile();
    if (!p) return;
    const v = (p.vehicles ?? []).find((v) => v.id === id);
    if (v) setVehicle(v);
  }, [id]);

  const updateVehicleInProfile = (updated: Vehicle) => {
    const p = getProfile();
    if (!p) return;
    const vehicles = (p.vehicles ?? []).map((v) => v.id === updated.id ? updated : v);
    saveProfile({ ...p, vehicles });
    setVehicle(updated);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, receiptFile: file }));
  };

  const uploadReceipt = async (file: File): Promise<string | undefined> => {
    if (!user) return undefined;
    const supabase = getSupabase();
    const ext = file.name.split(".").pop();
    const path = `receipts/${user.id}/${id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("vehicle-receipts").upload(path, file);
    if (error) { console.error("Upload error:", error); return undefined; }
    const { data } = supabase.storage.from("vehicle-receipts").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    let receiptUrl = form.receiptUrl;
    if (form.receiptFile) {
      setUploading(true);
      receiptUrl = (await uploadReceipt(form.receiptFile)) ?? "";
      setUploading(false);
    }

    const record: ServiceRecord = {
      id: crypto.randomUUID(),
      date: form.date,
      serviceType: form.serviceType,
      mileage: form.mileage ? parseInt(form.mileage) : undefined,
      cost: form.cost ? parseFloat(form.cost) : undefined,
      shop: form.shop || undefined,
      notes: form.notes || undefined,
      receiptUrl: receiptUrl || undefined,
    };

    // If this is an oil change, update the vehicle's lastOilChangeMileage
    const oilChangePatch: Partial<Vehicle> = {};
    if (form.serviceType === "oil_change" && record.mileage) {
      oilChangePatch.lastOilChangeMileage = record.mileage;
      oilChangePatch.lastOilChangeDate = form.date;
    }

    const updated: Vehicle = {
      ...vehicle!,
      ...oilChangePatch,
      serviceHistory: [
        ...(vehicle!.serviceHistory ?? []),
        record,
      ].sort((a, b) => b.date.localeCompare(a.date)),
    };

    updateVehicleInProfile(updated);
    setShowAdd(false);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      serviceType: "oil_change",
      mileage: "",
      cost: "",
      shop: "",
      notes: "",
      receiptUrl: "",
      receiptFile: null,
    });
    setSaving(false);
  };

  const deleteRecord = (recordId: string) => {
    if (!vehicle) return;
    const updated: Vehicle = {
      ...vehicle,
      serviceHistory: vehicle.serviceHistory.filter((r) => r.id !== recordId),
    };
    updateVehicleInProfile(updated);
  };

  if (!vehicle) return null;

  const sorted = [...(vehicle.serviceHistory ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const totalSpent = sorted.reduce((s, r) => s + (r.cost ?? 0), 0);
  const latestMileage = getLatestMileage(vehicle);

  const vehicleTitle = [vehicle.year, vehicle.make].filter(Boolean).join(" ") || vehicle.nickname;

  return (
    <main className="max-w-lg mx-auto px-4 pb-24">

      {/* Print-only header — hidden on screen */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold">{vehicle.nickname || vehicleTitle} — Service History</h1>
        {vehicleTitle !== vehicle.nickname && <p className="text-base text-gray-600">{vehicleTitle}</p>}
        <p className="text-sm text-gray-500 mt-1">
          Printed {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          {latestMileage ? ` · ${latestMileage.toLocaleString()} miles` : ""}
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Screen header */}
      <div className="pt-8 pb-4 print:hidden">
        <Link href="/vehicles" className="text-sm text-orange-600 font-medium mb-4 inline-block">← My Vehicles</Link>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.nickname || vehicleTitle}</h1>
            {vehicle.nickname && vehicleTitle !== vehicle.nickname && (
              <p className="text-sm text-gray-400">{vehicleTitle}</p>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            🖨️ Print / PDF
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3 mt-4">
          {latestMileage && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Current mileage</p>
              <p className="font-bold text-gray-900 text-sm">{latestMileage.toLocaleString()} mi</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-gray-400">Records</p>
            <p className="font-bold text-gray-900 text-sm">{sorted.length}</p>
          </div>
          {totalSpent > 0 && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">Total logged</p>
              <p className="font-bold text-gray-900 text-sm">{formatCurrency(totalSpent)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add record button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3.5 border-2 border-dashed border-orange-200 rounded-2xl text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors mb-6 print:hidden"
        >
          + Log a service record
        </button>
      )}

      {/* Add record form */}
      {showAdd && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6 print:hidden">
          <h3 className="font-bold text-gray-900 mb-4">New service record</h3>
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Mileage</label>
                <input
                  type="number"
                  placeholder="e.g. 52000"
                  value={form.mileage}
                  onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Service type</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, serviceType: t }))}
                    className={`text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      form.serviceType === t
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-100 text-gray-600 hover:border-orange-200"
                    }`}
                  >
                    {SERVICE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.cost}
                    onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Shop</label>
                <input
                  type="text"
                  placeholder="e.g. Valvoline"
                  value={form.shop}
                  onChange={(e) => setForm((f) => ({ ...f, shop: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Replaced front pads and rotors"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>

            {/* Receipt upload */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                Receipt photo <span className="font-normal normal-case text-gray-400">(optional)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
              >
                {form.receiptFile ? `📎 ${form.receiptFile.name}` : "📷 Tap to attach receipt"}
              </button>
              {!user && (
                <p className="text-xs text-gray-400 mt-1.5">Sign in to save receipt photos to the cloud.</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm disabled:opacity-60"
              >
                {uploading ? "Uploading…" : saving ? "Saving…" : "Save record →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service history */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-300">
          <div className="text-5xl mb-3">🔧</div>
          <p className="text-sm text-gray-400">No service records yet.<br />Log your first one above.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 print:hidden">Service history</h2>

          {/* Print summary line */}
          {totalSpent > 0 && (
            <p className="hidden print:block text-sm text-gray-500 mb-4">
              {sorted.length} service record{sorted.length !== 1 ? "s" : ""} · {formatCurrency(totalSpent)} total logged
            </p>
          )}

          <div className="space-y-3">
            {sorted.map((record, i) => (
              <div
                key={record.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 print:border-0 print:border-b print:border-gray-200 print:rounded-none print:pb-4"
              >
                <div className="flex items-start gap-3">
                  {/* Bullet for print */}
                  <span className="hidden print:inline text-gray-400 mt-0.5">•</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{SERVICE_LABELS[record.serviceType]}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(record.date)}
                          {record.mileage ? ` · ${record.mileage.toLocaleString()} mi` : ""}
                          {record.shop ? ` · ${record.shop}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {record.cost != null && (
                          <span className="text-sm font-semibold text-gray-700">{formatCurrency(record.cost)}</span>
                        )}
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-gray-200 hover:text-red-400 text-xs print:hidden"
                          title="Remove record"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{record.notes}</p>
                    )}

                    {record.receiptUrl && (
                      <a
                        href={record.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-500 font-medium mt-2 print:hidden"
                      >
                        📎 View receipt
                      </a>
                    )}
                    {record.receiptUrl && (
                      <p className="hidden print:block text-xs text-gray-400 mt-1">Receipt on file</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Print footer */}
          <div className="hidden print:block mt-10 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Generated by It&apos;s Called Adulting · itscalledadulting.com
            </p>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          nav, footer, .print\\:hidden { display: none !important; }
          body { font-size: 13px; color: #111; }
          @page { margin: 1in; }
        }
      `}</style>
    </main>
  );
}
