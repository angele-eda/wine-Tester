const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const {chromium} = require(path.join(process.env.CF24_NODE_MODULES, "playwright"));

const root = path.resolve(__dirname, "..");
const types = {".html":"text/html",".js":"text/javascript",".css":"text/css",".wasm":"application/wasm",".png":"image/png",".svg":"image/svg+xml"};
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let target = path.resolve(root, "." + pathname);
  if (!target.startsWith(root + path.sep) && target !== root) return response.writeHead(403).end();
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  fs.readFile(target, (error, content) => error ? response.writeHead(404).end() : response.writeHead(200, {"Content-Type":types[path.extname(target)] || "application/octet-stream"}).end(content));
});
function wav() {
  const sampleRate = 22050, samples = sampleRate * 2, bytes = Buffer.alloc(44 + samples * 2);
  bytes.write("RIFF", 0); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write("data", 36);
  bytes.writeUInt32LE(samples * 2, 40);
  for (let n = 0; n < samples; n++) bytes.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 440 * n / sampleRate) * 12000), 44 + n * 2);
  return bytes;
}
function mp3Bitrate(bytes) {
  let offset = 0;
  if (bytes.subarray(0, 3).toString() === "ID3") offset = 10 + ((bytes[6] & 127) << 21) + ((bytes[7] & 127) << 14) + ((bytes[8] & 127) << 7) + (bytes[9] & 127);
  const bitrateTable = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];
  for (; offset < bytes.length - 4; offset++) {
    if (bytes[offset] === 0xff && (bytes[offset + 1] & 0xe0) === 0xe0 && (bytes[offset + 1] & 0x18) === 0x18 && (bytes[offset + 2] & 0xf0) !== 0xf0) return bitrateTable[(bytes[offset + 2] >> 4) & 15];
  }
  return 0;
}
async function main() {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"});
  try {
    const page = await browser.newPage({acceptDownloads:true});
    page.on("pageerror", error => console.error("PAGE ERROR", error));
    await page.goto(base + "/audio-tools/?lang=en");
    const inputWav = wav();
    const fixture = await page.evaluate(async bytes => {
      const script = document.createElement("script"); script.src = "/assets/ffmpeg/0.12.15/ffmpeg.js";
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.head.append(script); });
      const engine = new FFmpegWASM.FFmpeg();
      await engine.load({coreURL:"/assets/ffmpeg/0.12.15/ffmpeg-core.js",wasmURL:"/assets/ffmpeg/0.12.15/ffmpeg-core.wasm"});
      await engine.writeFile("tone.wav", new Uint8Array(bytes));
      const m4aExit = await engine.exec(["-y","-i","tone.wav","-c:a","aac","-b:a","128k","tone.m4a"]);
      const mp4Exit = await engine.exec(["-y","-f","lavfi","-i","color=c=black:s=160x120:r=10:d=2","-i","tone.wav","-shortest","-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac","tone.mp4"]);
      const silentExit = await engine.exec(["-y","-f","lavfi","-i","color=c=black:s=160x120:r=10:d=1","-c:v","libx264","-pix_fmt","yuv420p","silent.mp4"]);
      const m4a = m4aExit === 0 ? Array.from(await engine.readFile("tone.m4a")) : null;
      const mp4 = mp4Exit === 0 ? Array.from(await engine.readFile("tone.mp4")) : null;
      const silent = silentExit === 0 ? Array.from(await engine.readFile("silent.mp4")) : null;
      engine.terminate();
      return {m4aExit,mp4Exit,silentExit,m4a,mp4,silent};
    }, Array.from(inputWav));
    assert.equal(fixture.m4aExit, 0, "M4A sample generation");
    assert.equal(fixture.mp4Exit, 0, "MP4 video sample generation");
    assert.equal(fixture.silentExit, 0, "Silent MP4 sample generation");
    const samples = [
      {mode:"wav",name:"tone.wav",type:"audio/wav",bytes:inputWav,quality:"128"},
      {mode:"m4a",name:"tone.m4a",type:"audio/mp4",bytes:Buffer.from(fixture.m4a),quality:"192"},
      {mode:"mp4",name:"tone.mp4",type:"video/mp4",bytes:Buffer.from(fixture.mp4),quality:"256"}
    ];
    for (const sample of samples) {
      await page.locator(`[data-mode="${sample.mode}"]`).click();
      await page.locator("#fileInput").setInputFiles({name:sample.name,mimeType:sample.type,buffer:sample.bytes});
      await page.locator("#qualitySelect").selectOption(sample.quality);
      await page.locator("#processButton").click();
      await page.locator("#downloadButton").waitFor({state:"visible",timeout:180000});
      const [download] = await Promise.all([page.waitForEvent("download"),page.locator("#downloadButton").click()]);
      const downloadPath = await download.path();
      const downloaded = fs.readFileSync(downloadPath);
      assert(downloaded.length > 1000, `${sample.mode} MP3 must have audio data`);
      assert(downloaded.subarray(0, 3).toString() === "ID3" || downloaded[0] === 0xff, `${sample.mode} must be an MP3`);
      assert.equal(mp3Bitrate(downloaded), Number(sample.quality), `${sample.mode} MP3 bitrate`);
      assert(await page.locator("#processButton").isDisabled(), "Completed action should be disabled");
      console.log(`${sample.name} -> ${download.suggestedFilename()} ${downloaded.length} bytes, ${sample.quality} kbps: PASS`);
    }
    await page.locator('[data-mode="wav"]').click();
    await page.locator("#fileInput").setInputFiles({name:"wrong.txt",mimeType:"text/plain",buffer:Buffer.from("not audio")});
    assert(await page.locator("#status").textContent().then(text => text.includes("WAV")), "Invalid file feedback");
    await page.locator('[data-mode="mp4"]').click();
    await page.locator("#fileInput").setInputFiles({name:"silent.mp4",mimeType:"video/mp4",buffer:Buffer.from(fixture.silent)});
    await page.locator("#processButton").click();
    await page.locator("#status").filter({hasText:"No readable audio track"}).waitFor({timeout:180000});
    assert(await page.locator("#downloadButton").isHidden(), "Silent MP4 has no download");
    assert(await page.locator("#progressWrap").isHidden(), "Failed conversion hides progress");
    await page.setViewportSize({width:390,height:844});
    assert(await page.locator("#languageSelect").isVisible(), "Mobile language control");
    assert(await page.locator("#themeButton").isVisible(), "Mobile theme control");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "Mobile layout should not overflow horizontally");
    await page.screenshot({path:path.join(__dirname, "generated", "audio-tools-mobile.png"),fullPage:true});
    console.log("Invalid file, silent MP4 error, and mobile controls: PASS");
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
