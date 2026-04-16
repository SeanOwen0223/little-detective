const apiKey = "AIzaSyBkxoSWbIMwdrqWW1248KXm_ewQPUzALJM";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

async function test() {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Read this like an old janitor: I was cleaning the hallway early this morning." }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede" 
            }
          }
        }
      }
    })
  });
  console.log(response.status);
  const data = await response.json();
  if (data.error) console.error(data.error);
  else console.log(data.candidates[0]?.content?.parts?.[0]?.inlineData?.mimeType);
}
test();
