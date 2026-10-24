import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pager } from "@/components/Pager";
import { VehicleFormDialog } from "@/components/VehicleFormDialog";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { EMPTY_FILTERS, type Page, type Vehicle, type VehicleInput } from "@/lib/types";

const PAGE_SIZE = 10;

function RestockDialog({ vehicle, onClose, onConfirm }: { vehicle: Vehicle; onClose: () => void; onConfirm: (quantity: number) => Promise<void> }) {
  const [quantity, setQuantity] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onConfirm(Number(quantity));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restock");
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Restock {vehicle.make} {vehicle.model}</DialogTitle>
            <DialogDescription>{vehicle.quantity} currently in stock. How many units are arriving?</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="restock-qty">Units to add</Label>
            <Input id="restock-qty" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Restock"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ vehicle, onClose, onConfirm }: { vehicle: Vehicle; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setError(null);
    setBusy(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {vehicle.make} {vehicle.model}?</DialogTitle>
          <DialogDescription>This removes the listing permanently and cannot be undone.</DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" disabled={busy} onClick={handleConfirm}>{busy ? "Deleting..." : "Delete"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Manage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<Vehicle> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listVehicles(EMPTY_FILTERS, page, PAGE_SIZE)
      .then((res) => !cancelled && setResult(res))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load vehicles"));
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  async function handleSave(values: VehicleInput) {
    if (editing) await api.updateVehicle(editing.id, values);
    else await api.createVehicle(values);
    setFormOpen(false);
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Manage inventory</h1>
          <p className="mt-2 text-xl text-muted-foreground">Add, update, restock and remove vehicles.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus /> Add vehicle
        </Button>
      </div>

      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">In stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result?.data.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.make} {vehicle.model}</TableCell>
                <TableCell><Badge variant="outline">{vehicle.category}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{formatPrice(vehicle.price)}</TableCell>
                <TableCell className="text-right tabular-nums">{vehicle.quantity}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="outline" size="sm" onClick={() => setRestocking(vehicle)}>
                      <Package /> Restock
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
                      onClick={() => {
                        setEditing(vehicle);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${vehicle.make} ${vehicle.model}`} onClick={() => setDeleting(vehicle)}>
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {result && (
        <Pager page={result.page} totalPages={result.totalPages} total={result.total} limit={result.limit} onPage={setPage} />
      )}

      {formOpen && <VehicleFormDialog vehicle={editing} onClose={() => setFormOpen(false)} onSubmit={handleSave} />}
      {restocking && (
        <RestockDialog
          vehicle={restocking}
          onClose={() => setRestocking(null)}
          onConfirm={async (quantity) => {
            await api.restock(restocking.id, quantity);
            setRestocking(null);
            refresh();
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          vehicle={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await api.deleteVehicle(deleting.id);
            setDeleting(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}