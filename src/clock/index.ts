declare class NoSleep {
	enable(): void;
	disable(): void;
}

function formatTime(time: number) {
	time /= 1000;
	const h = Math.floor(time / 3600);
	const m = Math.ceil((time % 3600) / 60);
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

//#region Action
const actions = document.querySelector<HTMLDivElement>('.actions')!;

document.querySelector('.action-toggle')?.addEventListener('click', () => {
	actions.classList.toggle('actions-show');
});

//#region Clock
let timerFrom = 0;
let timerTo = 0;
const digitHa = document.querySelector<HTMLDivElement>('#time-hour-a')!;
const digitHb = document.querySelector<HTMLDivElement>('#time-hour-b')!;
const digitMa = document.querySelector<HTMLDivElement>('#time-min-a')!;
const digitMb = document.querySelector<HTMLDivElement>('#time-min-b')!;
const digitSa = document.querySelector<HTMLDivElement>('#time-sec-a')!;
const digitSb = document.querySelector<HTMLDivElement>('#time-sec-b')!;
const digitTarget = document.querySelector<HTMLDivElement>('.timer-target')!;
const digitDuration =
	document.querySelector<HTMLDivElement>('.timer-duration')!;
const progress = document.querySelector<HTMLDivElement>('.line')!;
function clock() {
	const now = new Date();
	const h = now.getHours();
	const m = now.getMinutes();
	const s = now.getSeconds();
	digitHa.setAttribute('num', Math.floor(h / 10).toFixed(0));
	digitHb.setAttribute('num', (h % 10).toFixed(0));
	digitMa.setAttribute('num', Math.floor(m / 10).toFixed(0));
	digitMb.setAttribute('num', (m % 10).toFixed(0));
	digitSa.setAttribute('num', Math.floor(s / 10).toFixed(0));
	digitSb.setAttribute('num', (s % 10).toFixed(0));
	if (timerTo < now.getTime()) clearTimer();
	if (timerTo) {
		digitDuration.textContent = formatTime(timerTo - now.getTime());
		progress.style.setProperty(
			'--prog',
			`${(((now.getTime() - timerFrom) / (timerTo - timerFrom)) * 100).toFixed(
				3,
			)}%`,
		);
	}
	requestAnimationFrame(clock);
}

//#region Timer
const timerPanel = document.querySelector<HTMLElement>('.panel-timer')!;
const timerTarget = document.querySelector<HTMLInputElement>('#timer-target')!;
const timerDuration =
	document.querySelector<HTMLInputElement>('#timer-duration')!;
timerTarget.addEventListener('input', () => {
	const [h, m] = timerTarget.value.split(':').map((v) => parseInt(v));
	const target = new Date();
	target.setHours(h);
	target.setMinutes(m);
	const now = new Date();
	if (target.getTime() <= now.getTime()) {
		target.setDate(target.getDate() + 1);
		target.setMinutes(m - 1);
	}
	const durationTime = target.getTime() - now.getTime();
	const durationHours = Math.floor(durationTime / 1000 / 60 / 60)
		.toString()
		.padStart(2, '0');
	const durationMinutes = (Math.floor(durationTime / 1000 / 60) % 60)
		.toString()
		.padStart(2, '0');
	timerDuration.value = `${durationHours}:${durationMinutes}`;
});
timerDuration.addEventListener('input', () => {
	const [h, m] = timerDuration.value.split(':').map((v) => parseInt(v));
	const now = new Date();
	const target = new Date();
	target.setHours(now.getHours() + h);
	target.setMinutes(now.getMinutes() + m);
	timerTarget.value = `${target.getHours().toString().padStart(2, '0')}:${target
		.getMinutes()
		.toString()
		.padStart(2, '0')}`;
});
function setTimerInput() {
	timerDuration.value = '00:05';
	timerDuration.dispatchEvent(new Event('input'));
}
document.querySelector('#action-timer')?.addEventListener('click', () => {
	setTimerInput();
	timerPanel.classList.add('panel-show');
	actions.classList.remove('actions-show');
});
document.querySelector('#timer-cancel')?.addEventListener('click', () => {
	timerPanel.classList.remove('panel-show');
});
document.querySelector('#timer-clear')?.addEventListener('click', () => {
	clearTimer();
	timerPanel.classList.remove('panel-show');
});
document.querySelector('#timer-set')?.addEventListener('click', () => {
	const [h, m] = timerDuration.value.split(':').map((v) => parseInt(v));
	timerFrom = Date.now();
	timerTo = timerFrom + h * 3600 * 1000 + m * 60 * 1000;
	const target = new Date(timerTo);
	digitTarget.textContent = `${target
		.getHours()
		.toString()
		.padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
	timerPanel.classList.remove('panel-show');
	progress.classList.add('line-active');
});
function clearTimer() {
	timerFrom = 0;
	timerTo = 0;
	progress.classList.remove('line-active');
	digitDuration.textContent = '';
	digitTarget.textContent = '';
}

//#region Settings
const settinsPanel = document.querySelector<HTMLElement>('.panel-settings')!;
const size = document.querySelector<HTMLInputElement>('#size')!;
const theme = document.querySelector<HTMLButtonElement>('#theme')!;
document.querySelector('#action-settings')?.addEventListener('click', () => {
	settinsPanel.classList.add('panel-show');
	actions.classList.remove('actions-show');
});
size.addEventListener('input', () => {
	document.body.style.setProperty('--time-size', `${size.value}px`);
});
theme.addEventListener('click', () => {
	document.documentElement.classList.toggle('invert');
});
document.querySelector('#settings-close')?.addEventListener('click', () => {
	settinsPanel.classList.remove('panel-show');
});
function setSizeRange() {
	size.max = (window.innerWidth * 0.18).toFixed(0);
	size.value = Math.min(
		parseInt(size.value),
		window.innerWidth * 0.18,
	).toString();
	size.dispatchEvent(new Event('input'));
}
function setDefaultSize() {
	const max = parseInt(size.max);
	size.value = (32 + (max - 32) / 3).toFixed(0);
	size.dispatchEvent(new Event('input'));
}
window.addEventListener('resize', setSizeRange);
const noSleep = new NoSleep();
const noSleepBtn =
	document.querySelector<HTMLInputElement>('#screen-always-on')!;
noSleepBtn.addEventListener('change', () => {
	if (noSleepBtn.checked) {
		return noSleep.enable();
	}
	noSleep.disable();
});

//#region Full Screen
document.querySelector('#action-full')?.addEventListener('click', () => {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.documentElement.requestFullscreen();
	}
	actions.classList.remove('actions-show');
});

requestAnimationFrame(clock);
setSizeRange();
setDefaultSize();
