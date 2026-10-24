import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, type Vehicle, type VehicleInput } from "@/lib/types";

interface Props {
  /** null means "add a new vehicle"; a vehicle means "edit it". */
  vehicle: Vehicle | null;
  onClose: () => void;
  onSubmit: (values: VehicleInput) => Promise<void>;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function VehicleFormDialog({ vehicle, onClose, onSubmit }: Props) {
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [category, setCategory] = useState<string>(vehicle?.category ?? CATEGORIES[0]);
  const [price, setPrice] = useState(vehicle ? String(vehicle.price) : "");
  const [quantity, setQuantity] = useState(vehicle ? String(vehicle.quantity) : "0");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = Array.from(new Set<string>([...CATEGORIES, category]));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit({ make, model, category, price: Number(price), quantity: Number(quantity) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the vehicle");
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{vehicle ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
            <DialogDescription>
              {vehicle ? "Update the details of this listing." : "Enter the details for the new listing."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="v-make">Make</Label>
              <Input id="v-make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="v-model">Model</Label>
              <Input id="v-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry Hybrid" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="v-category">Category</Label>
            <select id="v-category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="v-price">Price (INR)</Label>
              <Input id="v-price" type="number" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="v-qty">Quantity in stock</Label>
              <Input id="v-qty" type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}