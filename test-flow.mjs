import fs from 'fs';

async function testFullFlow() {
  try {
    const fileBuffer = fs.readFileSync('src/assets/hero-bg.jpg');
    const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

    console.log("1. Starting upscale...");
    const startRes = await fetch('https://our-digital-dwelling-3-1.vercel.app/api/upscale-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageType: 'exterior',
        prompt: 'highly detailed',
        imageBase64: base64Data
      })
    });
    
    if (!startRes.ok) {
      const text = await startRes.text();
      throw new Error(`Failed to start: ${startRes.status} - ${text}`);
    }
    
    const startData = await startRes.json();
    console.log("Start Data:", startData);
    
    if (!startData.predictionId) {
      throw new Error("No prediction ID returned");
    }
    
    const pid = startData.predictionId;
    let isProcessing = true;
    
    console.log(`2. Polling for ${pid}...`);
    while (isProcessing) {
      await new Promise(r => setTimeout(r, 2000));
      const pollUrl = `https://our-digital-dwelling-3-1.vercel.app/api/poll-upscale?id=${pid}&t=${Date.now()}`;
      const pollRes = await fetch(pollUrl);
      
      if (!pollRes.ok) {
        const text = await pollRes.text();
        throw new Error(`Poll failed: ${pollRes.status} - ${text}`);
      }
      
      const pollData = await pollRes.json();
      console.log("Poll result:", pollData);
      
      if (pollData.status === 'succeeded') {
        console.log("Final URL:", pollData.url);
        isProcessing = false;
      } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
        throw new Error("Prediction failed");
      }
    }
  } catch (e) {
    console.error(e);
  }
}

testFullFlow();
