import { v2 as cloudinary } from 'cloudinary';

// Parse Cloudinary URL correctly
const parseCloudinaryUrl = (url: string) => {
  try {
    const match = url.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (!match) throw new Error('Invalid Cloudinary URL format');
    return {
      api_key: match[1],
      api_secret: match[2],
      cloud_name: match[3]
    };
  } catch (error) {
    console.error('Failed to parse Cloudinary URL:', error);
    throw error;
  }
};

// Configure Cloudinary with parsed credentials
const credentials = parseCloudinaryUrl(process.env.CLOUDINARY_URL || '');

cloudinary.config({
  cloud_name: credentials.cloud_name,
  api_key: credentials.api_key,
  api_secret: credentials.api_secret,
  secure: true
});

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `hotels/${folder}`,
          resource_type: 'auto',
          // Add specific options based on folder type
          ...(folder === 'logos' && {
            transformation: [
              { width: 300, crop: 'fit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          }),
          ...(folder === 'hotel-images' && {
            transformation: [
              { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          }),
          ...(folder === 'rooms' && {
            transformation: [
              { width: 1000, height: 667, crop: 'fill', gravity: 'auto' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          })
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve({ success: false, error: error.message });
          } else {
            resolve({ 
              success: true, 
              url: result?.secure_url 
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Upload processing error:', error);
    return {
      success: false,
      error: 'Failed to process upload'
    };
  }
}

// Export configured cloudinary instance for direct use if needed
export { cloudinary };