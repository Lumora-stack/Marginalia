export default function About() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl mb-8">About the Artist</h1>
      
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-1/3 aspect-square bg-ink/10 dark:bg-white/10 rounded-2xl overflow-hidden relative">
          {/* Portrait placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-50 font-serif">
            PG
          </div>
        </div>
        
        <div className="flex-1 space-y-6 text-lg leading-relaxed opacity-90">
          <p>
            Hello, I'm Praveenkumar G, a dedicated artist exploring the boundaries between traditional mediums and digital creation.
          </p>
          <p>
            My work spans intricate pencil sketches to vibrant pixel art and DIY crafts. This portfolio is a curated collection of my journey, showcasing the different techniques and styles I have developed over the years.
          </p>
          
          <div className="pt-8 flex gap-6">
            <a href="mailto:hello@example.com" className="uppercase text-sm tracking-wider font-medium hover:text-accent transition-colors">
              Email Me
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="uppercase text-sm tracking-wider font-medium hover:text-accent transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
