import { motion } from 'framer-motion';

const timeline = [
  {
    year: "2022",
    title: "First Pencil Sketch",
    desc: "The beginning of my love for graphite and shading. A simple portrait of a mountain landscape — my first real attempt at capturing light and shadow. This sketch taught me the importance of patience and observation."
  },
  {
    year: "2023",
    title: "Started Pixel Art",
    desc: "Discovered the beauty of tiny squares and retro aesthetics."
  },
  {
    year: "2024",
    title: "DIY Arts",
    desc: "Moved from digital to physical — paper, glue, and scissors."
  },
  {
    year: "2025",
    title: "Built My First Web Game",
    desc: "Combined coding with creativity — a playable puzzle game."
  },
  {
    year: "2026",
    title: "Started Multiplayer Games",
    desc: "Collaborative and competitive games with friends around the world."
  }
];

export default function About() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="flex flex-col gap-12 md:gap-16">
        
        {/* Intro Section */}
        <section className="text-center md:text-left flex flex-col md:flex-row gap-12 items-center md:items-start">
          <div className="flex-1 space-y-6 text-lg leading-relaxed opacity-90 font-serif">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-2xl md:text-3xl font-serif text-accent mb-6 leading-snug"
            >
              Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              A passionate creative artist with a deep love for pencil sketches, pixel art, DIY crafts, and aesthetic visual storytelling ✨ Every artwork is created with patience, imagination, and emotion, transforming simple ideas into meaningful visual experiences.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Inspired by nature, memories, silence, and everyday emotions, the creative journey continues through exploring different artistic styles and handmade creations 🌙
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              This portfolio is a collection of artistic works, ideas, and creative moments developed over time — pencil drawings, sketchbook studies, DIY crafts, pixel art, games, and quotes ✨
            </motion.p>
          </div>
        </section>

        {/* Contact Info */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-ink/5 dark:bg-white/5 p-8 rounded-2xl text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div>
            <h3 className="font-serif text-2xl mb-4 text-accent">Let's Connect</h3>
            <div className="space-y-2 opacity-80 font-mono text-sm">
              <p>Email: <a href="mailto:quantumvoyager2005@gmail.com" className="hover:text-accent transition-colors">quantumvoyager2005@gmail.com</a></p>
              <p>Phone: <a href="tel:+919600404942" className="hover:text-accent transition-colors">9600404942</a></p>
              <p>Insta: <a href="https://instagram.com/crafted.strokes.42" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">@crafted.strokes.42</a></p>
            </div>
          </div>
        </motion.section>

        {/* Timeline Section */}
        <section className="mt-12">
          <div className="mb-12 text-center md:text-left">
            <p className="uppercase tracking-widest text-xs opacity-60 font-mono mb-2">Creative Journey</p>
            <h2 className="text-4xl md:text-5xl font-serif">My artistic <span className="text-accent italic">growth</span></h2>
            <p className="opacity-70 mt-4 max-w-2xl">A timeline of creative milestones — from first sketch to multiplayer games. Each moment represents a step in my artistic evolution.</p>
          </div>

          <div className="relative border-l border-ink/20 dark:border-white/20 ml-4 md:ml-6 space-y-12 pb-12">
            {timeline.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                {/* Timeline dot */}
                <div className="absolute -left-1.5 md:-left-2 top-2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-accent ring-4 ring-paper dark:ring-[#1a1a1c]" />
                
                <div className="bg-ink/5 dark:bg-white/5 p-6 md:p-8 rounded-2xl border border-ink/10 dark:border-white/10 hover:border-accent/50 transition-colors">
                  <span className="text-xs font-mono tracking-widest text-accent uppercase mb-2 block">{item.year}</span>
                  <h3 className="text-xl md:text-2xl font-serif mb-3">{item.title}</h3>
                  <p className="opacity-70 leading-relaxed text-sm md:text-base">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
