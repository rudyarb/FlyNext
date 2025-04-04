import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split('@')[1],
  api_key: process.env.CLOUDINARY_URL?.split('//')[1].split(':')[0],
  api_secret: process.env.CLOUDINARY_URL?.split(':')[1].split('@')[0],
});

// Base optimization options
const baseOptions = {
  resource_type: 'auto',
  fetch_format: 'auto',
  quality: 'auto',
  flags: 'progressive',
};

// Specific optimization configurations
const transformationOptions: Record<string, any> = {
  'logos': {
    ...baseOptions,
    format: 'png',
    quality: 90,
    width: 300,
    crop: 'fit'
  },
  'hotel-images': {
    ...baseOptions,
    width: 1200,
    height: 800,
    crop: 'fill',
    gravity: 'auto'
  },
  'rooms': {
    ...baseOptions,
    width: 1000,
    height: 667,
    crop: 'fill',
    gravity: 'auto'
  }
};

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine which optimization to use based on folder path
    const folderType = folder.split('/')[0]; // Get 'logos', 'hotel-images', or 'rooms'
    const options = {
      ...transformationOptions[folderType] || baseOptions,
      folder: `hotels/${folder}`
    };

    // Upload to Cloudinary with optimizations
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return {
      success: true,
      url: (result as any).secure_url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image'
    };
  }
}