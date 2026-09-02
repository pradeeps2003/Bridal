"use client";

import { useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

interface FAQAccordionProps {
  sections: FAQSection[];
  className?: string;
}

export function FAQAccordion({ sections, className }: FAQAccordionProps) {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleSection = (sectionIndex: number) => {
    setOpenSection(openSection === sectionIndex ? null : sectionIndex);
    setOpenItem(null);
  };

  const toggleItem = (itemIndex: number) => {
    setOpenItem(openItem === itemIndex ? null : itemIndex);
  };

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <button
            onClick={() => toggleSection(sectionIndex)}
            className="w-full flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5 transition-all hover:border-[var(--color-accent)]/50 hover:shadow-md"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
              {section.title}
            </h2>
            <motion.div
              animate={{ rotate: openSection === sectionIndex ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            </motion.div>
          </button>

          <AnimatePresence>
            {openSection === sectionIndex && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-2 overflow-hidden"
              >
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.q}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.1 }}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(itemIndex)}
                      className="w-full flex items-start gap-3 p-3 sm:p-4 text-left transition-all hover:bg-[var(--color-muted)]/20"
                    >
                      <div className="flex-1">
                        <h3 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-medium text-[var(--color-foreground)]">
                          {item.q}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: openItem === itemIndex ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 text-[var(--color-accent)]" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openItem === itemIndex && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                            <p className="text-sm sm:text-base leading-relaxed text-[var(--color-muted-foreground)]">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
