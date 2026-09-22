export const compressImage = async (file: File, maxEdge: number): Promise<Blob | File> => {
  // If file is not an image or SVG/GIF (preserve vector and animations), return as is
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxEdge || height > maxEdge) {
            if (width > height) {
              height = Math.round((height * maxEdge) / width);
              width = maxEdge;
            } else {
              width = Math.round((width * maxEdge) / height);
              height = maxEdge;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Try WebP first, fallback to JPEG, fallback to original file
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob);
              } else {
                canvas.toBlob(
                  (jpegBlob) => {
                    if (jpegBlob && jpegBlob.size > 0) resolve(jpegBlob);
                    else resolve(file);
                  },
                  'image/jpeg',
                  0.88
                );
              }
            },
            'image/webp',
            0.85
          );
        } catch (e) {
          console.warn('Canvas compression error, falling back to original file:', e);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
};
