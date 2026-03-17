'use client';

import { motion } from 'framer-motion';
import RatingBadge from '../molecules/RatingBadge';
import { ChopThumbnail } from '../atomics/ChopThumbnail';

const ratings = [
  { score: '4.8', source: '🍎 App Store', stars: 5 },
  { score: '4.9', source: '▶ Google Play', stars: 5 },
  { score: '4.8', source: '⭐ Trustpilot', stars: 5 },
];

export default function RatingsSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="flex items-center gap-8 md:gap-16">
            {ratings.map((r, i) => (
              <RatingBadge key={r.source} score={r.score} source={r.source} stars={r.stars} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl md:text-4xl font-bold">Highest</span>
              <ChopThumbnail bgcolor="fuchia" textcolor="black" textsize="xxxlarge" nospace>
                Rated
              </ChopThumbnail>
              <span className="text-3xl md:text-4xl font-bold">platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xxxlarge" nospace>
                Across
              </ChopThumbnail>
              <span className="text-3xl md:text-4xl font-bold">The Globe</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
