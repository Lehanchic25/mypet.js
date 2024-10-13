// mypet.js: https://github.com/Lehanchic25/mypet.js (webring variant)

(function mypet() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const petEl = document.createElement("div");

  let petPosX = 32;
  let petPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  // please use data-pet="true" on your A elements that link to another site with mypet-webring.js instead of this
  // this is deprecated and will eventually be removed
  const petSites = [
    "localhost",
  ];
  
  try {
    const searchParams = location.search
      .replace("?", "")
      .split("&")
      .map((keyvaluepair) => keyvaluepair.split("="));
    // This is so much repeated code, I don't like it
    tmp = searchParams.find((a) => a[0] == "catx");
    if (tmp && tmp[1]) petPosX = parseInt(tmp[1]);
    tmp = searchParams.find((a) => a[0] == "caty");
    if (tmp && tmp[1]) petPosY = parseInt(tmp[1]);
    tmp = searchParams.find((a) => a[0] == "catdx");
    if (tmp && tmp[1]) mousePosX = parseInt(tmp[1]);
    tmp = searchParams.find((a) => a[0] == "catdy");
    if (tmp && tmp[1]) mousePosY = parseInt(tmp[1]);
  } catch (e) {
    console.error("mypet.js: failed to parse query params.");
    console.error(e);
  }

  function onClick(event) {
    let target;
    if (event.target.tagName === "A" && event.target.getAttribute("href")) {
      target = event.target;
    } else if (
      event.target.tagName == "IMG" &&
      event.target.parentElement.tagName === "A" &&
      event.target.parentElement.getAttribute("href")
    ) {
      target = event.target.parentElement;
    } else {
      return;
    }
    let newLocation;
    try {
      newLocation = new URL(target.href);
    } catch (e) {
      return;
    }
    if (
      (petSites.includes(newLocation.host) && newLocation.pathname == "/") ||
      target.dataset.pet
    ) {
      newLocation.searchParams.append("catx", Math.floor(petPosX));
      newLocation.searchParams.append("caty", Math.floor(petPosY));
      newLocation.searchParams.append("catdx", Math.floor(mousePosX));
      newLocation.searchParams.append("catdy", Math.floor(mousePosY));
      event.preventDefault();
      window.location.href = newLocation.toString();
    }
  }
  document.addEventListener("click", onClick);

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const petSpeed = 10;
  const spriteSets = {
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
    petEl.style.position = "fixed";
    petEl.style.pointerEvents = "none";
    petEl.style.imageRendering = "pixelated";
    petEl.style.left = `${petPosX - 16}px`;
    petEl.style.top = `${petPosY - 16}px`;
    petEl.style.zIndex = Number.MAX_VALUE;

    let petFile = "./mypet.gif"
    const curScript = document.currentScript
    if (curScript && curScript.dataset.cat) {
      petFile = curScript.dataset.cat
    }
    petEl.style.backgroundImage = `url(${petFile})`;

    document.body.appendChild(petEl);

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    // Stops execution if the pet element is removed from DOM
    if (!petEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp
      frame()
    }

    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    petEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
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
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = petPosX - mousePosX;
    const diffY = petPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

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
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    petPosX -= (diffX / distance) * petSpeed;
    petPosY -= (diffY / distance) * petSpeed;

    petPosX = Math.min(Math.max(16, petPosX), window.innerWidth - 16);
    petPosY = Math.min(Math.max(16, petPosY), window.innerHeight - 16);

    petEl.style.left = `${petPosX - 16}px`;
    petEl.style.top = `${petPosY - 16}px`;
  }

  init();
})();
