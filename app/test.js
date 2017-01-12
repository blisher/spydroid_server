var host = window.location.hostname
window.socket = new WebSocket('ws://' + host + ':8001')

window.socket.onopen = () => {
  window.socket.send('opened');
};

window.socket.onmessage = (e) => {
  console.info(e.data);
};

window.socket.onerror = (e) => {
  console.error(e.message);
};

window.socket.onclose = (e) => {
  console.log(e.code, e.reason);
};
