import { motion } from 'framer-motion';
import { Mail, Phone, AtSign } from 'lucide-react';

const timeline = [
  {
    year: '2022',
    title: 'First Pencil Sketch',
    desc: 'The beginning of my love for graphite and shading. A simple portrait — my first real attempt at capturing light and shadow. This sketch taught me the importance of patience and observation.',
  },
  {
    year: '2023',
    title: 'Started Pixel Art',
    desc: 'Discovered the beauty of tiny squares and retro aesthetics. Pixel art became a meditative practice of placing each dot with intention.',
  },
  {
    year: '2024',
    title: 'DIY Crafts Journey',
    desc: 'Moved from digital to physical — paper, glue, and scissors. Discovered that handmade creations carry a warmth that digital art cannot replicate.',
  },
  {
    year: '2025',
    title: 'First Web Game',
    desc: 'Combined coding with creativity — a playable pixel puzzle game. The intersection of logic and art felt like a new superpower.',
  },
  {
    year: '2026',
    title: 'Multiplayer Experiences',
    desc: 'Collaborative and competitive games with friends around the world. Art as a shared language, transcending screens and borders.',
  },
];

const contacts = [
  { icon: Mail,    label: 'Email',     value: 'quantumvoyager2005@gmail.com', href: 'mailto:quantumvoyager2005@gmail.com' },
  { icon: Phone,   label: 'Phone',     value: '9600404942',                   href: 'tel:+919600404942' },
  { icon: AtSign,  label: 'Instagram', value: '@crafted.strokes.42',          href: 'https://instagram.com/crafted.strokes.42' },
];

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="max-w-4xl mx-auto pb-16"
    >

      {/* ── PAGE HEADER ── */}
      <div className="mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-mono tracking-[0.3em] uppercase text-accent/70 mb-4"
        >
          The Artist
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="text-5xl md:text-6xl font-serif leading-none"
        >
          About the
          <span className="italic text-accent"> Gallery</span>
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-6 h-px bg-accent"
        />
      </div>

      {/* ── INTRO PARAGRAPHS ── */}
      <section className="mb-20 space-y-6">
        {[
          { delay: 0.2, large: true, text: 'Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍.' },
          { delay: 0.3, large: false, text: 'A passionate creative artist with a deep love for pencil sketches, pixel art, DIY crafts, and aesthetic visual storytelling ✨ Every artwork is created with patience, imagination, and emotion, transforming simple ideas into meaningful visual experiences.' },
          { delay: 0.4, large: false, text: 'Inspired by nature, memories, silence, and everyday emotions, the creative journey continues through exploring different artistic styles and handmade creations 🌙' },
          { delay: 0.5, large: false, text: 'This portfolio is a collection of artistic works, ideas, and creative moments developed over time — pencil drawings, sketchbook studies, DIY crafts, pixel art, games, and quotes ✨' },
        ].map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: p.delay, duration: 0.7, ease: 'easeOut' }}
            className={`font-serif leading-relaxed ${p.large ? 'text-xl md:text-2xl text-accent' : 'text-base md:text-lg opacity-80'}`}
          >
            {p.text}
          </motion.p>
        ))}
      </section>

      {/* ── CONTACT ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-24 p-8 md:p-10 rounded-3xl border border-ink/10 dark:border-white/10 bg-ink/3 dark:bg-white/3 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

        <h2 className="font-serif text-2xl mb-8 text-accent">Let's Connect</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contacts.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-accent/8 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-mono tracking-wider uppercase opacity-50 mb-0.5">{label}</p>
                <p className="text-sm font-medium group-hover:text-accent transition-colors">{value}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.section>

      {/* ── TIMELINE ── */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent/70 mb-4">Creative Journey</p>
          <h2 className="text-4xl md:text-5xl font-serif">
            My artistic <span className="text-accent italic">growth</span>
          </h2>
          <p className="mt-3 opacity-50 text-sm max-w-lg font-serif italic">
            A timeline of creative milestones — each moment a step in the artistic evolution.
          </p>
        </motion.div>

        {/* Timeline — alternating on desktop, left-aligned on mobile */}
        <div className="relative">
          {/* Center line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-ink/15 dark:bg-white/15 -translate-x-1/2" />
          {/* Left line (mobile) */}
          <div className="md:hidden absolute left-3 top-0 bottom-0 w-px bg-ink/15 dark:bg-white/15" />

          <div className="space-y-10 md:space-y-12">
            {timeline.map((item, i) => {
              const isRight = i % 2 !== 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`relative flex items-start md:items-center gap-8 ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 pl-10 md:pl-0 ${isRight ? 'md:pl-10' : 'md:pr-10'}`}>
                    <div className="group p-6 md:p-7 rounded-2xl border border-ink/8 dark:border-white/8 bg-ink/3 dark:bg-white/3 hover:border-accent/30 hover:bg-accent/3 transition-all duration-400">
                      <span className="text-accent font-mono text-xs tracking-widest uppercase">{item.year}</span>
                      <h3 className="text-xl md:text-2xl font-serif mt-2 mb-3 group-hover:text-accent transition-colors duration-300">{item.title}</h3>
                      <p className="opacity-60 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1 md:left-1/2 top-7 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 z-10 w-5 h-5 rounded-full bg-accent ring-4 ring-paper dark:ring-[#111111] shadow-[0_0_16px_rgba(212,175,55,0.6)] flex-shrink-0" />

                  {/* Spacer (desktop) */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
