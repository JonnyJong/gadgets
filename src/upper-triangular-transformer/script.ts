type Matrix = number[][];

let currentMatrixSize = 2;
//#region Global Elements
let matrix: HTMLDivElement;
let matrixEffect: HTMLDivElement;
let matrixSizeInput: HTMLInputElement;
let factorE: HTMLElement;

//#region Solver
async function solver() {
  let size = currentMatrixSize;
  let offset = 0;
  let matrixValue = getMatrixValue();
  let factor = 1;

  while (size - offset >= 2) {
    // Normalize Left Top
    factor *= await normalizeLT(matrixValue, size, offset);
    factorE.textContent = String(factor);
    highlightAnimation(matrix.children[offset].children[offset] as HTMLElement);
    await timer(100);

    // Make to zero one by one
    for (let i = offset + 1; i < size; i++) {
      let k = -matrixValue[i][offset];
      if (k === 0) continue;
      await scaleAndAddRowDOM(matrixValue, k, offset, i);
      scaleAndAddRow(matrixValue, k, offset, i);
      await timer(100);
    }

    offset++;
    setMatrixLookOffset(offset);
    factorE.textContent = '';
  }
  setMatrixLookOffset(0);

  dialog(
    '成功',
    `所以答案就是 ${
      matrixValue[size - 1][size - 1] * factor
    } 哒，另外还有系数 ${factor} 哦`,
    '😎'
  );
}

async function normalizeLT(
  matrixValue: Matrix,
  size: number,
  offset: number
): Promise<number> {
  let currentValue = matrixValue[offset][offset];
  if (currentValue === 1) return 1;
  // 查找同一列是否有 1，有则交换
  for (let i = offset + 1; i < size; i++) {
    if (matrixValue[i][offset] !== 1) continue;
    await swapRow(offset, i);
    swapMatrixRow(matrixValue, offset, i);
    return -1;
  }
  // 查找同一行是否有 1，有则交换
  for (let i = offset + 1; i < size; i++) {
    if (matrixValue[offset][i] !== 1) continue;
    await swapColumn(offset, i);
    swapMatrixColumn(matrixValue, offset, i);
    return -1;
  }
  // 查找同一列是否有非零倍数后相加为 1，有则进行该操作
  for (let i = offset + 1; i < size; i++) {
    let k = findMultiplierForOne(currentValue, matrixValue[i][offset]);
    if (!k) continue;
    await scaleAndAddRowDOM(matrixValue, k, i, offset);
    scaleAndAddRow(matrixValue, k, i, offset);
    return 1;
  }
  // 查找同一行是否有非零倍数后相加为 1，有则进行该操作
  for (let i = offset + 1; i < size; i++) {
    let k = findMultiplierForOne(currentValue, matrixValue[offset][i]);
    if (!k) continue;
    await scaleAndAddColumnDOM(matrixValue, k, i, offset);
    scaleAndAddColumn(matrixValue, k, i, offset);
    return 1;
  }
  // 查找矩阵中是否有 1，有则交换
  for (let y = offset + 2; y < size; y++) {
    for (let x = offset + 2; x < size; x++) {
      if (matrixValue[y][x] !== 1) continue;
      await swapColumn(offset, x);
      swapMatrixColumn(matrixValue, offset, x);
      await swapRow(offset, y);
      swapMatrixRow(matrixValue, offset, y);
      return 1;
    }
  }
  // 查找矩阵中是否有非零倍数后相加为 1，有则进行该操作
  for (let y = offset + 2; y < size; y++) {
    for (let x = offset + 2; x < size; x++) {
      let k = findMultiplierForOne(currentValue, matrixValue[y][x]);
      if (k === 0) continue;
      await scaleAndAddColumnDOM(matrixValue, k, offset, x);
      scaleAndAddColumn(matrixValue, k, offset, x);
      await scaleAndAddRowDOM(matrixValue, k, y, offset);
      scaleAndAddRow(matrixValue, k, y, offset);
      return 1;
    }
  }
  // throw new Error('No solution');
  // TODO: 其他解决办法
  // 最后的方法：将该行乘以 1 / currentValue
  await scaleRowDom(matrixValue, offset, 1 / currentValue);
  scaleRow(matrixValue, offset, 1 / currentValue);
  return currentValue;
}

//#region Style
function resetMatrixLook() {
  document.body.style.setProperty(
    '--size',
    String(matrixSizeInput.valueAsNumber)
  );
}
function setMatrixLookOffset(offset: number) {
  document.body.style.setProperty('--offset', String(offset));
  document
    .querySelectorAll('.offseted')
    .forEach((e) => e.classList.remove('offseted'));
  [...matrix.children]
    .slice(0, offset)
    .forEach((e) => e.classList.add('offseted'));
  [...matrix.children].slice(offset).forEach((line) => {
    [...line.children]
      .slice(0, offset)
      .forEach((e) => e.classList.add('offseted'));
  });
}

function resizeMatrix() {
  let newSize = parseInt(matrixSizeInput.value);
  if (newSize < 2 || newSize === currentMatrixSize) return;
  if (newSize > currentMatrixSize) {
    for (let i = currentMatrixSize + 1; i <= newSize; i++) {
      for (const line of matrix.children) {
        line.append(createMatrixCell(i - 1));
      }
      matrix.append(createMatrixLine(i));
    }
  } else {
    let removedLines = Array.from(matrix.children).slice(newSize);
    let removedCells = [];
    for (const line of Array.from(matrix.children)) {
      removedCells.push(...Array.from(line.children).slice(newSize));
    }
    setTimeout(() => {
      for (const element of [...removedLines, ...removedCells]) {
        element.remove();
      }
    }, 300);
  }
  currentMatrixSize = newSize;
  resetMatrixLook();
}

//#region Helper
function timer(stamp: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, stamp);
  });
}

function toArray(to: number) {
  let result = [];
  if (to > 0) {
    for (let i = 2; i <= to; i++) {
      result.push(i);
    }
    return result;
  }
  for (let i = -1; i >= to; i--) {
    result.push(i);
  }
  return result;
}

function findMultiplierForOne(a: number, b: number): number {
  if (b === 0) return 0;

  const x = (1 - a) / b;

  // 检查x是否为非零整数
  if (Number.isInteger(x) && x !== 0) return x;
  return 0;
}

// 数据操作

function swapMatrixRow(matrix: Matrix, fromRow: number, toRow: number) {
  let temp = matrix[fromRow];
  matrix[fromRow] = matrix[toRow];
  matrix[toRow] = temp;
}

function swapMatrixColumn(matrix: Matrix, fromCol: number, toCol: number) {
  for (let i = 0; i < matrix.length; i++) {
    let temp = matrix[i][fromCol];
    matrix[i][fromCol] = matrix[i][toCol];
    matrix[i][toCol] = temp;
  }
}

function scaleAndAddRow(
  matrix: Matrix,
  scale: number,
  fromRow: number,
  toRow: number
) {
  if (
    fromRow < 0 ||
    fromRow >= matrix.length ||
    toRow < 0 ||
    toRow >= matrix.length
  ) {
    throw new Error('Row index out of bounds');
  }

  for (let col = 0; col < matrix[0].length; col++) {
    matrix[toRow][col] += scale * matrix[fromRow][col];
  }
}
function scaleAndAddColumn(
  matrix: Matrix,
  scale: number,
  fromColumn: number,
  toColumn: number
) {
  if (
    fromColumn < 0 ||
    fromColumn >= matrix[0].length ||
    toColumn < 0 ||
    toColumn >= matrix[0].length
  ) {
    throw new Error('Column index out of bounds');
  }

  for (let row = 0; row < matrix.length; row++) {
    matrix[row][toColumn] += scale * matrix[row][fromColumn];
  }
}

function scaleRow(matrix: Matrix, row: number, scale: number) {
  for (let col = 0; col < matrix[row].length; col++) {
    matrix[row][col] *= scale;
  }
}

// DOM 操作

function createMatrixCell(x: number) {
  let cell = document.createElement('input');
  cell.className = 'cell';
  cell.type = 'number';
  cell.placeholder = '0';
  cell.style.setProperty('--i', String(x));
  return cell;
}
function createMatrixLine(cellCount: number) {
  let line = document.createElement('div');
  line.className = 'line';
  line.style.setProperty('--i', String(cellCount - 1));
  for (let i = 0; i < cellCount; i++) {
    line.append(createMatrixCell(i));
  }
  return line;
}

function clearMatrix() {
  for (const line of matrix.children) {
    for (const cell of line.children) {
      (cell as HTMLInputElement).value = '';
    }
  }
}

function getMatrixValue(): Matrix {
  let result: Matrix = [];
  let size = matrixSizeInput.valueAsNumber;
  for (let y = 0; y < size; y++) {
    let line = [];
    for (let x = 0; x < size; x++) {
      let num = (matrix.children[y].children[x] as HTMLInputElement)
        .valueAsNumber;
      if (isNaN(num) || !isFinite(num)) num = 0;
      line.push(num);
    }
    result.push(line);
  }
  return result;
}

function setValueAt(x: number, y: number, value: number) {
  (matrix.children[y].children[x] as HTMLInputElement).valueAsNumber = value;
}

async function swap(parent: HTMLElement, x1: number, x2: number) {
  if (x1 === x2) return;
  const child1 = parent.children[x1] as HTMLElement;
  const child2 = parent.children[x2] as HTMLElement;
  if (!child1 || !child2) return;

  child1.style.setProperty('--i', String(x2));
  child2.style.setProperty('--i', String(x1));

  await timer(300);

  // 交换两个子元素的位置
  parent.insertBefore(child2, child1);
  parent.insertBefore(child1, parent.children[x2]);
}

async function swapRow(y1: number, y2: number) {
  let r1 = document.createElement('div');
  let r2 = document.createElement('div');
  r1.className = 'row';
  r2.className = 'row';
  r1.style.setProperty('--i', String(y1));
  r2.style.setProperty('--i', String(y2));
  matrixEffect.append(r1, r2);
  await timer(300);
  r1.style.setProperty('--i', String(y2));
  r2.style.setProperty('--i', String(y1));
  await swap(matrix, y1, y2);
  await timer(300);
  r1.className = 'row row-removing';
  r2.className = 'row row-removing';
  await timer(300);
  r1.remove();
  r2.remove();
}

async function swapColumn(x1: number, x2: number) {
  let c1 = document.createElement('div');
  let c2 = document.createElement('div');
  c1.className = 'column';
  c2.className = 'column';
  c1.style.setProperty('--i', String(x1));
  c2.style.setProperty('--i', String(x2));
  matrixEffect.append(c1, c2);
  await timer(300);
  c1.style.setProperty('--i', String(x2));
  c2.style.setProperty('--i', String(x1));
  for (const line of matrix.children) {
    swap(line as HTMLElement, x1, x2);
  }
  await timer(300);
  c1.className = 'column column-removing';
  c2.className = 'column column-removing';
  await timer(300);
  c1.remove();
  c2.remove();
}

async function scaleAndAddRowDOM(
  matrixValue: Matrix,
  scale: number,
  fromRow: number,
  toRow: number
) {
  // Prepare
  let scaler = document.createElement('div');
  scaler.className = 'row row-scaler';
  scaler.style.setProperty('--i', String(fromRow));
  let factor = document.createElement('div');
  factor.textContent = '1';
  let original = [];
  let multied = [];
  for (let i = 0; i < currentMatrixSize; i++) {
    let div = document.createElement('div');
    multied.push(matrixValue[fromRow][i]);
    div.textContent = String(multied[i]);
    scaler.append(div);
  }
  scaler.append(factor);
  original = [...multied];
  matrixEffect.append(scaler);
  await timer(300);

  // Multiply
  for (const i of toArray(scale)) {
    factor.textContent = String(i);
    original.forEach((v, j) => {
      multied[j] = v * i;
      scaler.children[j].textContent = String(multied[j]);
      scaleAnimation(scaler.children[j] as HTMLElement);
    });
    boldAnimation(factor);
    await timer(200);
  }
  await timer(300);

  // Move
  scaler.style.setProperty('--i', String(toRow));
  await timer(500);

  // Apply
  scaler.classList.add('row-scaler-removing');
  multied.forEach((v, i) => {
    (matrix.children[toRow].children[i] as HTMLInputElement).valueAsNumber += v;
  });
  await timer(200);
  scaler.remove();
}

async function scaleAndAddColumnDOM(
  matrixValue: Matrix,
  scale: number,
  fromColumn: number,
  toColumn: number
) {
  // Prepare
  let scaler = document.createElement('div');
  scaler.className = 'column column-scaler';
  scaler.style.setProperty('--i', String(fromColumn));
  let factor = document.createElement('div');
  factor.textContent = '1';
  let original = [];
  let multied = [];
  for (let i = 0; i < currentMatrixSize; i++) {
    let div = document.createElement('div');
    multied.push(matrixValue[i][fromColumn]);
    div.textContent = String(multied[i]);
    scaler.append(div);
  }
  scaler.append(factor);
  original = [...multied];
  matrixEffect.append(scaler);
  await timer(300);

  // Multiply
  for (const i of toArray(scale)) {
    factor.textContent = String(i);
    original.forEach((v, j) => {
      multied[j] = v * i;
      scaler.children[j].textContent = String(multied[j]);
      scaleAnimation(scaler.children[j] as HTMLElement);
    });
    boldAnimation(factor);
    await timer(200);
  }
  await timer(300);

  // Move
  scaler.style.setProperty('--i', String(toColumn));
  await timer(500);

  // Apply
  scaler.classList.add('column-scaler-removing');
  multied.forEach((v, i) => {
    (matrix.children[i].children[toColumn] as HTMLInputElement).valueAsNumber +=
      v;
  });
  await timer(200);
  scaler.remove();
}

async function scaleRowDom(matrixValue: Matrix, row: number, scale: number) {
  // Prepare
  let scaler = document.createElement('div');
  scaler.className = 'row row-scaler';
  scaler.style.setProperty('--i', String(row));
  let factor = document.createElement('div');
  factor.textContent = '1';
  let values = [];
  for (let i = 0; i < currentMatrixSize; i++) {
    let div = document.createElement('div');
    values.push(matrixValue[row][i]);
    div.textContent = String(values[i]);
    scaler.append(div);
  }
  scaler.append(factor);
  matrixEffect.append(scaler);
  await timer(300);

  // Multiply
  factor.textContent = String(scale);
  values.forEach((v, i) => {
    values[i] *= scale;
    scaler.children[i].textContent = String(values[i]);
    scaleAnimation(scaler.children[i] as HTMLElement);
  });
  boldAnimation(factor);
  await timer(500);

  // Apply
  scaler.classList.add('row-scaler-removing');
  values.forEach((v, i) => {
    (matrix.children[row].children[i] as HTMLInputElement).valueAsNumber = v;
  });
  await timer(200);
  scaler.remove();
}

// 动画

function boldAnimation(e: HTMLElement) {
  e.animate(
    [
      {
        scale: '1',
        rotate: '1deg',
      },
      {
        scale: '2',
        rotate: ((Math.random() - 0.5) * 45).toFixed(2) + 'deg',
      },
      {
        scale: '1',
        rotate: '1deg',
      },
    ],
    {
      duration: 100,
    }
  ).play();
}

function scaleAnimation(e: HTMLElement) {
  e.animate(
    [
      {
        scale: '0',
      },
      { scale: '1' },
    ],
    { duration: 100 }
  ).play();
}

function highlightAnimation(e: HTMLElement) {
  e.animate(
    [
      {
        backgroundColor: 'var(--color)',
      },
      {
        backgroundColor: getComputedStyle(e).backgroundColor,
      },
    ],
    { duration: 200, easing: 'ease-out' }
  ).play();
}

//#region UI

async function dialog(title: string, content: string, bg?: string) {
  // Prepare
  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  const inner = document.createElement('div');
  inner.className = 'dialog-inner';
  inner.innerHTML = `${
    bg ? `<div class="dialog-bg">${bg}</div>` : ''
  }<div class="dialog-title">${title}</div><div class="dialog-content">${content}</div><button><i class="icon icon-dismiss"></i> 关闭</button>`;
  dialog.append(inner);
  document.body.append(dialog);
  inner.lastChild?.addEventListener('click', () => {
    dialog.classList.add('dialog-closing');
    dialog.style.height = '0px';
    setTimeout(() => dialog.remove(), 1000);
  });
  // Style
  await timer(1);
  dialog.style.height = inner.getBoundingClientRect().height + 'px';
}

//#region Init

function initMatrixSizeControl() {
  matrixSizeInput = document.querySelector('.size-input')!;
  let btnAdd = document.querySelector<HTMLButtonElement>('#size-add')!;
  let btnReduce = document.querySelector<HTMLButtonElement>('#size-reduce')!;
  let effectBox = document.querySelector('.size-input-box')!;

  function effect(type: 'add' | 'reduce') {
    let div = document.createElement('div');
    div.className = `size-effect size-${type}`;
    effectBox.append(div);
    setTimeout(() => div.remove(), 200);
  }

  btnAdd.addEventListener('click', () => {
    btnReduce.disabled = false;
    effect('add');
    setTimeout(() => {
      matrixSizeInput.valueAsNumber += 1;
      resizeMatrix();
    }, 100);
  });
  btnReduce.addEventListener('click', () => {
    setTimeout(() => {
      if (matrixSizeInput.valueAsNumber <= 3) {
        btnReduce.disabled = true;
      }
      if (matrixSizeInput.valueAsNumber <= 2) {
        return;
      }
      matrixSizeInput.valueAsNumber -= 1;
      resizeMatrix();
    }, 100);
    if (matrixSizeInput.valueAsNumber <= 3) {
      btnReduce.disabled = true;
    }
    effect('reduce');
  });

  matrixSizeInput.addEventListener('input', () => {
    if (
      matrixSizeInput.valueAsNumber < 2 ||
      isNaN(matrixSizeInput.valueAsNumber)
    ) {
      matrixSizeInput.valueAsNumber = 2;
    }
    if (matrixSizeInput.valueAsNumber > 50) {
      matrixSizeInput.valueAsNumber = 50;
    }
    btnReduce.disabled = matrixSizeInput.valueAsNumber <= 2;
    resizeMatrix();
  });
}

function initControl() {
  let btnSolve = document.querySelector<HTMLButtonElement>('#solve')!;
  btnSolve.addEventListener('click', async () => {
    btnSolve.disabled = true;
    try {
      await solver();
    } catch (error) {
      setMatrixLookOffset(0);
      dialog('失敗した', '解不开，怎么解都解不开', '😭');
    }
    btnSolve.disabled = false;
  });
  let btnClear = document.querySelector<HTMLButtonElement>('#clear')!;
  btnClear.addEventListener('click', () => {
    matrix.classList.add('matrix-cleaning');
    let cells = [...document.querySelectorAll<HTMLInputElement>('.cell')];
    cells.sort(() => Math.random() - 0.5);
    let i = 0;
    // TODO: if timeout is lower than 1, should reset mulit cell at once time
    let interval = setInterval(() => {
      cells[i++].value = '';
      if (i >= cells.length) {
        clearInterval(interval);
      }
    }, 820 / cells.length);
    // setTimeout(() => {
    //   clearMatrix();
    // }, 410);
    setTimeout(() => {
      matrix.classList.remove('matrix-cleaning');
      clearMatrix();
    }, 820);
  });
}

matrix = document.querySelector('.matrix')!;
matrixEffect = document.querySelector('.matrix-effect')!;
factorE = document.querySelector('.factor')!;
initControl();
initMatrixSizeControl();
