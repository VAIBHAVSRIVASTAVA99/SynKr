// import { GoogleGenerativeAI } from "@google/generative-ai";
// import mime from "mime-types";
// import dotenv from "dotenv";
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
// const transcribeAudio = async (audioBuffer, mimeType, lang) => {
//   console.log("Transcribing audio...");
  
//   const audio = {
//     inlineData: {
//       data: Buffer.from(audioBuffer).toString("base64"),
//       mimeType: mimeType || "audio/wav",
//     },
//   };

//   const prompt = `Transcribe the audio and provide the transcription in ${lang} without any timestamps or new line characters.`;

//   const result = await model.generateContent([audio, prompt]);
//   return result.response.text();
// };

// export const handleAudio = async (req, res) => {
//   console.log("Received POST request for audio processing");

//   try {
//     const { audio, mimeType, lang } = req.body;

//     if (!audio) {
//       return res.status(400).json({ message: "No audio data received" });
//     }
//     if (!lang) {
//       return res.status(400).json({ message: "No language data received" });
//     }

//     const audioBuffer = Buffer.from(audio, "base64");
//     const mimeTypeFromHeader = mimeType || "audio/wav";

//     const transcription = await transcribeAudio(audioBuffer, mimeTypeFromHeader, lang);
    
//     console.log("Transcription:", transcription);
//     res.status(200).json({ message: "Transcription completed", transcription });

//   } catch (error) {
//     console.error("Error processing audio:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };

// export const transcribe = async (req, res) => {
//   console.log("Translating text...");

//   try {
//     const { text, preffered_lang, text_lang } = req.body;
    
//     if (!text || !preffered_lang || !text_lang) {
//       return res.status(400).json({ message: "Missing translation parameters" });
//     }

//     const prompt = `Translate the text '${text}' from ${text_lang} to ${preffered_lang}, and provide only the translated text as the output.`;
//     const result = await model.generateContent([prompt]);

//     console.log("Translated text:", result.response.text());
//     res.json({ message: result.response.text() });

//   } catch (error) {
//     console.error("Error during translation:", error);
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };
