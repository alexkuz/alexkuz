const hourHand = document.querySelector("#hour-hand");
const minuteHand = document.querySelector("#minute-hand");
const secondHand = document.querySelector("#second-hand");

const timeDelta = 0.5;

function render() {
	const now = new Date(Date.now() + window.timeShift * 1000);
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();
	const milliseconds = now.getMilliseconds();

	const hourDeg = Math.round(30 * hours + 0.5 * minutes);
	const minuteDeg = Math.round(6 * minutes + 0.1 * seconds);
	const secondDeg = 6 * seconds + 0.006 * milliseconds;

	hourHand.style.transform = `rotate(${hourDeg}deg)`;
	minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
	secondHand.style.transform = `rotate(${secondDeg}deg)`;

  if (window.timeTravel) {
    window.timeShift += timeDelta;
  } else if (window.timeShift > 0) {
    window.timeShift = Math.max(0, window.timeShift - timeDelta);
  }

	window.requestAnimationFrame(render);
}

render();

const clockButton = document.querySelector("#clock-button");

document.querySelector("#clock-hands").style.visibility = "visible";

clockButton.addEventListener("pointerdown", () => {
	window.timeTravel = true;
	clockButton.setAttribute("aria-selected", true);
});

clockButton.addEventListener("pointerup", () => {
	window.timeTravel = false;
	clockButton.setAttribute("aria-selected", false);
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyT") {
    window.timeTravel = true;
  }
});

window.addEventListener("keyup", () => {
  window.timeTravel = false;
});
