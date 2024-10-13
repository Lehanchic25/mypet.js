function pet() {
  var petEl = document.createElement("div");

  var petPosX = 32;
  var petPosY = 32;

  var mousePosX = 0;
  var mousePosY = 0;

  var frameCount = 0;
  var idleTime = 0;
  var idleAnimation = null;
  var idleAnimationFrame = 0;
  var direction;

  var IE = document.all ? true : false;

  var petSpeed = 10;
  var spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };
  function init() {
    petEl.id = "mypet";
    petEl.ariaHidden = true;
    petEl.style.width = "32px";
    petEl.style.height = "32px";
    petEl.style.position = "absolute";
    petEl.style.pointerEvents = "none";
    petEl.style.backgroundImage = "url('mypet.gif')";
    petEl.style.imageRendering = "pixelated";
    petEl.style.left = petPosX - 16 + "px";
    petEl.style.top = petPosY - 16 + "px";
    petEl.style.zIndex = Number.MAX_VALUE;

    document.body.appendChild(petEl);
    function mousePos(event) {
      if (IE) {
        event = window.event;
      }
      mousePosX = event.clientX;
      mousePosY = event.clientY - 16;
    }
    document.onmousemove = mousePos;
    window.mypetInterval = setInterval(frame, 100);
  }

  function setSprite(name, frame) {
    var length = spriteSets[name].length;
    if (IE) {
      length = 0;
      // Internet explorer is really fucking dumb
      while (length < spriteSets[name].length) {
        if (spriteSets[name][length] != null) {
          length = length + 1;
          continue;
        }
        break;
      }
    }
    var sprite = spriteSets[name][frame % length];
    petEl.style.backgroundPosition =
      sprite["0"] * 32 + "px " + sprite["1"] * 32 + "px";
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime = idleTime + 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      var avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (petPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (petPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (petPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (petPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame = idleAnimationFrame + 1;
  }

  function frame() {
    frameCount = frameCount + 1;
    var diffX = petPosX - mousePosX;
    var diffY = petPosY - mousePosY;
    var distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));

    if (distance < petSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime = idleTime - 1;
      return;
    }

    direction = "";
    if (diffY / distance > 0.5) {
      direction = "N";
    } else if (diffY / distance < -0.5) {
      direction = "S";
    }
    if (diffX / distance > 0.5) {
      direction = direction + "W";
    } else if (diffX / distance < -0.5) {
      direction = direction + "E";
    }
    setSprite(direction, frameCount);

    if (distance > petSpeed) {
      petPosX = petPosX - (diffX / distance) * petSpeed;
      petPosY = petPosY - (diffY / distance) * petSpeed;
    } else {
      petPosX = mousePosX;
      petPosY = mousePosY;
    }

    petPosX = Math.min(
      Math.max(16, petPosX),
      document.getElementsByTagName("body")[0].clientWidth - 16
    );
    petPosY = Math.min(
      Math.max(16, petPosY),
      document.getElementsByTagName("body")[0].clientHeight - 16
    );

    petEl.style.left = petPosX - 16 + "px";
    petEl.style.top = petPosY - 16 + "px";
  }
  init();
}
pet();
