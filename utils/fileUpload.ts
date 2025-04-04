import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface SaveFileResult {
  success: boolean;
  path?: string;
  error?: string;
}

export async function saveFile(
  file: File, 
  hotelId: string, 
  type: 'logo' | 'image'
): Promise<SaveFileResult> {
  try {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.'
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.'
      };
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'hotels', hotelId);
    await mkdir(uploadsDir, { recursive: true });

    const buffer = await file.arrayBuffer();
    const fileName = `${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await writeFile(filePath, Buffer.from(buffer));
    
    return {
      success: true,
      path: `/uploads/hotels/${hotelId}/${fileName}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to save file.'
    };
  }
}

export async function saveUserProfilePicture(
  file: File,
  userId: string
): Promise<SaveFileResult> {
  try {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.'
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.'
      };
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadsDir, { recursive: true });

    const buffer = await file.arrayBuffer();
    const fileName = `profile-${userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await writeFile(filePath, Buffer.from(buffer));
    
    return {
      success: true,
      path: `/uploads/profiles/${fileName}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to save file.'
    };
  }
}