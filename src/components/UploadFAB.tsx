import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadFAB() {
  const [isOwner, setIsOwner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsOwner(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isOwner) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <Upload />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          >
            <div className="bg-paper dark:bg-ink w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X />
              </button>
              
              <h2 className="text-3xl font-serif mb-6">Upload Artworks</h2>
              
              <div className="border-2 border-dashed border-ink/20 dark:border-white/20 rounded-xl p-12 text-center">
                <p className="opacity-70 mb-4">Drag and drop images here, or click to select files</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <label 
                  htmlFor="file-upload"
                  className="cursor-pointer px-6 py-3 bg-ink text-paper dark:bg-paper dark:text-ink rounded-lg font-medium inline-block hover:opacity-90 transition-opacity"
                >
                  Select Files
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-8 space-y-6">
                  {files.map((file, i) => (
                    <div key={i} className="flex gap-4 items-start bg-ink/5 dark:bg-white/5 p-4 rounded-lg">
                      <div className="w-24 h-24 bg-black/10 rounded overflow-hidden flex-shrink-0">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Title" defaultValue={file.name.split('.')[0]} className="p-2 rounded bg-white dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-accent w-full" />
                        <select className="p-2 rounded bg-white dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-accent w-full">
                          <option value="pencil-arts">Pencil Arts</option>
                          <option value="pixel-arts">Pixel Arts</option>
                          <option value="sketches">Sketches</option>
                          <option value="doodles">Doodles</option>
                          <option value="diy-crafts">DIY Crafts</option>
                        </select>
                        <input type="text" placeholder="Description (optional)" className="p-2 rounded bg-white dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-accent w-full col-span-2" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <button className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                      Upload All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
