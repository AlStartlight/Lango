'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { ChopThumbnail } from "./atomics/ChopThumbnail";
import Button from "./atomics/button";
import AnimatedSection from "./molecules/AnimatedSection";

export default function Hero() {
  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <AnimatedSection direction="left">
            <div className="rounded-3xl overflow-hidden">
              <Image
                width={600}
                height={500}
                src="/images/hero.png"
                alt="Hero Image"
                className="w-full h-auto object-cover rounded-3xl"
              />
            </div>
          </AnimatedSection>

          {/* Right - Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-4xl md:text-5xl font-light">Start</span>
                  <ChopThumbnail nospace textsize="xtrahuge" bgcolor="transparent" textcolor="black">
                    Learning
                  </ChopThumbnail>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-4xl md:text-5xl font-light">Languages For</span>
                  <ChopThumbnail nospace textsize="xtrahuge" bgcolor="fuchia" textcolor="black">
                    Free
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Learn to speak Spanish, French, German and more with top handpicked professional language tutors.
              </p>
              <Button href="/languages" text="Learning More" color="blue" size="lg" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}