
export function makeVideoCall(peer, userId, video) {
	const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	getUserMedia({ video: true, audio: true }, function(stream) {
		const call = peer.call(userId, stream);
		call.on('call', function(remoteStream) {
			// show stream in video
			video.srcObject = remoteStream;
		});
	}, function(err) {
		console.log('Failed to get local stream', err.message);
	})
}

export function answerVideoCall(peer,video) {
	const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	peer.on('call', call => {
		getUserMedia({ video: true, audio: true }, stream => {
			call.answer(stream);
			call.on('stream', remoteStream => {
				// show stream in video
				video.srcObject = remoteStream;
			})
		}, (err) => {
			console.log('Failed to get local stream', err.message);
		})
	})
}
