'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChopThumbnail } from '../../components/atomics/ChopThumbnail';
import Button from '../../components/atomics/button';

const blogPosts = [
  {
    title: '10 Tips to Learn a New Language Faster',
    category: 'Tips & Tricks',
    image: '/images/explore/test1.png',
    color: 'bg-blue-500',
  },
  {
    title: 'Why Cultural Context Matters in Language',
    category: 'Culture',
    image: '/images/explore/test2.png',
    color: 'bg-fuchsia-400',
  },
  {
    title: 'How Technology is Changing Language Learning',
    category: 'Technology',
    image: '/images/explore/test1.png',
    color: 'bg-green-500',
  },
];

export default function BlogSection() {
  return (
    <section className="w-full py-20 px-4 border-b border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ChopThumbnail bgcolor="transparent" textcolor="black" textsize="xxxlarge" nospace>
              Explore
            </ChopThumbnail>
            <span className="text-3xl md:text-4xl font-bold"> The Latest From</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-3xl md:text-4xl font-bold">Our</span>
            <ChopThumbnail bgcolor="blue" textcolor="white" textsize="xxxlarge" nospace>
              Blog
            </ChopThumbnail>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className={`h-48 ${post.color} relative overflow-hidden`}>
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 leading-snug">{post.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Button href="/blog" text="Read All" color="white" size="md" />
        </div>
      </div>
    </section>
  );
}
