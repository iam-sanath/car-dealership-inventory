const SHAPES = {
  sedan: {
    wheels: [64, 176],
    paths: [
      "M18 70V60C18 55 21 53 27 52L59 45L79 25C82 22 85 21 89 21H149C154 21 157 22 160 25L182 45L208 51C214 52 222 55 222 60V70",
      "M18 70H48M80 70H160M192 70H222",
      "M92 28L76 45H158L142 28Z",
    ],
  },
  suv: {
    wheels: [64, 176],
    paths: [
      "M18 70V58C18 53 21 51 27 50L56 46L70 22C71 20 73 19 76 19H172C176 19 178 20 180 22L198 44L210 48C216 50 222 53 222 58V70",
      "M18 70H48M80 70H160M192 70H222",
      "M82 26L72 45H132V26Z",
      "M140 26V45H186L172 26Z",
    ],
  },
  truck: {
    wheels: [64, 184],
    paths: [
      "M18 70V56C18 51 21 49 27 48L52 44L68 22C69 20 71 19 74 19H108C111 19 113 20 114 22L122 44H222V70",
      "M18 70H48M80 70H168M200 70H222",
      "M78 26L66 44H112L106 26Z",
      "M122 44V52H222",
    ],
  },
};

function shapeFor(category: string) {
  const c = category.toLowerCase();
  if (c === "truck") return SHAPES.truck;
  if (c === "suv" || c === "electric") return SHAPES.suv;
  return SHAPES.sedan;
}

/** Simple line illustration used in place of photos. */
export function CarArt({ category, className = "h-[70px] w-[168px]" }: { category: string; className?: string }) {
  const shape = shapeFor(category);
  return (
    <svg
      viewBox="0 0 240 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shape.paths.map((d) => (
        <path key={d} d={d} />
      ))}
      {shape.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={72} r={14} />
          <circle cx={cx} cy={72} r={4} />
        </g>
      ))}
    </svg>
  );
}