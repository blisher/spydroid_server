var host = window.location.hostname;
window.socket = new WebSocket('ws://' + host + ':8001');

window.socket.onopen = () => {
  console.info('Connected!');
  window.socket.send('opened');
};

window.socket.onmessage = (e) => {
  console.info(e.data);
};

window.socket.onerror = (e) => {
  console.error(e.message);
};

window.socket.onclose = (e) => {
  console.log('Connection closed.', e.code, e.reason);
};

//
// window.socket.on('open', function open() {
//   window.socket.send('something');
// });
//
// window.socket.on('message', function(data, flags) {
//   console.log('kurwa');
// });
