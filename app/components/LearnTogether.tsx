'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from './atomics/ChopThumbnail';
import AnimatedSection from './molecules/AnimatedSection';

export default function LearnTogether() {
  return (
    <section className="w-full py-20 px-4 bg-amber-50/80 border-y border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Chat Interface Mockup */}
          <AnimatedSection direction="left">
            <div className="bg-white rounded-3xl shadow-lg p-6 relative">
              {/* Chat Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <p className="text-sm text-gray-500">
                  You have received feedback on your Japanese exersices and
                </p>
              </div>
              <div className="text-2xl font-bold mb-4">exercise</div>

              {/* User Profile */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <Image
                    src="/images/speakers/Mask1.png"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">Surbani</p>
                  <div className="flex gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Expert</span>
                  </div>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Pronunciation</span>
                <span className="text-xs text-gray-400">Great pronunciation</span>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 mt-4">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-gray-700">Well, it&apos;s a lot of homework.</p>
                </div>
                <div className="text-xs text-gray-400 mt-1">yesterday</div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-gray-700">I love it! 😊 <span className="font-medium">Got it done?</span></p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right - Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-4xl md:text-5xl font-bold">Learn Together With</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-4xl md:text-5xl font-bold">Huge</span>
                  <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="huge" nospace>
                    Excitement
                  </ChopThumbnail>
                </div>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Gather your friends and join groups, get feedback from expert tutors. Join
                10,000+ learners who have learnt together. The fastest
                method based on the latest studies across the world.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
