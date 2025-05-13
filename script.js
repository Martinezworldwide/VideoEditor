const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const uploader = document.getElementById('uploader');
const combineBtn = document.getElementById('combineBtn');
const previews = document.getElementById('previews');
const finalVideo = document.getElementById('finalVideo');
const status = document.getElementById('status');

let files = [];

uploader.addEventListener('change', async (event) => {
  files = Array.from(event.target.files);
  previews.innerHTML = '';

  files.forEach(file => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    previews.appendChild(video);
  });
});

combineBtn.addEventListener('click', async () => {
  if (files.length < 2) {
    alert('Please upload at least 2 videos to combine.');
    return;
  }

  status.innerText = 'Loading ffmpeg...';
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  status.innerText = 'Writing files...';
  const concatList = [];

  for (let i = 0; i < files.length; i++) {
    const fileName = `input${i}.mp4`;
    ffmpeg.FS('writeFile', fileName, await fetchFile(files[i]));
    concatList.push(`file '${fileName}'`);
  }

  ffmpeg.FS('writeFile', 'list.txt', concatList.join('\n'));

  status.innerText = 'Merging...';
  await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4');

  const data = ffmpeg.FS('readFile', 'output.mp4');
  const mergedBlob = new Blob([data.buffer], { type: 'video/mp4' });
  finalVideo.src = URL.createObjectURL(mergedBlob);

  const a = document.createElement('a');
  a.href = finalVideo.src;
  a.download = 'combined.mp4';
  a.textContent = 'Download Combined Video';
  document.body.appendChild(a);

  status.innerText = 'Done!';
});
