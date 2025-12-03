const canvas = document.querySelector("canvas");

let lastTime = 0;

function render() {
  // TODO: Implement
  console.log("Rendering screen");
}

function updateState(deltaTime) {
  // TODO: Implement
  console.log(deltaTime + " elapsed");
}

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  updateState(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
