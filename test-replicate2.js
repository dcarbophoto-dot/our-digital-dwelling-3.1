import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function run() {
  try {
    const r1 = await replicate.models.get("recraft-ai", "recraft-crisp-upscale");
    console.log("recraft-crisp-upscale exists:", r1.url);
  } catch (e) {
    console.log("No recraft-crisp-upscale");
  }
  
  try {
    const r2 = await replicate.models.get("batouresearch", "magic-image-refiner");
    console.log("magic-image-refiner exists:", r2.url);
  } catch (e) {
    console.log("No magic-image-refiner");
  }
  
  try {
     const r3 = await replicate.models.get("batouresearch", "high-resolution-controlnet-tile");
     console.log("high-resolution-controlnet-tile exists:", r3.url);
  } catch (e) {
     console.log("No high-res controlnet tile");
  }
}

run();
