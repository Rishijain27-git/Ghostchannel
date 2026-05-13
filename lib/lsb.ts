/**
 * GhostChannel LSB Steganography Module
 * Embeds/extracts data in the least significant bits of RGB channels
 * Uses Canvas API for pixel manipulation
 */

const BITS_PER_BYTE = 8;
const LENGTH_HEADER_BITS = 32; // 4 bytes for length header
const CHANNELS_PER_PIXEL = 3;  // R, G, B (Alpha channel is skipped)

/**
 * Calculate maximum bytes that can be embedded in an image
 * Formula: floor((width * height * 3 channels - 32 bits) / 8)
 */
export function calculateCapacity(width: number, height: number): number {
  const totalPixels = width * height;
  const totalBits = totalPixels * CHANNELS_PER_PIXEL;
  const availableBits = totalBits - LENGTH_HEADER_BITS;
  return Math.floor(availableBits / BITS_PER_BYTE);
}

/**
 * Embed data into an ImageData object using LSB steganography
 * Format: [32-bit length header (big-endian)][data bytes...]
 * Each bit is stored in the LSB of R, G, or B channel
 */
export function embed(imageData: ImageData, data: Uint8Array): ImageData {
  const pixels = imageData.data;
  const totalBitsNeeded = LENGTH_HEADER_BITS + (data.length * BITS_PER_BYTE);
  const totalAvailableBits = imageData.width * imageData.height * CHANNELS_PER_PIXEL;

  if (totalBitsNeeded > totalAvailableBits) {
    throw new Error(
      `Data too large: needs ${totalBitsNeeded} bits, but image only has ${totalAvailableBits} bits available`
    );
  }

  // Create length header (4 bytes, big-endian)
  const lengthHeader = new Uint8Array(4);
  const view = new DataView(lengthHeader.buffer);
  view.setUint32(0, data.length, false); // big-endian

  // Combine header + data into single byte array
  const combined = new Uint8Array(4 + data.length);
  combined.set(lengthHeader, 0);
  combined.set(data, 4);

  // Embed each bit into LSB of R, G, B channels
  let bitIndex = 0;
  for (let i = 0; i < pixels.length && bitIndex < totalBitsNeeded; i += 4) {
    // R channel (index i)
    const bitR = (combined[Math.floor(bitIndex / 8)] >> (7 - (bitIndex % 8))) & 1;
    pixels[i] = (pixels[i] & 0xFE) | bitR;
    bitIndex++;

    // G channel (index i + 1)
    if (bitIndex < totalBitsNeeded) {
      const bitG = (combined[Math.floor(bitIndex / 8)] >> (7 - (bitIndex % 8))) & 1;
      pixels[i + 1] = (pixels[i + 1] & 0xFE) | bitG;
      bitIndex++;
    }

    // B channel (index i + 2)
    if (bitIndex < totalBitsNeeded) {
      const bitB = (combined[Math.floor(bitIndex / 8)] >> (7 - (bitIndex % 8))) & 1;
      pixels[i + 2] = (pixels[i + 2] & 0xFE) | bitB;
      bitIndex++;
    }
  }

  return imageData;
}

/**
 * Extract data from an ImageData object using LSB steganography
 * Reads 32-bit length header first, then extracts that many bytes
 */
export function extract(imageData: ImageData): Uint8Array {
  const pixels = imageData.data;

  // Collect all LSB bits from RGB channels
  const allBits: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    allBits.push(pixels[i] & 1);       // R channel LSB
    allBits.push(pixels[i + 1] & 1);   // G channel LSB
    allBits.push(pixels[i + 2] & 1);   // B channel LSB
  }

  // Read length header (first 32 bits, big-endian)
  let dataLength = 0;
  for (let i = 0; i < 32; i++) {
    dataLength = (dataLength << 1) | allBits[i];
  }

  // Validate length
  const totalBitsNeeded = LENGTH_HEADER_BITS + (dataLength * BITS_PER_BYTE);
  if (dataLength === 0) {
    throw new Error('No hidden data found in image');
  }
  if (totalBitsNeeded > allBits.length) {
    throw new Error('Invalid data: length exceeds image capacity');
  }

  // Read data bytes
  const result = new Uint8Array(dataLength);
  for (let byteIndex = 0; byteIndex < dataLength; byteIndex++) {
    let byte = 0;
    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      const bit = allBits[32 + byteIndex * 8 + bitIndex];
      byte = (byte << 1) | bit;
    }
    result[byteIndex] = byte;
  }

  return result;
}

/**
 * Helper: Load an image file and return ImageData
 */
export function loadImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Helper: Convert ImageData to a downloadable PNG Blob
 */
export function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png');
  });
}
