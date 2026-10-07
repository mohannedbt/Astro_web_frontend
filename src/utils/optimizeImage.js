export const optimizeImageFile = (file, { maxFileSize = 5 * 1024 * 1024, maxDimension = 512, quality = 0.82 } = {}) => (
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose a valid image file.'));
      return;
    }
    if (file.size > maxFileSize) {
      reject(new Error(`Choose an image smaller than ${Math.round(maxFileSize / (1024 * 1024))} MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read. Please try again.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This image could not be opened. Try another image file.'));
      image.onload = () => {
        try {
          const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Your browser could not process this image.');

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const optimizedImage = canvas.toDataURL('image/webp', quality);
          if (!optimizedImage.startsWith('data:image/webp')) {
            throw new Error('Your browser could not convert this image to WebP.');
          }
          resolve(optimizedImage);
        } catch (error) {
          reject(error);
        }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  })
);
