"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MasonryGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  gap?: number;
  minColumnWidth?: number;
}

interface MasonryItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

// Pinterest-style masonry grid that preserves natural aspect ratios
export function MasonryGrid({
  children,
  className = "",
  columns = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 16,
  minColumnWidth = 280,
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(columns.desktop);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);

  const updateColumnCount = () => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    
    // Calculate how many columns fit based on minColumnWidth
    const calculatedColumns = Math.max(1, Math.floor(containerWidth / (minColumnWidth + gap)));
    
    // Apply responsive breakpoints
    let newColumnCount = calculatedColumns;
    if (containerWidth < 640) {
      newColumnCount = columns.mobile || 1;
    } else if (containerWidth < 1024) {
      newColumnCount = columns.tablet || 2;
    } else if (containerWidth < 1280) {
      newColumnCount = columns.desktop || 3;
    } else {
      newColumnCount = columns.large || 4;
    }
    
    setColumnCount(newColumnCount);
    setColumnHeights(new Array(newColumnCount).fill(0));
  };

  useEffect(() => {
    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, [columns, gap, minColumnWidth]);

  // Distribute children into columns
  const childrenArray = Array.isArray(children) ? children : [children];
  const columnChildren: ReactNode[][] = Array.from({ length: columnCount || 1 }, () => []);

  childrenArray.forEach((child, index) => {
    const columnIndex = index % (columnCount || 1);
    columnChildren[columnIndex].push(child);
  });

  return (
    <div
      ref={containerRef}
      className={`flex gap-${gap / 4} ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {columnChildren.map((columnItems, colIndex) => (
        <motion.div
          key={colIndex}
          className="flex flex-col gap-4 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: colIndex * 0.1 }}
          style={{ gap: `${gap}px` }}
        >
          {columnItems.map((item, itemIndex) => (
            <motion.div
              key={itemIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: (colIndex * 0.1) + (itemIndex * 0.05),
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              {item}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Wrapper for individual masonry items
export function MasonryItem({ children, className = "" }: MasonryItemProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}
