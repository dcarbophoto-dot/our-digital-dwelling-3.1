import Replicate from 'replicate';
import fs from 'fs';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  const model = await replicate.models.get("lucataco", "supir");
  const fileBuffer = fs.readFileSync('src/assets/hero-bg.jpg');
  const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
  
  console.log("Starting prediction...");
  const prediction = await replicate.predictions.create({
    version: model.latest_version.id,
    input: {
      image: base64Data,
      prompt: "highly detailed outdoor landscape",
      upscale: 2
    }
  });
  
  console.log("Prediction ID:", prediction.id);
  
  let currentPrediction = prediction;
  while (currentPrediction.status !== 'succeeded' && currentPrediction.status !== 'failed') {
    await new Promise(r => setTimeout(r, 2000));
    currentPrediction = await replicate.predictions.get(prediction.id);
    console.log("Status:", currentPrediction.status);
  }
  
  console.log("Output:", currentPrediction.output);
  console.log("Error:", currentPrediction.error);
}

main().catch(console.error);
