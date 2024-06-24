declare class NoSleep {
  enable(): void;
  disable(): void;
}

function formatTime(time: number) {
  time /= 1000;
  let h = Math.floor(time / 3600);
  let m = Math.ceil((time % 3600) / 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

//#region Action
let actions = document.querySelector<HTMLDivElement>('.actions')!;

document.querySelector('.action-toggle')?.addEventListener('click', () => {
  actions.classList.toggle('actions-show');
});

//#region Clock
let timerFrom = 0;
let timerTo = 0;
let digitHa = document.querySelector<HTMLDivElement>('#time-hour-a')!;
let digitHb = document.querySelector<HTMLDivElement>('#time-hour-b')!;
let digitMa = document.querySelector<HTMLDivElement>('#time-min-a')!;
let digitMb = document.querySelector<HTMLDivElement>('#time-min-b')!;
let digitSa = document.querySelector<HTMLDivElement>('#time-sec-a')!;
let digitSb = document.querySelector<HTMLDivElement>('#time-sec-b')!;
let digitTarget = document.querySelector<HTMLDivElement>('.timer-target')!;
let digitDuration = document.querySelector<HTMLDivElement>('.timer-duration')!;
let progress = document.querySelector<HTMLDivElement>('.line')!;
function clock() {
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
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
        3
      )}%`
    );
  }
  requestAnimationFrame(clock);
}

//#region Timer
let timerPanel = document.querySelector<HTMLElement>('.panel-timer')!;
let timerTarget = document.querySelector<HTMLInputElement>('#timer-target')!;
let timerDuration =
  document.querySelector<HTMLInputElement>('#timer-duration')!;
timerTarget.addEventListener('input', () => {
  let [h, m] = timerTarget.value.split(':').map((v) => parseInt(v));
  let target = new Date();
  target.setHours(h);
  target.setMinutes(m);
  let now = new Date();
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
    target.setMinutes(m - 1);
  }
  let durationTime = target.getTime() - now.getTime();
  let durationHours = Math.floor(durationTime / 1000 / 60 / 60)
    .toString()
    .padStart(2, '0');
  let durationMinutes = (Math.floor(durationTime / 1000 / 60) % 60)
    .toString()
    .padStart(2, '0');
  timerDuration.value = `${durationHours}:${durationMinutes}`;
});
timerDuration.addEventListener('input', () => {
  let [h, m] = timerDuration.value.split(':').map((v) => parseInt(v));
  let now = new Date();
  let target = new Date();
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
  let [h, m] = timerDuration.value.split(':').map((v) => parseInt(v));
  timerFrom = Date.now();
  timerTo = timerFrom + h * 3600 * 1000 + m * 60 * 1000;
  let target = new Date(timerTo);
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
let settinsPanel = document.querySelector<HTMLElement>('.panel-settings')!;
let size = document.querySelector<HTMLInputElement>('#size')!;
let theme = document.querySelector<HTMLButtonElement>('#theme')!;
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
    window.innerWidth * 0.18
  ).toString();
  size.dispatchEvent(new Event('input'));
}
function setDefaultSize() {
  let max = parseInt(size.max);
  size.value = (32 + (max - 32) / 3).toFixed(0);
  size.dispatchEvent(new Event('input'));
}
window.addEventListener('resize', setSizeRange);
let noSleep = new NoSleep();
let noSleepBtn = document.querySelector<HTMLInputElement>('#screen-always-on')!;
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
