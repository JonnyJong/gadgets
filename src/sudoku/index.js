'use strict'
// 初始化
let grid = new Array(9)
for (let i = 0; i < grid.length; i++) {
  grid[i] = new Array(9).fill({n:0,d:false,e:0,m:[]})
}
grid = JSON.parse(JSON.stringify(grid))
let time = (new Date()).getTime()
let record = []
let targetEle = null
let targetEleX = null
let targetEleY = null
let targetNum = null
let targetNumEle = null
let isMarkMode = false
let isSwitchingDarkMode = false
let markLabel = ['a','b','c','d','e','f','g','h','i']
let isEditGame = false
let timer
let timerEle
let isShowError = false
let less = [9,9,9,9,9,9,9,9,9]
let totalErr = 0
let totalLess = 81

// 移动端检测
if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  document.body.classList.add('pc')
}

// 暗色模式
const switchDarkmode = (isDark)=>{
  if (isDark) {
    localStorage.setItem('sudoku-darkmode', 'true')
    document.body.classList.add('dark-animation')
    setTimeout(() => {
      document.body.classList.remove('dark-animation')
      document.documentElement.setAttribute('data-theme','dark')
      isSwitchingDarkMode = false
    }, 500)
  }else{
    localStorage.setItem('sudoku-darkmode', 'false')
    document.body.classList.add('dark-animation')
    setTimeout(() => {
      document.body.classList.remove('dark-animation')
      document.documentElement.setAttribute('data-theme','light')
      isSwitchingDarkMode = false
    }, 500)
  }
}
const darkmode = ()=>{
  if (isSwitchingDarkMode) {
    return
  }
  isSwitchingDarkMode = true
  let darkmode = localStorage.getItem('sudoku-darkmode')
  if (darkmode === null) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      switchDarkmode(true)
    }else{
      switchDarkmode(false)
    }
  }else if (darkmode === 'true') {
    switchDarkmode(false)
  }else{
    switchDarkmode(true)
  }
}

// 显示错误
const showError = ()=>{
  if (isShowError) {
    isShowError = false
    document.querySelector('.tip').classList.remove('active')
    document.body.classList.remove('show-error')
  }else{
    isShowError = true
    document.querySelector('.tip').classList.add('active')
    document.body.classList.add('show-error')
  }
}

// 设置局面
const setGame = (data)=>{
  document.querySelectorAll('.block').forEach(e=>{
    e.classList.remove('default')
    e.querySelector('.cur-num').innerHTML = ''
    markLabel.forEach(m=>{
      e.classList.remove(m)
    })
  })
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (data[y][x].n !== 0) {
        document.querySelector(`.line:nth-child(${y+1}) .block:nth-child(${x+1}) .cur-num`).innerHTML = data[y][x].n
      }
      if (data[y][x].d) {
        document.querySelector(`.line:nth-child(${y+1}) .block:nth-child(${x+1})`).classList.add('default')
      }
      data[y][x].m.forEach(m=>{
        document.querySelector(`.line:nth-child(${y+1}) .block:nth-child(${x+1})`).classList.add(m)
      })
    }
  }
}

// 重置
const reset = (method)=>{
  switch (method) {
    case 'timer':
      time = (new Date()).getTime()
      clearInterval(timer)
      timer = setInterval(() => {
        timerEle.innerHTML = parseInt(((new Date()).getTime() - time) / 1000)
      }, 500)
      break
    case 'clear':
      time = (new Date()).getTime()
      record = []
      targetEle = null
      targetEleX = null
      targetEleY = null
      targetNum = null
      targetNumEle = null
      totalErr = 0
      less = [9,9,9,9,9,9,9,9,9]
      totalLess = 81
      for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(9).fill({n:0,d:false,e:0,m:[]})
      }
      grid = JSON.parse(JSON.stringify(grid))
      document.querySelectorAll('.block').forEach(e=>{
        e.classList.remove('default')
        e.querySelector('.cur-num').innerHTML = ''
        markLabel.forEach(m=>{
          e.classList.remove(m)
        })
      })
      document.querySelectorAll('.block, .num').forEach(e=>{
        e.classList.remove('active')
      })
      if (document.querySelector('.fake-active')) {
        document.querySelector('.fake-active').classList.remove('fake-active')
      }
      highlight()
      calcLess()
      clearInterval(timer)
      timer = setInterval(() => {
        timerEle.innerHTML = parseInt(((new Date()).getTime() - time) / 1000)
      }, 500)
      break
    case 'replay':
      time = (new Date()).getTime()
      record = []
      targetEle = null
      targetEleX = null
      targetEleY = null
      targetNum = null
      targetNumEle = null
      // BUG 此处 totalErr 应该重新计算
      totalErr = 0
      document.querySelectorAll('.block, .num').forEach(e=>{
        e.classList.remove('active')
      })
      if (document.querySelector('.fake-active')) {
        document.querySelector('.fake-active').classList.remove('fake-active')
      }
      grid.forEach(line=>{
        line.forEach(block=>{
          if (!block.d) {
            block.n = 0
          }
          block.m = []
        })
      })
      highlight()
      setGame(grid)
      reCalcLess()
      clearInterval(timer)
      timer = setInterval(() => {
        timerEle.innerHTML = parseInt(((new Date()).getTime() - time) / 1000)
      }, 500)
      break
  }
  if (isShowError) {
    if (document.querySelector('.dialog').classList.contains('open')) {
      document.body.classList.add('show-error')
    }else{
      document.body.classList.remove('show-error')
    }
  }
  document.querySelector('.dialog').classList.toggle('open')
}
// 记录
const recorder = (type)=>{
  switch (type) {
    case 'add':
      record.push(JSON.parse(JSON.stringify(grid)))
      break
    case 'undo':
      if (record.length > 0) {
        setGame(record[record.length - 1])
        grid = JSON.parse(JSON.stringify(record[record.length - 1]))
        record.pop()
        if (targetNum !== null) {
          highlight(targetNum)
        }else if (targetEle !== null && targetEle.querySelector('.cur-num').innerHTML !== '') {
          highlight(parseInt(targetEle.querySelector('.cur-num').innerHTML))
        }else{
          highlight()
        }
      }
      break
  }
}

// 标记模式
const markmode = ()=>{
  if (isMarkMode) {
    isMarkMode = false
    document.querySelector('.mark').classList.remove('active')
  }else{
    isMarkMode = true
    document.querySelector('.mark').classList.add('active')
  }
}

// 编辑局面模式
const editGame = ()=>{
  if (isEditGame) {
    isEditGame = false
    document.querySelector('.edit').classList.remove('active')
  }else{
    isEditGame = true
    document.querySelector('.edit').classList.add('active')
  }
}

// 高亮
const highlight = (num)=>{
  document.querySelectorAll('.hl').forEach(e=>{
    e.classList.remove('hl')
  })
  if (num !== undefined) {
    document.querySelectorAll('.block').forEach(e=>{
      if (parseInt(e.querySelector('.cur-num').innerHTML) === num || e.classList.contains(markLabel[num - 1])) {
        e.classList.add('hl')
      }
    })
  }
}

// 查错
const check = (y,x,after)=>{
  let before = grid[y][x].n
  y = y + 1
  x = x + 1
  let bbx = (x < 4 ? 2 : (x < 7 ? 5 : 8))
  let bby = (y < 4 ? 2 : (y < 7 ? 5 : 8))
  let target = document.querySelector(`.line:nth-child(${y}) .block:nth-child(${x})`)
  totalErr -= grid[y - 1][x - 1].e
  grid[y - 1][x - 1].e = 0
  document.querySelectorAll(`.line:nth-child(${y}) .block, .line .block:nth-child(${x}), .line:nth-child(${bby - 1}) .block:nth-child(${bbx - 1}), .line:nth-child(${bby - 1}) .block:nth-child(${bbx}), .line:nth-child(${bby - 1}) .block:nth-child(${bbx + 1}), .line:nth-child(${bby}) .block:nth-child(${bbx - 1}), .line:nth-child(${bby}) .block:nth-child(${bbx}), .line:nth-child(${bby}) .block:nth-child(${bbx + 1}), .line:nth-child(${bby + 1}) .block:nth-child(${bbx - 1}), .line:nth-child(${bby + 1}) .block:nth-child(${bbx}), .line:nth-child(${bby + 1}) .block:nth-child(${bbx + 1})`).forEach(e=>{
    let eg = grid[e.getAttribute('data-y')][e.getAttribute('data-x')]
    if (before !== 0 && e !== target && eg.n === before) {
      totalErr--
      eg.e--
    }
    if (after !== 0 && e !== target && eg.n === after) {
      totalErr += 2
      eg.e++
      grid[y - 1][x - 1].e++
    }
    if (eg.e > 0) {
      e.classList.add('error')
    }else{
      e.classList.remove('error')
    }
  })
  if (grid[y - 1][x - 1].e > 0) {
    target.classList.add('error')
  }else{
    target.classList.remove('error')
  }
}

// 统计剩余
const calcLess = ()=>{
  let lessEle = document.querySelectorAll('.less')
  for (let i = 0; i < less.length; i++) {
    lessEle[i].innerHTML = less[i]
  }
}
const reCalcLess = ()=>{
  totalLess = 81
  less = [9,9,9,9,9,9,9,9,9]
  document.querySelectorAll('.cur-num').forEach(e=>{
    let num = parseInt(e.innerHTML)
    if (num > 0) {
      totalLess--
      less[num - 1]--
    }
  })
  calcLess()
  if (totalLess === 0 && totalErr === 0) {
    win()
  }
}

// 完成
const win = ()=>{
  clearTimeout(timer)
  document.querySelector('.time').innerHTML = ((new Date()).getTime() - time) / 1000
  document.querySelector('.win').classList.add('open')
}

// 操作
const setNum = (num, ele)=>{
  console.time('setNum')
  if (document.querySelector('.fake-active')) {
    document.querySelector('.fake-active').classList.remove('fake-active')
  }
  if (targetEle === null) {
    if (targetNum === num) {
      ele.classList.remove('active')
      targetNum = null
      highlight()
    }else{
      if (targetNumEle) {
        targetNumEle.classList.remove('active')
      }
      ele.classList.add('active')
      targetNumEle = ele
      targetNum = num
      highlight(num)
    }
  }else{
    if (isEditGame) {
      recorder('add')
      if (num === 0 || parseInt(targetEle.querySelector('.cur-num').innerHTML) === num) {
        check(targetEleY,targetEleX, 0)
        targetEle.querySelector('.cur-num').innerHTML = ''
        targetEle.classList.remove('default')
        grid[targetEleY][targetEleX].n = 0
        grid[targetEleY][targetEleX].d = false
        highlight()
      }else{
        check(targetEleY,targetEleX, num)
        targetEle.querySelector('.cur-num').innerHTML = num
        targetEle.classList.add('default')
        grid[targetEleY][targetEleX].n = num
        grid[targetEleY][targetEleX].d = true
        highlight(num)
        targetEle.classList.add('fake-active')
      }
    }else if (targetEle.classList.contains('default') === false) {
      recorder('add')
      if (isMarkMode) {
        if (num === 0) {
          markLabel.forEach(m=>{
            targetEle.classList.remove(m)
            grid[targetEleY][targetEleX].m = []
          })
          highlight()
        }else{
          let markIndex = grid[targetEleY][targetEleX].m.indexOf(markLabel[num - 1])
          if (markIndex === -1) {
            grid[targetEleY][targetEleX].m.push(markLabel[num - 1])
          }else{
            grid[targetEleY][targetEleX].m.splice(markIndex, 1)
          }
          targetEle.classList.toggle(markLabel[num - 1])
          highlight(num)
        }
      }else{
        if (num === 0 || parseInt(targetEle.querySelector('.cur-num').innerHTML) === num) {
          check(targetEleY,targetEleX, 0)
          targetEle.querySelector('.cur-num').innerHTML = ''
          grid[targetEleY][targetEleX].n = 0
          highlight()
        }else{
          check(targetEleY,targetEleX, num)
          targetEle.querySelector('.cur-num').innerHTML = num
          grid[targetEleY][targetEleX].n = num
          highlight(num)
        }
      }
    }
    reCalcLess()
  }
  console.timeEnd('setNum')
}
const setEle = (y,x)=>{
  console.time('setEle')
  if (document.querySelector('.fake-active')) {
    document.querySelector('.fake-active').classList.remove('fake-active')
  }
  let nowTarget = document.querySelector(`.line:nth-child(${y+1}) .block:nth-child(${x+1})`)
  if (targetNum === null) {
    if (targetEle === nowTarget) {
      nowTarget.classList.remove('active')
      targetEle = null
      highlight()
    }else{
      if (targetEle) {
        targetEle.classList.remove('active')
      }
      targetEle = nowTarget
      nowTarget.classList.add('active')
      targetEleX = x
      targetEleY = y
      if (targetEle.querySelector('.cur-num').innerHTML !== '') {
        highlight(parseInt(targetEle.querySelector('.cur-num').innerHTML))
      }else{
        highlight()
      }
    }
  }else{
    if (isEditGame) {
      recorder('add')
      if (targetNum === 0 || parseInt(nowTarget.querySelector('.cur-num').innerHTML) === targetNum) {
        check(y,x, 0)
        nowTarget.querySelector('.cur-num').innerHTML = ''
        nowTarget.classList.remove('default')
        grid[y][x].n = 0
        grid[y][x].d = false
      }else{
        check(y,x, targetNum)
        nowTarget.querySelector('.cur-num').innerHTML = targetNum
        nowTarget.classList.add('default')
        grid[y][x].n = targetNum
        grid[y][x].d = true
      }
    }else if (nowTarget.classList.contains('default') === false) {
      recorder('add')
      if (isMarkMode) {
        if (targetNum === 0) {
          markLabel.forEach(m=>{
            nowTarget.classList.remove(m)
            grid[y][x].m = []
          })
        }else{
          let markIndex = grid[y][x].m.indexOf(markLabel[targetNum - 1])
          if (markIndex === -1) {
            grid[y][x].m.push(markLabel[targetNum - 1])
          }else{
            grid[y][x].m.splice(markIndex, 1)
          }
          nowTarget.classList.toggle(markLabel[targetNum - 1])
        }
      }else{
        if (targetNum === 0 || parseInt(nowTarget.querySelector('.cur-num').innerHTML) === targetNum) {
          check(y,x, 0)
          nowTarget.querySelector('.cur-num').innerHTML = ''
          grid[y][x].n = 0
        }else{
          check(y,x, targetNum)
          nowTarget.querySelector('.cur-num').innerHTML = targetNum
          grid[y][x].n = targetNum
        }
      }
    }
    nowTarget.classList.add('fake-active')
    highlight(targetNum)
    reCalcLess()
  }
  console.timeEnd('setEle')
}

// 保存、加载面板
const panel = (type)=>{
  switch (type) {
    case 'close':
      document.querySelector('.panel').classList.remove('save-mode')
      document.querySelector('.panel').classList.remove('load-mode')
      if (isShowError) {
        document.body.classList.add('show-error')
      }
      break
    case 'save':
      document.querySelector('.panel').classList.add('save-mode')
      if (isShowError) {
        document.body.classList.remove('show-error')
      }
      break
    case 'load':
      document.querySelector('.panel').classList.add('load-mode')
      if (isShowError) {
        document.body.classList.remove('show-error')
      }
      break
  }
}

// 删除
const deleteGame = (id)=>{
  let saves = JSON.parse(localStorage.getItem('sudoku-save'))
  saves.splice(id, 1)
  localStorage.setItem('sudoku-save', JSON.stringify(saves))
  panelList()
}

// 加载保存的数据
const loadSave = (data)=>{
  reset('clear')
  reset('clear')
  grid = data.grid
  totalErr = data.er
  less = data.le
  totalLess = data.tle
  setGame(grid)
  time = ((new Date()).getTime() - data.dur)
  calcLess()
  panel('close')
  clearInterval(timer)
  timer = setInterval(() => {
    timerEle.innerHTML = parseInt(((new Date()).getTime() - time) / 1000)
  }, 500)
}

// 保存、加载
const saveLoad = (id)=>{
  if (document.querySelector('.panel').classList.contains('save-mode')) {
    let saves = JSON.parse(localStorage.getItem('sudoku-save'))
    if (id === undefined) {
      saves.push({grid, time: (new Date()).getTime(), dur: ((new Date()).getTime() - time), er:totalErr, le:less, tle:totalLess})
    }else{
      saves[id] = {grid, time: (new Date()).getTime(), dur: ((new Date()).getTime() - time), er:totalErr, le:less, tle:totalLess}
    }
    localStorage.setItem('sudoku-save', JSON.stringify(saves))
    panelList()
  }else{
    let saves = JSON.parse(localStorage.getItem('sudoku-save'))
    loadSave(saves[id])
  }
}

// 外部加载
const outsideLoader = (ev, value)=>{
  if (ev.key === 'Enter') {
    let isRight = true
    let data
    try {
      data = JSON.parse(value)
      if (!data.grid || data.grid.length !== 9) {
        console.log('a')
        throw false
      }
      data.grid.forEach(line=>{
        if (line.length !== 9) {
          console.log('b')
          throw false
        }
        line.forEach(block=>{
          if (typeof block.n !== 'number' || typeof block.d !== 'boolean' || typeof block.e !== 'number' || typeof block.m !== 'object') {
            console.log('c')
            throw false
          }
        })
      })
      if (typeof data.time !== 'number' || typeof data.dur !== 'number' || typeof data.er !== 'number' || typeof data.le !== 'object' || typeof data.le.length !== 9 || typeof data.tle !== 'number') {
        console.log('g')
        throw false
      }
    } catch (error) {
      isRight = false
      document.querySelector('.input input').value = ''
    }
    if (isRight) {
      loadSave(data)
      document.querySelector('.input').style.cssText = 'display:none;'
    }
  }
}

// 外部保存、加载
const saveLoadOutside = ()=>{
  document.querySelector('.input').style.cssText = ''
  if (document.querySelector('.panel').classList.contains('save-mode')) {
    document.querySelector('input').value = JSON.stringify({grid, time: (new Date()).getTime(), dur: ((new Date()).getTime() - time), er: totalErr, le:less, tle:totalLess})
    document.querySelector('input').select()
    document.execCommand('Copy')
    document.querySelector('input').disabled = true
  }else{
    document.querySelector('input').disabled = false
    document.querySelector('input').value = ''
    document.querySelector('input').focus()
  }
}

// 面板列表
const panelList = ()=>{
  document.querySelectorAll('.save-item').forEach(item=>item.remove())
  let saves = JSON.parse(localStorage.getItem('sudoku-save'))
  for (let i = 0; i < saves.length; i++) {
    const save = saves[i]
    let saveTime = new Date(save.time)
    let item = document.createElement('div')
    item.className = 'save-item'
    item.onclick = ()=>{saveLoad(i)}
    item.oncontextmenu = (ev)=>{
      ev.preventDefault()
      deleteGame(i)
    }
    let view = ''
    save.grid.forEach(line=>{
      view += '<div>'
      line.forEach(block=>{
        if (block.n !== 0) {
          view += '<div class="h"></div>'
        }else{
          view += '<div></div>'
        }
      })
      view += '</div>'
    })
    item.innerHTML = `<div class="view">${view}</div><div>${saveTime.getFullYear()}-${saveTime.getMonth()}-${saveTime.getDate()} ${saveTime.getHours()}:${saveTime.getMinutes()}:${saveTime.getSeconds()}</div><div>${save.dur / 1000}s</div>`
    document.querySelector('.save-load .content').insertBefore(item, document.querySelector('.save-load .content .save-new'))
  }
  document.querySelector('.save-title span').innerHTML = saves.length
  if (saves.length > 19) {
    document.querySelector('.save-new').style.display = 'none'
  }else{
    document.querySelector('.save-new').style.cssText = ''
  }
}

// 全屏
const switchFullScreen = ()=>{
  if (!!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.webkitFullScreen || document.msFullScreen)) {
    var element = document.documentElement
    if (window.ActiveXObject) {
      var WsShell = new ActiveXObject('WScript.Shell')
      WsShell.SendKeys('{F11}')
    }else if (element.requestFullScreen) {
      document.exitFullscreen()
    }else if (element.msRequestFullscreen) {
      document.msExitFullscreen()
    }else if (element.webkitRequestFullScreen) {
      document.webkitCancelFullScreen();
    }else if (element.mozRequestFullScreen) {
      document.mozCancelFullScreen()
    }
    document.querySelector('.full-screen>*').className = 'icon icon-full'
    document.body.classList.remove('full')
  }else{
    var element = document.documentElement
    if (window.ActiveXObject) {
      var WsShell = new ActiveXObject('WScript.Shell')
      WsShell.SendKeys('{F11}')
    }else if (element.requestFullScreen) {
      element.requestFullScreen()
    }else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen()
    }else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    }
    document.querySelector('.full-screen>*').className = 'icon icon-unfull'
    document.body.classList.add('full')
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  let darkmode = localStorage.getItem('sudoku-darkmode')
  if (darkmode === 'true') {
    document.documentElement.setAttribute('data-theme','dark')
  }else if (darkmode !== null) {
    document.documentElement.setAttribute('data-theme','light')
  }
  timerEle = document.querySelector('.time')
  timer = setInterval(() => {
    timerEle.innerHTML = parseInt(((new Date()).getTime() - time) / 1000)
  }, 500)
  if (localStorage.getItem('sudoku-save') === null) {
    localStorage.setItem('sudoku-save', '[]')
  }
  panelList()
  document.querySelector('input').onkeydown = (ev)=>{outsideLoader(ev,document.querySelector('input').value)}
})
