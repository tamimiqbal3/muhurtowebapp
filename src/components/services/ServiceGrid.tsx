import type { Service, Vendor } from "@/lib/types";
import { ServiceCard } from "./ServiceCard";

export function ServiceGrid({ services, vendors, priorityCount = 0 }: { services: Service[]; vendors: Vendor[]; priorityCount?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => {
        const v = vendors.find((x) => x.id === s.vendorId);
        return <ServiceCard key={s.id} service={s} vendorName={v?.name} vendorVerified={v?.verified} priority={i < priorityCount} />;
      })}
    </div>
  );
}
