const { config, createAudioFromText } = require("tiktok-tts");
const { spawn } = require("child_process");
const fs = require("fs");
require("dotenv").config();

const TIKTOK_SESSION_ID = process.env.TIKTOK_SESSION_ID;
config(TIKTOK_SESSION_ID);



const generateAudioFromText = async (inputText) => {
  const words = inputText.split(/\s+/);
  const chunks = [];
  const maxWordsPerChunk = 30;

  
  for (let i = 0; i < words.length; i += maxWordsPerChunk) {
    chunks.push(words.slice(i, i + maxWordsPerChunk).join(" "));
  }




  const audioFiles = [];
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    const filename = `audio_${index}`;
    audioFiles.push(filename+".mp3");
    await createAudioFromText(chunk, filename);
  }
  return audioFiles;
};

function mergeAudioFiles(outputFilename, audioFiles) {
    console.log(audioFiles);
    const ffmpegProcess = spawn("ffmpeg", [
      "-y",
      "-i",
      "concat:" + audioFiles.join("|"),
      "-c",
      "copy",
      outputFilename,
    ]);
  
    ffmpegProcess.stderr.on("data", (data) => {
      console.error(`ffmpeg stderr: ${data}`);
    });
  
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        audioFiles.forEach(async (audioFileName) => {
          const filePath = audioFileName;
          // Check if the file exists
          if (fs.existsSync(filePath)) {
            await fs.unlinkSync(filePath);
          }
        });
        console.log(`Merged audio saved: ${outputFilename}`);
      } else {
        console.error("ffmpeg process exited with code", code);
      }
    });
  }

const init = async () => {
  // await createAudioFromText("Mingalar bar","output"); 
  const inputStr = await fs.readFileSync("data.txt");
  const data = inputStr.toString();
  const audioFileNames = await generateAudioFromText(data);
  await mergeAudioFiles("output.mp3", audioFileNames);
};

init();
