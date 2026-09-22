import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2, Sparkles, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../lib/image-utils';
import { CATEGORIES } from '../lib/categories';

type FileMeta = { title: string; section: string; description: string; year: string };

export default function UploadFAB() {
  const [isOwner, setIsOwner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<number, FileMeta>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsOwner(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Cleanup preview URLs on unmount or file reset
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const isImageFile = (f: File) => {
    if (f.type && f.type.toLowerCase().startsWith('image/')) return true;
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'heic', 'heif', 'jfif', 'avif'].includes(ext);
  };

  const handleFiles = (newFiles: File[]) => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    const imageFiles = newFiles.filter(isImageFile);
    if (imageFiles.length === 0 && newFiles.length > 0) {
      alert('Please select valid image files (JPG, PNG, WebP, GIF, HEIC, etc.).');
      return;
    }

    setFiles(imageFiles);
    const urls = imageFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);

    const currentYear = new Date().getFullYear().toString();
    const initialMeta: Record<number, FileMeta> = {};
    imageFiles.forEach((f, i) => {
      const cleanTitle = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      initialMeta[i] = {
        title: cleanTitle,
        section: 'pencil-arts',
        description: '',
        year: currentYear,
      };
    });
    setMetadata(initialMeta);
  };

  const removeFile = (index: number) => {
    if (uploading) return;
    const newFiles = files.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    const newMeta: Record<number, FileMeta> = {};
    newFiles.forEach((_, i) => {
      const oldIdx = i >= index ? i + 1 : i;
      newMeta[i] = metadata[oldIdx] || {
        title: '',
        section: 'pencil-arts',
        description: '',
        year: new Date().getFullYear().toString(),
      };
    });
    setFiles(newFiles);
    setPreviewUrls(newUrls);
    setMetadata(newMeta);
  };

  const updateMeta = (index: number, key: keyof FileMeta, value: string) => {
    setMetadata(prev => ({ ...prev, [index]: { ...prev[index], [key]: value } }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const closeModal = () => {
    if (uploading) return;
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setFiles([]);
    setIsOpen(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      // 1. Authenticate user
      const { data: { session } } = await supabase.auth.getSession();
      let user = session?.user;
      if (!user) {
        const { data: { user: fetchedUser } } = await supabase.auth.getUser();
        user = fetchedUser ?? undefined;
      }

      if (!user) {
        alert('Authentication required: Please log in to your owner account to publish artworks.');
        setUploading(false);
        return;
      }

      const firstSection = metadata[0]?.section || 'pencil-arts';

      // 2. Process and upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const meta = metadata[i] || {
          title: file.name.replace(/\.[^/.]+$/, ''),
          section: 'pencil-arts',
          description: '',
          year: new Date().getFullYear().toString(),
        };

        setUploadProgress(`Uploading ${i + 1} of ${files.length}: "${meta.title || file.name}"...`);

        // Compress image safely (with original file fallback)
        let uploadBlob: Blob | File = file;
        let finalExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        let mimeType = file.type || 'image/jpeg';

        try {
          const compressed = await compressImage(file, 2048);
          if (compressed && compressed.size > 0) {
            uploadBlob = compressed;
            if (compressed instanceof Blob && !(compressed instanceof File)) {
              finalExt = 'webp';
              mimeType = 'image/webp';
            }
          }
        } catch (compErr) {
          console.warn('Image compression fallback:', compErr);
          uploadBlob = file;
        }

        const timestamp = Date.now();
        const rand = Math.random().toString(36).substring(2, 8);
        const filePath = `${user.id}/${timestamp}-${rand}.${finalExt}`;

        // 3. Upload to Storage Bucket
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, uploadBlob, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(filePath);

        // 5. Insert Database Record
        const payload: Record<string, any> = {
          section: meta.section || 'pencil-arts',
          title: meta.title?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Untitled Artwork',
          description: meta.description?.trim() || '',
          image_url: publicUrl,
          thumbnail_url: publicUrl,
          user_id: user.id,
        };

        if (meta.year?.trim()) {
          payload.year = meta.year.trim();
        }

        let { error: dbError } = await supabase.from('artworks').insert(payload);

        // If the 'year' column is not in the user's schema, retry without it
        if (dbError && dbError.message && dbError.message.includes('year')) {
          delete payload.year;
          const retry = await supabase.from('artworks').insert(payload);
          dbError = retry.error;
        }

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }
      }

      setUploadProgress('Published successfully!');
      alert('Success! Your artwork has been published to the gallery.');
      closeModal();
      // Redirect to the section where the artwork was uploaded
      window.location.href = `/section/${firstSection}`;
    } catch (err: any) {
      console.error('Upload process failed:', err);
      alert('Upload failed: ' + (err.message || 'Unknown error occurred'));
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  if (!isOwner) return null;

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        title="Curate / Upload Artwork"
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center z-40 border border-accent-light/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-shadow cursor-pointer"
      >
        <Upload size={22} />
      </motion.button>

      {/* Upload Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => e.preventDefault()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="bg-paper dark:bg-[#121214] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 relative border border-ink/10 dark:border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                disabled={uploading}
                aria-label="Close"
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-20 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-accent" />
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent font-semibold">Exhibition Curator</p>
              </div>
              <h2 className="text-3xl font-serif mb-6">Add New Artworks</h2>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                  isDragging
                    ? 'border-accent bg-accent/10 scale-[1.01]'
                    : 'border-ink/20 dark:border-white/20 hover:border-accent/60'
                }`}
              >
                <p className="opacity-80 text-sm font-serif mb-4">
                  Drag and drop images here, or choose files from your device
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.jfif"
                  className="hidden"
                  id="file-upload"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(Array.from(e.target.files));
                    }
                    e.target.value = '';
                  }}
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer px-6 py-2.5 bg-ink text-paper dark:bg-paper dark:text-ink rounded-full text-xs font-mono tracking-widest uppercase inline-block hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors shadow-sm"
                >
                  Browse Files
                </label>
                <p className="text-[11px] font-mono opacity-40 mt-3">
                  JPG, PNG, WebP, GIF supported • Automatic optimization
                </p>
              </div>

              {/* Files Details List */}
              {files.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                      {files.length} {files.length === 1 ? 'Artwork' : 'Artworks'} Ready to Curate
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        previewUrls.forEach(url => URL.revokeObjectURL(url));
                        setFiles([]);
                        setPreviewUrls([]);
                        setMetadata({});
                      }}
                      className="text-[11px] font-mono text-red-400 hover:text-red-500 uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  </div>

                  {files.map((_file, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-4 items-start bg-ink/5 dark:bg-white/5 p-4 rounded-2xl border border-ink/5 dark:border-white/5 relative group"
                    >
                      <div className="w-20 h-20 bg-black/10 rounded-xl overflow-hidden flex-shrink-0 relative">
                        {previewUrls[i] && (
                          <img
                            src={previewUrls[i]}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pr-8 sm:pr-0">
                        <input
                          type="text"
                          placeholder="Artwork Title"
                          value={metadata[i]?.title || ''}
                          onChange={e => updateMeta(i, 'title', e.target.value)}
                          className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-ink/10 dark:border-white/10 outline-none focus:border-accent text-xs font-sans w-full"
                          disabled={uploading}
                        />

                        <select
                          value={metadata[i]?.section || 'pencil-arts'}
                          onChange={e => updateMeta(i, 'section', e.target.value)}
                          className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-ink/10 dark:border-white/10 outline-none focus:border-accent text-xs font-sans w-full cursor-pointer"
                          disabled={uploading}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Year (e.g. 2026)"
                          value={metadata[i]?.year || ''}
                          onChange={e => updateMeta(i, 'year', e.target.value)}
                          className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-ink/10 dark:border-white/10 outline-none focus:border-accent text-xs font-sans w-full"
                          disabled={uploading}
                        />

                        <input
                          type="text"
                          placeholder="Description or notes (optional)"
                          value={metadata[i]?.description || ''}
                          onChange={e => updateMeta(i, 'description', e.target.value)}
                          className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-ink/10 dark:border-white/10 outline-none focus:border-accent text-xs font-sans w-full sm:col-span-3"
                          disabled={uploading}
                        />
                      </div>

                      {/* Remove single file button */}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        disabled={uploading}
                        title="Remove artwork"
                        className="absolute top-4 right-4 p-1.5 text-ink/40 dark:text-white/40 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  {/* Upload Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ink/10 dark:border-white/10">
                    <p className="text-xs font-mono text-accent">
                      {uploadProgress}
                    </p>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-accent text-white rounded-full font-sans text-xs font-medium tracking-widest uppercase hover:bg-accent-light transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Publish All to Exhibition</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
