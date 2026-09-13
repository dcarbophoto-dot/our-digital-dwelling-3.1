import Replicate from 'replicate';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim().replace(/(^"|"$)/g, '');
  return acc;
}, {});

const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN
});

async function run() {
  try {
    const fileBuffer = fs.readFileSync('src/assets/hero-bg.jpg');
    const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
    
    console.log("Testing real-esrgan...");
    const out1 = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        input: {
          image: base64Data,
          scale: 2,
          face_enhance: false
        }
      }
    );
    console.log("Real-ESRGAN output isArray?", Array.isArray(out1));
    console.log("Real-ESRGAN output type:", typeof out1);
    console.log("Real-ESRGAN output constructor:", out1.constructor.name);
    console.log("Real-ESRGAN output:", out1);

    console.log("Testing batouresearch...");
    const model = await replicate.models.get("batouresearch", "high-resolution-controlnet-tile");
    const out2 = await replicate.run(
      `batouresearch/high-resolution-controlnet-tile:${model.latest_version.id}`,
      {
        input: {
          image: base64Data,
          prompt: "highly detailed, 4k",
          resolution: 2048,
          creativity: 0.35
        }
      }
    );
    console.log("batouresearch output isArray?", Array.isArray(out2));
    console.log("batouresearch output type:", typeof out2);
    console.log("batouresearch output constructor:", out2.constructor.name);
    console.log("batouresearch output:", out2);
    
  } catch (e) {
    console.error(e);
  }
}
run();
