"use client";

import { motion } from "framer-motion";
import { PackageCard } from "@/components/ui/package-card";
import type { Package } from "@/types";

interface PackageWithSale extends Package {
  salePrice?: number | null;
}

interface PackageCardSliderProps {
  packages: PackageWithSale[];
  className?: string;
}

export function PackageCardSlider({ packages, className }: PackageCardSliderProps) {
  return (
    <div className={`relative ${className || ''}`}>
      {/* Static grid layout for all devices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <PackageCard
              pkg={pkg}
              showSaleBadge={pkg.salePrice !== undefined && pkg.salePrice !== null}
              salePrice={pkg.salePrice || undefined}
              inclusionsPreview={2}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
