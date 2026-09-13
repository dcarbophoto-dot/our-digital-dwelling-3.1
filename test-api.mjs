import Replicate from 'replicate';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim().replace(/(^"|"$)/g, '');
  return acc;
}, {});

const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });

const extractUrl = (obj) => {
  if (typeof obj === 'string') return obj;
  if (obj && typeof obj.url === 'function') {
    const u = obj.url();
    return typeof u === 'string' ? u : u.toString();
  }
  if (obj && typeof obj.url === 'string') return obj.url;
  return String(obj);
};

async function run() {
  const fileBuffer = fs.readFileSync('src/assets/hero-bg.jpg');
  const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

  console.log("Testing interior (real-esrgan)...");
  const model = await replicate.models.get("nightmareai", "real-esrgan");
  const output1 = await replicate.run(
    `nightmareai/real-esrgan:${model.latest_version.id}`,
    {
      input: { image: base64Data, scale: 4, face_enhance: false }
    }
  );
  
  let finalUrl1 = '';
  if (Array.isArray(output1) && output1.length > 0) {
    finalUrl1 = extractUrl(output1[0]);
  } else {
    finalUrl1 = extractUrl(output1);
  }
  console.log("Interior URL:", finalUrl1);
  
  console.log("Testing exterior (batouresearch)...");
  const extModel = await replicate.models.get("batouresearch", "high-resolution-controlnet-tile");
  const output2 = await replicate.run(
    `batouresearch/high-resolution-controlnet-tile:${extModel.latest_version.id}`,
    {
      input: {
        image: base64Data,
        prompt: "highly detailed",
        resolution: 2048,
        creativity: 0.35
      }
    }
  );
  
  let finalUrl2 = '';
  if (Array.isArray(output2) && output2.length > 0) {
    finalUrl2 = extractUrl(output2[0]);
  } else {
    finalUrl2 = extractUrl(output2);
  }
  console.log("Exterior URL:", finalUrl2);
}

run();
