"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChopThumbnail } from "./atomics/ChopThumbnail";
import FlagsCard from "./atomics/FlagsCard";

const languages = [
  { name: "English", flag: "/images/flags/england.png", href: "/learn/english" },
  { name: "Spanish", flag: "/images/flags/spain.png", href: "/learn/spanish" },
  { name: "French", flag: "/images/flags/france.png", href: "/learn/french" },
  { name: "German", flag: "/images/flags/germany.png", href: "/learn/german" },
  { name: "Italian", flag: "/images/flags/italy.png", href: "/learn/italian" },
  { name: "Dutch", flag: "/images/flags/netherlands.png", href: "/learn/dutch" },
  { name: "Portuguese", flag: "/images/flags/portugal.png", href: "/learn/portuguese" },
  { name: "Arabic", flag: "/images/flags/arab.png", href: "/learn/arabic" },
  { name: "India", flag: "/images/flags/India.png", href: "/learn/hindi" },
  { name: "Bangladesh", flag: "/images/flags/bangli.png", href: "/learn/bengali" },
];

export default function HeroLearn() {
  const [active, setActive] = useState(0);
  const perPage = 5;
  const pages: (typeof languages)[] = [];
  for (let i = 0; i < languages.length; i += perPage) {
    pages.push(languages.slice(i, i + perPage));
  }
  const pagesCount = pages.length;
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Auto-advance slides every 4s
  useEffect(() => {
    if (pagesCount <= 1) return;
    const id = setInterval(() => setActive((s) => (s + 1) % pagesCount), 4000);
    return () => clearInterval(id);
  }, [pagesCount]);

  // Apply transform to track when active changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = "transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)";
    track.style.transform = `translateX(-${active * 100}%)`;
  }, [active]);

  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-3xl md:text-4xl font-light">Learn Your</span>
            <ChopThumbnail nospace textsize="xxxlarge" bgcolor="fuchia" textcolor="black">
              Favourite
            </ChopThumbnail>
          </div>
          <h2 className="text-3xl md:text-4xl font-light mt-2">Languages</h2>
        </motion.div>

        {/* Carousel */}
        <div className="mt-8 w-full">
          <div className="w-full overflow-hidden">
            <div ref={trackRef} className="flex w-full">
              {pages.map((page, pidx) => (
                <div key={pidx} className="flex-none w-full px-2">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {page.map((language, lidx) => (
                      <FlagsCard
                        key={language.name}
                        country={language.name}
                        flag={language.flag}
                        href={language.href}
                        index={lidx}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 w-full flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: pagesCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "bg-gray-900 w-8" : "bg-gray-300 w-4"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}