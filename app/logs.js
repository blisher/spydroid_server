window.socket = io(window.location.origin + '/io_logs');

window.socket.on('serverMessage', (data) => {
  console.log(data)
})

window.socket.on('log', (data) => {
  addLogMessage(data.message)
});

window.socket.on('listenersCount', (data) => {
  document.getElementById('listeners-count').innerHTML = data.count
})

var addLogMessage = (message) => {
  var msg = document.createElement('p')
  msg.innerHTML = message
  output.appendChild(msg)
}

var init = () => {
  output = document.getElementById('log-feed')
}

window.addEventListener('load', init, false)
