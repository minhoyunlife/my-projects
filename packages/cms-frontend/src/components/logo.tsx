import { cn } from "@/src/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        fillRule: "nonzero",
        clipRule: "evenodd",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }}
      className={cn("text-gray-700 dark:text-gray-100 fill-current", className)}
      width={36}
      height={36}
      version="1.1"
      viewBox="0 0 300 300"
    >
      <g>
        <path
          d="M252.636+24.2943L150.759+126.216L49.2312+24.688C45.7786+34.5579+42.986+44.9961+40.8325+55.8768L67.9969+83.0412L49.5811+187.543C55.3378+203.755+62.7703+218.363+71.4964+230.98L72.065+231.068L93.6303+108.675L135.23+150.274L135.23+277.479C140.404+278.554+145.651+279.272+151.021+279.272C155.737+279.272+160.365+278.749+164.931+277.916L164.931+151.587L207.975+108.543L229.671+231.461L230.196+231.374C238.919+218.849+246.415+204.393+252.199+188.287L233.652+82.91L261.122+55.4393C258.951+44.5702+256.105+34.1496+252.636+24.2943Z"
          opacity="1"
        />
      </g>
    </svg>
  );
}
