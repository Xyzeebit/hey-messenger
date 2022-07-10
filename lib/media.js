let recorder = null;
let videoElement = documentElement.getElementById('main-video');

export function getUserMedia(mediaElement) {
	navigator.mediaDevices.getUserMedia({ video: true, audio: true })
		.then((stream) => {
			setupVideo(mediaElement, stream);
		})
}

export function setupVideo(video, stream) {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	});
}

export function startRecording(stream, lengthMS) {
	recorder = new MediaRecorder(stream);
	let data = [];
	
	recorder.ondataavailable = event => data.push(event.data);
	recorder.start();
	return data;
}

export function stopRecording(){
	if(recorder && recorder.state == 'recording') {
		recorder.stop();
	}
}

export function startStreaming() {
	navigator.mediaDevices.getUserMedia({ video: true, audio: true})
		.then(stream => {
			videoElement.srcObject = stream;
			videoElement.captureStream = videoElement.captureStream || videoElement.mozCaptureStream;
			return new Promise(resolve => {
				videoElement.onplaying = resolve;
			}).then(() => {
				startRecording(videoElement.captureStream()).then((recordedChunks) => {
					let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
					recording.src = URL.createObjectURL(recordedBlob);
				}).catch((error) => {})
			})
		})
}

export function stopStreaming(stream) {
	stream.getTracks().forEach(track => track.stop());
}

function recordScreen() {
	navigator.mediaDevices.getDisplayMedia({
		video: { cursor: 'always' },
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
			sampleRate: 44100
		}
	}).then((strean) => {
		
	})
}