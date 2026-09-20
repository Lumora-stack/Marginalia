import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FileMeta = { title: string; section: string; description: string };

export default function UploadFAB() {
  const [isOwner, setIsOwner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<Record<number, FileMeta>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsOwner(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleFiles = (newFiles: File[]) => {
    setFiles(newFiles);
    const initialMeta: Record<number, FileMeta> = {};
    newFiles.forEach((f, i) => {
      initialMeta[i] = { title: f.name.split('.')[0].replace(/[-_]/g, ' '), section: 'pencil-arts', description: '' };
    });
    setMetadata(initialMeta);
  };

  const updateMeta = (index: number, key: keyof FileMeta, value: string) => {
    setMetadata(prev => ({ ...prev, [index]: { ...prev[index], [key]: value } }));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Error: You must be logged in to upload.");
      setUploading(false);
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const meta = metadata[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        // 2. Insert into Database
        const { error: dbError } = await supabase.from('artworks').insert({
          section: meta.section,
          title: meta.title,
          description: meta.description,
          image_url: publicUrl,
          thumbnail_url: publicUrl, // For now using the same image
          user_id: user.id
        });

        if (dbError) throw dbError;
      }
      
      alert("Successfully uploaded!");
      setIsOpen(false);
      setFiles([]);
      // Force a tiny reload so the galleries update
      window.location.reload();
      
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

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
                className="absolute top-6 right-6 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                disabled={uploading}
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
                    if (e.target.files) handleFiles(Array.from(e.target.files));
                  }}
                  disabled={uploading}
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
                        <input 
                          type="text" 
                          placeholder="Title" 
                          value={metadata[i]?.title || ''}
                          onChange={e => updateMeta(i, 'title', e.target.value)}
                          className="p-2 rounded bg-white dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-accent w-full text-sm" 
                          disabled={uploading}
                        />
                        <select 
                          value={metadata[i]?.section || 'pencil-arts'}
                          onChange={e => updateMeta(i, 'section', e.target.value)}
                          className="p-2 rounded bg-white dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-accent w-full text-sm"
                          disabled={uploading}
                        >
                          <option value="pencil-arts">Pencil Arts</option>
                          <option value="pixel-arts">Pixel Arts</option>
                          <option value="sketches">Sketches</option>
                          <option value="doodles">Doodles</option>
                          <option value="diy-crafts">DIY Crafts</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Description (optional)" 
                          value={metadata[i]?.description || ''}
                          onChange={e => updateMeta(i, 'description', e.target.value)}
                          className="p-2 rounded bg-white dark:bg-black/20 border-none outline-none focus:ring-1 focus:ring-accent w-full col-span-2 text-sm" 
                          disabled={uploading}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {uploading ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : 'Upload All'}
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
