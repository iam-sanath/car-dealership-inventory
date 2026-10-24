import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarArt } from "@/components/CarArt";
import { formatPrice } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const LOW_STOCK_LIMIT = 2;

interface Props {
  vehicle: Vehicle;
  busy: boolean;
  onPurchase: (vehicle: Vehicle) => void;
}

function StockLabel({ quantity }: { quantity: number }) {
  if (quantity === 0) return <span className="text-sm text-muted-foreground">Out of stock</span>;
  if (quantity <= LOW_STOCK_LIMIT) {
    return <span className="text-sm font-medium text-destructive">Only {quantity} left</span>;
  }
  return <span className="text-sm text-muted-foreground">{quantity} in stock</span>;
}

export function VehicleCard({ vehicle, busy, onPurchase }: Props) {
  const soldOut = vehicle.quantity === 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-muted text-muted-foreground">
        <CarArt category={vehicle.category} />
        {soldOut && <Badge className="absolute left-3 top-3">Sold out</Badge>}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{vehicle.make}</span>
          <Badge variant="outline">{vehicle.category}</Badge>
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{vehicle.model}</h3>
        <div className="mt-auto flex items-baseline justify-between gap-3">
          <span className="text-2xl font-bold tabular-nums tracking-tight">{formatPrice(vehicle.price)}</span>
          <StockLabel quantity={vehicle.quantity} />
        </div>
        <Button variant="outline" className="w-full" disabled={soldOut || busy} onClick={() => onPurchase(vehicle)}>
          <ShoppingCart /> Purchase
        </Button>
      </div>
    </article>
  );
}