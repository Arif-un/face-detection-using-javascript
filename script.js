const cam = document.getElementById('cam')

const startCamera = () => {
  navigator.getUserMedia(
    { video: {} },
    stream => cam.srcObject = stream,
    error => console.log(error)
  )
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models')
]).then(res => {
  document.getElementById('loader').style.display = 'none'
  startCamera()
})


cam.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(cam)
  document.body.append(canvas)
  const displaySize = { width: cam.width, height: cam.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(cam, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    if (document.getElementById('bound').checked) {
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }
    if (document.getElementById('landmark').checked) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    }

    if (detections[0] !== undefined) {
      let exp = { exp: '', possibility: 0, emo: '' }

      for (const i in detections[0].expressions) {
        if (Number(detections[0].expressions[i]) > exp.possibility) {
          exp.possibility = detections[0].expressions[i].toFixed(2)
          exp.exp = i
          exp.emo = getEmo(i)
        }
      }

      document.querySelector('#face').innerHTML = 'Face Detected'
      document.querySelector('#face-p').innerHTML = (detections[0].detection._score.toFixed(2) * 100) + '%'
      document.querySelector('#exp').innerHTML = exp.exp
      document.querySelector('#exp-p').innerHTML = (exp.possibility * 100) + '%'
      document.querySelector('#exp-emo').innerHTML = exp.emo
      document.querySelector('#gen').innerHTML = detections[0].gender
      document.querySelector('#gen-p').innerHTML = (detections[0].genderProbability.toFixed(2) * 100) + '%'
      document.querySelector('#age').innerHTML = detections[0].age.toFixed(0)
      console.log(detections[0])
    }
  }, 100)
})


const getEmo = i => {
  if (i === 'neutral') {
    return '😐'
  } else if (i === 'happy') {
    return '😀'
  }
  else if (i === 'sad') {
    return '😥'
  }
  else if (i === 'angry') {
    return '😡'
  }
  else if (i === 'fearful') {
    return '😧'
  }
  else if (i === 'disgusted') {
    return '😫'
  } else if (i === 'surprised') {
    return '😲'
  }
}
