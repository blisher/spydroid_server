window.socket = io('http://localhost:5000');

window.socket.on('chatMessage', function (data) {
  printUserMessage(data.color, data.userName, data.message)
});

window.socket.on('chatJoined', function (data) {
  printSystemMessage('User ' + data.userName + ' joined.')
});

// var userName = prompt('Whats your name?')
var userName = new Date().getMilliseconds()

window.socket.emit('chatJoined', { userName: userName })

var printUserMessage = (color, nick, message) => {
  var msg = document.createElement('div')
  var nickContainer = document.createElement('span')
  nickContainer.style['color'] = color
  nickContainer.style['font-weight'] = 'bold'
  nickContainer.innerHTML = nick + ': '
  msg.classList.add('message')
  msg.classList.add('user-message')
  msg.appendChild(nickContainer)
  var content = document.createElement('span')
  content.innerHTML = message
  msg.appendChild(content)
  output.appendChild(msg)
}

var printSystemMessage = (message) => {
  var msg = document.createElement('div')
  msg.classList.add('message')
  msg.classList.add('system-message')
  msg.innerHTML = message
  output.appendChild(msg)
}

var init = () => {
  output = document.getElementById('output')
  form = document.getElementById('form')

  form.onsubmit = function (event) {
  	var msg = document.getElementById('msg')
  	if (msg.value) { window.socket.emit('chatMessage', { color: color, userName: userName, message: msg.value }) }
  	msg.value = ''
  	event.preventDefault()
  }
}

window.addEventListener('load', init, false)

var generateColor = () => {
  var r = getRandomInt(45, 180)
  var g = getRandomInt(45, 180)
  var b = getRandomInt(45, 180)

  return composeColorValue(r, g, b)
}

var composeColorValue = (r, g, b) => {
  return '#' + r.toString(16) + g.toString(16) + b.toString(16)
}

var getRandomInt = (min, max) => {
  return parseInt(Math.random() * (max - min) + min)
}

const color = generateColor();
