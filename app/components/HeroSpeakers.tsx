"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChopThumbnail } from "./atomics/ChopThumbnail";
import Image from "next/image";

const speakers = [
  { imgSrc: "/images/speakers/Mask1.png", name: "John Doe", role: "English" },
  { imgSrc: "/images/speakers/Mask2.png", name: "Jane Smith", role: "Spanish" },
  { imgSrc: "/images/speakers/Mask3.png", name: "Alice Johnson", role: "French" },
  { imgSrc: "/images/speakers/Mask4.png", name: "Bob Brown", role: "German" },
  { imgSrc: "/images/speakers/Mask1.png", name: "Carol Lee", role: "Japanese" },
  { imgSrc: "/images/speakers/Mask2.png", name: "Dan White", role: "Italian" },
];

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function HeroSpeakers() {
  const perPage = 4;
  const pages = chunk(speakers, perPage);
  const pagesCount = pages.length;
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = "transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)";
    track.style.transform = `translateX(-${active * 100}%)`;
  }, [active]);

  const prev = () => setActive((s) => (s - 1 + pagesCount) % pagesCount);
  const next = () => setActive((s) => (s + 1) % pagesCount);

  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-3xl md:text-4xl font-bold">Learn From The Best</h3>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h3 className="text-3xl md:text-4xl font-bold">Native</h3>
            <ChopThumbnail nospace textsize="xxxlarge" bgcolor="fuchia" textcolor="black">
              Speakers
            </ChopThumbnail>
          </div>
        </motion.div>

        {/* Nav Arrows */}
        <div className="relative my-20 ">
          <div className="absolute md:right-0 md:-top-24 -top-14 right-32 flex items-center gap-3 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous speakers"
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            >
              <Image src="/images/icons/left.png" alt="Previous" width={16} height={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next speakers"
              onClick={next}
              className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            >
              <Image src="/images/icons/right.png" alt="Next" width={16} height={16} />
            </motion.button>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden w-full mt-6">
            <div ref={trackRef} className="flex w-full">
              {pages.map((page, idx) => (
                <div key={idx} className="flex-none w-full">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {page.map((sp, sidx) => (
                      <motion.div
                        key={sidx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: sidx * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-center">
                          <div className="w-28 h-28 rounded-full bg-gray-50 overflow-hidden border-2 border-gray-100">
                            <Image
                              src={sp.imgSrc}
                              alt={sp.name}
                              width={112}
                              height={112}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-xs text-gray-400 uppercase tracking-wide">Speaks</div>
                          <div className="text-xl font-bold mt-1">{sp.role}</div>
                          <div className="mx-auto h-0.5 w-12 bg-fuchsia-300 mt-2 rounded-full" />
                          <div className="text-sm text-gray-500 mt-2">With {sp.name.split(" ")[0]}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "bg-blue-500 w-8" : "bg-gray-300 w-4"
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

export default HeroSpeakers;