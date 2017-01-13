// var host = window.location.hostname;
// window.socket = new WebSocket('ws://' + host + ':8001');
//
// window.socket.onopen = () => {
//   window.socket.send('Connected!');
// };
//
// window.socket.onmessage = (e) => {
//   writeToScreen(e.data)
// };
//
// window.socket.onerror = (e) => {
//   return '-- Disconnected with error';
// };
//
// window.socket.onclose = (e) => {
//   return '-- Disconnected (closed)';
// };
//
// function writeToScreen(message)
// {
//   var pre = document.createElement("p");
//   pre.innerHTML = message;
//   output.appendChild(pre);
// }
//
// window.addEventListener("load", () => { output = document.getElementById("output") }, false);
