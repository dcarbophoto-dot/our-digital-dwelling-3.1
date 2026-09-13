import fs from 'fs';
import Replicate from 'replicate';

// Simple .env parser to avoid requiring external node versions
const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim().replace(/(^"|"$)/g, '');
  return acc;
}, {});

const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN
});

const run = async () => {
    try {
        const renderType = process.argv[2] || 'interior'; // Default to interior
        const fileBuffer = fs.readFileSync('src/assets/hero-bg.jpg');
        const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

        let output;

        if (renderType === 'exterior') {
            console.log(`Upscaling ${renderType} image to 4K using SUPIR for photorealistic foliage...`);
            output = await replicate.run(
              "lucataco/supir:2b07e4e89e3a6bf45e419811fa1d8e1363650da52eb6bc3cecc3bc3b39d73d6e", // known supir hash
              {
                input: {
                  image: base64Data,
                  prompt: "highly detailed outdoor landscape, crisp foliage, sharp grass and leaves, high-resolution, photorealistic, 4k",
                  upscale: 2
                }
              }
            );
        } else {
            console.log(`Upscaling ${renderType} image to 4K using Real-ESRGAN...`);
            output = await replicate.run(
              "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
              {
                input: {
                  image: base64Data,
                  scale: 4,
                  face_enhance: false
                }
              }
            );
        }

        let url = Array.isArray(output) ? output[0] : (typeof output === 'string' ? output : (output.url ? output.url() : String(output)));
        console.log("Success! Fetching:", url);
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync('src/assets/hero-bg.jpg', Buffer.from(buffer));
        console.log("Saved True 4K Hero!");
    } catch (e) {
        console.error("Upscale failed:", e.message);
    }
}
run();
