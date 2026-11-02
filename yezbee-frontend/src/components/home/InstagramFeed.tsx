'use client';

import { Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const INSTA_POSTS = [
  {
    id: 1,
    image: '/images/hero/hero1.png',
    tag: '#YEZBEELookbook',
  },
  {
    id: 2,
    image: '/images/hero/hero2.png',
    tag: '#MaternityStyle',
  },
  {
    id: 3,
    image: '/images/hero/hero3.png',
    tag: '#FestivalGlam',
  },
];

export default function InstagramFeed() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <Instagram size={16} className="text-[var(--color-primary-gold)]" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
            @YEZBEEFASHION
          </span>
        </div>
        <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl">
          Follow Our Instagram Atelier
        </h2>
        <p className="text-sm text-[var(--color-dark)]/60 mt-2">
          Tag #YEZBEELookbook to be featured in our seasonal magazine
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {INSTA_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/yezbeefashion?igsi=MTRwZm1rNzdrc2h0bw=="
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[4/5] overflow-hidden bg-gray-100 rounded-2xl sm:rounded-3xl shadow-soft-md hover:shadow-gold-md transition-all duration-500 hover:-translate-y-1"
            >
              <Image
                src={post.image}
                alt={post.tag}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                <Instagram
                  size={28}
                  className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                />
                <span className="text-xs font-bold text-[var(--color-gold-light)] opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2 uppercase tracking-wider">
                  {post.tag}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="https://www.instagram.com/yezbeefashion?igsi=MTRwZm1rNzdrc2h0bw=="
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] border-2 border-[var(--color-primary-gold)] text-[var(--color-dark)] bg-transparent hover:bg-[var(--color-primary-gold)] hover:text-white transition-all shadow-sm font-semibold hover:scale-105 active:scale-95"
        >
          <Instagram size={16} className="text-[var(--color-primary-gold)] group-hover:text-white transition-colors" />
          <span>Follow On Instagram</span>
        </a>

        <a
          href="https://www.facebook.com/share/1GoBY9GSPB/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] border-2 border-[var(--color-primary-gold)] text-[var(--color-dark)] bg-transparent hover:bg-[var(--color-primary-gold)] hover:text-white transition-all shadow-sm font-semibold hover:scale-105 active:scale-95"
        >
          <Facebook size={16} className="text-[var(--color-primary-gold)] group-hover:text-white transition-colors" />
          <span>Follow On Facebook</span>
        </a>
      </div>
    </section>
  );
}
