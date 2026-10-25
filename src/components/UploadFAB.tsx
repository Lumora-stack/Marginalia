import { useState, useEffect, useRef } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Upload, X, Loader2, Sparkles, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../lib/image-utils';
import { ARTWORK_SECTIONS } from '../lib/categories';
import { validateGameLink } from '../lib/game-link';

type FileMeta = { title: string; section: string; description: string; year: string; link_url: string };
const extensionForMimeType = (mimeType: string, fallback: string) => {
  const extensions: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return extensions[mimeType] || fallback;
};

export default function UploadFAB() {
  const [isOwner, setIsOwner] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<number, FileMeta>>({});
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
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
        link_url: '',
      };
    });
    setMetadata(initialMeta);
    setLinkErrors({});
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
        link_url: '',
      };
    });
    setFiles(newFiles);
    setPreviewUrls(newUrls);
    setMetadata(newMeta);
    setLinkErrors({});
  };

  const updateMeta = (index: number, key: keyof FileMeta, value: string) => {
    setMetadata(prev => ({ ...prev, [index]: { ...prev[index], [key]: value } }));
    if (key === 'link_url') {
      setLinkErrors(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
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
    if (!isSupabaseConfigured) {
      setUploadError('Uploads are temporarily unavailable because Supabase is not configured.');
      return;
    }
    const normalizedGameLinks: Record<number, string | null> = {};
    const errors: Record<number, string> = {};
    files.forEach((_, index) => {
      const meta = metadata[index];
      if (meta?.section.startsWith('games-')) {
        const result = validateGameLink(meta.link_url, true);
        if (result.ok) normalizedGameLinks[index] = result.value;
        else errors[index] = result.error;
      }
    });
    setLinkErrors(errors);
    if (Object.keys(errors).length > 0) {
      setUploadError('Fix the game link errors before publishing.');
      return;
    }
    setUploadError(null);
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
          link_url: '',
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
              mimeType = compressed.type || 'image/webp';
              finalExt = extensionForMimeType(mimeType, finalExt);
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

        const thumbnailBlob = await compressImage(file, 640);
        const thumbnailType = thumbnailBlob.type || mimeType;
        const thumbnailExt = extensionForMimeType(thumbnailType, finalExt);
        const thumbnailPath = `${user.id}/thumbnails/${timestamp}-${rand}.${thumbnailExt}`;
        const { error: thumbnailError } = await supabase.storage
          .from('portfolio-images')
          .upload(thumbnailPath, thumbnailBlob, {
            contentType: thumbnailType,
            upsert: true,
          });
        if (thumbnailError) {
          const cleanup = await supabase.storage.from('portfolio-images').remove([filePath]);
          if (cleanup.error) console.error('Could not clean up uploaded original after thumbnail failure:', cleanup.error);
          throw new Error(`Thumbnail upload failed: ${thumbnailError.message}`);
        }
        const { data: { publicUrl: thumbnailUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(thumbnailPath);

        let dimensions: { width: number; height: number } | undefined;
        try {
          const bitmap = await createImageBitmap(uploadBlob);
          dimensions = { width: bitmap.width, height: bitmap.height };
          bitmap.close();
        } catch (dimensionError) {
          console.warn('Could not read artwork dimensions:', dimensionError);
        }

        // 5. Insert the original and thumbnail locations with optional image dimensions.
        const payload: {
          section: string;
          title: string;
          description: string;
          image_url: string;
          thumbnail_url: string;
          user_id: string;
          width?: number;
          height?: number;
          year?: string;
          link_url?: string | null;
        } = {
          section: meta.section || 'pencil-arts',
          title: meta.title?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Untitled Artwork',
          description: meta.description?.trim() || '',
          image_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          user_id: user.id,
          ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {}),
          ...(meta.section.startsWith('games-') ? { link_url: normalizedGameLinks[i] ?? null } : {}),
        };

        if (meta.year?.trim()) {
          payload.year = meta.year.trim();
        }

        let insertPayload = payload;
        let { error: dbError } = await supabase.from('artworks').insert(insertPayload);
        while (dbError) {
          const missingDimension = /width|height/i.test(dbError.message) &&
            (insertPayload.width !== undefined || insertPayload.height !== undefined);
          const missingYear = /year/i.test(dbError.message) && insertPayload.year !== undefined;
          if (!missingDimension && !missingYear) break;
          insertPayload = { ...insertPayload };
          if (missingDimension) {
            delete insertPayload.width;
            delete insertPayload.height;
          }
          if (missingYear) delete insertPayload.year;
          const retry = await supabase.from('artworks').insert(insertPayload);
          dbError = retry.error;
        }

        if (dbError) {
          const cleanup = await supabase.storage.from('portfolio-images').remove([filePath, thumbnailPath]);
          if (cleanup.error) console.error('Could not clean up artwork files after database failure:', cleanup.error);
          throw new Error(`Database error: ${dbError.message}`);
        }
      }

      setUploadProgress('Published successfully!');
      alert('Success! Your artwork has been published to the gallery.');
      closeModal();
      // Redirect to the section where the artwork was uploaded
      window.location.href = `/section/${firstSection}`;
    } catch (err: unknown) {
      console.error('Upload process failed:', err);
      setUploadError(`Upload failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
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
        aria-label="Curate or upload artwork"
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
              className="viewport-max-90 bg-paper dark:bg-[#121214] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 relative border border-ink/10 dark:border-white/10"
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
              {uploadError && (
                <p role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                  {uploadError}
                </p>
              )}

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
                            alt={`Artwork preview: ${metadata[i]?.title || _file.name}`}
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

                        {metadata[i]?.section.startsWith('games-') && (
                          <div className="sm:col-span-3">
                            <label htmlFor={`game-link-${i}`} className="mb-1 block text-[11px] font-mono uppercase tracking-wider text-accent">
                              Game link <span aria-hidden="true">*</span>
                            </label>
                            <input
                              id={`game-link-${i}`}
                              type="url"
                              inputMode="url"
                              autoComplete="url"
                              placeholder="https://..."
                              value={metadata[i]?.link_url || ''}
                              onChange={e => updateMeta(i, 'link_url', e.target.value)}
                              onBlur={() => {
                                const result = validateGameLink(metadata[i]?.link_url || '', true);
                                if (result.ok && result.value) updateMeta(i, 'link_url', result.value);
                                else setLinkErrors(prev => ({ ...prev, [i]: result.ok ? 'Enter a game link to publish this game.' : result.error }));
                              }}
                              aria-invalid={!!linkErrors[i]}
                              aria-describedby={`game-link-help-${i}${linkErrors[i] ? ` game-link-error-${i}` : ''}`}
                              className="w-full rounded-xl border border-ink/10 bg-white p-2.5 text-xs font-sans outline-none focus:border-accent dark:border-white/10 dark:bg-black/30"
                              disabled={uploading}
                            />
                            <p id={`game-link-help-${i}`} className="mt-1 text-[10px] opacity-55">
                              Required for Games. A bare domain will use https:// automatically.
                            </p>
                            {linkErrors[i] && (
                              <p id={`game-link-error-${i}`} role="alert" className="mt-1 text-xs text-red-500">
                                {linkErrors[i]}
                              </p>
                            )}
                          </div>
                        )}

                        <select
                          value={metadata[i]?.section || 'pencil-arts'}
                          onChange={e => updateMeta(i, 'section', e.target.value)}
                          className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-ink/10 dark:border-white/10 outline-none focus:border-accent text-xs font-sans w-full cursor-pointer"
                          disabled={uploading}
                        >
                          {ARTWORK_SECTIONS.map(section => (
                            <option key={section.id} value={section.id}>
                              {section.label}
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
                        aria-label={`Remove ${metadata[i]?.title || 'artwork'}`}
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
