import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pager } from "@/components/Pager";
import { VehicleCard } from "@/components/VehicleCard";
import { api } from "@/lib/api";
import { useDebounced } from "@/lib/useDebounced";
import { CATEGORIES, EMPTY_FILTERS, type Page, type Vehicle, type VehicleFilters } from "@/lib/types";

const PAGE_SIZE = 8;

interface Notice {
  type: "success" | "error";
  text: string;
}

export default function Inventory() {
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<Vehicle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const debouncedFilters = useDebounced(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listVehicles(debouncedFilters, page, PAGE_SIZE)
      .then((res) => !cancelled && setResult(res))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load vehicles"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedFilters, page]);

  function updateFilter(key: keyof VehicleFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  async function handlePurchase(vehicle: Vehicle) {
    setBusyId(vehicle.id);
    setNotice(null);
    try {
      const updated = await api.purchase(vehicle.id);
      setResult((current) =>
        current ? { ...current, data: current.data.map((v) => (v.id === updated.id ? updated : v)) } : current,
      );
      setNotice({ type: "success", text: `Purchased ${vehicle.make} ${vehicle.model}.` });
    } catch (err) {
      setNotice({ type: "error", text: err instanceof Error ? err.message : "Purchase failed" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Inventory</h1>
        <p className="mt-2 text-xl text-muted-foreground">Browse live stock, filter by make or budget, and purchase in one click.</p>
      </div>

      <section aria-label="Search and filters" className="grid gap-4 rounded-xl border bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-make">Make</Label>
          <Input id="f-make" placeholder="Toyota" value={filters.make} onChange={(e) => updateFilter("make", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-model">Model</Label>
          <Input id="f-model" placeholder="Camry" value={filters.model} onChange={(e) => updateFilter("model", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-min">Min price</Label>
          <Input id="f-min" type="number" min="0" placeholder="0" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-max">Max price</Label>
          <Input id="f-max" type="number" min="0" placeholder="Any" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} />
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setFilters(EMPTY_FILTERS);
            setPage(1);
          }}
        >
          Reset
        </Button>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-full overflow-x-auto">
          <Tabs value={filters.category || "all"} onValueChange={(value) => updateFilter("category", value === "all" ? "" : value)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c} value={c}>
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {result && <span className="text-sm text-muted-foreground">{result.total} vehicles</span>}
      </div>

      {notice && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${notice.type === "error" ? "text-destructive" : ""}`}
        >
          {notice.text}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {loading && !result ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : result && result.data.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No vehicles match your filters.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {result?.data.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} busy={busyId === vehicle.id} onPurchase={handlePurchase} />
          ))}
        </div>
      )}

      {result && (
        <Pager page={result.page} totalPages={result.totalPages} total={result.total} limit={result.limit} onPage={setPage} />
      )}
    </div>
  );
}