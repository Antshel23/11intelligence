import sharp from 'sharp';
import { existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, basename } from 'path';

const inputDir = 'public/league_logos';

async function optimizeImages() {
  try {
    // Check if directory exists
    if (!existsSync(inputDir)) {
      console.error(`Directory not found: ${inputDir}`);
      return;
    }

    // Get all image files
    const files = readdirSync(inputDir).filter(file => 
      /\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|WEBP)$/i.test(file)
    );

    if (files.length === 0) {
      console.log('No images found to optimize.');
      return;
    }

    console.log(`Found ${files.length} images to optimize...`);

    for (const file of files) {
      const inputPath = join(inputDir, file);
      const outputPath = join(inputDir, file.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp'));
      
      try {
        // Get original file size
        const originalStats = statSync(inputPath);
        const originalSize = originalStats.size;

        // Process image
        const info = await sharp(inputPath)
          .resize(200, 200, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ 
            quality: 80,
            effort: 6
          })
          .toFile(outputPath);
          
        const newSize = info.size;
        const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ ${file} -> ${basename(outputPath)}`);
        console.log(`   ${Math.round(originalSize / 1024)}KB -> ${Math.round(newSize / 1024)}KB (${savings}% smaller)`);
        
        // Delete original file after successful conversion
        unlinkSync(inputPath);
        console.log(`🗑️  Deleted: ${file}\n`);
        
      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error.message);
      }
    }
    
    console.log('🎉 All images optimized and converted to WebP!');
  } catch (error) {
    console.error('Error:', error);
  }
}

optimizeImages();