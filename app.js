(function () {
  'use strict';

  // ========== 从 anchor-life 提取：纯数据与时间法则（无 DOM） ==========
  const KEY_USERNAME = 'anchor_live_username';
  const KEY_PASSWORD = 'anchor_live_password';
  const KEY_DB = 'anchor_live_db';
  const KEY_ARCHIVE = 'anchor_live_archive';
  const KEY_LOG = 'anchor_live_log';
  const KEY_STATS = 'anchor_live_stats';
  const KEY_VISITED = 'anchor_has_visited_v55_personal';
  const KEY_RITUAL_MORNING = 'anchor_ritual_morning_v55';
  const KEY_RITUAL_NIGHT = 'anchor_ritual_night_v55';
  const KEY_LIVE_STATE = 'anchor_live_state_v69';
  const KEY_OPENED_DAYS = 'anchor_opened_days_v56';
  const KEY_POSTER_SHOWN_DAY = 'anchor_poster_shown_day_v56';
  const ONBOARDING_VISITED_KEY = 'anchor_visited_v8_0_spatial';
  let isSanctuaryVisible = localStorage.getItem('anchor_sanctuary_visible') !== 'false';

  var DAILY_POSTER_IMAGES = (function () {
    var arr = [];
    for (var i = 1; i <= 97; i++) {
      var n = i < 10 ? '0' + i : '' + i;
      arr.push('assets/images/daily_posters/poster' + n + '.jpg');
    }
    return arr.map(function (url) { return url + '?v=2'; });
  })();

  const CANDY_FAMILIES = [
    { id: 'draw', weight: 1, variants: ['doodle', 'doodle', 'coloring'] },
    { id: 'tactile', weight: 1, variants: ['bubble'] },
    { id: 'audio', weight: 1, variants: ['music', 'instrument'] },
    { id: 'visual', weight: 1, variants: ['fireworks'] }
  ];

  const MUSIC_CLIPS = [
    { title: '《这条小鱼在乎》王OK / 洪佩瑜', bvid: 'BV1yr421j7vr' },
    { title: '《多远都要在一起》—— 王橹杰（snn定制🍬）', bvid: 'BV1jTmMBqE4N' },
    { title: '《Reality》- 1980 年冠军单曲', bvid: 'BV1hr4y1v7k3' },
    { title: '《Young And Beautiful》', bvid: 'BV1vW411W7qZ' }
  ];

  // 糖果引擎状态变量
  let candyEatenThisSession = false;
  let lastCandyType = null;
  const coloringBgImg = new Image();
  let coloringBgImgLoaded = false;
  const BUBBLE_POP_URL = 'assets/audio/bubble-pop-short.mp3';
  const FIREWORK_POP_URL = 'assets/audio/firework-pop.wav';
  const STAR_SHINE_URL  = 'assets/audio/star-shinning.mp3';
  const BUBBLE_POP_FALLBACK_DATA = 'data:audio/wav;base64,UklGRl4RAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YToRAADgCvgQzhm/JWQ0mD1iPu9Br0eNXGxgY2GEaE1t225ldGp1onyYeXN6v30Le5h/hXwqcIBv1m38bNxgyF91WcpSdUpHSCY+2ixgKAMkyxVmCygDDf/19J3tUue02eTQ5MGYwJK5Z7IHpsGcwppjmXSWYZlAkYKSnpBFjEyQPY1ljTCSdJEgl5iX+aFbo/qqPrWTsNC55skGzarZfeH+6fXyw/bZ/BwJDhd/HhAgEy54MDA82UV2Sx5IZlhZXBVgiWT5aVxlX287amBzXG3Ha/FsL2E8Zm5Zx2EZX+xTaEoBRWhAaDRDJ/Urvh/CG1QNBALC/PTzgOvx46Dc+M3W0XjIrL/qtF60b65Hp5ehxp+toXGcR56slhGcnpwOnQecUJ+soQqnxql+tUm6WMTLx5zHhtRj21Hf6uqn9Ir+dQPkDHQXIyH/KqEzsTTnNso/jENHTcZRYk/NW8hcDlzKYeZguF8VZIldxF2gV7dW6E67T39HZD6UP0Y31i4iMHofbhhKB+YOdAFZ+UbklOWK3U7WUdQEz0DCS70DuvK3grM9qi2om6W+pO2g6aY6o+KlVatMqtOvCK/xuGPBzcK7yY7OpdXj2oDlJ/By84H6pQNFCrIXqhvtJP4sNTNyNjs+5EOBSHdLwFGsT9pPYlOKVYNW01Y6VchVvlFpToxHj0pcO049kDNYLeYmXCDNFhkNdQmhAAP3ivX85zjjRd3L04LMPsyawjG6PLuGurCwwawirmatA6wJtkax/rTits+1Wby3wXTDFsvVzRvXndyc54jn9/SO+KoBHgdEDPwWgR7/IkkslDBYMuA8Sj6bQ7pF7UtjTiBMWk6gSUtNd0htSOZGcUAjPYc+ojRNM4knxSFgGxAVFQoTBm/9'; // 截断版，足够触发后备机制

  coloringBgImg.src = '/assets/images/coloring_bg.png';
  coloringBgImg.onload = function () {
    coloringBgImgLoaded = true;
  };

  function getDayStartOffset() {
    return parseInt(localStorage.getItem('anchor_day_start_offset') || '0', 10);
  }

  function getAnchorDate(baseDate) {
    const d = baseDate ? new Date(baseDate) : new Date();
    const offsetHours = getDayStartOffset();
    if (d.getHours() < offsetHours) {
      d.setDate(d.getDate() - 1);
    }
    return d;
  }

  function saveDayStartOffset() {
    var sel = document.getElementById('dayStartOffset');
    if (!sel) return;
    var offset = sel.value;
    try {
        localStorage.setItem('anchor_day_start_offset', offset);
    } catch (e) {}
    
    // 👉 核心修复：改完时间后，无需刷新网页，全域自动对齐新时空！
    if (typeof updateTimeHorizon === 'function') updateTimeHorizon();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof sortDailyLogByTime === 'function') sortDailyLogByTime();
    
    if (typeof showToast === 'function') showToast('⏳ 时区已更新，全站时空已自动对齐');
}

  function getTodayDateStr() {
    const d = getAnchorDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`; }

  function initOpenedDays() {
    var today = getTodayDateStr();
    var raw = localStorage.getItem(KEY_OPENED_DAYS);
    var arr;
    try {
      arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch (e) {
      arr = [];
    }
    if (arr.indexOf(today) === -1) {
      arr.push(today);
      arr.sort(function (a, b) { return new Date(a).getTime() - new Date(b).getTime(); });
      localStorage.setItem(KEY_OPENED_DAYS, JSON.stringify(arr));
    }
    return arr.length;
  }

  // 记录本时段打卡图已处理（用于避免玄关与打卡图互锁）
  function markPosterPhase(phaseKey) {
    try {
      localStorage.setItem(phaseKey, '1');
    } catch (e) {
      // ignore quota / privacy errors
    }
  }

  // v8.0 自动打卡图入口（与玄关共享同一 phaseKey 度量衡）
  function showDailyPosterIfNeeded(openDaysCount) {
    var phase = (typeof getCurrentPhase === 'function') ? getCurrentPhase() : 'morning';
    var todayStr = (typeof getTodayDateStr === 'function') ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
    var phaseKey = 'anchor_poster_phase_v67_' + todayStr + '_' + phase;

    // 🚨 终极防线：彻底废除变量依赖，直接检测 v8 空间版暗号！新手绝对不弹打卡图！
    if (!localStorage.getItem('anchor_visited_v8_0_spatial')) {
      if (typeof markPosterPhase === 'function') markPosterPhase(phaseKey);
      return;
    }

    // 1. 如果已处理过，果断退场
    if (localStorage.getItem(phaseKey)) return;

    var overlay = document.getElementById('dailyPosterOverlay');
    var daySpan = document.getElementById('dailyPosterDayCount');
    if (!overlay || !daySpan) return;

    currentViewedPosterDay = openDaysCount;
    if (typeof updatePosterDisplay === 'function') {
        updatePosterDisplay(currentViewedPosterDay);
    }

    var unameEl = document.getElementById('dailyPosterUname');
    if (unameEl) unameEl.textContent = (typeof currentUsername !== 'undefined' && currentUsername && currentUsername !== 'Anchor') ? currentUsername : '你';

    overlay.style.display = 'flex';
    if (typeof markPosterPhase === 'function') markPosterPhase(phaseKey);
  }

  // 👉 v8.1 三时漫步与星光航迹计算引擎
  function updateTimeHorizon() {
    const fill = document.getElementById('horizonProgressFill');
    const text = document.getElementById('horizonProgressText');
    const starsLayer = document.getElementById('horizonStars');
    if (!fill || !text || !starsLayer) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const offsetHours = typeof getDayStartOffset === 'function' ? getDayStartOffset() : 0;
    
    // 计算基于夜猫子时钟的已流逝分钟数
    let elapsedMins = 0;
    if (currentHour >= offsetHours) {
        elapsedMins = (currentHour - offsetHours) * 60 + currentMin;
    } else {
        elapsedMins = (24 - offsetHours + currentHour) * 60 + currentMin;
    }
    
    // 限制在 0 - 1440 内并计算百分比
    const totalMinsInDay = 1440;
    let percentage = (elapsedMins / totalMinsInDay) * 100;
    if (percentage > 100) percentage = 100;

    // 👉 核心修复 1：使用 clip-path 裁剪代替 width 缩放，彻底解决渐变色挤压 Bug
    fill.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    
    // 👉 核心修复 2：分离小船，让小船独立跟随百分比行驶
    const boat = document.getElementById('horizonBoat');
    if (boat) boat.style.left = percentage + '%';
    
    // 计算剩余时间
    const remainingMins = 1440 - elapsedMins;
    const rH = Math.floor(remainingMins / 60);
    const rM = remainingMins % 60;
    const remainStr = (rH > 0 ? `${rH}h ` : '') + `${rM}m`;
    
    // 👉 核心修复 3：统计今日已采撷的锚点数（排除纯记录，只要有实际动作的足迹）
    let anchorCount = 0;
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        const anchorTodayStr = typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString();
        anchorCount = dailyLog.filter(l => l.date === anchorTodayStr && (l.done || l.isTrailer || l.isMilestone)).length;
    }
    
    // 👉 充满情绪价值与成就感的动态文案
    let baseText = '';
    if (percentage < 30) {
        baseText = anchorCount > 0 ? `晨光初绽，已采撷 ${anchorCount} 枚锚点` : `晨光初绽，前方有浩瀚的未知航线`;
    } else if (percentage < 70) {
        baseText = anchorCount > 0 ? `航行平稳，已留下 ${anchorCount} 处闪光足迹` : `时间充裕，稳稳地在当下航行`;
    } else if (percentage < 90) {
        baseText = anchorCount > 0 ? `满载而归，今日共收获 ${anchorCount} 枚锚点` : `夜色渐浓，准备温柔着陆`;
    } else {
        baseText = anchorCount > 0 ? `旧日将尽，带着 ${anchorCount} 份成就安睡` : `旧日将尽，感谢今天的陪伴`;
    }
    
    if (text) {
        text.innerHTML = `${baseText} <span style="opacity:0.5; margin-left:6px; font-family:monospace; font-size:0.9em;">(距着陆 ${remainStr})</span>`;
    }

    // --- 渲染星光航迹 ---
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        const anchorTodayStr = typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString();
        
        // 筛选今天的足迹
        const todaysLogs = dailyLog.filter(l => l.date === anchorTodayStr && l.timeStr);
        let starsHtml = '';
        todaysLogs.forEach(log => {
            const timeParts = (log.timeStr || '').split(':');
            if (timeParts.length >= 2) {
                const logH = parseInt(timeParts[0], 10);
                const logM = parseInt(timeParts[1], 10);
                
                if (isNaN(logH) || isNaN(logM)) return;

                let logElapsed = 0;
                if (logH >= offsetHours) {
                    logElapsed = (logH - offsetHours) * 60 + logM;
                } else {
                    logElapsed = (24 - offsetHours + logH) * 60 + logM;
                }
                
                let logPct = (logElapsed / totalMinsInDay) * 100;
                if (logPct > 100) logPct = 100;
                
                const posPercent = logPct;
                const vertOffset = -4;
                // 👉 v8.3.X 美学升级：轻与重共存于天空。花是璀璨的星，石头是淡淡的微尘。
                if (log.isMilestone || log.icon === '🌸' || log.isSoulFlower) {
                    starsHtml += `<div style="position: absolute; left: ${posPercent}%; top: ${vertOffset}px; font-size: 0.85rem; transform: translateX(-50%); text-shadow: 0 0 4px rgba(255,255,255,0.8); z-index: 4;">🌸</div>`;
                } else if (log.isBallastStone || log.icon === '🪨') {
                    starsHtml += `<div style="position: absolute; left: ${posPercent}%; top: ${vertOffset}px; font-size: 0.55rem; opacity: 0.5; transform: translateX(-50%); z-index: 3;">🪨</div>`;
                } else {
                    starsHtml += `<div style="position: absolute; left: ${posPercent}%; top: ${vertOffset}px; font-size: 0.6rem; transform: translateX(-50%); opacity: 0.8; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">✨</div>`;
                }
            }
        });
        starsLayer.innerHTML = starsHtml;
    }
  }

  // 在 DOMContentLoaded 中挂载周期刷新
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof updateTimeHorizon === 'function') {
      updateTimeHorizon();
      setInterval(updateTimeHorizon, 60000);
    }
  });

  function sortDailyLogByTime() {
    if (!Array.isArray(dailyLog)) return;
    dailyLog.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      const offset = typeof getDayStartOffset === 'function' ? getDayStartOffset() : 0;
      const getMins = (t) => {
        if (!t) return -1;
        const matches = (t || '').match(/(\d{1,2}):(\d{2})/g);
        if (!matches) return -1;
        const lastTime = matches[matches.length - 1];
        let [h, m] = lastTime.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m) && h < offset) h += 24;
        if (isNaN(h) || isNaN(m)) return -1;
        return h * 60 + m;
      };
      return getMins(b.timeStr) - getMins(a.timeStr);
    });
  }

  function spawnQuietConfetti() {
    var colors = ['#FFB6B9', '#A8E6CF', '#FDFD96', '#B5DEFF', '#FFDAC1', '#D5AAFF'];
    var count = 24;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      var clr = colors[Math.floor(Math.random() * colors.length)];
      var isTriangle = (i % 2 === 0);
      el.className = 'quiet-confetti ' + (isTriangle ? 'quiet-confetti--triangle' : 'quiet-confetti--square');
      el.style.left = (5 + Math.random() * 90) + '%';
      el.style.top = (15 + Math.random() * 25) + '%';
      if (isTriangle) {
        el.style.borderBottomColor = clr;
      } else {
        el.style.background = clr;
      }
      var dur = (2.8 + Math.random() * 1.4);
      var delay = (Math.random() * 0.5);
      el.style.animation = 'confettiFall ' + dur + 's linear ' + delay + 's forwards';
      frag.appendChild(el);
      (function (elem, ms) {
        setTimeout(function () { if (elem.parentNode) elem.parentNode.removeChild(elem); }, ms);
      })(el, (dur + delay) * 1000 + 300);
    }
    document.body.appendChild(frag);
  }

  function updateStatsUI() {
    var elWill = document.getElementById('stat-willpower');
    var elJoy = document.getElementById('stat-joy');
    if (elWill) elWill.innerText = userStats.willpower;
    if (elJoy) elJoy.innerText = userStats.joy;
  }

  function incrementStat(type) {
    if (type === 'willpower') { userStats.willpower++; if (typeof showToast === 'function') showToast("💪 意志力 +1"); }
    else if (type === 'joy') { userStats.joy++; if (typeof showToast === 'function') showToast("✨ 小确幸 +1"); }
    if (typeof updateStatsUI === 'function') updateStatsUI();
    save();
  }

  // ========== v8.1 探索式全息地图 Onboarding (Hub & Spoke) ==========
  //const ONBOARDING_VISITED_KEY = 'anchor_visited_v8_1_holo';
  let onboardingUnlockedRooms = [];
  let obCurrentState = 'lobby'; // 'lobby' | 'room' | 'done'
  let obCurrentRoomId = null;
  let obCurrentStepIndex = 0;

  // 剧本字典：大厅 + 5 个房间 (v8.2.X 终极导演剪辑版)
  const OB_SCRIPT = {
    lobby: '<div style="font-size:1.25rem; font-weight:900; margin-bottom:12px; color:#333; letter-spacing:1px;">🗺️ 欢迎登船，船长。<br>这里是 Anchor。</div><div style="font-size:0.9rem; margin-bottom:12px;">请点击以下任意一个舱室微缩图，开始全舰巡游：</div>',
    rooms: {
      4: [
        {
          targetId: '',
          text: '<div style="text-align:center;"><div style="color:#7A6F9E; margin-bottom:16px;"><div style="font-size:0.9rem; opacity:0.8; letter-spacing:2px; margin-bottom:4px;">第 1 站</div><div style="font-size:1.45rem; font-weight:900; letter-spacing:1px;">⚙️ 罗盘中枢</div></div>这里是整艘方舟的底层机房。一切数据的同步、偏好的设定，都在这里保管。</div><div style="display:block; width:100%; text-align:right; font-size:0.75rem; color:#888; margin-top:16px;">(点击黑屏，检视核心设备)</div>'
        },
        {
          targetId: 'onboardingUserZone',
          text: '🛂 <b>罗盘中枢 (1/4)：认领数字护照。</b><br>给你的船起个名字吧（作为云端的唯一标识）。设定后，你的足迹将真正属于你。'
        },
        {
          targetId: 'newCustomTagInp',
          text: '🏷️ <b>罗盘中枢 (2/4)：自定义标签。</b><br>系统自带的分类不够用？在这里造一个你专属的底层标签（比如：🎧 听播客）。'
        },
        {
          targetId: 'newCustomFilterInp',
          text: '🗂️ <b>罗盘中枢 (3/4)：组装专属筛选。</b><br>把几个标签打包成一个“专属抽屉”（比如限定只抽：室内+读书）。以后抽卡时，可以指定只抽这一个抽屉。'
        },
        { 
          targetId: 'dayStartOffset', 
          text: '🕰️ <b>罗盘中枢 (4/4)：专属时区。</b><br>夜猫子也有权定义自己的一天！在这里设定新一天的起点，凌晨打卡也会乖乖算作昨天。<br><span style="font-size:0.75rem; color:#888;">(点击黑屏继续)</span>' 
        },
        {
          targetId: 'manualCardWrapper',
          text: '🎉 <b>本舱巡航结束！</b><br>更多高阶玩法请翻看上方的「用户手册」。忘记怎么玩可随时点击【👀 重看新手引导】。<br><br>👉 <b>现在点击屏幕，返回大厅！</b>'
        }
      ],
      2: [
        {
          targetId: '',
          text: '<div style="text-align:center;"><div style="color:#D98850; margin-bottom:16px;"><div style="font-size:0.9rem; opacity:0.8; letter-spacing:2px; margin-bottom:4px;">第 2 站</div><div style="font-size:1.45rem; font-weight:900; letter-spacing:1px;">📥 星种之窗</div></div>这里是方舟的进货口。脑海中繁杂的念头、大项目、小目标，都请毫无负担地倾倒在这里。</div><div style="display:block; width:100%; text-align:right; font-size:0.75rem; color:#888; margin-top:16px;">(点击黑屏，检视入库履带)</div>'
        },
        {
          targetId: 'onboardingSingleTaskZone',
          text: '📥 <b>星种之窗 (1/3)：散装单次任务。</b><br>把琐事像撒鱼苗一样扔进这里，点【＋】号存入。系统会自动为你打上标签。'
        },
        {
          targetId: 'tagWormholeBtn',
          text: '⚙️ <b>星种之窗 (2/3)：标签虫洞。</b><br>看到这个齿轮了吗？它是个快捷传送门，能带你一键直达 04 区去管理标签。<br><span style="color:#d65a64;">（现在知道就行，先别点，以免跳出引导）</span>'
        },
        {
          targetId: 'onboardingGroupZone',
          text: '📦 <b>星种之窗 (3/3)：建立任务组。</b><br>如果任务太庞大，请在这里打包建项：<br>🌱 <b>无限工程</b>：无 KPI，只看累计投入。<br>🎯 <b>进度项目</b>：按件计费，完成不倒退。<br>⏳ <b>期限战役</b>：带倒计时的高压冲刺。'
        }
      ],
      1: [
        {
          targetId: '',
          text: '<div style="text-align:center;"><div style="color:#E06C75; margin-bottom:16px;"><div style="font-size:0.9rem; opacity:0.8; letter-spacing:2px; margin-bottom:4px;">第 3 站</div><div style="font-size:1.45rem; font-weight:900; letter-spacing:1px;">⚓️ 主舵甲板</div></div>这里是命运的交汇处。把决定权交给大海，钓起当下最适合你的锚点。</div><div style="display:block; width:100%; text-align:right; font-size:0.75rem; color:#888; margin-top:16px;">(点击黑屏，检视抽卡罗盘)</div>'
        },
        {
          targetId: 'energyPill',
          text: '🔋 <b>主舵甲板 (1/5)：感知状态。</b><br>我们不强迫努力。请根据当下的精力，拨动能量药丸，系统会自动过滤掉不适合现在的任务。'
        },
        {
          targetId: 'filterDrawerToggle',
          text: '🔽 <b>主舵甲板 (2/5)：高级筛选。</b><br>不想太随机？点开这里，你可以限定只在某个「专属筛选」或「具体项目」里抽卡，打造极致的心流隧道。'
        },
        {
          targetId: 'mainBtn',
          text: '🎲 <b>主舵甲板 (3/5)：交出决定权。</b><br>点击抽取，系统会为你钓起当下的挑战。用随机对抗有序，斩断选择困难症。'
        },
        {
          targetId: 'resultCard',
          text: '🃏 <b>主舵甲板 (4/5)：卡片决策演示。</b><br>抽出的任务会在这里出现。你可以选择【就它啦】开始专注计时，或者【换一个】。<br><span style="font-size:0.75rem; color:#888;">(点击黑屏继续)</span>'
        },
        { 
          targetId: 'btnDailyPoster', 
          text: '🌁 <b>主舵甲板 (5/5)：每日落幕。</b><br>一天结束时点击这里，一键汇总今天的【完成件数】与【专注时长】。<br><span style="font-size:0.75rem; color:#888;">(👉 <b>现在就点开它！</b>试着勾选定制项，体验一下保存功能。完成后点击黑屏继续)</span>' 
        }
      ],
      0: [
        {
          targetId: '',
          text: '<div style="text-align:center;"><div style="color:#4E9A51; margin-bottom:16px;"><div style="font-size:0.9rem; opacity:0.8; letter-spacing:2px; margin-bottom:4px;">第 4 站</div><div style="font-size:1.45rem; font-weight:900; letter-spacing:1px;">🚪 船长静室</div></div>这是全船唯一可以反锁的房间。没有KPI，没有任务，只有对你情绪的无条件接纳。这里永远允许你合法地逃避。</div><div style="display:block; width:100%; text-align:right; font-size:0.75rem; color:#888; margin-top:16px;">(点击黑屏，检视疗愈角落)</div>'
        },
        {
          targetId: 'onboardingStatsZone',
          text: '🛡️ <b>船长静室 (1/4)：情绪账户。</b><br>忍住了一次坏习惯点「意志力」，遇到微小开心点「小确幸」。给生命留点不费力的痕迹。'
        },
        {
          targetId: 'candyButton',
          text: '🍬 <b>船长静室 (2/4)：合法逃避区。</b><br>如果彻底瘫住了，点一下吃颗糖，玩玩气泡或涂鸦回血，玩够了再出发。<br><br><span style="font-size:0.75rem; color:#888;">(你可以直接在高亮处试着点一下)</span>'
        },
        {
          targetId: 'soulFlowerZone',
          text: '🌸 <b>船长静室 (3/4)：灵魂锚点。</b><br>镌刻今天最触动你的一句话，或是【记一次撑住】的至暗时刻。它会成为你生命图谱中最浪漫的星河。'
        },
        // 👉 新增：引导观星窗（星尘与黑洞）
        {
          targetId: 'observationWindowZone',
          text: '🔭 <b>船长静室 (4/4)：观星窗。</b><br><br>左侧 🌌「星尘」安放暂不落地的念头<br><span style="font-size:0.75rem; color:#888;">（如超预算但看着开心的购物单、不曾说出口的梦想）；</span><br><br>右侧 🕳️「黑洞」是灵魂的单向信箱<br><span style="font-size:0.75rem; color:#888;">（将无法消解的情绪写下，寄给无法收信的人）。</span><br><br>这里脱离因果，绝对私密，不留任何足迹。'
        }
      ],
      3: [
        {
          targetId: '',
          text: '<div style="text-align:center;"><div style="color:#4B9E9C; margin-bottom:16px;"><div style="font-size:0.9rem; opacity:0.8; letter-spacing:2px; margin-bottom:4px;">第 5 站</div><div style="font-size:1.45rem; font-weight:900; letter-spacing:1px;">🗄️ 万象生态舱</div></div>你撒下的鱼苗、走过的航海日志，都会稳稳地沉淀在这座货舱里，成为你存在过的坚实证据。</div><div style="display:block; width:100%; text-align:right; font-size:0.75rem; color:#888; margin-top:16px;">(点击黑屏，检视岁月痕迹)</div>'
        },
        {
          targetId: 'cabinetContent',
          text: '🗄️ <b>万象生态舱 (1/2)：专属清单与样板间。</b><br>这里为你准备了一个【无限工程】的样板间。你可以试着展开它，直接在上面打钩，感受进度增长的快乐。'
        },
        {
          targetId: 'heatmapCard',
          text: '🟩 <b>万象生态舱 (2/2)：岁月热力图。</b><br>你做过的每一件小事，都会在这里亮起一个绿格子。点击格子，下方的放映机会温柔地重播那天的记忆。'
        }
      ]
    }
  };

  // 👉 v8.1 修复：给打卡图和档案柜开启 VIP 通道，绝对不允许被新手引导的全局锁误伤
function obPreventScroll(e) { 
  if (
    e.target.closest('.daily-poster-card') ||
    e.target.closest('.cabinet-scroll-area') ||
    e.target.closest('#universeStardust') ||
    e.target.closest('#universeBlackhole')
  ) {
    return; // 结界放行：打卡图、档案柜、星尘宇宙与黑洞内可滑动/拖拽
  }
  e.preventDefault(); 
}

  function showObLobby() {
    obCurrentState = 'lobby';
    const tooltip = document.getElementById('onboardingTooltip');
    const holoMap = document.getElementById('holoMapContainer');
    const astrolabe = document.getElementById('spatialAstrolabe');
    const overlay = document.getElementById('onboardingOverlay');
    const spotlight = document.getElementById('onboardingSpotlight');

    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
      el.style.pointerEvents = '';
    });

    if (holoMap) holoMap.style.display = 'grid';
    if (astrolabe) astrolabe.style.zIndex = '';

    // 确保清除双重黑幕，恢复大厅单层黑幕
    if (overlay) overlay.style.setProperty('background', 'rgba(0, 0, 0, 0.65)', 'important');
    if (spotlight) spotlight.style.display = 'none';

    if (tooltip) {
      tooltip.style.display = 'block';
      tooltip.innerHTML = `
      <div style="font-size:0.9rem; color:#5D5C61; line-height:1.6; margin-bottom:8px;">${OB_SCRIPT.lobby}</div>
      `;
      // 最高指令：强行覆盖 CSS 设置 80px
      tooltip.style.setProperty('top', '80px', 'important');
      tooltip.style.setProperty('bottom', 'auto', 'important');
      tooltip.style.setProperty('left', '50%', 'important');
      tooltip.style.setProperty('transform', 'translateX(-50%)', 'important');
      tooltip.dataset.arrowDir = 'none';
    }
  }

  function enterObRoom(roomId) {
    obCurrentState = 'room';
    obCurrentRoomId = roomId;
    obCurrentStepIndex = 0;

    const mapEl = document.getElementById('holoMapContainer');
    if (mapEl) mapEl.style.display = 'none';

    if (window.anchorSwiper && typeof window.anchorSwiper.slideTo === 'function') {
      window.anchorSwiper.slideTo(roomId, 0);
    }

    // 唤醒原有的克隆星图，临时提权穿透黑幕
    const astrolabe = document.getElementById('spatialAstrolabe');
    if (astrolabe) {
      astrolabe.style.zIndex = '20005';
    }
    if (typeof wakeUpAstrolabe === 'function') wakeUpAstrolabe();

    playObRoomStep();
  }

  function playObRoomStep() {
    const steps = OB_SCRIPT.rooms[obCurrentRoomId];
    const tooltip = document.getElementById('onboardingTooltip');
    if (!steps || !tooltip) return;


    
    // 👉 每次切步时，先把可能伪造展示的卡片藏起来，防止污染后续操作
    const card = document.getElementById('resultCard');
    if (card && obCurrentState === 'room' && card.dataset.isMock === 'true') {
        card.style.display = 'none';
        card.dataset.isMock = 'false';
    }

    const step = steps[obCurrentStepIndex];
    if (!step) return;

    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
      el.style.pointerEvents = '';
    });

    // 预告片模式：无 targetId，只居中排版，保持黑幕隔离
    if (!step.targetId || step.targetId === '') {
      const overlay = document.getElementById('onboardingOverlay');
      const spotlight = document.getElementById('onboardingSpotlight');
      if (overlay) overlay.style.setProperty('background', 'rgba(0, 0, 0, 0.65)', 'important');
      if (spotlight) spotlight.style.display = 'none';
      tooltip.style.display = 'block';
      tooltip.innerHTML = step.text;
      tooltip.style.top = '40%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      tooltip.dataset.arrowDir = 'none';
      return;
    }
// 👉 核心防御：每次打光前，强制清场 01 区可能残留的遮挡物
if (String(obCurrentRoomId) === '1') {
  if (typeof toggleFilterDrawer === 'function' && typeof filterDrawerExpanded !== 'undefined' && filterDrawerExpanded) {
    toggleFilterDrawer(false);
  }
  const ritualOverlay = document.getElementById('ritualOverlay');
  if (ritualOverlay) ritualOverlay.style.display = 'none';
  const playlistOverlay = document.getElementById('playlistOverlay');
  if (playlistOverlay) playlistOverlay.style.display = 'none';
}

    const targetEl = document.getElementById(step.targetId);
    if (targetEl) {
      window.obOnboardingExtraTargets = [];

      // 👉 v8.2 全息星盘智能切页支持（防止打错光导致黑屏）
      // 1. 如果目标是 ID 输入框，强制星盘转到【📡 方舟】(索引4)
      if (step.targetId === 'onboardingUserZone' || step.targetId === 'settingUsernameInp') {
        if (typeof spinAstrolabe === 'function') spinAstrolabe(4, '📡 方舟');
      } 
      // 2. 如果目标是自定义标签或专属筛选，强制星盘转到【⚙️ 偏好】(索引3)
      else if (step.targetId === 'newCustomTagInp' || step.targetId === 'newCustomFilterInp') {
        if (typeof spinAstrolabe === 'function') spinAstrolabe(3, '⚙️ 偏好');
      }
      // 3. 如果目标是夜猫子时钟，强制星盘转到【⚙️ 偏好】(索引3)
      else if (step.targetId === 'dayStartOffset') {
        if (typeof spinAstrolabe === 'function') spinAstrolabe(3, '⚙️ 偏好');
      }
      // 4. 如果目标是用户手册大卡片，强制星盘转到【📖 手册】(索引0)
      else if (step.targetId === 'manualCardWrapper' || step.targetId === 'sec04Title') {
        if (typeof spinAstrolabe === 'function') spinAstrolabe(0, '📖 手册');
      }

      // 👉 核心修复：如果是深层折叠元素，强制展开其父级 details，防止高度为 0 导致定位失败黑屏
      const autoOpenTargets = ['onboardingUserZone', 'settingUsernameInp', 'dayStartOffset', 'newCustomTagInp', 'newCustomFilterInp'];
      if (autoOpenTargets.includes(step.targetId)) {
        const arkDetails = targetEl.closest('details');
        if (arkDetails) arkDetails.open = true;
      }

      // 👉 核心修复 2：如果是展示结果卡片那一步，强行把隐藏的卡片变出来，并填入示例数据
      if (step.targetId === 'resultCard' && typeof card !== 'undefined' && card) {
        card.style.display = 'block';
        card.dataset.isMock = 'true'; // 打上伪造标记
        const titleEl = document.getElementById('rTitle');
        if (titleEl) titleEl.innerText = '示例：读 30 页一直想看的书';
        const statusEl = document.getElementById('rStatus');
        if (statusEl) { statusEl.style.display = 'block'; statusEl.innerText = '📌 锚点 · 待确认'; }
        const ingEl = document.getElementById('rIngPulse');
        if (ingEl) ingEl.style.display = 'none';
        const badgeEl = document.getElementById('rBadge');
        if (badgeEl) badgeEl.innerHTML = '';
      }

      targetEl.classList.add('onboarding-highlight');

      // 👉 v8.2 补充连带高亮：车间 B 专属筛选 — 输入框 + 下方待勾选标签池
      if (step.targetId === 'newCustomFilterInp') {
        const tagSelector = document.getElementById('filterTagSelector');
        if (tagSelector) {
          tagSelector.classList.add('onboarding-highlight');
          window.obOnboardingExtraTargets.push(tagSelector);
        }
      }

      // 👉 v8.2 智能交互：光打到高级筛选时，自动拉开抽屉，并照亮抽屉内面板
      if (step.targetId === 'filterDrawerToggle') {
        if (typeof toggleFilterDrawer === 'function' && typeof filterDrawerExpanded !== 'undefined' && !filterDrawerExpanded) {
          toggleFilterDrawer(true);
        }
        const filterDrawerEl = document.getElementById('filterDrawer');
        if (filterDrawerEl) {
          filterDrawerEl.classList.add('onboarding-highlight');
          window.obOnboardingExtraTargets.push(filterDrawerEl);
        }
      }

      // 👉 糖果按钮连带高亮
      if (step.targetId === 'candyButton') {
        const candySec = document.getElementById('candySection');
        if (candySec) {
          candySec.classList.add('onboarding-highlight');
          window.obOnboardingExtraTargets.push(candySec);
        }
      }

      // 👉 日签沙盒特权
      if (step.targetId === 'btnDailyPoster' || step.targetId === 'observationWindowZone') {
        targetEl.style.pointerEvents = 'auto';
      } else {
        targetEl.style.pointerEvents = 'none';
      }

      // 👉 核心修复 3：封杀 00 和 01 区的物理滚动，保护 3D 引擎不被撕裂
      const noScrollRooms = ['0', '1'];
      const isProtectedRoom = noScrollRooms.includes(String(obCurrentRoomId));
      if (!isProtectedRoom && step.targetId !== 'onboardingUserZone') {
        if (step.targetId === 'manualCardWrapper') {
          // 👉 核心修复：彻底解决嵌套滚动（俄罗斯套娃）导致的顶穿天花板
          // 强行把外层房间和内层视口同时归零，绝对静止在顶部！
          const room04 = document.querySelector('.room-04');
          const vp = document.getElementById('sec04Viewport');
          if (room04) room04.scrollTo({ top: 0, behavior: 'smooth' });
          if (vp) vp.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // 普通元素，安全居中
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // 👉 核心修复 1：将延时提升至 450ms，彻底等 Swiper 滑动和 details 展开动画停稳！
      setTimeout(function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            const overlayOb = document.getElementById('onboardingOverlay');
            if (overlayOb) overlayOb.style.setProperty('background', 'transparent', 'important');
            tooltip.style.display = 'block';
            tooltip.innerHTML = `
          <div class="onboarding-step-counter">探索进度 ${obCurrentStepIndex + 1} / ${steps.length}</div>
          <div style="font-size:0.9rem; color:#5D5C61; line-height:1.6;">${step.text}</div>
          <div class="onboarding-hint">(点击黑屏继续)</div>
        `;

            const baseRect = targetEl.getBoundingClientRect();
            let minX = baseRect.left;
            let minY = baseRect.top;
            let maxX = baseRect.right;
            let maxY = baseRect.bottom;

            if (typeof window.obOnboardingExtraTargets !== 'undefined' && window.obOnboardingExtraTargets.length > 0) {
              window.obOnboardingExtraTargets.forEach(function (el) {
                if (!el) return;
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                  minX = Math.min(minX, r.left);
                  minY = Math.min(minY, r.top);
                  maxX = Math.max(maxX, r.right);
                  maxY = Math.max(maxY, r.bottom);
                }
              });
            }

            const unionWidth = maxX - minX;
            const unionHeight = maxY - minY;

            const spotlight = document.getElementById('onboardingSpotlight');
            if (spotlight) {
              spotlight.style.display = 'block';
              spotlight.style.left = (minX - 8) + 'px';
              spotlight.style.top = (minY - 8) + 'px';
              spotlight.style.width = (unionWidth + 16) + 'px';
              spotlight.style.height = (unionHeight + 16) + 'px';
              const computedStyle = window.getComputedStyle(targetEl);
              spotlight.style.borderRadius = computedStyle.borderRadius || '12px';
              spotlight.classList.add('show');
            }

            const tooltipRect = tooltip.getBoundingClientRect();
            let topPos = maxY + 12;
            tooltip.dataset.arrowDir = 'up';

            if (topPos + tooltipRect.height > window.innerHeight - 20) {
              topPos = minY - tooltipRect.height - 12;
              tooltip.dataset.arrowDir = 'down';
            }

            if (step.targetId === 'cabinetContent') {
              topPos = minY - tooltipRect.height - 20;
              if (topPos < 40) topPos = 40;
              tooltip.dataset.arrowDir = 'down';
            }
             // 👉 修复：02 区星种之窗输入区（气泡在下方，箭头朝上）
            if (step.targetId === 'onboardingSingleTaskZone') {
              topPos = maxY + 16; // 稳稳吸附在元素的脚底板下方 16px 处
              if (topPos + tooltipRect.height > window.innerHeight - 20) {
                topPos = window.innerHeight - tooltipRect.height - 20; // 触底保护
              }
              tooltip.dataset.arrowDir = 'up';
            }
            // 👉 修复：02 区任务组（气泡在上方，箭头朝下）
            if (step.targetId === 'onboardingGroupZone') {
              topPos = minY - tooltipRect.height - 16; // 稳稳坐在元素的天灵盖上方 16px 处
              if (topPos < 12) topPos = 12; // 触顶保护
              tooltip.dataset.arrowDir = 'down';
            }
            if (step && step.targetId === 'candyButton') {
              topPos = minY + 30;
              if (topPos < 12) topPos = 12;
              tooltip.dataset.arrowDir = 'up';
            }

            tooltip.dataset.arrowAlign = 'center';
            tooltip.style.left = '50%';
            if (step.targetId === 'btnDailyPoster') {
              tooltip.dataset.arrowAlign = 'right';
              tooltip.style.left = '70%';
              topPos += 5;
            } else if (step.targetId === 'dayStartOffset') {
              tooltip.dataset.arrowAlign = 'left';
            }

            if (step.targetId === 'resultCard') {
              topPos = minY - 140;
              if (topPos < 40) topPos = 40;
              tooltip.dataset.arrowDir = 'down';
            }

            tooltip.style.top = topPos + 'px';
            tooltip.style.transform = 'translateX(-50%)';

            if (step.targetId === 'resultCard') {
              tooltip.style.maxWidth = '360px';
              tooltip.style.width = '340px';
            } else {
              tooltip.style.maxWidth = '280px';
              tooltip.style.width = 'auto';
            }

            if (window.obResizeObserver) window.obResizeObserver.disconnect();
            window.obResizeObserver = new ResizeObserver(function () {
              const fr = targetEl.getBoundingClientRect();
              var uMinX = fr.left;
              var uMinY = fr.top;
              var uMaxX = fr.right;
              var uMaxY = fr.bottom;
              if (typeof window.obOnboardingExtraTargets !== 'undefined' && window.obOnboardingExtraTargets.length > 0) {
                window.obOnboardingExtraTargets.forEach(function (el) {
                  if (!el) return;
                  var r2 = el.getBoundingClientRect();
                  if (r2.width > 0 && r2.height > 0) {
                    uMinX = Math.min(uMinX, r2.left);
                    uMinY = Math.min(uMinY, r2.top);
                    uMaxX = Math.max(uMaxX, r2.right);
                    uMaxY = Math.max(uMaxY, r2.bottom);
                  }
                });
              }
              var uw = uMaxX - uMinX;
              var uh = uMaxY - uMinY;
              if (spotlight) {
                spotlight.style.left = (uMinX - 8) + 'px';
                spotlight.style.top = (uMinY - 8) + 'px';
                spotlight.style.width = (uw + 16) + 'px';
                spotlight.style.height = (uh + 16) + 'px';
              }
            });
            window.obResizeObserver.observe(targetEl);
            if (typeof window.obOnboardingExtraTargets !== 'undefined') {
              window.obOnboardingExtraTargets.forEach(function (ex) {
                if (ex) window.obResizeObserver.observe(ex);
              });
            }
          });
        });
      }, 450);
    }
  }

  function handleObClick(e) {
    if (obCurrentState === 'lobby') return; // 大厅只能点截图
    if (obCurrentState === 'done') {
      // 终极清场
      const overlay = document.getElementById('onboardingOverlay');
      if (overlay) overlay.style.display = 'none';
      const tooltip = document.getElementById('onboardingTooltip');
      if (tooltip) tooltip.style.display = 'none';
      if (window.obResizeObserver) window.obResizeObserver.disconnect();
      window.removeEventListener('wheel', obPreventScroll);
      window.removeEventListener('touchmove', obPreventScroll);
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
        el.style.pointerEvents = '';
      });
      // 👉 核心修复：彻底重置状态机，拆除上帝结界，将点击权归还给浏览器原生 DOM
    obCurrentState = 'idle';
    window.removeEventListener('click', window.obGlobalClickHandler, true);
      return;
    }
  
    if (obCurrentState === 'room') {
      obCurrentStepIndex++;
      const steps = OB_SCRIPT.rooms[obCurrentRoomId];
      if (obCurrentStepIndex < steps.length) {
        playObRoomStep();
      } else {
        onboardingUnlockedRooms.push(obCurrentRoomId);
        const tile = document.querySelector(`.holo-room-tile[data-room="${obCurrentRoomId}"]`);
        if (tile) {
          tile.classList.remove('locked');
          tile.classList.add('unlocked');
        }
        if (onboardingUnlockedRooms.length >= 5) {
          finishObAllClear();
        } else {
          showObLobby();
        }
      }
    }
  }

  function finishObAllClear() {
    obCurrentState = 'done';

    // 1. 彻底扒掉高亮，消灭追光灯（物理断电，不留残影）
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
        el.style.pointerEvents = '';
    });
    if (typeof lastTarget !== 'undefined' && lastTarget) lastTarget = null;

    const spotlight = document.getElementById('onboardingSpotlight');
    if (spotlight) {
        spotlight.classList.remove('show', 'fullscreen');
        spotlight.style.display = 'none';
        spotlight.style.opacity = '0';
        spotlight.style.boxShadow = 'none'; 
    }

    // 2. 👉 绝对防御：强行给底层 Overlay 上纯黑幕，无视任何 CSS 兼容失效问题
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.style.backgroundColor = 'rgba(15, 15, 20, 0.92)'; // 高级深邃黑幕
        overlay.style.opacity = '1';
    }

    const mapEl = document.getElementById('holoMapContainer');
    if (mapEl) mapEl.style.display = 'none';

    const tooltip = document.getElementById('onboardingTooltip');
    const skipBtn = document.getElementById('globalSkipObBtn');
    if (skipBtn) skipBtn.style.display = 'none';

    if (tooltip) {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        if (!isPWA) {
            // Safari 浏览器环境：展示 PWA 强烈建议
            tooltip.innerHTML = `
                <div style="text-align:center; padding: 4px 0;">
                    <div style="font-size:1.8rem; margin-bottom:8px;">✨</div>
                    <div style="font-size:1.1rem; font-weight:900; color:#d65a64; margin-bottom:10px;">最后一步：打造独立空间</div>
                    <div style="font-size:0.85rem; color:#555; line-height:1.7; text-align:left;">
                        强烈建议：点击浏览器底部「分享 <b>↑</b>」图标，选择「添加到主屏幕」。<br>
                        <span style="color:#d65a64; font-weight:bold;">Anchor 将变身为无边框的沉浸式 App！</span>
                    </div>
                </div>
            `;
            // 👉 核心修复：抛弃会崩溃的 max() 与 env()，改用百分比定轴 + translate 完美垂直居中，绝不切底！
            tooltip.style.top = '75%';
            tooltip.style.bottom = 'auto';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            tooltip.dataset.arrowDir = 'down';
            tooltip.dataset.arrowAlign = 'center';
        } else {
            // 已在 PWA 独立 App 内：只展示完结撒花
            tooltip.innerHTML = `
                <div style="text-align:center; padding: 10px 0;">
                    <div style="font-size:2.4rem; margin-bottom:12px;">🎉</div>
                    <div style="font-size:1.15rem; font-weight:900; color:#5D5C61; margin-bottom:12px; letter-spacing:1px;">全舰测绘完毕！</div>
                    <div style="font-size:0.85rem; color:#777; line-height:1.8; background:rgba(0,0,0,0.03); padding:12px; border-radius:8px;">
                        你的数字结界已在桌面完美展开。<br>
                        <span style="color:#5D5C61; font-weight:bold;">忘掉说明书，去创造属于你的痕迹吧。</span>
                    </div>
                </div>
            `;
            tooltip.style.top = '45%';
            tooltip.style.bottom = 'auto';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            tooltip.dataset.arrowDir = 'none';
            tooltip.dataset.arrowAlign = 'center';
        }
        tooltip.style.display = 'block'; // 强制确保气泡可见
    }

    // 记录通关
    try { if (typeof ONBOARDING_VISITED_KEY !== 'undefined') localStorage.setItem(ONBOARDING_VISITED_KEY, 'true'); } catch(e) {}

    if (typeof window.backToCenter === 'function') window.backToCenter();
    document.querySelectorAll('.room').forEach(function (room) {
      room.scrollTop = 0;
    });
    if (typeof setMode === 'function' && typeof mode !== 'undefined') setMode(mode);

    // 👉 核心修复 4：结束巡游时，强制执行浏览器级正骨，清零所有因为计算导致的意外偏移
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// 👉 v8.1.3 新增：逃生舱，随时强制退出新手引导并归还控制权
window.quitOnboarding = function() {
  // 1. 隐藏所有 UI (气泡、黑幕、九宫格全息地图)
  const overlay = document.getElementById('onboardingOverlay');
  if (overlay) overlay.style.display = 'none';
  const tooltip = document.getElementById('onboardingTooltip');
  if (tooltip) tooltip.style.display = 'none';
  const mapEl = document.getElementById('holoMapContainer');
  if (mapEl) mapEl.style.display = 'none';
  const skipBtn = document.getElementById('globalSkipObBtn');
  if (skipBtn) skipBtn.style.display = 'none';

  // 2. 彻底解除物理+框架锁 (归还原生滚动和 Swiper 滑动权)
  if (window.obPreventScroll) {
      window.removeEventListener('wheel', window.obPreventScroll);
      window.removeEventListener('touchmove', window.obPreventScroll);
  }
  document.body.classList.remove('onboarding-lock');
  document.documentElement.classList.remove('onboarding-lock');
  document.body.classList.remove('swiper-no-swiping');

  const outSwp = document.getElementById('outerSwiper')?.swiper || (typeof window !== 'undefined' ? window.swiper : null);
  const inSwp = document.getElementById('innerSwiper')?.swiper;
  if (outSwp) outSwp.allowTouchMove = true;
  if (inSwp) inSwp.allowTouchMove = true;

  // 3. 清理高亮残影
  document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
      el.style.pointerEvents = '';
  });

  // 4. 状态复位并打上记忆钢印
  obCurrentState = 'idle';
  try { if (typeof ONBOARDING_VISITED_KEY !== 'undefined') localStorage.setItem(ONBOARDING_VISITED_KEY, 'true'); } catch(e) {}

  if (typeof window.backToCenter === 'function') window.backToCenter();
  document.querySelectorAll('.room').forEach(function (room) {
    room.scrollTop = 0;
  });
  if (typeof setMode === 'function' && typeof mode !== 'undefined') setMode(mode);

  // 👉 核心修复 4：结束巡游时，强制执行浏览器级正骨，清零所有因为计算导致的意外偏移
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};



  // 覆盖老版入口：使用全息地图引擎
  function initOnboarding() {
    // 👉 核心修复：用 removeAttribute 撕掉所有的 JS 内联样式污染，把黑幕控制权还给纯净的 CSS 引擎！
    if (window.obOnboardingExtraTargets) {
      window.obOnboardingExtraTargets = [];
    }
    const spotlightWash = document.getElementById('onboardingSpotlight');
    if (spotlightWash) {
      spotlightWash.classList.remove('show', 'fullscreen');
      spotlightWash.removeAttribute('style');
    }
    const overlayWash = document.getElementById('onboardingOverlay');
    if (overlayWash) {
      overlayWash.removeAttribute('style');
      overlayWash.style.display = 'none';
    }
    if (window.obResizeObserver) {
      window.obResizeObserver.disconnect();
      window.obResizeObserver = null;
    }
    document.querySelectorAll('.onboarding-highlight').forEach(function (el) {
      el.classList.remove('onboarding-highlight');
      el.style.pointerEvents = '';
    });

    try {
      if (localStorage.getItem(ONBOARDING_VISITED_KEY)) return;
    } catch (e) {}

    const overlay = document.getElementById('onboardingOverlay');
    const tooltip = document.getElementById('onboardingTooltip');
    if (!overlay || !tooltip) return;

    onboardingUnlockedRooms = [];
    obCurrentState = 'lobby';
    obCurrentRoomId = null;
    obCurrentStepIndex = 0;

    window.addEventListener('wheel', obPreventScroll, { passive: false });
    window.addEventListener('touchmove', obPreventScroll, { passive: false });
    // 👉 锁死 3D 引擎：新手引导期间绝对禁止跨房间穿墙滑动
    if (typeof outerSwiper !== 'undefined' && outerSwiper) outerSwiper.allowTouchMove = false;
    if (typeof innerSwiper !== 'undefined' && innerSwiper) innerSwiper.allowTouchMove = false;
    
    const clone = overlay.cloneNode(true);
    overlay.parentNode.replaceChild(clone, overlay);
    const newOverlay = clone;

    newOverlay.style.display = 'block';

// 👉 延时锁死 3D 引擎：等待 Swiper 彻底初始化完成后再掐断动力，防止新用户加载时序冲突
setTimeout(() => {
  const outSwp = document.getElementById('outerSwiper');
  const inSwp = document.getElementById('innerSwiper');
  
  // 尝试通过 DOM 实例挂载点上锁
  if (outSwp && outSwp.swiper) outSwp.swiper.allowTouchMove = false;
  if (inSwp && inSwp.swiper) inSwp.swiper.allowTouchMove = false;
  
  // 尝试通过全局变量上锁 (双重保险)
  if (typeof outerSwiper !== 'undefined' && outerSwiper) outerSwiper.allowTouchMove = false;
  if (typeof innerSwiper !== 'undefined' && innerSwiper) innerSwiper.allowTouchMove = false;
}, 600);

// 👉 终极防御：打造独立于所有图层的全局逃生门
let skipBtn = document.getElementById('globalSkipObBtn');
if (!skipBtn) {
    skipBtn = document.createElement('div');
    skipBtn.id = 'globalSkipObBtn';
    skipBtn.innerHTML = '⏭️ 结束巡游';
    // 挂载在全站最高层，移至右下角，避免遮挡顶部 Header 按钮
    skipBtn.style.cssText = 'position:fixed; bottom:max(30px, env(safe-area-inset-bottom)); right:20px; z-index:999999; background:rgba(255,255,255,0.9); color:#555; padding:6px 12px; border-radius:20px; font-size:0.85rem; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2); pointer-events:auto;';
    
    // 双重物理绑定；pointerdown 优先于桌面端被全局 capture 吞噬的 click
    const triggerQuit = function(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }

      // 👉 解除封印：中途跳过巡游时，必须恢复原生上下滑动和 3D 引擎跨房滑动
      window.removeEventListener('wheel', obPreventScroll);
      window.removeEventListener('touchmove', obPreventScroll);
      document.body.classList.remove('onboarding-lock');
      if (typeof outerSwiper !== 'undefined' && outerSwiper) outerSwiper.allowTouchMove = true;
      if (typeof innerSwiper !== 'undefined' && innerSwiper) innerSwiper.allowTouchMove = true;

      // 强行隐藏遮罩和气泡，打扫战场
      const overlay = document.getElementById('onboardingOverlay');
      const tooltip = document.getElementById('onboardingTooltip');
      if (overlay) overlay.style.display = 'none';
      if (tooltip) tooltip.style.display = 'none';
      if (skipBtn) skipBtn.style.display = 'none';

      if (typeof quitOnboarding === 'function') quitOnboarding();
      else if (typeof window.quitOnboarding === 'function') window.quitOnboarding();
    };
    skipBtn.onpointerdown = triggerQuit;
    skipBtn.onclick = triggerQuit;
    skipBtn.ontouchend = triggerQuit;
    document.body.appendChild(skipBtn);
}
skipBtn.style.display = 'block';

    newOverlay.querySelectorAll('.holo-room-tile').forEach(tile => {
      tile.addEventListener('click', function (e) {
        if (obCurrentState !== 'lobby') return;
        e.stopPropagation();
        const roomId = parseInt(this.getAttribute('data-room'), 10);
        if (!Number.isNaN(roomId)) {
          enterObRoom(roomId);
        }
      });
    });

    showObLobby();

    // 👉 上帝结界：全局事件捕获，精准放行目标交互，拦截其余点击并推进引导
    window.removeEventListener('click', window.obGlobalClickHandler, true);
    window.obGlobalClickHandler = function(e) {
      // 👉 核心修复：给日签、清单浮层、观星窗/星尘弹窗发放免死金牌，绝对不拦截其内部的原生点击
      if (
        e.target.closest('#globalSkipObBtn') ||
        e.target.closest('#btnDailyPoster') ||
        e.target.closest('#dailyPosterOverlay') ||
        e.target.closest('#posterStudioPanel') ||
        e.target.closest('#playlistOverlay') ||
        e.target.closest('#projectConsoleOverlay') ||
        e.target.closest('.stardust-back-btn') ||
        e.target.closest('.stardust-universe-back-btn') ||
        e.target.closest('#stardustTextDialog') ||
        e.target.closest('.cold-dialog-backdrop') ||
        e.target.closest('.stardust-tool-btn') ||
        e.target.closest('#btnToolText') ||
        e.target.closest('#blackholeInput') ||
        e.target.closest('#blackholeOptions') ||
        e.target.closest('#thanosSnapContainer') ||
        e.target.closest('.void-input') ||
        e.target.closest('.blackhole-remnant')
      ) {
        return; // 结界放行：允许在新手引导期间自由点击返回按钮和弹窗
      }
      if (obCurrentState === 'lobby') {
        // 1. 如果是在大厅，且点在了九宫格舱室截图上：结界放行！允许进入房间！
        if (e.target.closest('.holo-room-tile')) {
          return; 
        }
        // 2. 如果点在大厅其他任意黑暗区域：结界绝对拦截！(防止底层乱摸和滑动)
        e.stopPropagation();
        e.preventDefault();
        return; 
      } 
      else if (obCurrentState === 'room') {
        // 👉 核心修复：只要点击的元素处于任何一个高亮区域内部，或者气泡内部，统统放行！
        const isHighlightArea = e.target.closest('.onboarding-highlight');
        const tooltipEl = document.getElementById('onboardingTooltip');
        
        if (isHighlightArea || (tooltipEl && tooltipEl.contains(e.target))) {
          return; // 结界放行，允许用户在这个安全的沙盒里真实点击互动！
        }
        
        // 点击黑暗区域：拦截底层误触，并推进新手引导剧本
        e.stopPropagation();
        e.preventDefault();
        handleObClick(e);
      } 
      else if (obCurrentState === 'done') {
        e.stopPropagation();
        e.preventDefault();
        
        // 👉 解除封印：正常走完巡游时，同样必须恢复所有的滑动权限
        window.removeEventListener('wheel', obPreventScroll);
        window.removeEventListener('touchmove', obPreventScroll);
        document.body.classList.remove('onboarding-lock');
        if (typeof outerSwiper !== 'undefined' && outerSwiper) outerSwiper.allowTouchMove = true;
        if (typeof innerSwiper !== 'undefined' && innerSwiper) innerSwiper.allowTouchMove = true;
        
        const skipBtn = document.getElementById('globalSkipObBtn');
        if (skipBtn) skipBtn.style.display = 'none';


        handleObClick(e);
      }
    };
    window.addEventListener('click', window.obGlobalClickHandler, true);
  }

  // v8.1 · 用户手册中的“重看新手引导”控制器
  window.restartOnboarding = function () {
    var ok = true;
    if (typeof window.confirm === 'function') {
      ok = window.confirm('是否重新播放新手引导？当前页面状态不会丢失。');
    }
    if (!ok) return;
    try {
      localStorage.removeItem('anchor_visited_v8_0_spatial');
      localStorage.removeItem(ONBOARDING_VISITED_KEY);
    } catch (e) {}
    if (typeof initOnboarding === 'function') {
      initOnboarding();
    }
  };

  /** 👉 v8.3.5：糖果舞台收起时恢复整个 soulFlowerZone（含 3D 手账本），彻底消除物理空隙 */
  function restoreSoulFlowerZone() {
    var z = document.getElementById('soulFlowerZone');
    if (z) z.style.display = 'block';
  }

  function handleCandyButtonClick() {
    var section = document.getElementById('candySection');
    var wrapper = document.querySelector('.stats-and-candy-wrapper');
    if (!section) return;
    var isVisible = section.style.display === 'block';
    
    // 👉 v8.1.3 空间雷达：判断当前是否在 00 房间
    var inRoom00 = (typeof innerSwiper !== 'undefined' && innerSwiper.activeIndex === 0);

    if (isVisible && inRoom00) {
        // 如果在 00 区且开着，正常收起
        section.style.display = 'none';
        if (wrapper) wrapper.classList.remove('candy-open');
        restoreSoulFlowerZone();
    } else {
        // 如果没开，或者人跑到别的房间了，强行折跃回 00 区并打开
        if (typeof anchorSwiper !== 'undefined') {
            anchorSwiper.slideTo(0);
        } else if (typeof innerSwiper !== 'undefined') {
            innerSwiper.slideTo(0);
        }
        openCandyEngine(); // 🚨 核心修复：必须调用此函数才能把糖果摆上舞台
    }
}

  function openCandyEngine() {
    var section = document.getElementById('candySection');
    var stage = document.getElementById('candyStageInner');
    var wrapper = document.querySelector('.stats-and-candy-wrapper');

    if (!section || !stage) {
      console.error('糖果舞台 DOM 丢失！');
      return;
    }

    section.style.display = 'block';
    if (wrapper) wrapper.classList.add('candy-open');

    // 👉 v8.3.5：整体隐藏 soulFlowerZone（含 3D 手账本），彻底消除 260px 物理占位
    var sfz = document.getElementById('soulFlowerZone');
    if (sfz) sfz.style.display = 'none';

    // 👉 核心修复：安全调用渲染引擎，防止内部报错卡死 UI，并直接输出错误信息
    try {
      if (typeof renderRandomCandy === 'function') {
        renderRandomCandy(stage);
      } else {
        stage.innerHTML = "<div style='padding:20px; color:#999;'>🍬 糖果机引擎函数丢失！</div>";
      }
    } catch (e) {
      console.error('糖果渲染崩溃:', e);
      stage.innerHTML = "<div style='padding:20px; color:#d65a64; font-size:0.8rem;'>⚠️ 糖果引擎卡住了:<br>" + e.message + "</div>";
    }
  }

  function closeCandyEngine() {
    var section = document.getElementById('candySection');
    var wrapper = document.querySelector('.stats-and-candy-wrapper');
    if (section) section.style.display = 'none';
    if (wrapper) wrapper.classList.remove('candy-open');
    restoreSoulFlowerZone();
  }

  var _openUniverseImpl = function (type) {
    if (type === 'stardust') {
      var sd = document.getElementById('universeStardust');
      if (sd) sd.style.display = 'block';
    }
    if (type === 'blackhole') {
      var bh = document.getElementById('universeBlackhole');
      if (bh) bh.style.display = 'block';
    }
  };

  var _bhRenderInterval = null;

  window.openUniverse = function (type) {
    _openUniverseImpl(type);
    if (type === 'blackhole') {
      if (typeof window.renderBlackholeRemnants === 'function') {
        window.renderBlackholeRemnants();
      }
      // 👉 每 10 秒刷新一次残影，实现用户停留期间的实时衰减
      if (_bhRenderInterval) clearInterval(_bhRenderInterval);
      _bhRenderInterval = setInterval(function () {
        if (typeof window.renderBlackholeRemnants === 'function') window.renderBlackholeRemnants();
      }, 10000);
    }
  };

  window.closeUniverse = function () {
    var sd = document.getElementById('universeStardust');
    var bh = document.getElementById('universeBlackhole');
    if (sd) sd.style.display = 'none';
    if (bh) bh.style.display = 'none';
    if (_bhRenderInterval) { clearInterval(_bhRenderInterval); _bhRenderInterval = null; }
  };

  // 👉 🕳️ 绝对黑洞逻辑引擎 (物理隔离，绝不触碰 db / dailyLog)
  function escapeBlackholeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.showBlackholeOptions = function () {
    var input = document.getElementById('blackholeInput');
    var options = document.getElementById('blackholeOptions');
    if (input && input.value.trim().length > 0 && options) {
      options.style.opacity = '1';
      options.style.pointerEvents = 'auto';
    }
  };

  window.hideBlackholeOptions = function () {
    var options = document.getElementById('blackholeOptions');
    if (options) {
      options.style.opacity = '0';
      options.style.pointerEvents = 'none';
    }
  };

  window.swallowEmotion = function (type) {
    var input = document.getElementById('blackholeInput');
    var snapContainer = document.getElementById('thanosSnapContainer');
    if (!input || input.value.trim() === '') return;

    var text = input.value.trim();
    window.hideBlackholeOptions();

    // 👉 仅 immediate：灭霸字级碎裂（项目内无 html2canvas，保持 char-dust 粒子化灰）
    if (type === 'immediate') {
      if (!snapContainer) return;
      input.style.display = 'none';
      snapContainer.innerHTML = '';
      snapContainer.style.display = 'block';

      text.split('').forEach(function (char, index) {
        if (char === '\n') {
          snapContainer.appendChild(document.createElement('br'));
          return;
        }
        if (char === ' ') {
          snapContainer.appendChild(document.createTextNode('\u00a0'));
          return;
        }
        var span = document.createElement('span');
        span.textContent = char;
        span.className = 'char-dust';
        span.style.setProperty('--tx', '0px');
        span.style.setProperty('--ty', '0px');
        span.style.setProperty('--rot', (Math.random() * 180 - 90) + 'deg');
        span.style.animationDelay = (index * 0.08) + 's';
        snapContainer.appendChild(span);
      });

      var charAnimMs = 3000;
      var perCharDelayMs = 80;
      var settleAfterSnapMs = Math.max(5000, (text.length - 1) * perCharDelayMs + charAnimMs + 400);
      setTimeout(function () {
        input.value = '';
        snapContainer.style.display = 'none';
        input.style.display = 'block';
      }, settleAfterSnapMs);
      return;
    }

    // 👉 2h / 24h：静默入渊，绝不触发粒子碎裂；温柔渐隐后清空并刷新残影
    if (type === '2h' || type === '24h') {
      var bhData = [];
      try { bhData = JSON.parse(localStorage.getItem('anchor_blackhole')) || []; } catch (e) {}
      var durationMap = { '2h': 2 * 60 * 60 * 1000, '24h': 24 * 60 * 60 * 1000 };
      bhData.push({
        id: 'bh_' + Date.now() + '_' + Math.floor(Math.random() * 1e9),
        text: text,
        startTime: Date.now(),
        duration: durationMap[type],
        top: Math.floor(Math.random() * 80 + 10) + '%',
        left: Math.floor(Math.random() * 80 + 10) + '%'
      });
      try { localStorage.setItem('anchor_blackhole', JSON.stringify(bhData)); } catch (e) {}

      input.style.transition = 'opacity 0.65s ease';
      input.style.opacity = '0';
      setTimeout(function () {
        input.value = '';
        input.style.opacity = '1';
        input.style.transition = '';
        if (typeof window.renderBlackholeRemnants === 'function') window.renderBlackholeRemnants();
        if (typeof showToast === 'function') showToast('情绪已抛入时间深渊');
      }, 650);
    }
  };

  window.renderBlackholeRemnants = function () {
    var container = document.getElementById('blackholeRemnants');
    if (!container) return;

    var bhData = [];
    try {
      bhData = JSON.parse(localStorage.getItem('anchor_blackhole')) || [];
    } catch (e) {}

    var now = Date.now();
    var survivingData = [];
    var html = '';

    bhData.forEach(function (item) {
      if (!item || typeof item.startTime !== 'number' || typeof item.duration !== 'number') return;
      if (!item.id) item.id = 'bh_' + Date.now() + '_' + Math.floor(Math.random() * 1e9);
      if (!item.top || !item.left) {
        item.top = Math.floor(Math.random() * 80 + 10) + '%';
        item.left = Math.floor(Math.random() * 80 + 10) + '%';
      }
      var elapsed = now - item.startTime;
      var progress = elapsed / item.duration;

      if (progress < 1) {
        survivingData.push(item);
        var currentOpacity = Math.max(0, 1.0 - (progress * 0.9));
        var currentBlur = progress * 6;
        var safe = escapeBlackholeHtml(item.text || '');
        var ridAttr = String(item.id).replace(/"/g, '').replace(/'/g, '').replace(/\\/g, '');
        html += '<div class="blackhole-remnant" data-bh-id="' + ridAttr + '" style="position:absolute; top:' + item.top + '; left:' + item.left + '; z-index:100000 !important; pointer-events:auto !important; transform:translate(-50%, -50%); color:#777; font-size:0.95rem; white-space:pre-wrap; text-align:center; opacity:' + currentOpacity + '; filter:blur(' + currentBlur + 'px); cursor:pointer; transition: all 1s ease; max-width:85vw; box-sizing:border-box;" onpointerdown="event.stopPropagation();event.preventDefault();if(window.salvageBlackholeRemnantById)window.salvageBlackholeRemnantById(\'' + ridAttr + '\');">' + safe + '</div>';
      }
    });

    container.innerHTML = html;
    localStorage.setItem('anchor_blackhole', JSON.stringify(survivingData));
  };

  /** 👉 v8.X 黑洞打捞：将未过期的残影无损迁入星尘宇宙（仅剥离计时字段） */
  function salvageBlackholeRemnantById(remnantId) {
    if (remnantId == null || remnantId === '') return;
    var bhData = [];
    try {
      bhData = JSON.parse(localStorage.getItem('anchor_blackhole')) || [];
    } catch (e) {}
    var idx = bhData.findIndex(function (it) {
      return it && String(it.id) === String(remnantId);
    });
    if (idx < 0) return;
    var raw = bhData[idx];
    var textKeep = String(raw.text || '').trim();
    if (!textKeep) return;
    if (!window.confirm('✨ 情绪已沉淀。要将这缕心绪从黑洞打捞，化作不灭的星尘吗？')) return;

    bhData.splice(idx, 1);
    try {
      localStorage.setItem('anchor_blackhole', JSON.stringify(bhData));
    } catch (e) {}

    var sx = (Math.random() - 0.5) * 800;
    var sy = (Math.random() - 0.5) * 800;
    if (typeof window.clientToSpaceCoord === 'function') {
      var sp = window.clientToSpaceCoord(window.innerWidth / 2, window.innerHeight / 2);
      sx = sp.x + (Math.random() - 0.5) * 160;
      sy = sp.y + (Math.random() - 0.5) * 160;
    }
    var newSid = Date.now() + Math.floor(Math.random() * 1000);
    if (typeof stardustTexts !== 'undefined' && Array.isArray(stardustTexts)) {
      stardustTexts.push({ id: newSid, text: textKeep, x: sx, y: sy });
    }
    if (typeof window.saveStardustTexts === 'function') window.saveStardustTexts();
    if (typeof window.renderBlackholeRemnants === 'function') window.renderBlackholeRemnants();
    if (typeof window.renderStardustTexts === 'function') window.renderStardustTexts();
    if (typeof showToast === 'function') showToast('🌟 打捞成功！它已化作星尘。');
  }
  window.salvageBlackholeRemnantById = salvageBlackholeRemnantById;

  // 收集所有当前可用的糖类型（去重）：用于“连续两次不能一样”的兜底逻辑
  function getAllCandyTypes() {
    const all = [];
    CANDY_FAMILIES.forEach(f => {
      if (Array.isArray(f.variants)) {
        f.variants.forEach(v => {
          if (!all.includes(v)) {
            all.push(v);
          }
        });
      }
    });
    return all;
  }

  // 从“糖家族”里选出本次要吃的糖：按家族权重选，并避免连续重复
  function pickCandyType() {
    // 只保留有有效 variants 的家族
    const enabledFamilies = CANDY_FAMILIES.filter(f => Array.isArray(f.variants) && f.variants.length > 0);
    if (enabledFamilies.length === 0) {
      return null;
    }

    // 计算总权重
    let totalWeight = 0;
    enabledFamilies.forEach(f => {
      const w = typeof f.weight === 'number' && f.weight > 0 ? f.weight : 1;
      totalWeight += w;
    });

    // 随机选家族
    let r = Math.random() * totalWeight;
    let chosenFamily = enabledFamilies;
    for (let f of enabledFamilies) {
      const w = typeof f.weight === 'number' && f.weight > 0 ? f.weight : 1;
      if (r <= w) {
        chosenFamily = f;
        break;
      }
      r -= w;
    }

    if (!chosenFamily || !chosenFamily.variants || chosenFamily.variants.length === 0) {
      return null;
    }

    // 在家族内部选一颗糖，同时尽量避免和 lastCandyType 一样
    let candidate = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const idx = Math.floor(Math.random() * chosenFamily.variants.length);
      candidate = chosenFamily.variants[idx];
      if (candidate !== lastCandyType) {
        break;
      }
    }

    // 如果尝试多次还是和上一次一样，就从所有糖里挑一个“不是上一次”的
    if (candidate === lastCandyType) {
      const all = getAllCandyTypes().filter(t => t !== lastCandyType);
      if (all.length > 0) {
        candidate = all[Math.floor(Math.random() * all.length)];
      }
    }

    // 更新记录，方便下一次“避免重复”
    lastCandyType = candidate;
    return candidate;
  }

  // 吃完糖 → 把 🍬 按钮变成低调版本（不是打勾，只是退居二线）
  function markCandyDone() {
    candyEatenThisSession = true;
    var btn = document.getElementById('candyButton');
    if (btn) {
      btn.classList.add('candy-used');
    }
  }

  async function safePlayAudio(audioEl, fallbackDataUrl) {
    try {
      audioEl.currentTime = 0;
      await audioEl.play();
      return true;
    } catch (e) {}

    if (fallbackDataUrl) {
      try {
        if (!audioEl.src || audioEl.src.indexOf('data:audio') !== 0) {
          audioEl.src = fallbackDataUrl;
          audioEl.load();
        }
        audioEl.currentTime = 0;
        await audioEl.play();
        return true;
      } catch (e) {}
    }
    return false;
  }

  const bubblePopAudio = new Audio(BUBBLE_POP_URL);
  bubblePopAudio.preload = 'auto';
  bubblePopAudio.volume = 1.0;
  bubblePopAudio.addEventListener('error', function () {
    try {
      bubblePopAudio.src = BUBBLE_POP_FALLBACK_DATA;
      bubblePopAudio.load();
    } catch (e) {}
  });

  const fireworkPopAudio = new Audio(FIREWORK_POP_URL);
  fireworkPopAudio.preload = 'auto';
  fireworkPopAudio.volume = 1.0;

  const starShineAudio = new Audio(STAR_SHINE_URL);
  starShineAudio.preload = 'auto';
  starShineAudio.loop = true;
  starShineAudio.volume = 0.65;

  let soundUnlocked = false;
  let currentCandyNeedsSound = false;

  function updateCandySoundButton(needsSound) {
    currentCandyNeedsSound = !!needsSound;
    var btn = document.getElementById('candySoundBtn');
    if (!btn) return;
    if (currentCandyNeedsSound && !soundUnlocked) {
      btn.style.display = 'inline-flex';
    } else {
      btn.style.display = 'none';
    }
  }

  // 👉 What & Why: 统一解锁机制。用户点一次按钮，强行用 0 秒播放唤醒 iOS Safari 的所有 Audio 实例和 WebAudio 上下文
  async function unlockAllCandySounds() {
    var btn = document.getElementById('candySoundBtn');

    // 尝试唤醒 WebAudio（作为兜底）
    try { getCandyAudioCtx(); } catch (e) {}

    // 逐个尝试强行唤醒，不要因为某个失败就中断
    try {
      bubblePopAudio.currentTime = 0;
      await bubblePopAudio.play();
      bubblePopAudio.pause();
    } catch (e) {}

    try {
      fireworkPopAudio.currentTime = 0;
      await fireworkPopAudio.play();
      fireworkPopAudio.pause();
    } catch (e) {}

    try {
      starShineAudio.currentTime = 0;
      await starShineAudio.play();
      starShineAudio.pause();
    } catch (e) {}

    // 不管实际是否发声，只要走到这里，就认为用户已经“尝试开启”并拿到了苹果的通行证
    soundUnlocked = true;
    if (typeof updateCandySoundButton === 'function') {
      updateCandySoundButton(currentCandyNeedsSound);
    }
  }
  // 👉 v8.0 核心修复：将音效解锁重新暴露给 HTML 按钮调用（防止 Undo 丢失）
  window.unlockAllCandySounds = unlockAllCandySounds;

  var _candyAudioCtx = null;
  function getCandyAudioCtx() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!_candyAudioCtx || _candyAudioCtx.state === 'closed') {
        _candyAudioCtx = new AC();
      }
      if (_candyAudioCtx.state === 'suspended') {
        _candyAudioCtx.resume().catch(function () {});
      }
    } catch (e) {
      _candyAudioCtx = null;
    }
    return _candyAudioCtx;
  }

  function playWebPop(f, dur) {
    if (f === void 0) f = 260;
    if (dur === void 0) dur = 0.10;
    var ctx = getCandyAudioCtx();
    if (!ctx) return;
    var t0 = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, f * 1.9), t0 + Math.max(0.02, dur * 0.35));
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  }

  function isStandaloneMode() {
    try {
      return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    } catch (e) {
      return false;
    }
  }

  // 00 区 · 船长静室「一朵花」桥接函数（确保始终在全局 window 下可用）
  // 👉 What & Why: 支持“再次点击反悔”与“专注态折叠”。打字时自动隐藏标语和最新记录，释放手账本有限的空间。
  window.currentSanctuaryType = 'flower';
  window.draftFlower = '';
  window.draftStone = '';

  window.switchSanctuaryType = function(type) {
    const inpRow = document.getElementById('sanctuaryFlowerInputRow');
    const slogan = document.getElementById('sanctuarySlogan');
    const latest = document.getElementById('latestFlowerDisplay');
    const inp = document.getElementById('sanctuaryFlowerInput');
    const isCurrentlyOpen = inpRow && (inpRow.style.display === 'flex' || inpRow.style.display === 'block');

    // 👉 核心逻辑：在切换或关闭前，默默保存当前输入框里的字到专属草稿本
    if (inp && window.currentSanctuaryType) {
      if (window.currentSanctuaryType === 'flower') window.draftFlower = inp.value;
      if (window.currentSanctuaryType === 'stone') window.draftStone = inp.value;
    }

    // 1. 如果点击的是当前已激活的按钮，且输入框开着 -> 执行“关闭/反悔”逻辑
    if (window.currentSanctuaryType === type && isCurrentlyOpen) {
      if (inpRow) inpRow.style.display = 'none';
      if (slogan) slogan.style.display = 'block';
      if (latest) latest.style.display = 'block';
      document.querySelectorAll('#sanctuaryTypeToggle .s-toggle').forEach(el => {
        el.classList.remove('active');
        el.style.fontWeight = 'normal';
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
        el.style.border = '1px dashed rgba(0,0,0,0.15)';
        el.style.color = '#999';
      });
      return;
    }

    // 2. 正常展开与切换逻辑
    window.currentSanctuaryType = type;
    if (inpRow) inpRow.style.display = 'flex';
    if (slogan) slogan.style.display = 'none';
    if (latest) latest.style.display = 'none';

    // 3. 更新 UI 高亮、Placeholder，并 👉 恢复专属草稿
    document.querySelectorAll('#sanctuaryTypeToggle .s-toggle').forEach(el => {
      if (el.dataset.type === type) {
        el.classList.add('active');
        el.style.fontWeight = 'bold';
        el.style.background = '#ffffff';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        if (type === 'flower') {
          el.style.border = '1px solid #FF9AA2';
          el.style.color = '#9A5B5B';
        } else {
          el.style.border = '1px solid #999';
          el.style.color = '#444';
        }
      } else {
        el.classList.remove('active');
        el.style.fontWeight = 'normal';
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
        el.style.border = '1px dashed rgba(0,0,0,0.15)';
        el.style.color = '#999';
      }
    });

    if (inp) {
      inp.placeholder = type === 'flower' ? '提炼今天最触动你的瞬间...' : '记录一次默默扛过的情绪风暴...';
      inp.style.color = type === 'flower' ? '#5A4A42' : '#444';
      inp.value = type === 'flower' ? window.draftFlower : window.draftStone;
      inp.focus();
    }
  };

  // 👉 What & Why: 控制花与石是否在外界(足迹/热力图)暴露，保护高敏感隐私
  window.toggleSanctuaryVisibility = function(checked) {
    isSanctuaryVisible = checked;
    localStorage.setItem('anchor_sanctuary_visible', checked);
    if (window.renderLog) renderLog();
    if (window.renderHistory) renderHistory();
    if (window.renderHeatmap) renderHeatmap();
  };

  window.toggleSanctuaryFlowerInput = function() {
    var row = document.getElementById('sanctuaryFlowerInputRow');
    var input = document.getElementById('sanctuaryFlowerInput');
    if (!row) return;
    var isHidden = row.style.display === 'none' || row.style.display === '';
    // What & Why: 展开必须走 switchSanctuaryType，避免先设 flex 再进入误触发“反悔关闭”分支
    if (isHidden) {
      if (typeof window.switchSanctuaryType === 'function') {
        window.switchSanctuaryType(window.currentSanctuaryType || 'flower');
      } else {
        row.style.display = 'flex';
      }
      if (input) setTimeout(function () { input.focus(); }, 100);
    } else {
      row.style.display = 'none';
      var slogan = document.getElementById('sanctuarySlogan');
      var latest = document.getElementById('latestFlowerDisplay');
      if (slogan) slogan.style.display = 'block';
      if (latest) latest.style.display = 'block';
      document.querySelectorAll('#sanctuaryTypeToggle .s-toggle').forEach(function(el) {
        el.classList.remove('active');
        el.style.fontWeight = 'normal';
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
        el.style.border = '1px dashed rgba(0,0,0,0.15)';
        el.style.color = '#999';
      });
    }
  };

  window.initLatestSanctuaryFlower = function() {
    var displayEl = document.getElementById('latestFlowerDisplay');
    if (!displayEl) return;
    if (typeof dailyLog === 'undefined' || !Array.isArray(dailyLog)) return;

    var todayStr = typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString();
    // What & Why: 封面只展示「花」高光；压舱石绝不占位（dailyLog 新在前，取当日首条花即可）
    var todayFlower = null;
    for (var fi = 0; fi < dailyLog.length; fi++) {
      var l = dailyLog[fi];
      if (!l || l.date !== todayStr || l.projectId) continue;
      if (l.isBallastStone === true || l.icon === '🪨') continue;
      if (l.isSoulFlower === true || l.isMilestone === true || l.type === 'milestone' || l.icon === '🌸') {
        todayFlower = l;
        break;
      }
    }

    if (todayFlower && todayFlower.title) {
      displayEl.innerHTML = '<span style="color:#FF9AA2; font-weight:bold;">🌸 ' + todayFlower.title + '</span>';
    } else {
      displayEl.innerHTML = '🌸 灵魂的锚点，静候花开...';
    }
  };

  window.saveSanctuaryFlower = function() {
    var inputEl = document.getElementById('sanctuaryFlowerInput');
    if (!inputEl) return;
    var text = inputEl.value.trim();
    if (!text) {
      if (typeof showToast === 'function') showToast("请输入灵魂锚点的内容哦~");
      return;
    }

    if (typeof dailyLog === 'undefined' || !Array.isArray(dailyLog)) return;
    // 👉 What & Why: 废除覆盖制，改为无限追加 (unshift)。允许一天记录无数次情绪切片。
    var isFlower = window.currentSanctuaryType === 'flower';
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    var targetDateStr = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toDateString();

    dailyLog.unshift({
      id: Date.now(),
      title: text,
      type: isFlower ? 'milestone' : 'sanctuary',
      icon: isFlower ? '🌸' : '🪨',
      isSoulFlower: isFlower,
      isBallastStone: !isFlower,
      isMilestone: isFlower, // 🚨 只有花保留里程碑特权（能在热力图顶部戴皇冠）
      date: targetDateStr,
      timeStr: timeStr
    });

    // What & Why: 写入后清空输入并回到封面态，连续记录时减少视觉噪音
    // 👉 落笔成功，不仅清空输入框，还要彻底撕毁对应的隐形草稿
    inputEl.value = '';
    if (isFlower) window.draftFlower = '';
    else window.draftStone = '';
    // 👉 保存完毕后，恢复封面默认状态的显示
    var slogan = document.getElementById('sanctuarySlogan');
    var latest = document.getElementById('latestFlowerDisplay');
    var inpRow = document.getElementById('sanctuaryFlowerInputRow');
    if (slogan) slogan.style.display = 'block';
    if (latest) latest.style.display = 'block';
    if (inpRow) inpRow.style.display = 'none';
    document.querySelectorAll('#sanctuaryTypeToggle .s-toggle').forEach(function(el) {
      el.classList.remove('active');
      el.style.fontWeight = 'normal';
      el.style.background = 'transparent';
      el.style.boxShadow = 'none';
      el.style.border = '1px dashed rgba(0,0,0,0.15)';
      el.style.color = '#999';
    });
    if (typeof save === 'function') save();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof renderHeatmap === 'function') renderHeatmap();
    if (typeof initLatestSanctuaryFlower === 'function') initLatestSanctuaryFlower();
    if (typeof renderSanctuaryTimeline === 'function') renderSanctuaryTimeline();
    if (typeof renderCabinet === 'function') renderCabinet();
    if (typeof showToast === 'function') showToast((isFlower ? "🌸 灵魂锚点已留印" : "🪨 压舱石已收纳"));
  };

  window.renderSanctuaryTimeline = function() {
    // 👉 What & Why: 完美复原 v8.3.2 以前的原版多层呼吸排版！保留白色光晕大圆点、双层折行展示，并融入最新的花石颜色逻辑。（_index 必须绑定 dailyLog 真实下标）
    const listEl = document.getElementById('sanctuaryTimelineList');
    if (!listEl) return;
    if (typeof dailyLog === 'undefined' || !Array.isArray(dailyLog)) return;

    const timelineMatch = function(l) {
      return l && (l.isSoulFlower || l.isBallastStone || l.isMilestone || l.icon === '🌸' || l.icon === '🪨' || l.type === 'milestone' || l.type === 'sanctuary');
    };

    try {
      const byDate = {};
      dailyLog.forEach(function(log, idx) {
        if (!timelineMatch(log)) return;
        const dStr = log.date || '未知日期';
        if (!byDate[dStr]) byDate[dStr] = [];
        const copy = Object.assign({}, log);
        copy._index = idx;
        byDate[dStr].push(copy);
      });

      const dateKeys = Object.keys(byDate);
      if (dateKeys.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; color:#999; font-size:0.8rem; padding: 10px;">暂无灵魂锚点，去种下第一朵花吧。</div>';
        return;
      }

      // 👉 核心视觉恢复 1：极其优雅的粉色虚线容器
      let html = '<div style="border-left: 2px dashed rgba(255,154,162,0.4); margin-left: 10px; padding-left: 14px; padding-bottom: 20px;">';

      dateKeys.sort(function(a, b) {
        let da = new Date(a).getTime();
        let db = new Date(b).getTime();
        if (isNaN(da)) da = 0;
        if (isNaN(db)) db = 0;
        return db - da;
      });

      dateKeys.forEach(function(dateStr) {
        // 👉 采用极具胶片感的等宽钢印格式：26.04.03
        const dObj = new Date(dateStr);
        const dateLabel = isNaN(dObj.getTime()) ? dateStr :
          String(dObj.getFullYear()).slice(2) + '.' + String(dObj.getMonth() + 1).padStart(2, '0') + '.' + String(dObj.getDate()).padStart(2, '0');

        // 📅 核心视觉恢复 2：带白色光晕阴影的大粉圆点
        html += '<div style="position:relative; margin-bottom: 10px; margin-top: 12px;">' +
          '<div style="position:absolute; left: -20px; top: 4px; width: 10px; height: 10px; background: #FF9AA2; border-radius: 50%; box-shadow: 0 0 0 3px rgba(255,255,255,0.8); z-index:2;"></div>' +
          '<div style="font-size:0.9rem; font-weight:bold; color:#5A4A42; margin-bottom: 8px; letter-spacing:0.5px;">' + dateLabel + '</div>';

        byDate[dateStr].slice().sort(function(a, b) {
          return (Number(b.id) || 0) - (Number(a.id) || 0);
        }).forEach(function(m) {
          if (!m) return;

          const isStone = m.isBallastStone || m.icon === '🪨';
          const textColor = isStone ? '#444' : '#9A5B5B';
          const dotColor = isStone ? '#999' : '#f8bbd0';
          const icon = m.icon || (isStone ? '🪨' : '🌸');

          let projSuffix = '';
          const targetId = m.projectId || m.taskId;
          if (targetId) {
            let pName = '';
            if (typeof db !== 'undefined' && Array.isArray(db)) {
              const pt = db.find(function(t) { return t && String(t.id) === String(targetId); });
              if (pt) pName = pt.title;
            }
            if (!pName && typeof archive !== 'undefined' && Array.isArray(archive)) {
              const pt = archive.find(function(t) { return t && String(t.id) === String(targetId); });
              if (pt) pName = pt.title;
            }
            if (!pName && typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) {
              const pl = customPlaylists.find(function(p) { return p && String(p.id) === String(targetId); });
              if (pl) pName = pl.title || pl.name;
            }
            if (pName) {
              const safePName = pName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
              projSuffix = ' <span style="font-size: 0.75rem; color: #999; font-style: italic; margin-left: 4px;">— [项目：' + safePName + ']</span>';
            }
          }

          const titleBody = (m.title || '未知记录').replace(/</g, '&lt;').replace(/>/g, '&gt;');

          let titleHtml = '<span style="cursor:pointer; color:' + textColor + '; font-weight:' + (isStone ? '600' : 'normal') + ';" onclick="if(window.showHistoryTaskDetail) window.showHistoryTaskDetail(\'log\', ' + m._index + ')">' + icon + ' ' + titleBody + '</span>';

          const editIcon = '<span style="font-size:0.7rem; opacity:0.4; margin-left:6px; cursor:pointer;" title="修改" onclick="event.stopPropagation(); if(window.showHistoryTaskDetail) window.showHistoryTaskDetail(\'log\', ' + m._index + ')">✏️</span>';

          // 🌸🪨 核心视觉恢复 3：双层呼吸排版，时间在上，文字在下
          html += '<div style="position:relative; margin-bottom: 8px; padding-left: 2px;">' +
            '<div style="position:absolute; left: -18px; top: 6px; width: 6px; height: 6px; background: ' + dotColor + '; border-radius: 50%; z-index:2;"></div>' +
            '<div style="font-size:0.75rem; color:#A0AAB2; margin-bottom: 2px; font-family: monospace;">' + (m.timeStr || '') + '</div>' +
            '<div style="position: relative; z-index: 50; text-align: left; padding: 2px 0 4px; margin: 0; font-size: 0.85rem; line-height: 1.5; width: 100%; max-width: 100%; box-sizing: border-box;">' +
            titleHtml + projSuffix + editIcon +
            '</div>' +
            '</div>';
        });
        html += '</div>';
      });

      html += '</div>';
      listEl.innerHTML = html;
    } catch (e) {
      console.error('岁月长卷崩溃真凶:', e);
      const elErr = document.getElementById('sanctuaryTimelineList');
      if (elErr) elErr.innerHTML = '<div style="color:red; font-size:0.8rem; padding:10px;">⚠️ 数据渲染受到幽灵数据干扰，请按 F12 查看控制台报错。</div>';
    }
  };


  window.toggleSanctuaryTimeline = function() {
    var listEl = document.getElementById('sanctuaryTimelineList');
    var toggleBtn = document.getElementById('sanctuaryTimelineToggle');
    if (!listEl || !toggleBtn) return;
    var isHidden = listEl.style.display === 'none' || listEl.style.display === '';
    if (isHidden) {
      listEl.style.display = 'block';
      toggleBtn.textContent = '︿ 收起岁月长卷';
      window.renderSanctuaryTimeline();
    } else {
      listEl.style.display = 'none';
      toggleBtn.textContent = '﹀ 展开岁月长卷';
    }
  };

  window.editSanctuaryFlower = function(flowerId) {
    if (typeof dailyLog === 'undefined' || !Array.isArray(dailyLog)) return;
    
    // 👉 核心修复：通过绝对唯一的时间戳 ID 寻找该条灵魂锚点，杜绝同日覆盖！
    var targetIndex = dailyLog.findIndex(function(l) {
        return String(l.id) === String(flowerId);
    });
    
    if (targetIndex === -1) {
        if (typeof showToast === 'function') showToast('⚠️ 找不到该记录，可能已被删除');
        return;
    }
    
    var log = dailyLog[targetIndex];
    
    // 调用原生 Prompt 进行轻量修改
    var newVal = prompt('✏️ 修改这朵灵魂锚点：', log.title);
    if (newVal !== null) {
        var trimmed = newVal.trim();
        if (trimmed) {
            dailyLog[targetIndex].title = trimmed;
            if (typeof showToast === 'function') showToast('✅ 锚点已更新');
        } else {
            // 如果用户清空了文本，温柔地确认是否删除
            if (confirm('内容为空。是否要彻底擦除这朵灵魂锚点？')) {
                dailyLog.splice(targetIndex, 1);
                if (typeof showToast === 'function') showToast('🗑️ 锚点已擦除');
            } else {
                return; // 用户取消擦除
            }
        }
        
        // 保存并全域刷新
        if (typeof save === 'function') save();
        if (typeof renderSanctuaryTimeline === 'function') renderSanctuaryTimeline();
        if (typeof renderLog === 'function') renderLog();
        if (typeof renderHistory === 'function') renderHistory();
    }
};


  function playBubblePopSound() {
    if (isStandaloneMode() && !soundUnlocked) return;
    safePlayAudio(bubblePopAudio, BUBBLE_POP_FALLBACK_DATA).then(function (ok) {
      if (!ok) {
        try { playWebPop(260, 0.10); } catch (e) {}
      }
    });
  }

  function playFireworkPopSound() {
    if (isStandaloneMode() && !soundUnlocked) return;
    safePlayAudio(fireworkPopAudio, null).then(function (ok) {
      if (!ok) {
        try { playWebPop(180, 0.12); } catch (e) {}
      }
    });
  }

  function startStarShineSound() {
    if (isStandaloneMode() && !soundUnlocked) return;
    try {
      if (starShineAudio && !starShineAudio.paused) return;
      if (!starShineAudio) return;
      starShineAudio.currentTime = 0;
      var p = starShineAudio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } catch (e) {}
  }

  function stopStarShineSound() {
    try {
      starShineAudio.pause();
    } catch (e) {}
  }

  // 👉 What & Why: 初始化按钮点击神经，必须在 DOM 加载后立刻通电
  function initCandySoundButton() {
    var btn = document.getElementById('candySoundBtn');
    if (!btn) return;
    // 防止重复绑定，先解绑再绑定
    btn.removeEventListener('click', unlockAllCandySounds);
    btn.addEventListener('click', unlockAllCandySounds);
  }

  // 确保在页面加载后通电
  document.addEventListener('DOMContentLoaded', initCandySoundButton);

  function renderRandomCandy(stageEl) {
    var t = pickCandyType() || 'bubble';
    if (typeof updateCandySoundButton === 'function') {
      updateCandySoundButton(t === 'bubble' || t === 'fireworks' || t === 'instrument');
    }
    if (t === 'bubble') renderBubbleCandy(stageEl);
    else if (t === 'doodle') renderDoodleCandy(stageEl);
    else if (t === 'coloring') renderColoringCandy(stageEl);
    else if (t === 'music') renderMusicCandy(stageEl);
    else if (t === 'instrument') renderInstrumentCandy(stageEl);
    else if (t === 'fireworks') renderFireworksCandy(stageEl);
    else renderBubbleCandy(stageEl);
  }

  function renderBubbleCandy(stageEl) {
    var cols = 6;
    var rows = 5;
    var total = cols * rows;
    var threshold = 8;
    var html = '<div class="bubble-grid">';
    for (var i = 0; i < total; i++) {
      html += '<button class="bubble" data-popped="0" type="button"></button>';
    }
    html += '</div>';
    html += '<div class="bubble-hint" id="bubbleHint">随便捏几个气泡，不用想太多。</div>';
    html += '<button type="button" id="bubbleToGachaBtn" class="bubble-to-gacha" style="display:none;">去抽卡</button>';
    stageEl.innerHTML = html;
    var popCount = 0;
    var bubbles = stageEl.querySelectorAll('.bubble');
    var hint = stageEl.querySelector('#bubbleHint');
    var toGachaBtn = stageEl.querySelector('#bubbleToGachaBtn');
    bubbles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.popped === '1') return;
        btn.dataset.popped = '1';
        btn.classList.add('bubble-popped');
        popCount++;
        playBubblePopSound();
        if (!candyEatenThisSession && popCount >= threshold) {
          markCandyDone();
          if (hint) hint.textContent = '好，这样就够啦，可以去抽一张卡。';
          if (toGachaBtn) toGachaBtn.style.display = 'block';
        }
      });
    });
    if (toGachaBtn) {
      toGachaBtn.addEventListener('click', function () {
        if (typeof window.backToCenter === 'function') window.backToCenter();
        var candySec = document.getElementById('candySection');
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone();
      });
    }
  }

  function renderMusicCandy(stageEl) {
    if (!Array.isArray(MUSIC_CLIPS) || MUSIC_CLIPS.length === 0) {
      renderBubbleCandy(stageEl);
      return;
    }
    var clip = MUSIC_CLIPS[Math.floor(Math.random() * MUSIC_CLIPS.length)];
    var html = '';
    html += '<div class="music-candy-card">';
    html += '  <div class="music-title">🎵 Anchor 启动歌单 · 随机一曲</div>';
    html += '  <div class="music-subtitle">' + clip.title + '</div>';
    html += '  <div class="music-player-wrapper">';
    html += '    <iframe class="music-player-iframe"';
    html += '            src="https://player.bilibili.com/player.html?bvid=' + clip.bvid + '&page=1&high_quality=1&autoplay=0"';
    html += '            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"';
    html += '            referrerpolicy="no-referrer-when-downgrade"';
    html += '            frameborder="0" scrolling="no"></iframe>';
    html += '  </div>';
    html += '  <div class="music-player-fallback">如果播放器加载不出来，可以点击右上角按钮在 B 站中完整播放。</div>';
    html += '  <div class="music-hint">建议只当作「启动 BGM」，听一小会儿就回到抽卡区，不被视频画面带走注意力。</div>';
    html += '  <button type="button" id="musicToGachaBtn" class="bubble-to-gacha">去抽卡</button>';
    html += '</div>';
    stageEl.innerHTML = html;
    var toGachaBtn = stageEl.querySelector('#musicToGachaBtn');
    if (toGachaBtn) {
      toGachaBtn.addEventListener('click', function () {
        if (!candyEatenThisSession) markCandyDone();
        if (typeof window.backToCenter === 'function') window.backToCenter();
        var candySec = document.getElementById('candySection');
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone();
      });
    }
  }

  function renderDoodleCandy(stageEl) {
    var html = '';
    html += '<div class="doodle-toolbar">';
    html += '  <div class="doodle-colors">';
    html += '    <button type="button" class="doodle-color doodle-color-active" data-color="#616161" style="background:#616161;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#FFCDD2" style="background:#FFCDD2;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#FFF9C4" style="background:#FFF9C4;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#BBDEFB" style="background:#BBDEFB;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#C8E6C9" style="background:#C8E6C9;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#F8BBD0" style="background:#F8BBD0;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#E1BEE7" style="background:#E1BEE7;"></button>';
    html += '  </div>';
    html += '  <button type="button" id="doodleClearBtn" class="doodle-clear-btn">清空</button>';
    html += '</div>';
    html += '<div class="doodle-canvas-wrapper swiper-no-swiping">';
    html += '  <canvas id="doodleCanvas"></canvas>';
    html += '</div>';
    html += '<div class="doodle-hint" id="doodleHint">随手画两笔就可以，不用好看。</div>';
    html += '<button type="button" id="doodleToGachaBtn" class="bubble-to-gacha" style="display:none;">去抽卡</button>';
    stageEl.innerHTML = html;
    var canvas = stageEl.querySelector('#doodleCanvas');
    var wrapper = stageEl.querySelector('.doodle-canvas-wrapper');
    var hint = stageEl.querySelector('#doodleHint');
    var toGachaBtn = stageEl.querySelector('#doodleToGachaBtn');
    var clearBtn = stageEl.querySelector('#doodleClearBtn');
    var colorBtns = stageEl.querySelectorAll('.doodle-color');
    if (!canvas || !wrapper) return;
    var wrapperWidth = wrapper.clientWidth || 260;
    var canvasHeight = 180;
    canvas.width = wrapperWidth;
    canvas.height = canvasHeight;
    var ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var drawing = false;
    var lastX = 0;
    var lastY = 0;
    var currentColor = '#616161';
    var hasDoodled = false;
    function getPos(evt) {
      var rect = canvas.getBoundingClientRect();
      var touch = evt.touches && evt.touches[0];
      var clientX = touch ? touch.clientX : evt.clientX;
      var clientY = touch ? touch.clientY : evt.clientY;
      if (clientX == null || clientY == null) return { x: lastX, y: lastY };
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      x = Math.max(0, Math.min(x, canvas.width));
      y = Math.max(0, Math.min(y, canvas.height));
      return { x: x, y: y };
    }
    function startDraw(evt) {
      evt.preventDefault();
      drawing = true;
      var pos = getPos(evt);
      lastX = pos.x;
      lastY = pos.y;
    }
    function draw(evt) {
      if (!drawing) return;
      evt.preventDefault();
      var pos = getPos(evt);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
      if (!hasDoodled) {
        hasDoodled = true;
        if (!candyEatenThisSession) markCandyDone();
        if (hint) hint.textContent = '很好，这样就够啦，可以去抽一张卡。';
        if (toGachaBtn) toGachaBtn.style.display = 'block';
      }
    }
    function endDraw(evt) {
      if (!drawing) return;
      drawing = false;
    }
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
    colorBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var color = btn.getAttribute('data-color');
        if (color) {
          currentColor = color;
          colorBtns.forEach(function (b) { return b.classList.remove('doodle-color-active'); });
          btn.classList.add('doodle-color-active');
        }
      });
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDoodled = false;
        if (hint) hint.textContent = '重新来一张也可以，随便画。';
        if (toGachaBtn) toGachaBtn.style.display = 'none';
      });
    }
    if (toGachaBtn) {
      toGachaBtn.addEventListener('click', function () {
        if (typeof window.backToCenter === 'function') window.backToCenter();
        var candySec = document.getElementById('candySection');
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone();
      });
    }
  }

  function renderColoringCandy(stageEl) {
    var html = '';
    html += '<div class="doodle-toolbar">';
    html += '  <div class="doodle-colors">';
    html += '    <button type="button" class="doodle-color doodle-color-active" data-color="#616161" style="background:#616161;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#FFCDD2" style="background:#FFCDD2;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#FFF9C4" style="background:#FFF9C4;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#BBDEFB" style="background:#BBDEFB;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#C8E6C9" style="background:#C8E6C9;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#F8BBD0" style="background:#F8BBD0;"></button>';
    html += '    <button type="button" class="doodle-color" data-color="#E1BEE7" style="background:#E1BEE7;"></button>';
    html += '  </div>';
    html += '  <div class="doodle-linewidth-group">';
    html += '    <button type="button" class="linewidth-btn linewidth-thin linewidth-active" data-width="6">细</button>';
    html += '    <button type="button" class="linewidth-btn linewidth-thick" data-width="12">粗</button>';
    html += '  </div>';
    html += '  <button type="button" id="coloringClearBtn" class="doodle-clear-btn">清空</button>';
    html += '</div>';
    html += '<div class="doodle-canvas-wrapper swiper-no-swiping">';
    html += '  <canvas id="coloringCanvas"></canvas>';
    html += '</div>';
    html += '<div class="doodle-hint" id="coloringHint">就像拿蜡笔随便涂几笔，不用很工整。</div>';
    html += '<button type="button" id="coloringToGachaBtn" class="bubble-to-gacha" style="display:none;">去抽卡</button>';
    stageEl.innerHTML = html;
    var canvas = stageEl.querySelector('#coloringCanvas');
    var wrapper = stageEl.querySelector('.doodle-canvas-wrapper');
    var hint = stageEl.querySelector('#coloringHint');
    var toGachaBtn = stageEl.querySelector('#coloringToGachaBtn');
    var clearBtn = stageEl.querySelector('#coloringClearBtn');
    var colorBtns = stageEl.querySelectorAll('.doodle-color');
    if (!canvas || !wrapper) return;
    var wrapperWidth = wrapper.clientWidth || 260;
    var canvasHeight = 180;
    canvas.width = wrapperWidth;
    canvas.height = canvasHeight;
    var ctx = canvas.getContext('2d');
    function drawLineArtBackground() {
      if (typeof coloringBgImg !== 'undefined' && coloringBgImgLoaded) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(coloringBgImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else if (typeof coloringBgImg !== 'undefined' && !coloringBgImgLoaded) {
        var onLoadOnce = function () {
          coloringBgImgLoaded = true;
          drawLineArtBackground();
          coloringBgImg.removeEventListener('load', onLoadOnce);
        };
        coloringBgImg.addEventListener('load', onLoadOnce);
      }
    }
    drawLineArtBackground();
    var painting = false;
    var lastX = 0;
    var lastY = 0;
    var currentColor = '#616161';
    var hasColored = false;
    var strokeSteps = 0;
    var threshold = 25;
    var currentLineWidth = 6;
    function getPos(evt) {
      var rect = canvas.getBoundingClientRect();
      var touch = evt.touches && evt.touches[0];
      var clientX = touch ? touch.clientX : evt.clientX;
      var clientY = touch ? touch.clientY : evt.clientY;
      if (clientX == null || clientY == null) return { x: rect.width / 2, y: rect.height / 2 };
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      x = Math.max(0, Math.min(x, canvas.width));
      y = Math.max(0, Math.min(y, canvas.height));
      return { x: x, y: y };
    }
    function startPaint(evt) {
      evt.preventDefault();
      painting = true;
      var pos = getPos(evt);
      lastX = pos.x;
      lastY = pos.y;
      drawStrokeTo(pos);
    }
    function drawStrokeTo(pos) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
      strokeSteps++;
      if (!hasColored && strokeSteps >= threshold) {
        hasColored = true;
        if (!candyEatenThisSession) markCandyDone();
        if (hint) hint.textContent = '很好，今天这页已经有颜色了，可以去抽一张卡。';
        if (toGachaBtn) toGachaBtn.style.display = 'block';
      }
    }
    function paint(evt) {
      if (!painting) return;
      evt.preventDefault();
      var pos = getPos(evt);
      drawStrokeTo(pos);
    }
    function endPaint(evt) {
      if (!painting) return;
      painting = false;
    }
    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('mousemove', paint);
    canvas.addEventListener('mouseup', endPaint);
    canvas.addEventListener('mouseleave', endPaint);
    canvas.addEventListener('touchstart', startPaint, { passive: false });
    canvas.addEventListener('touchmove', paint, { passive: false });
    canvas.addEventListener('touchend', endPaint);
    colorBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var color = btn.getAttribute('data-color');
        if (color) {
          currentColor = color;
          colorBtns.forEach(function (b) { return b.classList.remove('doodle-color-active'); });
          btn.classList.add('doodle-color-active');
        }
      });
    });
    var widthBtns = stageEl.querySelectorAll('.linewidth-btn');
    widthBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wVal = parseFloat(btn.getAttribute('data-width'));
        if (!isNaN(wVal)) {
          currentLineWidth = wVal;
          widthBtns.forEach(function (b) { return b.classList.remove('linewidth-active'); });
          btn.classList.add('linewidth-active');
        }
      });
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLineArtBackground();
        hasColored = false;
        strokeSteps = 0;
        if (hint) hint.textContent = '可以重新随便涂几笔，玩一玩就好。';
        if (toGachaBtn) toGachaBtn.style.display = 'none';
      });
    }
    if (toGachaBtn) {
      toGachaBtn.addEventListener('click', function () {
        if (typeof window.backToCenter === 'function') window.backToCenter();
        var candySec = document.getElementById('candySection');
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone();
      });
    }
  }

  function drawColoringTemplate(ctx, w, h, regionColors) {
    regionColors = regionColors || {};
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    var hillsTopY = h * 0.40;
    var hillsBottomY = h * 0.55;
    var lakeTopY = h * 0.55;
    var lakeBottomY = h * 0.75;
    var groundTopY = h * 0.75;
    ctx.beginPath();
    ctx.rect(0, 0, w, hillsTopY);
    ctx.fillStyle = regionColors.sky || '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(0, hillsTopY, w, hillsBottomY - hillsTopY);
    ctx.fillStyle = regionColors.sky || '#FFFFFF';
    ctx.fill();
    var hill1CX = w * 0.28;
    var hill1CY = (hillsTopY + hillsBottomY) / 2;
    var hill1RX = w * 0.40;
    var hill1RY = h * 0.25;
    ctx.beginPath();
    ctx.ellipse(hill1CX, hill1CY, hill1RX, hill1RY, 0, Math.PI, 0);
    ctx.lineTo(0, hillsBottomY);
    ctx.lineTo(0, hillsTopY);
    ctx.closePath();
    ctx.fillStyle = regionColors.hill1 || '#FFFFFF';
    ctx.fill();
    var hill2CX = w * 0.60;
    var hill2CY = (hillsTopY + hillsBottomY) / 2;
    var hill2RX = w * 0.35;
    var hill2RY = h * 0.23;
    ctx.beginPath();
    ctx.ellipse(hill2CX, hill2CY, hill2RX, hill2RY, 0, Math.PI, 0);
    ctx.lineTo(w, hillsBottomY);
    ctx.lineTo(w, hillsTopY);
    ctx.closePath();
    ctx.fillStyle = regionColors.hill2 || '#FFFFFF';
    ctx.fill();
    var lakeCX = w * 0.45;
    var lakeCY = (lakeTopY + lakeBottomY) / 2;
    var lakeRX = w * 0.42;
    var lakeRY = (lakeBottomY - lakeTopY) / 2;
    ctx.beginPath();
    ctx.ellipse(lakeCX, lakeCY, lakeRX, lakeRY, 0, 0, Math.PI * 2);
    ctx.fillStyle = regionColors.lake || '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, groundTopY);
    ctx.lineTo(w * 0.55, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = regionColors.ground || '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.45, groundTopY);
    ctx.lineTo(w, groundTopY + h * 0.05);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.55, h);
    ctx.closePath();
    ctx.fillStyle = regionColors.ground || '#FFFFFF';
    ctx.fill();
    var treeTrunkWidth = w * 0.05;
    var treeTrunkHeight = h * 0.26;
    var treeTrunkX = w * 0.78;
    var treeTrunkBottomY = h * 0.92;
    var treeTrunkY = treeTrunkBottomY - treeTrunkHeight;
    var treeCrownCX = treeTrunkX + treeTrunkWidth / 2;
    var treeCrownCY = h * 0.42;
    var treeCrownR = h * 0.18;
    ctx.beginPath();
    ctx.rect(treeTrunkX, treeTrunkY, treeTrunkWidth, treeTrunkHeight);
    ctx.arc(treeCrownCX, treeCrownCY, treeCrownR, 0, Math.PI * 2);
    ctx.fillStyle = regionColors.tree || '#FFFFFF';
    ctx.fill();
    var sunCX = w * 0.15;
    var sunCY = h * 0.16;
    var sunR = h * 0.07;
    ctx.beginPath();
    ctx.arc(sunCX, sunCY, sunR, 0, Math.PI * 2);
    ctx.fillStyle = regionColors.sun || '#FFFFFF';
    ctx.fill();
    if (coloringBgImgLoaded) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.drawImage(coloringBgImg, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.strokeStyle = '#D0D0D0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);
    }
    ctx.restore();
  }

  function renderInstrumentCandy(stageEl) {
    var threshold = 10;
    var playCount = 0;
    var mode = 'kalimba';
    var NOTES = [
      { num: '1', note: 'C', freq: 261.63 },
      { num: '2', note: 'D', freq: 293.66 },
      { num: '3', note: 'E', freq: 329.63 },
      { num: '4', note: 'G', freq: 392.00 },
      { num: '5', note: 'A', freq: 440.00 },
      { num: '6', note: 'C', freq: 523.25 },
      { num: '7', note: 'D', freq: 587.33 },
      { num: '8', note: 'E', freq: 659.25 }
    ];
    var CHORDS = [
      { label: 'Cmaj9', sub: '舒展', freqs: [261.63, 329.63, 392.00, 493.88, 587.33] },
      { label: 'Am9', sub: '柔和', freqs: [220.00, 261.63, 329.63, 392.00, 493.88] },
      { label: 'Fmaj7', sub: '明亮', freqs: [174.61, 220.00, 261.63, 329.63] },
      { label: 'G6', sub: '推进', freqs: [196.00, 246.94, 293.66, 392.00] },
      { label: 'Dm7', sub: '雾感', freqs: [293.66, 349.23, 392.00, 523.25] },
      { label: 'Em7', sub: '漂浮', freqs: [329.63, 392.00, 493.88, 587.33] },
      { label: 'Csus2', sub: '通透', freqs: [261.63, 293.66, 392.00, 523.25] },
      { label: 'Gsus4', sub: '张力', freqs: [196.00, 261.63, 293.66, 392.00] }
    ];
    var MELODY_SEQ = [0, 1, 2, 3, 4, 3, 2, 1, 0];
    var MAX_VOICES = 10;
    var activeVoices = 0;
    function afterPlayedOne() {
      playCount++;
      if (!candyEatenThisSession && playCount >= threshold) {
        markCandyDone();
        var hint = stageEl.querySelector('#instrumentHint');
        if (hint) hint.textContent = '好，这样就够啦，可以去抽一张卡。';
        var toGachaBtn = stageEl.querySelector('#instrumentToGachaBtn');
        if (toGachaBtn) toGachaBtn.style.display = 'block';
      }
    }
    function canPlayNow() {
      if (isStandaloneMode() && !soundUnlocked) {
        if (typeof showToast === 'function') showToast('先点右上角「开启音效」再试~');
        return false;
      }
      return true;
    }
    function makeVoice(ctx, opts) {
      var freq = opts.freq;
      var type1 = opts.type1 || 'sine';
      var type2 = opts.type2 || 'triangle';
      var detune2 = opts.detune2 !== undefined ? opts.detune2 : -7;
      var attack = opts.attack !== undefined ? opts.attack : 0.008;
      var peak = opts.peak !== undefined ? opts.peak : 0.55;
      var release = opts.release !== undefined ? opts.release : 1.2;
      var lp = opts.lp !== undefined ? opts.lp : 12000;
      var t0 = ctx.currentTime;
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();
      var filter = ctx.createBiquadFilter();
      osc1.type = type1;
      osc2.type = type2;
      osc1.frequency.setValueAtTime(freq, t0);
      osc2.frequency.setValueAtTime(freq * 2, t0);
      osc2.detune.setValueAtTime(detune2, t0);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(lp, Math.max(1200, freq * 10)), t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + release);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + release + 0.05);
      osc2.stop(t0 + release + 0.05);
      activeVoices++;
      setTimeout(function () { activeVoices = Math.max(0, activeVoices - 1); }, (release + 0.08) * 1000);
    }
    function playKalimbaTone(freq) {
      if (!canPlayNow()) return;
      if (activeVoices >= MAX_VOICES) return;
      var ctx = getCandyAudioCtx();
      if (!ctx) return;
      makeVoice(ctx, { freq: freq, attack: 0.008, peak: 0.55, release: 1.25, lp: 14000 });
    }
    function playPadChord(freqs) {
      if (!canPlayNow()) return;
      var ctx = getCandyAudioCtx();
      if (!ctx) return;
      freqs.forEach(function (f, k) {
        if (activeVoices >= MAX_VOICES) return;
        setTimeout(function () {
          makeVoice(ctx, { freq: f, type1: 'sine', type2: 'sine', detune2: 3, attack: 0.02, peak: 0.22, release: 1.85, lp: 9000 });
        }, k * 14);
      });
    }
    function renderBody() {
      var body = stageEl.querySelector('#instrumentBody');
      var sub = stageEl.querySelector('#instrumentSub');
      if (!body) return;
      if (mode === 'kalimba') {
        if (sub) sub.textContent = '五声音阶：随便按也好听。余音会叠在一起，像轻轻的和弦。';
        var h = '<div class="kalimba-keys">';
        NOTES.forEach(function (n, i) {
          h += '<button type="button" class="kalimba-key" data-i="' + i + '">';
          h += '  <div class="kalimba-num">' + n.num + '</div>';
          h += '  <div class="kalimba-note">' + n.note + '</div>';
          h += '</button>';
        });
        h += '</div>';
        h += '<div class="instrument-actions">';
        h += '  <button type="button" id="kalimbaChordBtn">随机和弦</button>';
        h += '  <button type="button" id="kalimbaMelodyBtn">小旋律</button>';
        h += '</div>';
        body.innerHTML = h;
        body.querySelectorAll('.kalimba-key').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var i = parseInt(btn.getAttribute('data-i') || '0', 10);
            var n = NOTES[i] || NOTES[0];
            playKalimbaTone(n.freq);
            afterPlayedOne();
          });
        });
        var chordBtn = body.querySelector('#kalimbaChordBtn');
        if (chordBtn) {
          chordBtn.addEventListener('click', function () {
            var chordPools = [[0, 2, 4], [1, 3, 4], [0, 3, 4], [2, 4, 6]];
            var chord = chordPools[Math.floor(Math.random() * chordPools.length)];
            chord.forEach(function (idx, k) {
              setTimeout(function () {
                var n = NOTES[idx] || NOTES[0];
                playKalimbaTone(n.freq);
                afterPlayedOne();
              }, k * 55);
            });
          });
        }
        var melodyBtn = body.querySelector('#kalimbaMelodyBtn');
        if (melodyBtn) {
          melodyBtn.addEventListener('click', function () {
            MELODY_SEQ.forEach(function (idx, k) {
              setTimeout(function () {
                var n = NOTES[idx] || NOTES[0];
                playKalimbaTone(n.freq);
                afterPlayedOne();
              }, k * 160);
            });
          });
        }
      } else {
        if (sub) sub.textContent = 'Chord Pad：一按就是一团和声氛围。可以叠按，越按越有空间感。';
        var h = '<div class="chordpad-grid">';
        CHORDS.forEach(function (c, i) {
          h += '<button type="button" class="chordpad-pad" data-i="' + i + '">';
          h += '  <span class="chordpad-label">' + c.label + '</span>';
          h += '  <span class="chordpad-sub">' + c.sub + '</span>';
          h += '</button>';
        });
        h += '</div>';
        body.innerHTML = h;
        body.querySelectorAll('.chordpad-pad').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var i = parseInt(btn.getAttribute('data-i') || '0', 10);
            var c = CHORDS[i] || CHORDS[0];
            playPadChord(c.freqs);
            afterPlayedOne();
          });
        });
      }
    }
    stageEl.innerHTML = [
      '<div class="instrument-card">',
      '<div class="instrument-title">🎶 乐器糖</div>',
      '<div class="instrument-sub" id="instrumentSub"></div>',
      '<div class="instrument-tabs">',
      '<button type="button" class="instrument-tab active" id="tabKalimba">Kalimba</button>',
      '<button type="button" class="instrument-tab" id="tabChord">Chord Pad</button>',
      '</div>',
      '<div id="instrumentBody"></div>',
      '<div class="bubble-hint" id="instrumentHint">随便按几下，不用弹得「好听」。</div>',
      '<button type="button" id="instrumentToGachaBtn" class="instrument-to-gacha" style="display:none;">去抽卡</button>',
      '</div>'
    ].join('');
    var tabK = stageEl.querySelector('#tabKalimba');
    var tabC = stageEl.querySelector('#tabChord');
    function setMode(next) {
      if (mode === next) return;
      mode = next;
      if (tabK) tabK.classList.toggle('active', mode === 'kalimba');
      if (tabC) tabC.classList.toggle('active', mode === 'chord');
      renderBody();
    }
    if (tabK) tabK.addEventListener('click', function () { setMode('kalimba'); });
    if (tabC) tabC.addEventListener('click', function () { setMode('chord'); });
    renderBody();
    var toGachaBtn = stageEl.querySelector('#instrumentToGachaBtn');
    if (toGachaBtn) {
      toGachaBtn.addEventListener('click', function () {
        if (typeof window.backToCenter === 'function') window.backToCenter();
        var candySec = document.getElementById('candySection');
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone();
      });
    }
  }

  function renderFireworksCandy(stageEl) {
    var thresholdFire = 8;
    var thresholdStar = 6;
    var maxRunMs = 80000;
    var mode = 'fireworks';
    var burstCount = 0;
    var strokeCount = 0;
    var startedAt = Date.now();
    var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var html = '';
    html += '<div class="fireworks-candy-card">';
    html += '  <div class="fireworks-topbar">';
    html += '    <div class="mode-switch">';
    html += '      <button type="button" class="mode-btn" id="fwModeFire">烟花</button>';
    html += '      <button type="button" class="mode-btn" id="fwModeStar">星空</button>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="fireworks-hint" id="fwHint"></div>';
    html += '  <div class="fireworks-canvas-wrap swiper-no-swiping">';
    html += '    <canvas id="fwCanvas" aria-label="Fireworks / Stars"></canvas>';
    html += '  </div>';
    html += '  <button type="button" id="fwToGachaBtn" class="bubble-to-gacha" style="display:none;">去抽卡</button>';
    html += '</div>';
    stageEl.innerHTML = html;
    var canvas = stageEl.querySelector('#fwCanvas');
    var wrap = stageEl.querySelector('.fireworks-canvas-wrap');
    var ctx = canvas.getContext('2d');
    var hint = stageEl.querySelector('#fwHint');
    var btnFire = stageEl.querySelector('#fwModeFire');
    var btnStar = stageEl.querySelector('#fwModeStar');
    var toGachaBtn = stageEl.querySelector('#fwToGachaBtn');
    canvas.style.touchAction = 'none';
    var dpr = 1;
    function fitCanvas() {
      var rect = (wrap || canvas).getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width));
      var h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min((window.devicePixelRatio || 1), isMobile ? 1.5 : 2);
      var pxW = Math.floor(w * dpr);
      var pxH = Math.floor(h * dpr);
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    function clearFrame(alpha) {
      fitCanvas();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(10, 12, 24, ' + alpha + ')';
      var cw = (wrap && wrap.clientWidth) ? wrap.clientWidth : canvas.clientWidth;
      var ch = (wrap && wrap.clientHeight) ? wrap.clientHeight : canvas.clientHeight;
      ctx.fillRect(0, 0, cw, ch);
    }
    var rafId = 0;
    var running = false;
    var isDown = false;
    var lastSpawnAt = 0;
    var fwParticles = [];
    var fwPalette = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#B983FF', '#FF9F1C', '#F72585', '#00BBF9'];
    function spawnBurstFW(x, y) {
      var count = 42;
      var base = fwPalette[Math.floor(Math.random() * fwPalette.length)];
      for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = 1.2 + Math.random() * 3.2;
        fwParticles.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: 0.012 + Math.random() * 0.016,
          r: 1.2 + Math.random() * 1.8,
          color: base
        });
      }
    }
    var starParticles = [];
    var starPalette = ['rgba(255,255,255,0.95)', 'rgba(217,242,255,0.95)', 'rgba(190,227,255,0.95)', 'rgba(242,233,255,0.95)', 'rgba(255,232,244,0.95)'];
    var lastPt = null;
    var dragProgress = 0;
    var lastFrameAt = 0;
    function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
    function getStarSpread() {
      var t = clamp(dragProgress / 260, 0, 1);
      return 2.2 + t * 10.2;
    }
    function spawnStarDots(x, y, spread) {
      var n = isMobile ? (4 + Math.floor(Math.random() * 3)) : (6 + Math.floor(Math.random() * 5));
      var maxParticles = isMobile ? 220 : 520;
      for (var i = 0; i < n; i++) {
        var c = starPalette[Math.floor(Math.random() * starPalette.length)];
        var ox = (Math.random() - 0.5) * spread;
        var oy = (Math.random() - 0.5) * spread;
        var life = isMobile ? (34 + Math.random() * 20) : (46 + Math.random() * 26);
        starParticles.push({
          x: x + ox, y: y + oy,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          life: life, maxLife: life,
          color: c,
          size: isMobile ? (0.9 + Math.random() * 1.1) : (1.1 + Math.random() * 1.5)
        });
      }
      if (starParticles.length > maxParticles) {
        starParticles.splice(0, starParticles.length - maxParticles);
      }
    }
    function drawStarBrushSegment(a, b, spread) {
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var dist = Math.hypot(dx, dy) || 1;
      var speed = clamp(dist / 18, 0.6, 2.2);
      var t = clamp(dragProgress / 260, 0, 1);
      var base = isMobile ? 1.6 : 1.8;
      var maxW = isMobile ? 6.8 : 7.8;
      var w = (base + t * (maxW - base)) * speed;
      var g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, 'rgba(255,255,255,0.00)');
      g.addColorStop(0.35, 'rgba(190,227,255,0.10)');
      g.addColorStop(0.75, 'rgba(255,232,244,0.10)');
      g.addColorStop(1, 'rgba(255,255,255,0.00)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = g;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(190,227,255,0.18)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      var dustN = isMobile ? 1 : 2;
      for (var i = 0; i < dustN; i++) {
        var px = b.x + (Math.random() - 0.5) * (spread * 0.65);
        var py = b.y + (Math.random() - 0.5) * (spread * 0.65);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.beginPath();
        ctx.arc(px, py, 0.9 + Math.random() * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    function maybeComplete() {
      var done = (mode === 'fireworks') ? (burstCount >= thresholdFire) : (strokeCount >= thresholdStar);
      if (!done) return;
      if (toGachaBtn) toGachaBtn.style.display = 'block';
      if (!candyEatenThisSession) markCandyDone();
      if (hint) {
        hint.textContent = (mode === 'fireworks') ? '好，这样就够啦，可以去抽一张卡。' : '好，星光就到这里。可以去抽一张卡。';
      }
    }
    function ensureRunning() {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    }
    function stopRunning() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }
    function computeFadeAlpha(dt, base) {
      var keep = Math.pow(1 - base, dt / 16.6667);
      return 1 - keep;
    }
    function getXY(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left), y: (e.clientY - rect.top) };
    }
    function setMode(next) {
      if (mode === next) return;
      mode = next;
      stopStarShineSound();
      isDown = false;
      lastPt = null;
      dragProgress = 0;
      fwParticles.length = 0;
      starParticles.length = 0;
      if (btnFire) btnFire.classList.toggle('active', mode === 'fireworks');
      if (btnStar) btnStar.classList.toggle('active', mode === 'stars');
      updateHint();
      clearFrame(0.92);
    }
    function updateHint() {
      if (!hint) return;
      hint.textContent = (mode === 'fireworks') ? '点几下，让它炸开。够啦就去抽卡。' : '按住拖动，画出一点星光拖尾。够啦就去抽卡。';
    }
    function tick(now) {
      if (!document.body.contains(canvas)) {
        stopStarShineSound();
        stopRunning();
        return;
      }
      if (now - startedAt > maxRunMs && toGachaBtn) {
        if (!candyEatenThisSession) markCandyDone();
        toGachaBtn.style.display = 'block';
      }
      if (mode === 'fireworks') {
        clearFrame(0.18);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (var i = fwParticles.length - 1; i >= 0; i--) {
          var p = fwParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + 0.045;
          p.life -= p.decay;
          if (p.life <= 0) {
            fwParticles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        if (fwParticles.length === 0 && !isDown) {
          stopRunning();
          return;
        }
      } else {
        var dt = lastFrameAt ? (now - lastFrameAt) : 16.6;
        lastFrameAt = now;
        var base = isMobile ? 0.34 : 0.26;
        var fade = computeFadeAlpha(dt, base);
        clearFrame(fade);
        for (var i = starParticles.length - 1; i >= 0; i--) {
          var p = starParticles[i];
          p.life -= 1;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          if (p.life <= 0) {
            starParticles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = (p.life / p.maxLife);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (starParticles.length === 0 && !isDown) {
          stopRunning();
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    canvas.addEventListener('pointerdown', function (e) {
      try {
        isDown = true;
        startedAt = startedAt || Date.now();
        try { if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId); } catch (_) {}
        var xy = getXY(e);
        if (mode === 'fireworks') {
          spawnBurstFW(xy.x, xy.y);
          burstCount++;
          playFireworkPopSound();
          if (burstCount >= thresholdFire) maybeComplete();
        } else {
          strokeCount++;
          dragProgress = 0;
          lastPt = { x: xy.x, y: xy.y };
          startStarShineSound();
          var spread = getStarSpread();
          spawnStarDots(xy.x, xy.y, spread);
          if (strokeCount >= thresholdStar) maybeComplete();
        }
        ensureRunning();
      } catch (err) {
        console.error('[FireworksCandy] pointerdown error', err);
        if (hint) hint.textContent = '⚠️ 小烟花出了点小故障，刷新一下再试';
        stopRunning();
      }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var now = Date.now();
      if (mode === 'fireworks') {
        if (now - lastSpawnAt < 45) return;
        lastSpawnAt = now;
        var xy = getXY(e);
        spawnBurstFW(xy.x, xy.y);
        burstCount++;
        playFireworkPopSound();
        if (burstCount >= thresholdFire) maybeComplete();
        ensureRunning();
        return;
      }
      var minInterval = isMobile ? 55 : 28;
      if (now - lastSpawnAt < minInterval) return;
      lastSpawnAt = now;
      var xy = getXY(e);
      if (lastPt) {
        dragProgress += Math.hypot(xy.x - lastPt.x, xy.y - lastPt.y);
      }
      var spread = getStarSpread();
      if (lastPt) drawStarBrushSegment(lastPt, { x: xy.x, y: xy.y }, spread);
      spawnStarDots(xy.x, xy.y, spread);
      lastPt = { x: xy.x, y: xy.y };
      ensureRunning();
    });
    function endPointer() {
      if (!isDown) return;
      isDown = false;
      lastPt = null;
      dragProgress = 0;
      stopStarShineSound();
      ensureRunning();
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', endPointer);
    if (btnFire) btnFire.addEventListener('click', function () { setMode('fireworks'); });
    if (btnStar) btnStar.addEventListener('click', function () { setMode('stars'); });
    if (toGachaBtn) {
      toGachaBtn.addEventListener('click', function () {
        if (!candyEatenThisSession) markCandyDone();
        if (typeof window.backToCenter === 'function') window.backToCenter();
        var candySec = document.getElementById('candySection');
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone();
      });
    }
    setMode('fireworks');
    updateHint();
    clearFrame(0.92);
  }

  let currentUsername = localStorage.getItem(KEY_USERNAME) || 'Anchor';
  let currentPassword = localStorage.getItem(KEY_PASSWORD) || '';

  const defaultDB = [
    { id: 1, title: '听一张喜欢的黑胶', type: 'vinyl', desc: '音乐时间', time: 0 },
    { id: 2, title: '喝水果茶', type: 'indoor', desc: '补充维C', time: 15 }
  ];

  // 👉 What & Why: 给核心数据装上防爆装甲。防止本地 JSON 损坏导致整站白屏猝死。
  let db = [];
  let archive = [];
  let dailyLog = [];
  let userStats = { willpower: 0, joy: 0 };
  try {
    db = JSON.parse(localStorage.getItem(KEY_DB)) || [];
  } catch (e) {
    console.error('db读取失败', e);
    db = [];
  }
  try {
    archive = JSON.parse(localStorage.getItem(KEY_ARCHIVE)) || [];
  } catch (e) {
    console.error('archive读取失败', e);
    archive = [];
  }
  try {
    dailyLog = JSON.parse(localStorage.getItem(KEY_LOG)) || [];
  } catch (e) {
    console.error('dailyLog读取失败', e);
    dailyLog = [];
  }
  try {
    userStats = JSON.parse(localStorage.getItem(KEY_STATS)) || { willpower: 0, joy: 0 };
  } catch (e) {
    console.error('userStats读取失败', e);
    userStats = { willpower: 0, joy: 0 };
  }

  const ritualMorningDefault = [
    '起身离开床',
    '拉开窗帘 / 开灯',
    '喝一口水',
    '走到书桌 / 固定角落'
  ];
  const ritualNightDefault = [
    '手机充电并远离床边',
    '喝一口水 / 吃药',
    '关窗帘 / 灯',
    '写一句"明天想做的事"'
  ];
  let ritualMorningSteps = ritualMorningDefault.slice();
  let ritualNightSteps = ritualNightDefault.slice();

  function loadRitualSettings() {
    try {
      const storedMorning = localStorage.getItem(KEY_RITUAL_MORNING);
      const storedNight = localStorage.getItem(KEY_RITUAL_NIGHT);
      if (storedMorning) {
        const parsed = JSON.parse(storedMorning);
        if (Array.isArray(parsed) && parsed.length > 0) ritualMorningSteps = parsed;
      }
      if (storedNight) {
        const parsed = JSON.parse(storedNight);
        if (Array.isArray(parsed) && parsed.length > 0) ritualNightSteps = parsed;
      }
    } catch (e) {
      console.warn('加载仪式设置出错', e);
    }
  }
  loadRitualSettings();

  function save() {
    localStorage.setItem(KEY_DB, JSON.stringify(db));
    localStorage.setItem(KEY_ARCHIVE, JSON.stringify(archive));
    localStorage.setItem(KEY_LOG, JSON.stringify(dailyLog));
    localStorage.setItem(KEY_STATS, JSON.stringify(userStats));
  }
  // ========== 纯数据与时间法则结束 ==========

  // ========== 01 区 · 抽卡引擎与表现层（含 00/02/03 区 DOM 判空保护） ==========
  var APP_VARIANT = (function () {
    var host = (typeof location !== 'undefined' && location.hostname) ? location.hostname.toLowerCase() : '';
    if (host.indexOf('anchor-scc') !== -1) return 'personal';
    return 'common';
  })();

  var sosLibrary = [
    { title: '大口喝水', icon: '💧', desc: '感受水流经过食道。' },
    { title: '看窗外远方', icon: '👀', desc: '寻找视野里最远的一棵树。' },
    { title: '4-7-8 呼吸', icon: '🌬️', desc: '吸气4秒，憋气7秒，呼气8秒。' },
    { title: '压腿拉伸', icon: '🦵', desc: '拉伸大腿后侧。' },
    { title: '五感着陆', icon: '🖐️', desc: '5样看到的，4样听到的。' },
    { title: '洗把脸', icon: '🚿', desc: '冷水泼脸，物理降温。' },
    { title: '吃一颗水果', icon: '🍊', desc: '慢慢吃，感受香气。' }
  ];

  var mode = 'normal';
  var energyMode = (function () {
    try { return localStorage.getItem('energyMode') || 'anchor'; } catch (e) { return 'anchor'; }
  })();
  var currentTask = null;
  var currentStatus = 'idle';
  var gachaAnimating = false;
  var filterDrawerExpanded = false;
  var customPlaylists = (function () {
    try { return JSON.parse(localStorage.getItem('anchor_custom_playlists') || '[]'); } catch (e) { return []; }
  })();
  var activePlaylist = null;
  var lastDrawnTaskId = null;
  var anchorStartTime = null;
  var liveTimerId = null;
  // 👉 补齐微启动状态机变量
  var trailerTimer = null;
  var trailerTimeElapsed = 0;
  // v7.0.4 云端雷达互斥锁与 IoT 时间戳记忆
  var isRadarPaused = false;
  var lastIotTimestamp = 0;
  var isTimerEnabled = true;
  var tarotState = 'idle';
  var tarotChosenTask = null;
  var DRAW_MODES = ['classic', 'tarot', 'bamboo'];
  var lastDrawMode = 'classic';

  function getIcon(t) {
    var map = { indoor: '🏠', desktop: '💻', outdoor: '🌳', sport: '🏃', culture: '🎬', vinyl: '💿', sos: '🚑' };
    return map[t] || '✨';
  }
  function getDescByType(t) {
    if (t === 'vinyl') return '享受这段音乐时光。';
    if (t === 'culture') return '沉浸在故事里。';
    if (t === 'sport') return '动起来！';
    return '去行动吧！';
  }
  function getSmartIcon(item) {
    if (!item) return '✨';
    if (!item) return '✨';
    if (item.icon) return item.icon;
    
    // 👉 修复 1：精准剥离 Emoji。按空格截取，或者安全提取首字符，防止输出整个数组
    if (item.type === 'custom') {
      if (typeof customTags !== 'undefined') {
          const cTag = customTags.find(function(t) { return String(t.id) === String(item.subtype); });
          if (cTag && cTag.name) {
              var nTrim = cTag.name.trim();
              var spaceIdx = nTrim.indexOf(' ');
              return spaceIdx > 0 ? nTrim.substring(0, spaceIdx) : (Array.from(nTrim) || '🏷️');
          }
      }
      return '🏷️'; // 找不到时的兜底
  }
    if (item.icon) return item.icon;
    var titleRaw = (item.title || '').trim();
    var firstChar = titleRaw.charAt(0) || '';
    if (item.type === 'culture') {
      if (item.isSeries) return '📺';
      if (item.subtype === 'book') return '📖';
      if (item.subtype === 'movie') return '🎬';
      if (item.subtype === 'other') return (titleRaw.indexOf('演出') !== -1 || titleRaw.indexOf('音乐') !== -1) ? '🎭' : '🖼️';
      if (firstChar === '读' || firstChar === '书') return '📖';
      if (firstChar === '看' || firstChar === '影') return '🎬';
      if (/书|读|杂志|阅读/.test(titleRaw)) return '📖';
      if (/电影|影|片/.test(titleRaw)) return '🎬';
      if (/演出|音乐会|话剧|舞剧|脱口秀/.test(titleRaw)) return '🎭';
      if (/展|画|博物馆/.test(titleRaw)) return '🖼️';
      return '🖼️';
    }
    if (item.type === 'vinyl') {
      // 👉 优先识别黑胶/CD癖好，保留 💿
      if (/(唱片|cd|黑胶|碟)/i.test(titleRaw)) return '💿';
      // 👉 识别音乐类，发放 🎵
      if (/(歌|音乐|网易云|qq音乐)/i.test(titleRaw)) return '🎵';
      // 👉 兜底：既然 02 区标签已大一统为 🎙️ 播客，兜底必须是 🎙️
      return '🎙️';
    }
    return getIcon(item.type);
  }
  function getCapsuleSrc(task) {
    if (!task || task.type === 'sos') return null;
    if (task.isFrog) return 'assets/images/gacha/gacha-ball-white.png';
    if (task.isQuick) return 'assets/images/gacha/gacha-ball-yellow.png';
    if (task.type === 'vinyl') return 'assets/images/gacha/gacha-ball-orange.png';
    if (task.type === 'culture') {
      var t = task.title || '';
      return (t.indexOf('影') !== -1 || t.indexOf('片') !== -1) ? 'assets/images/gacha/gacha-ball-blue.png' : 'assets/images/gacha/gacha-ball-pink.png';
    }
    if (task.type === 'sport') return 'assets/images/gacha/gacha-ball-green.png';
    return 'assets/images/gacha/gacha-ball-purple.png';
  }
  window.getPlaylistTaskTexts = function(pl) {
    if (!pl) return [];
    // 👉 优先读取 V8 的真相之源：items 数组
    if (Array.isArray(pl.items) && pl.items.length > 0) {
        return pl.items.map(function(i) { return i && (i.text || i.title); }).filter(Boolean);
    }
    // 兜底读取旧版 tasks 数组
    if (Array.isArray(pl.tasks) && pl.tasks.length > 0) {
        return pl.tasks.filter(Boolean);
    }
    return [];
};
// 👉 v8.2 引路卡工厂：将清单包装为一张抽卡结果卡片
  function createTriggerCard(pl) {
  if (!pl) return null;
  const taskCount = pl.items ? pl.items.length : (pl.tasks ? pl.tasks.length : 0);
  return {
      id: 'trigger_' + pl.id,
      title: `🚀 清单：【${pl.title || pl.name}】`,
      desc: `📦 包含 ${taskCount} 个子步骤。点击「就它啦」正式展开专属隧道。`,
      icon: pl.icon || '📑',
      type: 'trigger',
      targetPlaylistId: pl.id
      };
  }

  function applySmartCooldown(pool, log, currentMode) {
    if (currentMode === 'culture') return pool;
    var todayStr = getAnchorDate().toDateString();
    var hasCompleted = log.some(function (entry) {
      if (entry.date !== todayStr || !entry.done) return false;
      if (entry.icon === '🎬' || entry.icon === '📺') return true;
      if (entry.taskId && pool) {
        var orig = pool.find(function (t) { return t.id === entry.taskId; });
        if (orig && (orig.subtype === 'movie' || orig.isSeries === true)) return true;
      }
      return false;
    });
    if (!hasCompleted) return pool;
    var cooled = pool.filter(function (item) {
      if (item.subtype === 'movie' || item.isSeries === true) return false;
      if (item.type === 'culture') {
        var icon = item.icon || getSmartIcon(item);
        if (icon === '🎬' || icon === '📺') return false;
      }
      return true;
    });
    return cooled.length === 0 ? pool : cooled;
  }
  /** 专属筛选：自定义标签 id → 任务匹配（含 targetType: vinyl 基因映射到 type === 'vinyl'） */
  function itemMatchesFilterTagId(item, tId) {
    if (!item || tId == null || tId === '') return false;
    if (String(tId) === 'tag_pc' || String(tId) === 'tag_audio_custom') return item.type === 'vinyl';
    var ctag = (typeof customTags !== 'undefined') ? customTags.find(function(t) { return t && String(t.id) === String(tId); }) : null;
    if (ctag && ctag.targetType === 'vinyl') return item.type === 'vinyl';
    return item.type === 'custom' && String(item.subtype) === String(tId);
  }
  function pickTaskByFilters(excludeTaskId) {
    excludeTaskId = excludeTaskId === undefined ? null : excludeTaskId;
    var selContextEl = document.getElementById('selContext');
    var selTimeEl = document.getElementById('selTime');
    var selPlaylistEl = document.getElementById('selPlaylist');
    var ctx = selContextEl ? selContextEl.value : 'desktop';
    var limitTime = selTimeEl ? parseInt(selTimeEl.value, 10) : 30;

    if (selPlaylistEl && selPlaylistEl.value) {
        var targetId = selPlaylistEl.value;

        // 👉 核心修复：找回丢失的 pl 变量定义！必须先去库里查出这是哪个清单
        var pl = null;
        if (typeof customPlaylists !== 'undefined') {
            pl = customPlaylists.find(function(p) { return String(p.id) === String(targetId); });
        }

        // 👉 v8.X 核心修复：如果是项目，去大任务库和档案柜里，把所有隶属该项目的成员找出来！
    if (pl && pl.playlistType === 'project') {
      const todayStr = getAnchorDate().toDateString();
      
      // 1. 去 db 抓取普通任务，并严格执行“周期打卡过滤”
      var projPool = db.filter(function(item) {
          if (String(item.projectId) !== String(targetId) || item.inColdStorage) return false;
          // 补齐：周期任务防连抽拦截
          if (item.recurrence && item.recurrence !== 'none' && item.lastDone) {
              var anchorD = getAnchorDate();
              var lastD = new Date(item.lastDone);
              if (item.recurrence === 'daily' && item.lastDone === todayStr) return false;
              if (item.recurrence === 'weekly') {
                  var thisMonday = new Date(anchorD);
                  thisMonday.setHours(0, 0, 0, 0);
                  thisMonday.setDate(anchorD.getDate() - (anchorD.getDay() || 7) + 1);
                  if (lastD >= thisMonday) return false;
              }
              if (item.recurrence === 'monthly') {
                  var first = new Date(anchorD.getFullYear(), anchorD.getMonth(), 1);
                  if (lastD >= first) return false;
              }
          }
          return true;
      });

      // 2. 去档案柜抓取嵌套的清单/SOP，并包装为“引路卡”
      if (typeof customPlaylists !== 'undefined' && typeof createTriggerCard === 'function') {
          var triggerPool = customPlaylists.filter(function(p) {
              // 必须属于该项目，且不是冷库/归档，且不能是项目本身(防死循环)
              return String(p.projectId) === String(targetId) && !p.inColdStorage && !p.isArchived && p.playlistType !== 'project';
          }).map(function(p) {
              return createTriggerCard(p);
          }).filter(Boolean);
          
          projPool = projPool.concat(triggerPool);
      }

      if (projPool.length === 0) {
          if (typeof showToast === 'function') showToast('⚠️ 该项目下暂无待办任务或清单');
          return null;
      }
      if (excludeTaskId && projPool.length > 1) {
          projPool = projPool.filter(function(i) { return String(i.id) !== String(excludeTaskId); });
      }
      var rIdx = Math.floor(Math.random() * projPool.length);
      return projPool[rIdx]; // 抽出专属项目任务或引路卡，交由盲盒展现！
  }


        // ... 旧版清单(SOP/Once)的兜底逻辑（正常情况下会被 draw 拦截，这里作容错防白屏）
        var plTasks = typeof getPlaylistTaskTexts === 'function' ? getPlaylistTaskTexts(pl) : [];
        if (pl && plTasks.length > 0) {
            pl.tasks = plTasks.slice();
            return pl;
        }
        if (typeof showToast === 'function') showToast('⚠️ 该清单为空');
        return null;
    }
    var todayStr = getAnchorDate().toDateString();
    var validPool = db.filter(function (item) {
      if (item.inColdStorage === true) return false;
      if (item.recurrence && item.recurrence !== 'none' && item.lastDone) {
        var anchorD = getAnchorDate();
        var lastD = new Date(item.lastDone);
        if (item.recurrence === 'daily' && item.lastDone === todayStr) return false;
        if (item.recurrence === 'weekly') {
          var thisMonday = new Date(anchorD);
          thisMonday.setHours(0, 0, 0, 0);
          thisMonday.setDate(anchorD.getDate() - (anchorD.getDay() || 7) + 1);
          if (lastD >= thisMonday) return false;
        }
        if (item.recurrence === 'monthly') {
          var first = new Date(anchorD.getFullYear(), anchorD.getMonth(), 1);
          if (lastD >= first) return false;
        }
      }
      return true;
    });
    validPool = applySmartCooldown(validPool, dailyLog, mode);
    validPool = validPool.filter(function (item) {
      var tTime = (item.time === undefined || item.time === null) ? 30 : item.time;
      var isFlexible = tTime === 0;
      if (energyMode === 'anchor' && filterDrawerExpanded && !isFlexible && !item.isQuick && tTime > limitTime) return false;
      if (mode === 'vinyl') return item.type === 'vinyl';
     // 👉 v8.X 修复：彻底打通专属筛选的标签与任务 type 的底层映射
     if (typeof mode === 'string' && mode.startsWith('cf_')) {
      var fId = mode.replace('cf_', '');
      var cf = (typeof customFilters !== 'undefined') ? customFilters.find(function(f) { return String(f.id) === String(fId); }) : null;
      
      if (cf && Array.isArray(cf.tags) && cf.tags.length > 0) {
          validPool = validPool.filter(function(item) {
              return cf.tags.some(function(tId) {
                  // 匹配原生系统标签
                  if (tId.startsWith('sys_')) {
                      var sysType = tId.replace('sys_', '');
                      if (sysType === 'indoor') return item.type === 'indoor';
                      if (sysType === 'desktop') return item.type === 'desktop';
                      if (sysType === 'outdoor') return item.type === 'outdoor';
                      if (sysType === 'sport') return item.type === 'sport';
                      if (sysType === 'vinyl') return item.type === 'vinyl';
                      if (sysType.startsWith('culture_')) {
                          return item.type === 'culture' && String(item.subtype) === sysType.replace('culture_', '');
                      }
                      return item.type === sysType;
                  } 
                  // 匹配用户自定义标签（含 vinyl 基因）
                  else {
                      return itemMatchesFilterTagId(item, tId);
                  }
              });
          });
      } else if (cf && (!cf.tags || cf.tags.length === 0)) {
          // 如果筛选器存在，但里面一个标签都没勾选，直接阻断
          return null;
      }
  }
      if (mode === 'culture') return item.type === 'culture';
      if (!filterDrawerExpanded) return true;
      if (item.type === 'culture' || item.type === 'vinyl') return ctx !== 'outdoor';
      if (ctx === 'desktop') return item.type !== 'outdoor';
      if (ctx === 'indoor') return item.type === 'indoor';
      if (ctx === 'outdoor') return item.type === 'outdoor';
      return true;
    });
    if (excludeTaskId && validPool.length > 1) validPool = validPool.filter(function (item) { return String(item.id) !== String(excludeTaskId); });
    // 👉 修复 3：专属筛选最高拦截护盾！(不管前面怎么过滤，专属筛选拥有一票否决权)
    if (typeof mode === 'string' && mode.startsWith('cf_')) {
      var fId = mode.replace('cf_', '');
      var cf = (typeof customFilters !== 'undefined') ? customFilters.find(function(f) { return String(f.id) === String(fId); }) : null;

      if (cf && Array.isArray(cf.tags) && cf.tags.length > 0) {
          validPool = validPool.filter(function(item) {
              return cf.tags.some(function(tId) {
                  if (tId.startsWith('sys_')) {
                      var sysType = tId.replace('sys_', '');
                      if (sysType === 'indoor') return item.type === 'indoor';
                      if (sysType === 'desktop') return item.type === 'desktop';
                      if (sysType === 'outdoor') return item.type === 'outdoor';
                      if (sysType === 'sport') return item.type === 'sport';
                      if (sysType === 'vinyl') return item.type === 'vinyl';
                      if (sysType.startsWith('culture_')) return item.type === 'culture' && String(item.subtype) === sysType.replace('culture_', '');
                      return item.type === sysType;
                  } else {
                      return itemMatchesFilterTagId(item, tId);
                  }
              });
          });
      } else if (cf) {
          // 如果筛选器里什么标签都没勾，直接返回空池子
          validPool = [];
      }
  }

    if (validPool.length === 0) return null;
    var weightedPool = validPool.map(function (item) {
      var taskEnergy = 'normal';
      if (item.isFrog) taskEnergy = 'high';
      else if (item.type === 'desktop' || item.type === 'sport') taskEnergy = 'high';
      else if (item.type === 'culture' || item.type === 'vinyl' || item.type === 'sos') taskEnergy = 'low';

      if (item.type === 'custom') {
        var cTag = (typeof customTags !== 'undefined') ? customTags.find(function (t) { return t && String(t.id) === String(item.subtype); }) : null;
        if (cTag) {
          if (cTag.energy) {
            taskEnergy = cTag.energy;
          } else if (cTag.targetType) {
            if (cTag.targetType === 'desktop' || cTag.targetType === 'sport') taskEnergy = 'high';
            else if (cTag.targetType === 'culture' || cTag.targetType === 'vinyl') taskEnergy = 'low';
          }
        }
      }

      var weight = 10;

      // 👉 v8.3.X 顺水推舟算法：临近 DDL（<= 3天）或已逾期任务，权重 x2 
      // Why: 不使用红色警报制造焦虑，而是让底层的命运轮盘悄悄偏向紧迫的任务
      if (item.deadline) {
        var ddlTime = new Date(item.deadline).getTime();
        // 🚨 核心防御：必须使用夜猫子时钟的基准日，防止凌晨时段算错天数
        var todayTime = new Date(typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString()).getTime();
        var diffDays = Math.ceil((ddlTime - todayTime) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          weight *= 2; 
        }
      }

      if (energyMode === 'uptime') {
        if (item.isFrog) weight *= 100;
        else if (taskEnergy === 'high') weight *= 50;
        else if (taskEnergy === 'normal') weight *= 5;
        else if (taskEnergy === 'low') weight = 0;
      } else if (energyMode === 'downtime') {
        if (item.isSeries) weight *= 80;
        else if (taskEnergy === 'low') weight *= 50;
        else if (taskEnergy === 'normal') weight *= 5;
        else if (taskEnergy === 'high') weight = 0;
      }

      return { item: item, weight: weight };
    }).filter(function (e) { return e.weight > 0; });
    if (weightedPool.length === 0) return null;
    var totalWeight = weightedPool.reduce(function (sum, e) { return sum + e.weight; }, 0);
    var random = Math.random() * totalWeight;
    for (var i = 0; i < weightedPool.length; i++) {
      random -= weightedPool[i].weight;
      if (random <= 0) return weightedPool[i].item;
    }
    return weightedPool[0].item;
  }
  function pickDrawMode() {
    var idx = DRAW_MODES.indexOf(lastDrawMode);
    lastDrawMode = DRAW_MODES[(idx + 1) % DRAW_MODES.length];
    return lastDrawMode;
  }
  function hideClassicGachaLayer() {
    var g = document.getElementById('gachaLayer');
    if (g) g.style.display = 'none';
  }
  function hideAllGachaLayers() {
    var g = document.getElementById('gachaLayer');
    var t = document.getElementById('tarotLayer');
    var b = document.getElementById('bambooLayer');
    if (g) g.style.display = 'none';
    if (t) t.style.display = 'none';
    if (b) b.style.display = 'none';
    tarotState = 'idle';
  }
  function showTarotLayer() {
    var layer = document.getElementById('tarotLayer');
    if (layer) layer.style.display = 'flex';
  }
  function hideTarotLayer() {
    var layer = document.getElementById('tarotLayer');
    var cards = document.getElementById('tarotCards');
    var deck = document.getElementById('tarotDeck');
    var skip = document.getElementById('tarotSkipLink');
    if (layer) layer.style.display = 'none';
    if (cards) cards.innerHTML = '';
    if (deck) deck.classList.remove('shuffling');
    if (skip) skip.style.display = 'none';
    tarotState = 'idle';
  }
  function prepareTarotScene(task) {
    tarotChosenTask = task;
    tarotState = 'idle';
    var caption = document.getElementById('tarotCaption');
    var sub = document.getElementById('tarotSubCaption');
    var deck = document.getElementById('tarotDeck');
    var cards = document.getElementById('tarotCards');
    var skip = document.getElementById('tarotSkipLink');
    if (caption) caption.textContent = '今天让塔罗帮你抽出一张 Anchor 卡。';
    if (sub) sub.textContent = '点一下牌堆，开始洗牌。';
    if (cards) cards.innerHTML = '';
    if (deck) {
      deck.style.opacity = '1';
      deck.classList.remove('shuffling');
      deck.onclick = function () {
        if (tarotState !== 'idle') return;
        startTarotShuffle();
      };
    }
    if (skip) {
      skip.style.display = 'block';
      skip.onclick = function () {
        hideTarotLayer();
        playGachaAnimation(tarotChosenTask);
      };
    }
    showTarotLayer();
  }
  function startTarotShuffle() {
    var deck = document.getElementById('tarotDeck');
    var sub = document.getElementById('tarotSubCaption');
    if (sub) sub.textContent = '洗牌中…';
    tarotState = 'shuffling';
    if (deck) {
      deck.classList.remove('shuffling');
      void deck.offsetWidth;
      deck.classList.add('shuffling');
    }
    setTimeout(spreadTarotCards, 900);
  }
  function spreadTarotCards() {
    var cardsWrap = document.getElementById('tarotCards');
    var deck = document.getElementById('tarotDeck');
    var sub = document.getElementById('tarotSubCaption');
    if (!cardsWrap) return;
    if (deck) deck.style.opacity = '0';
    if (sub) sub.textContent = '凭直觉，选一张今天的卡牌。';
    cardsWrap.innerHTML = '';
    tarotState = 'choose';
    var angles = [-20, -14, -7, 0, 7, 14, 20];
    var baseY = 15;
    var gap = 34;
    for (var i = 0; i < 7; i++) {
      var card = document.createElement('div');
      card.className = 'tarot-card';
      card.dataset.index = String(i);
      var x = (i - 3) * gap;
      var y = baseY + Math.pow(Math.abs(i - 3), 1.8) * 6;
      var a = angles[i];
      card.style.transform = 'translate(-50%, -50%) scale(0.5)';
      card.style.opacity = '0';
      card.innerHTML = '<div class="tarot-face tarot-back"></div><div class="tarot-face tarot-front"><span class="t-icon">✨</span><div class="t-title">...</div><div class="t-desc">...</div><button class="t-btn" type="button">收下</button></div>';
      card.addEventListener('click', (function (idx) { return function (e) { e.stopPropagation(); handleTarotCardClick(idx); }; })(i));
      cardsWrap.appendChild(card);
      (function (c, x, y, a) {
        setTimeout(function () {
          c.style.opacity = '1';
          c.style.transform = 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px)) rotate(' + a + 'deg)';
        }, i * 40);
      })(card, x, y, a);
    }
  }
  function handleTarotCardClick(index) {
    if (tarotState !== 'choose') return;
    var cardsWrap = document.getElementById('tarotCards');
    if (!cardsWrap) return;
    tarotState = 'reveal';
    var cards = Array.prototype.slice.call(cardsWrap.querySelectorAll('.tarot-card'));
    cards.forEach(function (c, i) { if (i !== index) c.classList.add('dim'); });
    var selected = cards[index];
    if (!selected) return;
    selected.classList.add('selected');
    var tIcon = selected.querySelector('.t-icon');
    var tTitle = selected.querySelector('.t-title');
    var tDesc = selected.querySelector('.t-desc');
    var tBtn = selected.querySelector('.t-btn');
    if (tarotChosenTask) {
      if (tIcon) tIcon.textContent = tarotChosenTask.icon || getSmartIcon(tarotChosenTask);
      if (tTitle) tTitle.textContent = tarotChosenTask.title;
      var d = tarotChosenTask.desc;
      if (!d || d === '自定义' || d === '系列' || d === '每日任务') d = getDescByType(tarotChosenTask.type);
      if (tDesc) tDesc.textContent = d;
    }
    if (tBtn) {
      tBtn.onclick = function (e) {
        e.stopPropagation();
        hideTarotLayer();
        currentTask = tarotChosenTask;
        renderResultCard(tarotChosenTask);
      };
    }
    setTimeout(function () { selected.classList.add('reveal'); }, 50);
  }
  function runTarotDrawFlow(result) {
    var card = document.getElementById('resultCard');
    if (card) card.style.display = 'none';
    hideClassicGachaLayer();
    prepareTarotScene(result);
  }
  function runBambooDrawFlow(task) {
    var card = document.getElementById('resultCard');
    if (card) card.style.display = 'none';
    hideAllGachaLayers();
    var layer = document.getElementById('bambooLayer');
    var tube = document.getElementById('bambooTubeImg');
    var stick = document.getElementById('bambooStick');
    var stamp = document.getElementById('stickStamp');
    var text = document.getElementById('stickText');
    var caption = document.getElementById('bambooCaption');
    if (!layer || !tube || !stick) {
      renderResultCard(task);
      return;
    }
    var fortuneTitle = '大吉';
    if (task.isFrog) fortuneTitle = '上上签';
    else if (task.isQuick) fortuneTitle = '神行签';
    else if (task.type === 'culture' || task.type === 'vinyl') fortuneTitle = Math.random() > 0.5 ? '清心签' : '雅签';
    else fortuneTitle = ['上签', '中吉', '大吉'][Math.floor(Math.random() * 3)];
    var fortuneDesc = task.isFrog ? '今日运势极旺，宜攻克难关' : (task.isQuick ? '宜速战速决' : (task.type === 'culture' || task.type === 'vinyl') ? '宜享受当下，忌焦虑' : '诸事皆宜，稳步向前');
    task._tempFortuneDesc = fortuneDesc;
    stamp.textContent = fortuneTitle;
    text.textContent = task.title;
    stick.style.opacity = '0';
    stick.classList.remove('stick-fly-out', 'stick-flip-reveal');
    tube.classList.remove('bamboo-shaking');
    caption.textContent = '摇晃竹筒，求得今日的指引…';
    layer.style.display = 'flex';
    setTimeout(function () { tube.classList.add('bamboo-shaking'); }, 150);
    setTimeout(function () {
      tube.classList.remove('bamboo-shaking');
      stick.style.opacity = '1';
      stick.classList.add('stick-fly-out');
      caption.textContent = '点化签文，揭晓天机';
    }, 1350);
    stick.onclick = function (e) {
      e.stopPropagation();
      stick.onclick = null;
      stick.classList.add('stick-flip-reveal');
      var originalDesc = task.desc;
      task.desc = '【' + fortuneTitle + '】 ' + fortuneDesc;
      setTimeout(function () {
        layer.style.display = 'none';
        renderResultCard(task);
        task.desc = originalDesc;
      }, 350);
    };
  }
  function enterImmersiveMode() {
    var overlay = document.getElementById('immersiveOverlay');
    var displaySec = document.getElementById('displaySec');
    if (overlay) overlay.classList.add('show');
    if (displaySec) displaySec.classList.add('immersive-active');
    document.body.classList.add('immersive-locked');
    if (displaySec) displaySec.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function exitImmersiveMode() {
    var overlay = document.getElementById('immersiveOverlay');
    var displaySec = document.getElementById('displaySec');
    if (overlay) overlay.classList.remove('show');
    if (displaySec) displaySec.classList.remove('immersive-active');
    document.body.classList.remove('immersive-locked');
  }
  function playGachaAnimation(result) {
    var layer = document.getElementById('gachaLayer');
    var eggOut = document.getElementById('eggOut');
    var img = document.getElementById('gachaImg');
    var card = document.getElementById('resultCard');
    var ph = document.getElementById('placeholder');
    var btn = document.getElementById('mainBtn');
    if (!layer || !eggOut || !img) {
      renderResultCard(result);
      return;
    }
    gachaAnimating = true;
    if (btn) { btn.disabled = true; btn.innerText = '抽取中…'; }
    if (ph) ph.style.display = 'none';
    if (card) card.style.display = 'none';
    layer.style.display = 'flex';
    layer.style.opacity = '1';
    img.style.opacity = '1';
    var src = getCapsuleSrc(result) || 'assets/images/gacha/gacha-ball-pink.png';
    eggOut.src = src;
    eggOut.style.opacity = 0;
    eggOut.style.animation = 'none';
    img.classList.remove('machine-shake');
    void eggOut.offsetWidth;
    setTimeout(function () { img.classList.add('machine-shake'); }, 80);
    setTimeout(function () { eggOut.style.animation = 'eggFly 1.1s ease-out forwards'; }, 260);
    setTimeout(function () { img.style.opacity = '0'; }, 700);
    setTimeout(function () {
      eggOut.style.animation = 'none';
      eggOut.style.left = '50%';
      eggOut.style.bottom = '44%';
      eggOut.style.transform = 'translateX(-50%) scale(1.25)';
      void eggOut.offsetWidth;
      eggOut.style.animation = 'eggBurst 0.4s ease-out forwards';
      renderResultCard(result);
      layer.style.transition = 'opacity 0.25s ease-out';
      layer.style.opacity = '0';
    }, 1350);
    setTimeout(function () {
      layer.style.display = 'none';
      layer.style.opacity = '1';
      img.classList.remove('machine-shake');
      img.style.opacity = '1';
      eggOut.style.animation = 'none';
      if (btn) {
        btn.disabled = false;
        if (mode === 'vinyl') btn.innerText = '💿 挑唱片';
        else if (mode === 'culture') btn.innerText = '🎬 精神食粮';
        else if (mode === 'sos') btn.innerText = '🚑 救救我';
        else btn.innerText = '🔮 帮我选 (混合)';
      }
      gachaAnimating = false;
    }, 2000);
  }
  function renderResultCard(result) {
    var card = document.getElementById('resultCard');
    var ph = document.getElementById('placeholder');
    var titleEl = document.getElementById('rTitle');
    var badgeEl = document.getElementById('rBadge');
    var descEl = document.getElementById('rDesc');
    var iconEl = document.getElementById('rIcon');
    var timeEl = document.getElementById('rTime');
    var statusEl = document.getElementById('rStatus');
    var changeBtn = document.getElementById('btnChange');
    var primaryBtn = document.getElementById('btnPrimary');
    var ingEl = document.getElementById('rIngPulse');
    var progressEl = document.getElementById('rProgress');
    if (!card) return;
    if (!result) {
      if (trailerTimer) { clearInterval(trailerTimer); trailerTimer = null; }
      var tz = document.getElementById('trailerZone');
      var tez = document.getElementById('trailerEntryZone');
      var btnStartTr = document.getElementById('btnStartTrailer');
      if (tz) tz.style.display = 'none';
      if (tez) tez.style.display = '';
      if (btnStartTr) btnStartTr.style.display = '';
      if (ph) ph.style.display = 'none';
      if (titleEl) titleEl.innerText = '暂无任务';
      if (badgeEl) badgeEl.innerHTML = '';
      if (descEl) descEl.innerText = '休息一下？';
      if (iconEl) iconEl.innerText = '🌙';
      if (timeEl) timeEl.innerText = '';
      if (statusEl) statusEl.style.display = 'none';
      if (ingEl) ingEl.style.display = 'none';
      if (changeBtn) changeBtn.style.display = 'none';
      if (primaryBtn) primaryBtn.style.display = 'none';
      if (progressEl) progressEl.innerHTML = '';
    } else {
      var trailerZone = document.getElementById('trailerZone');
      var trailerEntryZone = document.getElementById('trailerEntryZone');
      var btnStartTrailer = document.getElementById('btnStartTrailer');
      if (trailerZone) trailerZone.style.display = 'none';
      if (trailerEntryZone) trailerEntryZone.style.display = '';
      if (btnStartTrailer) btnStartTrailer.style.display = '';
      if (titleEl) titleEl.innerText = result.title || '';
      var badgesHtml = '';
      if (result.isFrog) badgesHtml += '<span class="card-badge bg-frog">🐸 重要</span>';
      if (result.isQuick) badgesHtml += '<span class="card-badge bg-flash">⚡️ 速办</span>';
      // 👉 视觉降噪：保留马卡龙分类底色，去除冗余前缀，统一使用 🔄 图标
      var recurSource = (typeof currentTask !== 'undefined' && currentTask && currentTask.id === result.id) ? currentTask : result;
      if (recurSource) {
        if (recurSource.recurrence === 'daily') {
          badgesHtml += '<span class="card-badge" style="background:#e8f5e9; color:#2e7d32;">🔄 每日</span>';
        } else if (recurSource.recurrence === 'weekly') {
          badgesHtml += '<span class="card-badge" style="background:#e3f2fd; color:#1565c0;">🔄 每周</span>';
        } else if (recurSource.recurrence === 'monthly') {
          badgesHtml += '<span class="card-badge" style="background:#f3e5f5; color:#4527a0;">🔄 每月</span>';
        } else if (recurSource.recurrence === 'long_term' || recurSource.type === 'long_term') {
          badgesHtml += '<span class="card-badge" style="background:#fff3e0; color:#e65100;">🚀 长期</span>';
        }
      }
      if (badgeEl) badgeEl.innerHTML = badgesHtml;
      var displayDesc = result.desc;
      if (!displayDesc || displayDesc === '自定义' || displayDesc === '') {
        displayDesc = getDescByType(result.type);
      }
      // 👉 找回 v7 的高级情感文案：长期任务与休闲任务的专属覆盖
      var recurSourceDesc = (typeof currentTask !== 'undefined' && currentTask && currentTask.id === result.id) ? currentTask : result;
      var isLongTerm = recurSourceDesc && (recurSourceDesc.recurrence === 'long_term' || recurSourceDesc.type === 'long_term');
      if (isLongTerm) {
        displayDesc = '持续推进，每一步都算数。';
      } else if (result.type === 'culture' || result.type === 'vinyl') {
        displayDesc = '✨ 放下顾虑去享受吧，这是你应得的。';
      }
      if (descEl) descEl.innerText = displayDesc || '';
      if (iconEl) iconEl.innerText = result.icon || getSmartIcon(result);
      var timeStr = result.type === 'sos' ? '⚡️ 即时' : (result.time === 0 ? '⏳ 丰俭由人' : '⏱️ ' + (result.time || 30) + ' min');
      if (timeEl) timeEl.innerText = timeStr;
      // v6.5/v6.9.7：显示进度提示行（书签、进度条、累计时长、打卡次数）
      if (progressEl) {
        var progressHtml = '';
        var active = (typeof currentTask !== 'undefined' && currentTask && currentTask.id === result.id) ? currentTask : result;
        var bText = active.bookmarkText || '';
        var bTotal = active.bookmarkTotal || '';
        var totalMins = active.totalMinutes || 0;
        var hasBookmark = !!bText;
        var hasTotal = totalMins > 0;
        var hasCount = active.completeCount && active.completeCount > 0;

        if (hasBookmark || hasTotal || hasCount) {
          // 第一行：书签与马卡龙进度条
          if (hasBookmark) {
            var bTextTrim = bText.trim();
            var bTotalTrim = bTotal.trim();
            var progressLabel = (bTotalTrim && bTextTrim.indexOf('/') === -1) ? bTextTrim + ' / ' + bTotalTrim : bTextTrim;
            progressHtml += '<div style="margin-bottom:6px;">🔖 当前进度: ' + progressLabel;

            // 👉 被你遗漏的进度条渲染核心逻辑
            var subtype = active.subtype;
            if (bTextTrim && bTotalTrim && subtype !== 'movie') {
              // 智能提取数字计算百分比
              var currNum = parseFloat(bTextTrim.replace(/[^\d.]/g, ''));
              var totalNum = parseFloat(bTotalTrim.replace(/[^\d.]/g, ''));
              if (!isNaN(currNum) && !isNaN(totalNum) && totalNum > 0) {
                var percent = Math.min(100, Math.max(0, Math.round((currNum / totalNum) * 100)));
                progressHtml += '<div style="max-width:140px; margin: 6px auto 0; background:#f0f1f5; border-radius:99px; height:6px; overflow:hidden;">' +
                  '<div style="width:' + percent + '%; background:linear-gradient(90deg, #A0E7E5, #FFB7B2); height:100%; border-radius:99px; transition:width 0.5s ease-out;"></div></div>';
              }
            }
            progressHtml += '</div>';
          }

          // 第二行：总计时长
          if (hasTotal) {
            var mins = totalMins % 60;
            var hours = Math.floor(totalMins / 60);
            var timeDisplay = totalMins < 60 ? (totalMins + 'm') : (hours + 'h' + (mins > 0 ? mins + 'm' : ''));
            progressHtml += '<div>⏱ 总计 ' + timeDisplay + '</div>';
          }

          // 第三行：累计打卡次数
          if (hasCount) {
            progressHtml += '<div style="margin-top:6px; color:#FF9AA2; font-weight:bold; font-size: 0.9rem;">💪 累计打卡: ' + active.completeCount + ' 次</div>';
          }
        }
        progressEl.innerHTML = progressHtml;
      }
      if (statusEl) statusEl.style.display = 'none';
      if (ingEl) ingEl.style.display = 'none';
      if (changeBtn) changeBtn.style.display = 'inline-block';
      if (primaryBtn) {
        primaryBtn.style.display = 'inline-block';
        primaryBtn.innerText = result.type === 'sos' ? '去完成' : '就它啦';
        currentStatus = result.type === 'sos' ? 'sos' : 'suggest';
      }
    }
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = 'stripOpen 0.28s ease-out forwards';
    card.style.display = 'block';
  }

  function startLiveTimer() {
    // 清理可能存在的所有幽灵定时器
    if (typeof liveTimerId !== 'undefined' && liveTimerId) clearInterval(liveTimerId);
    if (typeof window._anchorTimerId !== 'undefined' && window._anchorTimerId) clearInterval(window._anchorTimerId);
    
    var newTimerId = setInterval(function () {
        if (typeof currentStatus === 'undefined' || currentStatus !== 'anchor' || typeof anchorStartTime === 'undefined' || !anchorStartTime) return;
        
        var ingEl = document.getElementById('rIngPulse');
        if (!ingEl) return;
        
        // 👉 终极降维打击：不信任任何 JS 局部变量分身，直接查底层的绝对真理！
        var isEnabled = localStorage.getItem('anchor_timer_enabled') !== 'false'; // 只要不是明确的 false，就认为是开启
        var isRelax = (typeof currentTask !== 'undefined' && currentTask && (currentTask.type === 'culture' || currentTask.type === 'vinyl'));
        
        if (isEnabled) {
            var diff = Math.floor((Date.now() - anchorStartTime) / 1000);
            var h = Math.floor(diff / 3600);
            var m = Math.floor((diff % 3600) / 60);
            var s = diff % 60;
            var timeStr = h > 0 ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') : String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
            ingEl.innerText = (isRelax ? '✨ 蓄能 ' : '📌 专注 ') + timeStr;
        } else {
            ingEl.innerText = isRelax ? '✨ 蓄能 · 享受ING...' : '📌 锚点 · ING...';
        }
    }, 1000);

    if (typeof liveTimerId !== 'undefined') liveTimerId = newTimerId;
    window._anchorTimerId = newTimerId;
}

// 👉 终极降维打击：开关操作直接写入底层墙壁，并呼叫强制刷新
window.toggleSettingTimer = function(checked) {
  try {
      // 1. 直写底层墙壁
      localStorage.setItem('anchor_timer_enabled', checked);

      // 👉 2. v8.2.3 核心修复：砸碎单向玻璃，实施物理级实时渲染！
      // Why: 如果只是改了底层墙壁，UI 上正在跑的秒表会因为惯性发生“视觉残留”。必须当场复位文案，并重启引擎。
      const ingEl = document.getElementById('rIngPulse');
      if (!checked && ingEl) {
          ingEl.innerText = '正在进行中 · · ·'; // 关闭开关时，立刻复原占位文案，杜绝倒计时残影！
      }
      
      // 3. 踹一脚引擎室：如果当前正在专注任务，强制重启引擎让其应用新法则
      if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof startLiveTimer === 'function') {
          startLiveTimer();
      }
  } catch(e) {
      console.warn('存储计时器偏好失败', e);
  }
};
  function setCardAsAnchor(keepTime) {
    if (!currentTask || currentTask.type === 'sos') return;
    var statusEl = document.getElementById('rStatus');
    var primaryBtn = document.getElementById('btnPrimary');
    var ingEl = document.getElementById('rIngPulse');

    // 👉 核心清场：正式开工时，绝对不允许微启动的小广告留在台上
    var btnStartTrailer = document.getElementById('btnStartTrailer');
    var trailerZone = document.getElementById('trailerZone');
    var trailerEntryZone = document.getElementById('trailerEntryZone');
    if (btnStartTrailer) btnStartTrailer.style.display = 'none';
    if (trailerZone) trailerZone.style.display = 'none';
    if (trailerEntryZone) trailerEntryZone.style.display = 'none';

    if (statusEl) { statusEl.style.display = 'block'; statusEl.innerText = (currentTask.type === 'culture' || currentTask.type === 'vinyl') ? '✨ 蓄能 · ING...' : '📌 锚点 · ING...'; }
    if (ingEl) ingEl.style.display = 'block';
    if (primaryBtn) primaryBtn.innerText = '已完成';
    currentStatus = 'anchor';
    
    // 如果没有传入时空拨回的参数，才重置为现在
    if (!keepTime) anchorStartTime = Date.now();
    
    // v8.0 补齐：把 activePlaylist 一并刻入墙壁，防止刷新后失去连抽上下文
    if (typeof KEY_LIVE_STATE !== 'undefined') {
      localStorage.setItem(KEY_LIVE_STATE, JSON.stringify({
        task: currentTask,
        startTime: (typeof anchorStartTime !== 'undefined' ? anchorStartTime : null),
        activePl: (typeof activePlaylist !== 'undefined' ? activePlaylist : null)
      }));
    }
    startLiveTimer();
  }

  function openHarvestDialogAsync(defaultMins, task) {
    if (task === void 0) task = null;
    return new Promise(function (resolve) {
      var dlg = document.getElementById('harvestDialog');
      if (!dlg) {
        resolve({ mins: defaultMins, bookmark: null, note: null });
        return;
      }
      var selH = document.getElementById('harvestH');
      var selM = document.getElementById('harvestM');
      var bookmarkInput = document.getElementById('harvestBookmark');
      var nInp = document.getElementById('harvestNote'); // 👉 1. 抓取你刚刚在 HTML 加的本次小记输入框

      if (!selH || !selM) {
        resolve({ mins: defaultMins, bookmark: null, note: null });
        return;
      }
      selH.innerHTML = '';
      selM.innerHTML = '';
      for (var i = 0; i < 24; i++) selH.add(new Option(i + 'h', i));
      for (var j = 0; j < 60; j++) selM.add(new Option(String(j).padStart(2, '0') + 'm', j));
      selH.value = Math.floor(defaultMins / 60);
      selM.value = defaultMins % 60;

      // 书签继承上一次的进度
      if (bookmarkInput) {
        bookmarkInput.value = task && task.bookmarkText ? task.bookmarkText : '';
      }
      
      // 👉 2. 小记永远保持纯净留白，等待新灵感降临
      if (nInp) {
        nInp.value = ''; 
      }

      var msgEl = document.getElementById('harvestMsg');
      if (msgEl) {
        msgEl.innerText = defaultMins > 180 ? '似乎挂机了 ' + Math.floor(defaultMins / 60) + ' 小时😅 请手动修正：' : '本次专注了 ' + defaultMins + ' 分钟，要存入记忆吗？';
      }
      dlg.style.display = 'flex';

      // 👉 3. 升级收银员：把时长、书签和小记一起打包带走
      window._resolveHarvest = function (val) {
        dlg.style.display = 'none';
        var finalMins = val === -1
          ? (parseInt(selH.value, 10) * 60 + parseInt(selM.value, 10))
          : 0;
        var finalBookmark = (val === -1 && bookmarkInput)
          ? bookmarkInput.value.trim()
          : null;
        var finalNote = (val === -1 && nInp)
          ? nInp.value.trim()
          : null;
          
        resolve({ mins: finalMins, bookmark: finalBookmark, note: finalNote });
      };
    });
  }

  async function completeTaskCore(task, opts) {
    if (!task) return;
    opts = opts || {};
    var silent = !!opts.silentCard;

    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // 👉 夜猫子开始日界：若有 anchorStartTime，则以开始时间决定归属日
    var taskBaseDate = now;
    if (!silent && typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof anchorStartTime !== 'undefined' && anchorStartTime) {
      taskBaseDate = new Date(anchorStartTime);
    }
    var anchorTodayStr = getAnchorDate(taskBaseDate).toDateString();

    // 👉 追回：SOS 模式只重置状态，绝对不记入足迹/荣誉殿堂
    if (task && task.type === 'sos') {
      if (!silent) {
        if (typeof showToast === 'function') showToast("状态重启！🌱");
        var cardSos = document.getElementById('resultCard');
        if (cardSos) cardSos.style.display = 'none';
        currentTask = null;
        if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
        if (typeof anchorStartTime !== 'undefined') anchorStartTime = null;
        try { localStorage.removeItem(KEY_LIVE_STATE); } catch (e) {}
        if (typeof liveTimerId !== 'undefined' && liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }
        var statusElSos = document.getElementById('rStatus');
        var ingElSos = document.getElementById('rIngPulse');
        if (statusElSos) statusElSos.style.display = 'none';
        if (ingElSos) ingElSos.style.display = 'none';
      }
      return;
    }

    // db 中的最新状态优先
    var taskInDb = db.find(function (t) { return t.id === task.id; });
    var finalTask = taskInDb || task;


    

    // 若任务进行中且有开始时间，生成双时间戳跨度
    if (!silent && typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof anchorStartTime !== 'undefined' && anchorStartTime) {
      var startDt = new Date(anchorStartTime);
      var startStr = startDt.getHours().toString().padStart(2, '0') + ':' + startDt.getMinutes().toString().padStart(2, '0');
      if (startStr !== timeStr) {
        timeStr = startStr + ' - ' + timeStr;
      }
    }

    /// 时间收割机：5 秒起步算 1 分钟
    var harvestMins = 0;
    if (!silent && typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof anchorStartTime !== 'undefined' && anchorStartTime) {
      var elapsedSecs = Math.floor((Date.now() - anchorStartTime) / 1000);
      var elapsedMins = Math.floor(elapsedSecs / 60);
      if (elapsedSecs >= 5 && elapsedSecs < 60) elapsedMins = 1; // 10秒容错
      
      if (elapsedMins >= 1 && typeof openHarvestDialogAsync === 'function') {
        try {
            var harvestResult = await openHarvestDialogAsync(elapsedMins, currentTask);
            harvestMins = harvestResult.mins || 0;
            var newBookmark = harvestResult.bookmark;
            var newNote = harvestResult.note; // 从收银台接过小记

            // 👉 提取任务真身（绝对安全防崩取值法）
            var realTask = typeof finalTask !== 'undefined' ? finalTask : (db.find(function(t){ return t.id === currentTask.id }) || currentTask);

            // 同步书签
            if (newBookmark !== null && newBookmark !== undefined) {
              realTask.bookmarkText = newBookmark;
              realTask.bookmarkUpdatedAt = Date.now();
            }

            // 同步本次小记
            if (newNote !== null && newNote !== undefined) {
              realTask.noteText = newNote;
              realTask.noteUpdatedAt = Date.now();
            }

            // 同步回主数据库，防刷新丢失
            var idxB = db.findIndex(function(t) { return t.id === realTask.id; });
            if (idxB > -1) {
                if (newBookmark !== null) db[idxB].bookmarkText = newBookmark;
                if (newNote !== null) db[idxB].noteText = newNote;
                db[idxB].noteUpdatedAt = Date.now();
            }
            
            // 🚨 极其重要：拿到记忆后立刻强行落盘一次！哪怕后续流程断了，心血也绝对保住！
            if (typeof save === 'function') save();

        } catch (error) {
            console.error("时间收割机发生崩溃:", error);
            if (typeof showToast === 'function') showToast("⚠️ 记录记忆时遇到小波折，但任务已成功结束");
        }
      }
    }

    // 有有效收割时间时，更新任务记忆时长
    if (harvestMins > 0) {
      finalTask.totalMinutes = (finalTask.totalMinutes || 0) + harvestMins;
      finalTask.lastAddMinutes = harvestMins;
      finalTask.totalUpdatedAt = Date.now();
      var idxInDb = db.findIndex(function (t) { return t.id === finalTask.id; });
      if (idxInDb > -1) {
        db[idxInDb].totalMinutes = finalTask.totalMinutes;
        db[idxInDb].lastAddMinutes = finalTask.lastAddMinutes;
      }

      // 清单子任务：将时间回写到 customPlaylists.items 的隐形存钱罐
      if (finalTask.isPlaylist && typeof customPlaylists !== 'undefined' && typeof activePlaylist !== 'undefined' && activePlaylist) {
        var pIdx2 = customPlaylists.findIndex(function (p) { return p && String(p.id) === String(activePlaylist.id); });
        if (pIdx2 > -1 && Array.isArray(customPlaylists[pIdx2].items)) {
          var rawText2 = finalTask.rawTaskText;
          var matchIdx2 = customPlaylists[pIdx2].items.findIndex(function (it) { return it && (it.text === rawText2 || it.title === rawText2); });
          if (matchIdx2 > -1 && customPlaylists[pIdx2].items[matchIdx2]) {
            // 1. 存入子任务自身的隐形存钱罐
            customPlaylists[pIdx2].items[matchIdx2].totalMinutes = (customPlaylists[pIdx2].items[matchIdx2].totalMinutes || 0) + harvestMins;
            customPlaylists[pIdx2].items[matchIdx2].lastAddMinutes = harvestMins;

            // 👉 v8.X 核心修复：顺藤摸瓜，向上级项目汇报战果 (事件冒泡)
            var parentPlaylist = customPlaylists[pIdx2];
            if (parentPlaylist.projectId) {
              var projIdx = customPlaylists.findIndex(function(proj) { return proj && String(proj.id) === String(parentPlaylist.projectId); });
              if (projIdx > -1) {
                // 汇入项目总时长与完成子节点数
                customPlaylists[projIdx].linkedTotalMinutes = (customPlaylists[projIdx].linkedTotalMinutes || 0) + harvestMins;
                customPlaylists[projIdx].linkedCompletedCount = (customPlaylists[projIdx].linkedCompletedCount || 0) + 1;
                
                // 实时刷新项目大展厅 UI，让宏观进度条瞬间动起来
                if (typeof window.renderProjectConsoleInner === 'function') {
                  window.renderProjectConsoleInner(parentPlaylist.projectId);
                }
              }
            }

            if (typeof savePlaylists === 'function') savePlaylists();
          }
        }
      }
    }

 // 👉 v8.X 红线通讯局（时序修正版）：在时间收割完毕后，向项目本尊汇报战果！
 if (finalTask.projectId && typeof customPlaylists !== 'undefined') {
  const pIdx = customPlaylists.findIndex(p => p && String(p.id) === String(finalTask.projectId));
  if (pIdx > -1) {
      // 1. 汇报完成人头数
      customPlaylists[pIdx].linkedCompletedCount = (customPlaylists[pIdx].linkedCompletedCount || 0) + 1;
      // 2. 提取刚刚收割并写入的真实时长（防止未收割时产生 undefined）
      const harvestedMins = finalTask.lastAddMinutes || 0;
      customPlaylists[pIdx].linkedTotalMinutes = (customPlaylists[pIdx].linkedTotalMinutes || 0) + harvestedMins;
      
      // 3. 落盘并刷新 03 区展厅
      if (typeof savePlaylists === 'function') savePlaylists();
      if (typeof renderCabinet === 'function') renderCabinet(); 
      // 👉 亲自补丁 2：战果汇报完毕，立刻让项目大展厅重绘，实现秒划线！
      if (typeof window.renderProjectConsoleInner === 'function') {
        window.renderProjectConsoleInner(finalTask.projectId);
    }
  }
}

    // 👉 v7.1.2 核心：前台进度满格自动杀青（兼容限速里程碑）
    const currentProg = (finalTask.bookmarkText || '').trim();
    const targetProg = (finalTask.bookmarkTotal || '').trim();
    const isProgressFull = currentProg && targetProg && currentProg === targetProg;

    if (!silent && isProgressFull) {
      const tempNow = new Date();
      const killTimeStr = tempNow.getHours().toString().padStart(2, '0') + ":" + tempNow.getMinutes().toString().padStart(2, '0');
      const anchorDateStr = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toDateString();

      // 1. 写入【大结局】足迹
      dailyLog.unshift({
        id: Date.now(),
        title: finalTask.title,
        icon: '🏆',
        timeStr: killTimeStr,
        date: anchorDateStr,
        done: true,
        taskId: finalTask.id,
        bookmarkSnapshot: currentProg + ' / ' + targetProg,
        noteSnapshot: finalTask.noteText || '',
        lastAddMinutes: finalTask.lastAddMinutes || 0
      });

      // 2. 从任务池抹除，升入荣誉殿堂
      if (typeof db !== 'undefined') db = db.filter(t => t.id !== finalTask.id);
      if (typeof archive !== 'undefined') {
        archive.unshift({
          ...finalTask,
          finishDate: (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString()
        });
      }

      // 3. 视觉庆祝与状态清理
      if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
      if (typeof showToast === 'function') showToast("🏆 目标达成！伟大里程碑已自动归档");

      var card = document.getElementById('resultCard');
      var statusEl = document.getElementById('rStatus');
      var ingEl = document.getElementById('rIngPulse');
      if (card) card.style.display = 'none';
      if (statusEl) statusEl.style.display = 'none';
      if (ingEl) ingEl.style.display = 'none';
      currentTask = null;
      if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
      if (typeof anchorStartTime !== 'undefined') anchorStartTime = null;
      try { localStorage.removeItem(typeof KEY_LIVE_STATE !== 'undefined' ? KEY_LIVE_STATE : 'anchor_live_state'); } catch(e){}
      if (typeof liveTimerId !== 'undefined' && liveTimerId) clearInterval(liveTimerId);

      if (typeof save === 'function') save();
      if (typeof renderLog === 'function') renderLog();
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof renderList === 'function') renderList();
      if (typeof renderArchive === 'function') renderArchive();
      if (typeof renderHeatmap === 'function') renderHeatmap();
      
      // 🚨 绝对阻断：终止后续所有的普通循环、单次任务判定逻辑，防止二次写入
      return;
    }

    // 快照字段：bookmarkSnapshot / targetProgressSnapshot / noteSnapshot / lastAddMinutes / isTrailer
    var bookmarkSnapshot = finalTask.bookmarkText
      ? (finalTask.bookmarkTotal ? finalTask.bookmarkText + ' / ' + finalTask.bookmarkTotal : finalTask.bookmarkText)
      : '';
    var noteSnapshot = finalTask.noteText || '';
    var lastAddMinutesVal = finalTask.lastAddMinutes || harvestMins || 0;

    // 主线完成足迹：包含全量快照字段
    if (!silent) {
      var newLog = {
        id: Date.now(),
        title: finalTask.title,
        icon: finalTask.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(finalTask) : '✅'),
        timeStr: timeStr,
        date: anchorTodayStr,
        done: true,
        taskId: finalTask.id,
        bookmarkSnapshot: bookmarkSnapshot,
        targetProgressSnapshot: (finalTask.bookmarkTotal || '').trim(),
        noteSnapshot: noteSnapshot,
        lastAddMinutes: lastAddMinutesVal,
        isTrailer: opts.isTrailer || false
      };

      // 🚨 携带身份钢印，顺藤摸瓜，让右脑时间轴能准确认出它是哪个清单的子任务！
      if (finalTask.isPlaylist && typeof activePlaylist !== 'undefined' && activePlaylist && activePlaylist.id) {
          newLog.type = 'checklist_item';
          newLog.playlistId = activePlaylist.id;
      }

      dailyLog.unshift(newLog);
    }

    // 👉 v8.0 修复：大一统的周期任务结算（日/周/月/长期），并强制刷新 UI
    if (['daily', 'weekly', 'monthly'].includes(task.recurrence)) {
      var taskIndex = db.findIndex(function (t) { return t.id === task.id; });
      if (taskIndex > -1) {
        db[taskIndex].lastDone = anchorTodayStr;
        db[taskIndex].completeCount = (db[taskIndex].completeCount || 0) + 1;
      }
      if (typeof renderLog === 'function') renderLog();
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof save === 'function') save();
      if (typeof renderList === 'function') renderList(); // 🚨 核心：必须重绘列表以立刻显示✅划线
      if (typeof showToast === 'function') showToast("✅ 周期打卡成功！");
    }
    // 2）书 / 影 / 剧 / 文娱 等 culture 类
    else if (task.type === 'culture') {
      // 👉 核心重构：强制对齐 db 最新状态，彻底抛弃流转中可能掉件的 task
      const subtype = finalTask.subtype || null;
      const icon = finalTask.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(finalTask) : '');
      const isSeries = !!finalTask.isSeries;
      const isMovie = (subtype === 'movie') || icon === '🎬';
      const isEvent = (subtype === 'other') || icon === '🎭' || icon === '🖼️';

      // 2.1 🎭/🖼️ 线下文娱活动：一次性结项，直接进荣誉殿堂
      if (isEvent) {
        db = Array.isArray(db) ? db.filter(t => t.id !== finalTask.id) : db;
        if (Array.isArray(archive)) {
          archive.unshift(Object.assign({}, finalTask, {
            finishDate: (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString()
          }));
        }
        if (typeof save === 'function') save();
        if (typeof renderList === 'function') renderList();
        if (typeof renderArchive === 'function') renderArchive();
        if (typeof showToast === 'function') showToast("🏆 体验达成，已入荣誉殿堂");
      }
      // 2.2 🎬 电影（非系列）：询问是否彻底看完
      else if (isMovie && !isSeries) {
        var ok = confirm('《' + task.title + '》这部电影彻底看完了吗？\n[确定]=归档 [取消]=仅记录本次观看');
        if (ok) {
          db = db.filter(function (t) { return t.id !== task.id; });
          archive.unshift(Object.assign({}, task, { finishDate: now.toLocaleDateString() }));
          save(); 
          renderList(); 
          if (typeof renderArchive === 'function') renderArchive();
          
          // 👉 v8.1 补回：电影彻底看完被自动归档时，必须撒花庆祝！
          if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
          
          if (typeof showToast === 'function') showToast("🏆 已归档");
        } else {
          // 仅记足迹，上文已写入 dailyLog，这里只补一下状态和提示
          if (typeof save === 'function') save();
          if (typeof renderLog === 'function') renderLog();
          if (typeof renderList === 'function') renderList();
          if (typeof showToast === 'function') showToast("🎬 已记录到今日足迹");
        }
      }
      // 2.3 📚 书 / 剧集 / 其他：长期推进，仅记进度
      else {
        if (typeof save === 'function') save();
        if (typeof renderLog === 'function') renderLog();
        if (typeof renderHistory === 'function') renderHistory();
        if (typeof renderList === 'function') renderList();
        if (typeof showToast === 'function') showToast("📚 进度已更新，记录至今日足迹");
      }
      // 🚨 绝对铁律：此处千万不要写 return; 必须让代码向下流淌执行卡片关闭逻辑！
    } else if (task.recurrence === 'long_term' || task.type === 'long_term') {
      if (typeof save === 'function') save();
      if (typeof renderList === 'function') renderList();
      if (typeof showToast === 'function') showToast("🚀 阶段推进成功！");
    } else {
      // 单次任务：阅后即焚（或转为项目资产）
      db = db.filter(function (i) { return i.id !== task.id; });
      
      // 👉 v8.2.X 资产保护核心修复：使用全量基因克隆，找回致命遗漏的 ID 与所有记忆属性，保障右脑检索
      if (task.isFrog || task.projectId) {
        archive.unshift(Object.assign({}, finalTask, {
          type: task.isFrog ? 'important' : finalTask.type,
          isFrog: task.isFrog,
          projectId: task.projectId, // 保留项目归属，供项目大展厅认领
          // 确保图标准确，防止早期的空底色任务丢失智能图标
          icon: finalTask.icon || task.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(task) : ''),
          finishDate: (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString(),
          // 🚨 隐形资产钢印：只有非青蛙的普通项目琐事，才在荣誉殿堂中隐形展示！
          _isProjectHiddenAsset: (!task.isFrog && !!task.projectId)
        }));
      }
      
      if (typeof save === 'function') save();
      if (typeof renderList === 'function') renderList();
      if (typeof renderArchive === 'function') renderArchive();
      if (typeof showToast === 'function') showToast(task.isFrog ? "🏅 重要任务已加入荣誉殿堂！" : "✨ 完成！");
      if (task.isFrog && typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
    }
    var card = document.getElementById('resultCard');
    if (card) card.style.display = 'none';
    var statusEl = document.getElementById('rStatus');
    var ingEl = document.getElementById('rIngPulse');
    if (statusEl) statusEl.style.display = 'none';
    if (ingEl) ingEl.style.display = 'none';
    currentTask = null;
    currentStatus = 'idle';
    anchorStartTime = null;
    try { localStorage.removeItem(KEY_LIVE_STATE); } catch (e) {}
    if (liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    // 👉 核心修复 2：只有当前完成的任务是"清单子任务"时，才允许触发清单连抽
    // 👉 v8.1.3 修复：清单子任务完成时的底层同步、足迹补写与强制连抽
 // 👉 What & Why: 找回 v7.1.4 金标准。仅静默同步底层清单的 done 状态。
    // 绝不能在这里抢答写入 dailyLog，把写足迹的权力交还给 completeTaskCore 的最终结算处！
    if (task && task.isPlaylist && typeof activePlaylist !== 'undefined' && activePlaylist && activePlaylist.id) {
      try {
          if (typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) {
              const pIdx = customPlaylists.findIndex(p => p && String(p.id) === String(activePlaylist.id));
              if (pIdx > -1) {
                  const pl = customPlaylists[pIdx];
                  const rawText = (task.rawTaskText || '').toString();

                  // 👉 仅同步内存状态，不发任何多余广播
                  let items = Array.isArray(pl.items) ? pl.items : null;
                  if ((!items || items.length === 0) && Array.isArray(pl.tasks) && pl.tasks.length > 0) {
                      items = pl.tasks.map(text => ({ text, done: false }));
                      pl.items = items;
                  }
                  if (items && items.length > 0 && rawText) {
                    const matchIdx = items.findIndex(it => it && (it.text === rawText || it.title === rawText));
                    if (matchIdx > -1 && items[matchIdx]) {
                        // 👉 What & Why: 找回 v8.1.3 的杀青检测！
                        // 调用底层的“静默打钩”模式（第五个参数 isSilentSkip = true）。
                        // 既同步了状态，且不发足迹广播（防双胞胎），还能完美触发 100% 满格的 🏆 杀青颁奖！
                        if (typeof window.toggleCabinetItem === 'function') {
                            window.toggleCabinetItem(pIdx, matchIdx, true, true, true);
                        } else {
                            items[matchIdx].done = true;
                        }
                    }
                }
                  
                  // 👉 默默存盘，保证数据不丢
                  if (typeof savePlaylists === 'function') savePlaylists();
                  if (typeof renderCabinet === 'function') renderCabinet();

                  if (rawText && typeof save === 'function') {
                      save();
                      if (typeof renderLog === 'function') renderLog();
                      if (typeof renderHistory === 'function') renderHistory();
                  }
              }
          }
        } catch (e) {
          console.warn('completeTaskCore playlist-subtask sync error', e);
      }
      
      // 👉 What & Why: [修复4] 极其安全的连抽接力棒！
      // 因为在这段代码的上方，旧卡片的 UI 和状态 (currentTask=null, clearInterval 等) 已彻底清空，
      // 底层档案柜也已同步完毕。此时我们再呼叫下一张清单卡，绝对不会发生状态重叠崩溃！
      if (typeof activePlaylist !== 'undefined' && activePlaylist) {
          if (typeof drawFromPlaylist === 'function') {
              drawFromPlaylist();
          }
      }
      
    } // 结束 if (task && task.isPlaylist...) 分支
} // 结束 completeTaskCore 函数

  function finishTask() {
    if (!currentTask) return;
    completeTaskCore(currentTask, { silentCard: false });
  }
  function finishTask() {
    if (!currentTask) return;
    completeTaskCore(currentTask, { silentCard: false });
  }
  function handlePrimaryAction() {
    if (!currentTask) return;
    
    // 无论决策如何，先退出暗场沉浸态
    if (typeof exitImmersiveMode === 'function') exitImmersiveMode();
    
    if (currentTask.type === 'sos') {
        if (typeof finishTask === 'function') finishTask();
        return;
    }
    
    if (currentStatus === 'suggest') {
        // 👉 v8.2 引路卡拦截特权：如果是引路卡，绝不开启普通秒表，直接拉开对应隧道大门！
        if (currentTask.type === 'trigger' && currentTask.targetPlaylistId) {
            if (typeof customPlaylists !== 'undefined') {
                const targetPl = customPlaylists.find(p => String(p.id) === String(currentTask.targetPlaylistId));
                if (targetPl) {
                    if (typeof openPlaylistOverlay === 'function') {
                        openPlaylistOverlay(targetPl);
                        currentStatus = 'idle'; // 重置底层状态，将控制权交给专属 Overlay
                    }
                } else {
                    if (typeof showToast === 'function') showToast("⚠️ 未找到该隧道数据，可能已被删除");
                }
            }
        } else {
            // 普通任务：进入计时定锚状态
            if (typeof setCardAsAnchor === 'function') setCardAsAnchor();
        }
    } 
    else if (currentStatus === 'anchor') {
        if (typeof finishTask === 'function') finishTask();
    } 
    else {
        if (typeof draw === 'function') draw();
    }
}

  async function changeTask() {
    if (trailerTimer) { clearInterval(trailerTimer); trailerTimer = null; }
    // 1. 退出沉浸模式
    exitImmersiveMode();

    var discardedTaskId = (typeof currentTask !== 'undefined' && currentTask) ? currentTask.id : null;

    // 2. 清单模式的退回逻辑（保持与 v8 现有实现一致）
    if (typeof activePlaylist !== 'undefined' && activePlaylist) {
      if (!Array.isArray(activePlaylist.tasks)) activePlaylist.tasks = [];
      if (activePlaylist.tasks.length > 0) {
        var discardedText = currentTask ? currentTask.rawTaskText : null;
        var card = document.getElementById('resultCard');
        if (card) {
          card.style.animation = 'none';
          card.style.opacity = 0;
        }
        setTimeout(function () {
          if (typeof drawFromPlaylist === 'function') drawFromPlaylist();
          if (discardedText) activePlaylist.tasks.push(discardedText);
        }, 80);
      } else {
        if (typeof showToast === 'function') showToast("清单里只剩这一个啦，一鼓作气做完它吧！");
      }
      return;
    }

    // 非清单模式下，可能需要记录一次「勇敢的尝试」足迹
    if (!currentTask) {
      if (typeof draw === 'function') draw(discardedTaskId);
      return;
    }

    // v6.9.7 核心修复：如果任务已开始进行且超过 5 秒，放弃时触发时长收割与足迹记录
    if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof anchorStartTime !== 'undefined' && anchorStartTime) {
      var elapsedSecs = Math.floor((Date.now() - anchorStartTime) / 1000);
      if (elapsedSecs >= 5) {
        var elapsedMins = Math.floor(elapsedSecs / 60);
        if (elapsedSecs >= 5 && elapsedSecs < 60) elapsedMins = 1;

        var harvestMins = 0;
        var newBookmark = null;

        if (elapsedMins >= 1 && elapsedMins <= 180) {
          if (typeof openHarvestDialogAsync === 'function') {
            var harvestResult = await openHarvestDialogAsync(elapsedMins, currentTask);
            if (harvestResult) {
              harvestMins = harvestResult.mins;
              newBookmark = harvestResult.bookmark;
            }
          }
        } else if (elapsedMins > 180) {
          var ans = prompt('似乎挂机了 ' + Math.floor(elapsedMins / 60) + ' 小时😅\n如果只是中途放弃，请手动输入实际尝试了多少分钟 (0为不记录)：', String(elapsedMins));
          harvestMins = parseInt(ans, 10) || 0;
        }

        // 在最外层确立原任务对象，防止 ReferenceError 导致程序猝死
        var taskInDb = db.find(function (t) { return t.id === currentTask.id; }) || currentTask;

        // 更新进度书签
        if (newBookmark !== null && newBookmark !== taskInDb.bookmarkText) {
          taskInDb.bookmarkText = newBookmark;
          taskInDb.bookmarkUpdatedAt = Date.now();
        }

        // 更新累计时间
        if (harvestMins > 0) {
          taskInDb.totalMinutes = (taskInDb.totalMinutes || 0) + harvestMins;
          taskInDb.lastAddMinutes = harvestMins;
          taskInDb.totalUpdatedAt = Date.now();
        }

        // 生成时间跨度
        var startDt = new Date(anchorStartTime);
        var startStr = startDt.getHours().toString().padStart(2, '0') + ':' + startDt.getMinutes().toString().padStart(2, '0');
        var now = new Date();
        var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        if (startStr !== timeStr) timeStr = startStr + ' - ' + timeStr;

        // 写入今日足迹 (done: false 表示这是一次未完成的尝试)
        dailyLog.unshift({
          id: Date.now(),
          title: taskInDb.title,
          icon: taskInDb.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(taskInDb) : ''),
          timeStr: timeStr,
          date: typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString(),
          done: false,
          taskId: taskInDb.id,
          bookmarkSnapshot: taskInDb.bookmarkText || '',
          noteSnapshot: taskInDb.noteText || '',
          lastAddMinutes: harvestMins
        });

        if (typeof save === 'function') save();
        if (typeof renderLog === 'function') renderLog();
        if (typeof renderHistory === 'function') renderHistory();
        if (typeof showToast === 'function') showToast('🐾 已记录一次勇敢的尝试');
      }
    }

    // 3. 彻底清空状态，恢复 UI，重新抽卡
    currentTask = null;
    if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
    if (typeof anchorStartTime !== 'undefined') anchorStartTime = null;
    try { localStorage.removeItem(KEY_LIVE_STATE); } catch (e) {}
    if (typeof liveTimerId !== 'undefined' && liveTimerId) { clearInterval(liveTimerId); liveTimerId = null; }

    var statusEl = document.getElementById('rStatus');
    var ingEl = document.getElementById('rIngPulse');
    if (statusEl) statusEl.style.display = 'none';
    if (ingEl) ingEl.style.display = 'none';

    if (typeof draw === 'function') draw(discardedTaskId);

    // 物联网联动：状态重置时自动静默通知云端
    if (typeof syncToCloud === 'function') syncToCloud(true);
  }

  function formatTrailerTime(seconds) {
    var m = Math.floor(seconds / 60).toString();
    var s = (seconds % 60).toString();
    if (m.length < 2) m = '0' + m;
    if (s.length < 2) s = '0' + s;
    return m + ':' + s;
  }

  function startTrailer() {
    var btnStart = document.getElementById('btnStartTrailer');
    var btnChange = document.getElementById('btnChange');
    var btnPrimary = document.getElementById('btnPrimary');
    var tz = document.getElementById('trailerZone');
    var tc = document.getElementById('trailerChoices');
    var td = document.getElementById('trailerTimerDisplay');

    if (btnStart) btnStart.style.display = 'none';
    if (btnChange) btnChange.style.display = 'none';
    if (btnPrimary) btnPrimary.style.display = 'none';
    if (tz) tz.style.display = 'block';
    if (tc) tc.style.display = 'none';

    trailerTimeElapsed = 0;
    if (td) { td.innerText = '00:00'; td.style.color = '#75B79E'; }

    if (trailerTimer) clearInterval(trailerTimer);
    trailerTimer = setInterval(function () {
      trailerTimeElapsed++;
      if (td) td.innerText = formatTrailerTime(trailerTimeElapsed);
      if (trailerTimeElapsed === 60) {
        if (td) td.style.color = '#FFB7B2';
        if (tc) tc.style.display = 'flex';
        if (typeof showToast === 'function') showToast('🎉 1 分钟到了！');
      }
    }, 1000);
  }

  function continueFromTrailer() {
    if (trailerTimer) { clearInterval(trailerTimer); trailerTimer = null; }
    var tz = document.getElementById('trailerZone');
    if (tz) tz.style.display = 'none';
    var btnStart = document.getElementById('btnStartTrailer');
    var btnChange = document.getElementById('btnChange');
    var btnPrimary = document.getElementById('btnPrimary');
    if (btnStart) btnStart.style.display = '';
    if (btnChange) btnChange.style.display = 'inline-block';
    if (btnPrimary) btnPrimary.style.display = 'inline-block';

    // 👉 v8.1 核心修复：时空拨回法 (Time Travel)
    // What: 将开始时间强行拨回到微启动开始的那个时刻
    // Why: 这样 startLiveTimer 计算 (Date.now() - anchorStartTime) 时，就完美继承了预告片跑过的时间！
    if (typeof trailerTimeElapsed !== 'undefined' && trailerTimeElapsed > 0) {
        anchorStartTime = Date.now() - (trailerTimeElapsed * 1000);
    }

    if (typeof setCardAsAnchor === 'function') setCardAsAnchor(true);
    if (typeof showToast === 'function') showToast('🔥 状态不错！正式开始！');
  }

  function finishTrailer() {
    if (trailerTimer) { clearInterval(trailerTimer); trailerTimer = null; }
    if (!currentTask) return;
    if (typeof completeTaskCore === 'function') {
      completeTaskCore(currentTask, { silentCard: false, isTrailer: true });
    }
  }

  function cancelTrailer() {
    if (trailerTimer) { clearInterval(trailerTimer); trailerTimer = null; }
    if (typeof changeTask === 'function') changeTask();
  }

  function drawFromPlaylist() {
    if (!activePlaylist) return;
    if (!Array.isArray(activePlaylist.tasks)) activePlaylist.tasks = [];
    if (activePlaylist.tasks.length === 0) {
      if (typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) {
        var pIdx = customPlaylists.findIndex(function (p) { return p && String(p.id) === String(activePlaylist.id); });
        if (pIdx > -1) {
          // 👉 What & Why: 彻底裁撤 01 区的“幽灵颁发员”。
          // 发奖杯、记足迹、算次数的逻辑，已全部交由底层的 toggleCabinetItem 统一处理。
          // 这里只需默默存盘，防止双胞胎记录和状态冲突！
          if (typeof savePlaylists === 'function') savePlaylists();
          if (typeof renderCabinet === 'function') renderCabinet();
          if (typeof save === 'function') {
            save();
            if (typeof renderLog === 'function') renderLog();
            if (typeof renderHistory === 'function') renderHistory();
          }
        }
      }
      if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
      var finishCount = 1;
      if (typeof customPlaylists !== 'undefined') {
        var realPl = customPlaylists.find(function (p) { return String(p.id) === String(activePlaylist.id); });
        if (realPl && realPl.completeCount) finishCount = realPl.completeCount;
      }
      var plName = activePlaylist.name;
      activePlaylist = null;
      var selPl = document.getElementById('selPlaylist');
      if (selPl) selPl.value = '';
      if (typeof handlePlaylistChange === 'function') handlePlaylistChange();
      if (typeof renderPlaylistEditor === 'function') renderPlaylistEditor();
      var card = document.getElementById('resultCard');
      var ph = document.getElementById('placeholder');
      var gachaLayer = document.getElementById('gachaLayer');
      if (ph) ph.style.display = 'none';
      if (gachaLayer) gachaLayer.style.display = 'none';
      if (card) {
        var titleEl = document.getElementById('rTitle');
        var iconEl = document.getElementById('rIcon');
        var descEl = document.getElementById('rDesc');
        var timeEl = document.getElementById('rTime');
        var badgeEl = document.getElementById('rBadge');
        var progressEl = document.getElementById('rProgress');
        if (titleEl) titleEl.innerText = '【' + plName + '】全部完成！';
        if (iconEl) iconEl.innerText = '🏆';
        if (descEl) descEl.innerText = '这条专注隧道，你已经成功打通了 ' + finishCount + ' 次！去休息一下吧。';
        if (timeEl) timeEl.innerText = '🎉 完美收工';
        if (badgeEl) badgeEl.innerHTML = '';
        if (progressEl) progressEl.innerHTML = '';
        var statusEl = document.getElementById('rStatus');
        var ingEl = document.getElementById('rIngPulse');
        var btnChange = document.getElementById('btnChange');
        var btnPrimary = document.getElementById('btnPrimary');
        var btnMemory = document.getElementById('btnMemory');
        if (statusEl) statusEl.style.display = 'none';
        if (ingEl) ingEl.style.display = 'none';
        if (btnChange) btnChange.style.display = 'none';
        if (btnPrimary) btnPrimary.style.display = 'none';
        if (btnMemory) btnMemory.style.display = 'none';
        currentTask = null;
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'stripOpen 0.28s ease-out forwards';
        card.style.display = 'block';
      }
      return;
    }
    var taskText;
    if (activePlaylist.mode === 'sequence') {
      taskText = activePlaylist.tasks.shift();
    } else {
      var idx = Math.floor(Math.random() * activePlaylist.tasks.length);
      taskText = activePlaylist.tasks.splice(idx, 1)[0];
    }
    var baseTask = {
      id: 'pl_' + Date.now(),
      title: '【' + (activePlaylist.name || '') + '】' + taskText,
      rawTaskText: taskText,
      type: 'playlist',
      icon: activePlaylist.icon || '📑',
      desc: '专属清单进行中',
      time: 0,
      isPlaylist: true
    };
    currentTask = baseTask;
    var phEl = document.getElementById('placeholder');
    var gLayer = document.getElementById('gachaLayer');
    if (phEl) phEl.style.display = 'none';
    if (gLayer) gLayer.style.display = 'none';
    var cardEl = document.getElementById('resultCard');
    if (cardEl) {
      cardEl.style.opacity = '';
      cardEl.style.animation = 'none';
      void cardEl.offsetWidth;
      cardEl.style.animation = 'stripOpen 0.28s ease-out forwards';
    }
    if (typeof renderResultCard === 'function') renderResultCard(currentTask);
  }

  var currentRitualType = null;

  function dimRitualButton(type) {
    if (!type) return;
    var selector = type === 'morning'
      ? '.ritual-icon-btn[data-ritual="morning"]'
      : '.ritual-icon-btn[data-ritual="night"]';
    var btn = document.querySelector(selector);
    if (btn) btn.classList.add('dimmed');
  }

  function openRitual(type) {
    if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor') {
      if (typeof showToast === 'function') showToast('⚠️ 专注期间，请勿进行起飞/着陆仪式，以免打断心流。');
      return;
    }
    currentRitualType = type;
    var overlay = document.getElementById('ritualOverlay');
    var titleEl = document.getElementById('ritualTitle');
    var iconEl = document.getElementById('ritualIcon');
    var listEl = document.getElementById('ritualSteps');
    if (!overlay || !titleEl || !listEl) return;
    var steps = type === 'morning' ? ritualMorningSteps : ritualNightSteps;
    if (iconEl) iconEl.textContent = type === 'morning' ? '🌅' : '🌙';
    titleEl.textContent = type === 'morning' ? '起床起飞' : '睡前着陆';
    var resultCard = document.getElementById('resultCard');
    var placeholder = document.getElementById('placeholder');
    var gachaLayer = document.getElementById('gachaLayer');
    if (resultCard) resultCard.style.display = 'none';
    if (placeholder) placeholder.style.display = 'none';
    if (gachaLayer) gachaLayer.style.display = 'none';
    listEl.innerHTML = '';
    steps.forEach(function (text, index) {
      if (!text) return;
      var li = document.createElement('li');
      var label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginTop = '2px';
      checkbox.addEventListener('change', function () {
        if (!listEl) return;
        var allChecked = Array.prototype.every.call(listEl.querySelectorAll('input[type="checkbox"]'), function (cb) { return cb.checked; });
        var btn = document.querySelector('.ritual-btn-primary');
        if (btn) btn.disabled = !allChecked;
      });
      var span = document.createElement('span');
      span.textContent = text;
      label.appendChild(checkbox);
      label.appendChild(span);
      li.appendChild(label);
      listEl.appendChild(li);
    });
    overlay.style.display = 'flex';
    if (typeof currentTask !== 'undefined') currentTask = null;
  }

  function closeRitual() {
    var overlay = document.getElementById('ritualOverlay');
    if (overlay) overlay.style.display = 'none';
    var placeholder = document.getElementById('placeholder');
    var gachaLayer = document.getElementById('gachaLayer');
    var resultCard = document.getElementById('resultCard');
    if (placeholder) placeholder.style.display = 'none';
    if (gachaLayer) gachaLayer.style.display = 'none';
    if (resultCard) {
      if (typeof renderResultCard === 'function') renderResultCard(null);
      resultCard.style.display = 'block';
    }
    currentRitualType = null;
    currentTask = null;
    if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
  }

  function completeRitual() {
    if (!currentRitualType) {
      closeRitual();
      return;
    }
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    var icon = currentRitualType === 'morning' ? '🌅' : '🌙';
    var title = currentRitualType === 'morning' ? '起床起飞' : '睡前着陆';
    dailyLog.unshift({
      title: title,
      icon: icon,
      timeStr: timeStr,
      date: getAnchorDate().toDateString(),
      done: true
    });
    save();
    if (typeof renderLog === 'function') renderLog();
    closeRitual();
    dimRitualButton(currentRitualType);
    if (typeof showToast === 'function') showToast(icon === '🌅' ? '🌅 起飞啦！' : '🌙 着陆完成');
    currentTask = null;
    if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
    currentRitualType = null;
  }
  function draw(excludeTaskId) {
    // 👉 核心防御：新手引导期间，剥夺抽卡大按钮的真实操作权，强制变更为“下一步”
    if (typeof obCurrentState !== 'undefined' && obCurrentState === 'room') {
      if (typeof handleObClick === 'function') {
          handleObClick(new Event('click')); // 模拟点击黑幕，进入下一步
      }
      return;
  }
    excludeTaskId = excludeTaskId === undefined ? null : excludeTaskId;
    // 👉 v8.2 空间回正魔法：一旦触发抽卡，自动收起高级筛选抽屉，释放屏幕空间，防止视口坍缩
    if (typeof filterDrawerExpanded !== 'undefined' && filterDrawerExpanded) {
      if (typeof toggleFilterDrawer === 'function') toggleFilterDrawer(false);
  }
    var card = document.getElementById('resultCard');
    if (card) card.style.display = 'none';
    var ritualOverlay = document.getElementById('ritualOverlay');
    if (ritualOverlay) ritualOverlay.style.display = 'none';
    // 👉 核心修复：如果专属清单浮层还开着，强制关闭它！绝对禁止两张卡片同台竞技
    var plOverlay = document.getElementById('playlistOverlay');
    if (plOverlay) plOverlay.style.display = 'none';
     // 专属清单 VIP 拦截：优先处理清单 Overlay，而不是普通抽卡
     var selPl = document.getElementById('selPlaylist');
     if (selPl && selPl.value) {
       var targetId = selPl.value;
       
       // 👉 核心找回：被误删的 targetPl 身份调取逻辑
       var targetPl = null;
       if (typeof customPlaylists !== 'undefined') {
           targetPl = customPlaylists.find(function(p) { return String(p.id) === String(targetId); });
       }
 
       // 👉 v8.X 核心修复：区分「项目」与「清单」的路由分发
       if (targetPl && targetPl.playlistType === 'project') { 
  } else {
      // 如果是清单(SOP/Once)，拦截并弹出白色隧道 Overlay
      var taskTexts = targetPl && typeof getPlaylistTaskTexts === 'function' ? getPlaylistTaskTexts(targetPl) : (targetPl && targetPl.tasks) || [];
      if (!targetPl || !taskTexts || taskTexts.length === 0) {
          if (typeof showToast === 'function') showToast('⚠️ 该清单为空，请先添加子任务');
          return;
      }
      targetPl.tasks = taskTexts.slice();
      hideAllGachaLayers();
      var card = document.getElementById('resultCard');
      if (card) card.style.display = 'none';
      var ph = document.getElementById('placeholder');
      var gachaLayer = document.getElementById('gachaLayer');
      if (ph) ph.style.display = 'none';
      if (gachaLayer) gachaLayer.style.display = 'none';
      if (typeof openPlaylistOverlay === 'function') openPlaylistOverlay(targetPl);
      activePlaylist = targetPl;
      try { localStorage.setItem('anchor_last_playlist_overlay', String(targetPl.id)); } catch (e) {}
      return; // 🚨 成功拦截，终止常规抽卡
  }
}
    // 👉 核心修复 1：进入常规抽卡前，彻底清空专属清单的幽灵上下文
    activePlaylist = null;
    try { localStorage.removeItem('anchor_last_playlist_overlay'); } catch (e) {}
    hideAllGachaLayers();
    enterImmersiveMode();
    if (mode !== 'sos' && gachaAnimating) return;
    setTimeout(function () {
      var result = null;
      var idToExclude = excludeTaskId || lastDrawnTaskId;
      if (mode === 'sos') {
        var r = Math.floor(Math.random() * sosLibrary.length);
        result = Object.assign({}, sosLibrary[r], { type: 'sos', time: 0 });
      } else {
        result = pickTaskByFilters(idToExclude);
      }
      currentTask = result;
      if (result && result.id) lastDrawnTaskId = result.id;
      var ph = document.getElementById('placeholder');
      if (result) {
        if (ph) ph.style.display = 'none';
        if (mode === 'sos') renderResultCard(result);
        else {
          var drawMode = pickDrawMode();
          if (drawMode === 'tarot') runTarotDrawFlow(result);
          else if (drawMode === 'bamboo') runBambooDrawFlow(result);
          else playGachaAnimation(result);
        }
      } else {
        if (ph) ph.style.display = 'none';
        renderResultCard(null);
      }
    }, 300);
  }
  function setMode(m) {
    if (typeof APP_VARIANT !== 'undefined' && APP_VARIANT === 'common' && m === 'vinyl') m = 'normal';
    mode = m;
    
    // 👉 修复 1：废除“按座位号”找人的死逻辑！谁的名字(data-mode)匹配，高光灯就打给谁！
    var tabs = document.querySelectorAll('.mode-tab');
    if (tabs && tabs.length) {
        tabs.forEach(function (t) {
            t.classList.remove('active'); // 先关掉所有灯
            if (t.getAttribute('data-mode') === m) {
                t.classList.add('active'); // 名字对上了，开灯！
            }
        });
    }

    // 👉 修复 2：场景背景与主按钮文字的动态联动
    var filter = document.getElementById('filterSec');
    var display = document.getElementById('displaySec');
    var normCtl = document.getElementById('controls-normal');
    var sosCtl = document.getElementById('controls-sos');
    var btn = document.getElementById('mainBtn');

    if (m === 'sos') {
        if (filter) filter.style.background = 'var(--bg-sos)';
        if (display) display.style.background = '#F3E5F5';
        if (normCtl) normCtl.style.display = 'none';
        if (sosCtl) sosCtl.style.display = 'flex';
        if (btn) {
            btn.innerText = '🚑 救救我';
            btn.style.background = '#957DAD';
        }
    } else {
        // 常规与专属模式：清空警报背景
        if (filter) filter.style.background = '';
        if (display) display.style.background = '';
        if (normCtl) normCtl.style.display = 'flex';
        if (sosCtl) sosCtl.style.display = 'none';

        if (btn) {
            // 恢复默认粉色底色
            btn.style.background = "#FF9AA2";
            
            // 动态判断文案与排面
            if (m === 'vinyl') {
                btn.innerText = '💿 挑唱片';
            } else if (m === 'culture') {
                btn.innerText = '🎬 精神食粮';
            } else if (typeof m === 'string' && m.startsWith('cf_')) {
                // 👉 核心补充：专属筛选器被选中时，主按钮必须给予极其尊贵的反馈！
                var fId = m.replace('cf_', '');
                var cf = (typeof customFilters !== 'undefined') ? customFilters.find(function(f) { return String(f.id) === String(fId); }) : null;
                btn.innerText = cf ? '✨ 专属：' + cf.name : '✨ 专属抽卡';
                // 赋予专属的薄荷绿底色，与普通抽卡形成明显的心流区隔
                btn.style.background = "#A0E7E5"; 
                btn.style.color = "#ffffff"; // 深绿字保证对比度
            } else {
                btn.innerText = '🔮 帮我选 (混合)';
                btn.style.color = "#ffffff";
            }
        }
    }
}
  function setEnergyMode(m) {
    if (energyMode === m) return;
    energyMode = m;
    try { localStorage.setItem('energyMode', energyMode); } catch (e) {}
    updateEnergyPillUI();
    if (m === 'uptime' || m === 'downtime') {
      if (filterDrawerExpanded) toggleFilterDrawer(false);
    }
  }
  function updateEnergyPillUI() {
    var pill = document.getElementById('energyPill');
    var slider = document.getElementById('energyPillSlider');
    var hint = document.getElementById('energyHint');
    if (!pill || !slider || !hint) return;
    pill.classList.remove('uptime', 'anchor', 'downtime');
    pill.classList.add(energyMode);
    var icons = { uptime: '☀️', anchor: '⚓', downtime: '☁️' };
    slider.textContent = icons[energyMode];
    var hints = { uptime: ' 🔥 高能推进：趁现在状态好，高歌猛进', anchor: '⚓ 随机漫步：默认状态，劳逸结合', downtime: ' 🔋 安静蓄能：累了就选这个，安心休息。' };
    hint.textContent = hints[energyMode];
    var toggleBtn = document.getElementById('filterDrawerToggle');
    if (toggleBtn) {
      if (energyMode === 'anchor' && !filterDrawerExpanded) toggleBtn.classList.add('breathing');
      else toggleBtn.classList.remove('breathing');
    }
  }
  // 👉 What & Why: 02 区点击管理标签时，不仅跳转 04 区，更要自动拉开对应抽屉，消除用户的“迷路感”
  window.jumpToManageTags = function () {
    if (typeof anchorSwiper !== 'undefined') {
      anchorSwiper.slideTo(4);
    } else {
      if (typeof outerSwiper !== 'undefined' && outerSwiper) outerSwiper.slideToLoop(1);
      if (typeof innerSwiper !== 'undefined' && innerSwiper) innerSwiper.slideTo(2);
    }
    if (typeof spinAstrolabe === 'function') {
      spinAstrolabe(3, '⚙️ 偏好');
    }
    setTimeout(function () {
      var tagDetails = document.getElementById('details-tags-engine');
      if (tagDetails) {
        tagDetails.open = true;
        tagDetails.scrollIntoView({ behavior: 'smooth', block: 'center' });
        tagDetails.style.transition = 'box-shadow 0.3s';
        tagDetails.style.boxShadow = '0 0 0 2px #75B79E';
        setTimeout(function () { tagDetails.style.boxShadow = 'none'; }, 800);
      }
    }, 450);
  };
  function toggleFilterDrawer(forceState) {
    var drawer = document.getElementById('filterDrawer');
    var toggleBtn = document.getElementById('filterDrawerToggle');
    if (!drawer) return;
    if (forceState !== undefined) filterDrawerExpanded = forceState;
    else filterDrawerExpanded = !filterDrawerExpanded;
    if (filterDrawerExpanded) {
      drawer.classList.add('expanded');
      if (toggleBtn) toggleBtn.textContent = '🔼 收起筛选';
    } else {
      drawer.classList.remove('expanded');
      if (toggleBtn) toggleBtn.textContent = '🔽 高级筛选';
    }
    updateEnergyPillUI();
     // 👉 空间防塌陷装甲：只要高级筛选被收起，强制让 01 区平滑居中，防止浏览器高度计算错乱导致坠屏
     if (!filterDrawerExpanded) {
      setTimeout(() => {
          const hero = document.querySelector('.hero-wrapper');
          // 👉 核心修复：把 center 改为 start，让元素的头部贴紧屏幕天花板！
          if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
  }
  }
  function showToast(msg) {
    var t = document.getElementById('toast');
    if (t) {
      t.innerText = msg;
      t.classList.add('show');
      setTimeout(function () { t.classList.remove('show'); }, 2000);
    } else {
      if (typeof alert !== 'undefined') alert(msg);
    }
  }
  // 绑定 01 区事件（仅操作 01 区 DOM，其他区用 typeof 判空）
  function bindRoom01Events() {
    var mainBtn = document.getElementById('mainBtn');
    if (mainBtn) mainBtn.addEventListener('click', function () { draw(); });
    var pill = document.getElementById('energyPill');
    if (pill) {
      pill.querySelectorAll('.energy-pill-zone').forEach(function (zone) {
        var m = zone.getAttribute('data-mode');
        if (m) zone.addEventListener('click', function () { setEnergyMode(m); });
      });
    }
    var filterToggle = document.getElementById('filterDrawerToggle');
    if (filterToggle) filterToggle.addEventListener('click', function () { toggleFilterDrawer(); });
    var modeTabs = document.querySelectorAll('.mode-tab');
    if (modeTabs.length) modeTabs.forEach(function (tab) {
      var m = tab.getAttribute('data-mode');
      if (m) tab.addEventListener('click', function () { setMode(m); });
    });
    var overlay = document.getElementById('immersiveOverlay');
    if (overlay) overlay.addEventListener('click', function () { exitImmersiveMode(); });
    var btnChange = document.getElementById('btnChange');
    if (btnChange) btnChange.addEventListener('click', function () { changeTask(); });
    var btnPrimary = document.getElementById('btnPrimary');
    if (btnPrimary) btnPrimary.addEventListener('click', function () { handlePrimaryAction(); });
    var ritualBtns = document.querySelectorAll('.ritual-icon-btn');
    if (ritualBtns.length) ritualBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { if (typeof openRitual === 'function') openRitual(btn.getAttribute('data-ritual')); });
    });
    updateEnergyPillUI();
  }
  // 👉 What & Why: 物理世界的传送门。允许 NFC 贴纸或快捷指令通过 URL 直接操控网页状态。
  function handleUrlParams() {
    var params = new URLSearchParams(window.location.search);
    // 1. 外部直达药丸模式
    if (params.has('mode')) {
      var m = params.get('mode');
      if (m === 'uptime' || m === 'anchor' || m === 'downtime') {
        energyMode = m;
        try { localStorage.setItem('energyMode', energyMode); } catch (e) {}
        if (typeof updateEnergyPillUI === 'function') updateEnergyPillUI();
      }
    }
    // 2. 外部直通快捷动作
    if (params.has('action')) {
      var act = params.get('action');
      if (act === 'eat_candy' && typeof openCandyEngine === 'function') {
        openCandyEngine();
      }
    }
  }

  function runBoot() {
    handleUrlParams(); // 页面加载时立即执行测听
    // 👉 v8.2.3 架构级修复：唤醒薛定谔的计时器开关！
    // What & Why: 从墙壁（localStorage）直读底层法则，并在 DOM 渲染时强行同步给 Checkbox，解决刷新失忆 Bug。
    const timerCheckbox = document.getElementById('settingTimerCheckbox');
    if (timerCheckbox) {
        timerCheckbox.checked = localStorage.getItem('anchor_timer_enabled') !== 'false';
    }
    const chkSanctuary = document.getElementById('settingShowSanctuary');
    if (chkSanctuary) chkSanctuary.checked = isSanctuaryVisible;
    // 👉 v8.1 新兵物资：如果本地数据库是空的，下发 4 个极其温柔的新手默认任务
    if (typeof db !== 'undefined' && db.length === 0 && typeof archive !== 'undefined' && archive.length === 0) {
      db = [
          { id: Date.now(), title: '喝一杯水', type: 'indoor', time: 5, isQuick: true },
          { id: Date.now()+1, title: '《好东西》', type: 'culture', subtype: 'movie', icon: '🎬', time: '120' },
          { id: Date.now()+2, title: '《三体》', type: 'culture', subtype: 'book', icon: '📖', time: '60' },
          { id: Date.now()+3, title: '去公园散步', type: 'outdoor', icon: '🌳', time: '15' }
      ];
      if (typeof save === 'function') save();
  }
  // 👉 v8.X 新兵物资：提供 1个轻量SOP 和 3个空项目样板间，绝不增加认知负担
  if (typeof customPlaylists !== 'undefined' && customPlaylists.length === 0) {
      customPlaylists = [
          {
              id: 'pl_sop_1', title: '出差/旅行行李清单', name: '出差/旅行行李清单', type: 'playlist', playlistType: 'sop', icon: '🧳', completeCount: 0,
              items: [ { text: '手机充电器', done: false }, { text: '洗漱用品', done: false }, { text: '耳塞眼罩', done: false } ]
          },
          {
              id: 'proj_inf_1', title: '健康生活', name: '健康生活', type: 'playlist', playlistType: 'project', projectSubType: 'infinite', icon: '🌱', progress: 0, items: []
          },
          {
              id: 'proj_fin_1', title: '技能学习', name: '技能学习', type: 'playlist', playlistType: 'project', projectSubType: 'finite', icon: '🎯', progress: 0, items: []
          },
          {
              id: 'proj_ddl_1', title: '搬家大计', name: '搬家大计', type: 'playlist', playlistType: 'project', projectSubType: 'deadline', icon: '⏳', progress: 0, items: []
          }
      ];
      if (typeof savePlaylists === 'function') savePlaylists();
  }
  // 👉 v8.2.8 标签表里剥离：音频标签降维为「首发自定义标签」，并修复专属筛选对 sys_vinyl 的依赖
  var tagMetaDirty = false;
  if (typeof customTags !== 'undefined' && Array.isArray(customTags)) {
    var hasVinylTag = customTags.some(function(t) {
      return t && (t.targetType === 'vinyl' || String(t.id) === 'sys_vinyl' || String(t.id) === 'tag_pc' || String(t.id) === 'tag_audio_custom');
    });
    if (!hasVinylTag) {
      customTags.splice(0, 0, { id: 'tag_audio_custom', name: '🎙️ 播客', targetType: 'vinyl', energy: 'low', isVisible: true, visible: true });
      tagMetaDirty = true;
    }
    customTags.forEach(function(t) {
      if (t && (String(t.id) === 'tag_pc' || String(t.id) === 'tag_audio_custom') && t.targetType !== 'vinyl') {
        t.targetType = 'vinyl';
        tagMetaDirty = true;
      }
      if (t && String(t.id) === 'tag_audio_custom' && t.energy == null) {
        t.energy = 'low';
        tagMetaDirty = true;
      }
    });
  }
  if (typeof customFilters !== 'undefined' && Array.isArray(customFilters)) {
    customFilters.forEach(function(cf) {
      if (cf && Array.isArray(cf.tags) && cf.tags.indexOf('sys_vinyl') !== -1) {
        cf.tags = cf.tags.filter(function(t) { return t !== 'sys_vinyl'; });
        if (cf.tags.indexOf('tag_audio_custom') === -1) cf.tags.push('tag_audio_custom');
        tagMetaDirty = true;
      }
      if (cf && Array.isArray(cf.tagIds) && cf.tagIds.indexOf('sys_vinyl') !== -1) {
        cf.tagIds = cf.tagIds.filter(function(t) { return t !== 'sys_vinyl'; });
        if (cf.tagIds.indexOf('tag_audio_custom') === -1) cf.tagIds.push('tag_audio_custom');
        tagMetaDirty = true;
      }
    });
  }
  if (typeof customFilters !== 'undefined' && Array.isArray(customFilters) && customFilters.length === 0) {
    customFilters.push({ id: 'cf_boot_podcast', name: '🎙️ 音频/播客', tags: ['tag_audio_custom'], isVisible: true });
    tagMetaDirty = true;
  }
  if (tagMetaDirty && typeof saveCustomMeta === 'function') saveCustomMeta();
  // 👉 防御装甲：确保 dailyLog 永远是合法的数组，防止后续写足迹时崩溃
  if (typeof dailyLog === 'undefined' || !Array.isArray(dailyLog)) { 
      dailyLog = []; 
      if (typeof save === 'function') save(); 
  }

    loadAndRenderPlaylists();
    restoreLiveState();
    // v8.0 补齐：若无进行中任务，但用户上次停留在清单浮层，则恢复该清单 Overlay
    try {
      if ((typeof currentTask === 'undefined' || !currentTask) && typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) {
        var lastPlId = localStorage.getItem('anchor_last_playlist_overlay');
        if (lastPlId) {
          var lastPl = customPlaylists.find(function (p) { return p && String(p.id) === String(lastPlId); });
          if (lastPl && typeof openPlaylistOverlay === 'function') {
            activePlaylist = lastPl;
            openPlaylistOverlay(lastPl);
          }
        }
      }
    } catch (e) {}
    bindRoom01Events();
    initRoom0203();
    bindGlobalDialogs();
    var offsetSel = document.getElementById('dayStartOffset');
    if (offsetSel) offsetSel.value = getDayStartOffset().toString();

    // 强制物理挂载记忆按钮事件，防止断触
    var btnMemory = document.getElementById('btnMemory');
    if (btnMemory) {
      btnMemory.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof openMemoryPanel === 'function') openMemoryPanel();
      };
    }

    // 启动心跳：每 3 秒扫一次云端 liveState，用于 IoT 物理联动
    if (typeof checkCloudLiveState === 'function') {
      setInterval(checkCloudLiveState, 3000);
    }

    if (typeof initLatestSanctuaryFlower === 'function') initLatestSanctuaryFlower();
    if (typeof initOnboarding === 'function') initOnboarding();
    // 👉 v8.0 修复：开机强制渲染历史意志力与小确幸数据，防止界面显示 0
    if (typeof updateStatsUI === 'function') updateStatsUI();

    // v8.0 修复：恢复被遗漏的打卡图触发引擎（必须在玄关之前计算）
    var openDaysCount = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
    if (typeof showDailyPosterIfNeeded === 'function') {
      showDailyPosterIfNeeded(openDaysCount);
    }

    // v8.0 一日三季玄关挂载
    if (window.initLobby) window.initLobby();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBoot);
  } else {
    runBoot();
  }
  // ========== 01 区抽卡引擎结束 ==========

  // ========== 02/03 区 · 输入与列表引擎（柔性断言，不操作 00/04 DOM） ==========
  var currentDialogTask = null;
  // v6.3-edit-buttons-enter：当前对话框要操作的任务（用于 addNew 覆盖原任务，防止编辑生成双胞胎）
  var editingTaskId = null;
  var editingTaskOriginal = null;
  var modalPrefillProjectId = null;
  var modalFlashOn = false;
  var modalUserOverrideFlash = false;
  var pendingColdId = null;
  var pendingColdIsPlaylist = false;
  var editingPlaylistIndex = -1;
  var pendingCreatorType = 'sop';
  var switchState = { cycle: false, flash: false };
  var userOverrideFlash = false;
  var isCycleActive = false;

  function parseTimeFromInput(str) {
    if (!str || typeof str !== 'string') return { time: null, title: (str || '').trim() };
    var detectedTime = null;
    var cleanStr = str;
    var regexH = /(\d+(?:\.\d+)?)\s*(h|hr|hour|hours|小时)/i;
    var matchH = str.match(regexH);
    if (matchH) { detectedTime = parseFloat(matchH[1]) * 60; cleanStr = cleanStr.replace(matchH[0], '').trim(); }
    if (!detectedTime) {
      var regexM = /(\d+)\s*(m|min|mins|分|分钟)/i;
      var matchM = str.match(regexM);
      if (matchM) { detectedTime = parseInt(matchM[1], 10); cleanStr = cleanStr.replace(matchM[0], '').trim(); }
    }
    return { time: detectedTime, title: cleanStr };
  }

  function toggleTimeInput(type) {
    var sel = document.getElementById('inpTime');
    if (!sel) return;
    if (type === 'vinyl' || type === 'culture') sel.classList.add('disabled');
    else sel.classList.remove('disabled');
  }

  function toggleSwitch(type, forceState) {
    var isUserAction = (forceState === undefined);
    var newState = (forceState !== undefined) ? forceState : !switchState[type];
    switchState[type] = newState;
    var sw = document.getElementById(type + 'Switch');
    if (sw) {
      var activeClass = (type === 'cycle') ? 'active-cycle' : 'active-flash';
      if (newState) sw.classList.add(activeClass); else sw.classList.remove(activeClass);
    }
    if (type === 'flash') {
      var sel = document.getElementById('inpTime');
      if (sel) {
        if (isUserAction) { userOverrideFlash = true; sel.value = newState ? '5' : '30'; }
        else if (!newState) userOverrideFlash = false;
      }
    }
  }

  function toggleCycle(forceOn) {
    isCycleActive = (forceOn === true);
    toggleSwitch('cycle', isCycleActive);
  }

  function savePlaylists() {
    try { localStorage.setItem('anchor_custom_playlists', JSON.stringify(customPlaylists)); } catch (e) {}
    const sel = document.getElementById('selPlaylist');
    if (sel && typeof renderPlaylistDropdown === 'function') renderPlaylistDropdown();
    // 👉 v8.X：同步刷新 02 区关联项目下拉框
    if (typeof window.renderProjectDropdown === 'function') window.renderProjectDropdown();
    if (typeof renderNewPlProjectDropdown === 'function') renderNewPlProjectDropdown();
}

// 👉 动态渲染 02 区单次任务的“关联项目”下拉框
window.renderProjectDropdown = function() {
  const sel = document.getElementById('inpProject');
  if (!sel) return;
  let html = '<option value="">🔗 关联归属项目：无</option>';
  if (typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) {
      // 筛选出真实的“项目”
      const projects = customPlaylists.filter(p => p.playlistType === 'project');
      projects.forEach(p => {
        html += `<option value="${p.id}">🔗 项目：${p.icon || '🚀'} ${p.title || p.name}</option>`;
      });
  }
  sel.innerHTML = html;
};

  function renderNewPlProjectDropdown() {
    var sel = document.getElementById('newPlProject');
    if (!sel) return;
    var keep = sel.value;
    var html = '<option value="">🔗 关联归属项目：无</option>';
    if (typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) {
      customPlaylists.forEach(function(p) {
        if (!p || p.playlistType !== 'project') return;
        html += '<option value="' + String(p.id) + '">🔗 项目：' + (p.icon || '🚀') + ' ' + (p.title || p.name || '').replace(/</g, '&lt;') + '</option>';
      });
    }
    sel.innerHTML = html;
    var optExists = false;
    for (var oi = 0; oi < sel.options.length; oi++) {
      if (sel.options[oi].value === keep) { optExists = true; break; }
    }
    if (optExists) sel.value = keep;
  }

  function showPlaylistCreator(type) {
    pendingCreatorType = type || 'sop';
    renderNewPlProjectDropdown();
    var el = document.getElementById('playlistCreator');
    if (el) { el.style.display = 'block'; var t = document.getElementById('newPlTitle'); if (t) t.focus(); }
  }

// ============================================================
// v8.X 🚀 项目立项与管理引擎 (强制挂载到全局，防作用域丢失)
// ============================================================
window.openProjectCreator = function() {
  const pc = document.getElementById('projectCreator');
  if (pc) {
    pc.style.display = 'block';
    // 互斥：如果清单兵工厂正开着，关掉它
    const sc = document.getElementById('playlistCreator');
    if (sc) sc.style.display = 'none';
    
    setTimeout(() => { 
      const room02 = pc.closest('.room-02');
      if (room02) room02.scrollTo({ top: pc.offsetTop - 20, behavior: 'smooth' }); 
  }, 100);
  } else {
    if (typeof showToast === 'function') {
      showToast('⚠️ 找不到项目面板，请检查 HTML (projectCreator) 是否完整复制');
    } else {
      alert('⚠️ 项目面板 HTML 缺失！');
    }
  }
};

// ============================================================
// v8.X 🚀 项目立项预览中枢 (What & Why: 动态切换所见即所得卡片并赋默认时间)
// ============================================================
window.updateProjPreview = function() {
  const typeObj = document.querySelector('input[name="projType"]:checked');
  if (!typeObj) return;
  const type = typeObj.value;
  const dz = document.getElementById('projDateZone');
  const preview = document.getElementById('projPreviewZone');
  
  if (type === 'infinite') {
      dz.style.display = 'none';
      preview.style.borderColor = '#A5D6A7';
      preview.innerHTML = `<div style="font-size:1.4rem; margin-bottom:4px;">🌱</div><div style="font-weight:bold; color:#4E9A51; font-size:0.9rem;">无限工程 · 生命之树</div><div style="font-size:0.75rem; color:#999; margin-top:6px; line-height:1.5;">⏱️ 累计沉浸：0h 0m<br><span style="opacity:0.7;">(无KPI，纯积累，享受过程)</span></div>`;
  } else if (type === 'finite') {
      dz.style.display = 'none';
      preview.style.borderColor = '#90CAF9';
      preview.innerHTML = `<div style="font-size:1.4rem; margin-bottom:4px;">🎯</div><div style="font-weight:bold; color:#1565C0; font-size:0.9rem;">进度项目 · 绝对刻度</div><div style="font-size:0.75rem; color:#999; margin-top:6px; line-height:1.5;">[🟩🟩⬜️⬜️⬜️] 2 / 5 项<br><span style="opacity:0.7;">(按件计费，完成不缩水，消除倒退恐惧)</span></div>`;
  } else if (type === 'deadline') {
      dz.style.display = 'block';
      preview.style.borderColor = '#EF9A9A';
      preview.innerHTML = `<div style="font-size:1.4rem; margin-bottom:4px;">⏳</div><div style="font-weight:bold; color:#d65a64; font-size:0.9rem;">期限旅程 · 倒数沙漏</div><div style="font-size:0.75rem; color:#999; margin-top:6px; line-height:1.5;">距离目标还有 X 天<br><span style="opacity:0.7;">(DDL压迫感仅停留在外壳，内部依然纯净心流)</span></div>`;
      
      // 👉 核心：自动填充起始时间，消灭灰色空状态
      const startInput = document.getElementById('newProjStart');
      const endInput = document.getElementById('newProjEnd');
      if (startInput && !startInput.value) {
          // 获取今天的锚点日期
          const today = typeof getAnchorDate === 'function' ? getAnchorDate() : new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7); // 默认 7 天旅程
          
          const formatDate = (d) => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
          startInput.value = formatDate(today);
          if (endInput) endInput.value = formatDate(nextWeek);
      }
  }
};

// ============================================================
// v8.2.X: 项目生命周期管理引擎 (挂载至全局，解决作用域与穿模问题)
// ============================================================
window.editingProjectId = null;
window.pendingColdIsProject = false;

window.handleProjectManage = function(projId) {
    // 👉 v8.2.X：绝对暴力的全局变量赋值，防止作用域孤岛
    if (typeof pendingColdId !== 'undefined') {
        pendingColdId = projId;
    } else {
        window.pendingColdId = projId;
    }
    window.pendingColdIsProject = true;
    if (typeof pendingColdIsPlaylist !== 'undefined') {
        pendingColdIsPlaylist = false;
    }

    var dlg = document.getElementById('coldDialog');
    if (dlg) {
        dlg.style.zIndex = '20000';

        var titleEl = dlg.querySelector('.cold-dialog-title');
        if (titleEl) titleEl.innerText = '🚢 船长，要怎么处理这个工程？';

        var btnContainer = dlg.querySelector('.cold-dialog-buttons');
        if (btnContainer) {
            btnContainer.innerHTML =
                '<button type="button" class="cold-btn-delete" onclick="confirmColdAction(\'delete\')">🗑️ 彻底删档</button>' +
                '<button type="button" class="cold-btn-cold" onclick="confirmColdAction(\'cold\')">🧊 暂时搁置</button>' +
                '<button type="button" class="cold-btn-cancel" onclick="confirmColdAction(\'archive_project\')" style="font-weight:bold; color:#e65100;">🏆 光荣结项</button>';
        }
        dlg.style.display = 'flex';
    }
};

window.editProject = function(projId) {
    if (typeof customPlaylists === 'undefined') return;
    var proj = customPlaylists.find(function(p) { return p && String(p.id) === String(projId); });
    if (!proj) return;

    window.editingProjectId = projId;
    var titleEl = document.getElementById('newProjTitle');
    var iconEl = document.getElementById('newProjIcon');
    if (titleEl) titleEl.value = proj.title || proj.name;
    if (iconEl) iconEl.value = proj.icon || '🚀';

    var radios = document.getElementsByName('projType');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].value === proj.projectSubType) radios[i].checked = true;
    }
    if (proj.projectSubType === 'deadline') {
        var startEl = document.getElementById('newProjStart');
        var endEl = document.getElementById('newProjEnd');
        if (startEl) startEl.value = proj.deadlineStart || '';
        if (endEl) endEl.value = proj.deadlineEnd || '';
    }

    if (typeof window.updateProjPreview === 'function') window.updateProjPreview();
    if (typeof window.openProjectCreator === 'function') window.openProjectCreator();

    if (typeof closeProjectConsole === 'function') {
        closeProjectConsole();
    } else if (typeof window.closeProjectConsole === 'function') {
        window.closeProjectConsole();
    }

    setTimeout(function() {
        if (typeof window.anchorSwiper !== 'undefined' && window.anchorSwiper) {
            window.anchorSwiper.slideTo(2);
        }
        var pc = document.getElementById('projectCreator');
        if (pc) pc.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
};

window.submitNewProject = function() {
  const titleEl = document.getElementById('newProjTitle');
  const iconEl = document.getElementById('newProjIcon');
  if (!titleEl || !titleEl.value.trim()) {
      if (typeof showToast === 'function') showToast('⚠️ 请填写项目大纲名称');
      return;
  }
  const title = titleEl.value.trim();
  // 👉 尊重隐形占位符与用户输入的 Emoji
  let finalIcon = '🚀';
  if (iconEl && iconEl.value.trim()) finalIcon = iconEl.value.trim();
  else if (iconEl && iconEl.placeholder) finalIcon = iconEl.placeholder;

  // 抓取项目类型
  const typeObj = document.querySelector('input[name="projType"]:checked');
  const projectSubType = typeObj ? typeObj.value : 'infinite';

  // 抓取期限旅程的日期
  let dStart = '', dEnd = '';
  if (projectSubType === 'deadline') {
      const startEl = document.getElementById('newProjStart');
      const endEl = document.getElementById('newProjEnd');
      if (startEl) dStart = startEl.value;
      if (endEl) dEnd = endEl.value;
  }

  // 👉 核心：判断是新建还是修改覆盖
  if (window.editingProjectId) {
    const pIdx = customPlaylists.findIndex(p => p && p.id === window.editingProjectId);
    if (pIdx > -1) {
        customPlaylists[pIdx].title = title;
        customPlaylists[pIdx].name = title;
        customPlaylists[pIdx].icon = finalIcon;
        customPlaylists[pIdx].projectSubType = projectSubType;
        if (projectSubType === 'deadline') {
            customPlaylists[pIdx].deadlineStart = dStart;
            customPlaylists[pIdx].deadlineEnd = dEnd;
        }
    }
    window.editingProjectId = null;
    if (typeof showToast === 'function') showToast(`🚀 [${title}] 核心参数修改成功！`);
} else {
    const newProj = {
        id: 'proj_' + Date.now(),
        title: title, name: title, type: 'playlist', playlistType: 'project',
        projectSubType: projectSubType, icon: finalIcon,
        deadlineStart: dStart, deadlineEnd: dEnd,
        items: [], tasks: [], completeCount: 0, isArchived: false,
        createdDate: typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString()
    };
    customPlaylists.unshift(newProj);
    if (typeof showToast === 'function') showToast(`🚀 [${title}] 立项成功！红线已连通。`);
}

if (typeof savePlaylists === 'function') savePlaylists();
if (typeof renderCabinet === 'function') renderCabinet();


  // 清场退隐
  titleEl.value = '';
  if (iconEl) { iconEl.value = ''; iconEl.placeholder = '🚀'; }
  const pc = document.getElementById('projectCreator');
  if (pc) pc.style.display = 'none';

  if (typeof showToast === 'function') showToast(`🚀 [${title}] 立项成功！红线已连通。`);

  // 👉 v8.X 空间动线反馈：立项后自动滑向 03 区档案柜 (展示但不强迫执行)
  // Why: 建立空间记忆，让用户亲眼看到项目“落袋为安”。绝不自动弹出大展厅，保护用户的心理留白。
  setTimeout(() => {
      const cabinet = document.getElementById('cabinetDetails');
      if (cabinet) {
          cabinet.open = true; // 强制拉开档案柜抽屉
          cabinet.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, 150); // 极短延迟，等待 DOM 渲染新卡片完毕
};

// ============================================================
// v8.X 🚀 项目大展厅 (Console) 空间折跃引擎
// ============================================================
window.openProjectConsole = function(projectId) {
  if (typeof customPlaylists === 'undefined') return;
  const proj = customPlaylists.find(p => String(p.id) === String(projectId));
  if (!proj) return;

  const overlay = document.getElementById('projectConsoleOverlay');
  const box = document.getElementById('projectConsoleBox');
  const headerLeft = document.getElementById('pcHeaderLeft');
  if (!overlay || !box || !headerLeft) return;

  // 1. 动态渲染 Header 的视觉主题
  let themeColor = '#81C784'; // 默认薄荷绿
  let typeBadge = '';
  
  if (proj.projectSubType === 'infinite') {
      themeColor = '#81C784';
      typeBadge = '<span style="background:#e8f5e9; color:#2e7d32; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:bold;">🌱 无限工程</span>';
  } else if (proj.projectSubType === 'finite') {
      themeColor = '#64B5F6';
      typeBadge = '<span style="background:#e3f2fd; color:#1565c0; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:bold;">🎯 进度项目</span>';
  } else if (proj.projectSubType === 'deadline') {
      themeColor = '#E57373';
      typeBadge = '<span style="background:#ffebee; color:#c62828; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:bold;">⏳ 期限旅程</span>';
  }

  // 顶部的极简高级光边
  box.style.borderTop = `6px solid ${themeColor}`;
  
  // 注入灵魂图腾
  headerLeft.innerHTML = `
      <span style="font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${proj.icon || '🚀'}</span>
      <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 1.25rem; font-weight: 900; color: #333; letter-spacing: 0.5px;">${proj.title || proj.name}</span>
          <div>${typeBadge}</div>
      </div>
  `;

// 👉 v8.2 空间折跃前，瞬间渲染大展厅内脏
if (typeof window.renderProjectConsoleInner === 'function') {
  window.renderProjectConsoleInner(projectId);
}

  // 2. 空间折跃动画
  overlay.style.display = 'flex';
  // 强制触发重绘
  void box.offsetWidth;
  setTimeout(() => {
      box.style.opacity = '1';
      box.style.transform = 'translateY(0)';
  }, 10);
};

window.closeProjectConsole = function() {
  const overlay = document.getElementById('projectConsoleOverlay');
  const box = document.getElementById('projectConsoleBox');
  if (!overlay || !box) return;

  // 离场动画
  box.style.opacity = '0';
  box.style.transform = 'translateY(20px)';
  setTimeout(() => {
      overlay.style.display = 'none';
  }, 300);
};

// ============================================================
// v8.2.X：大展厅左脑 -> 01区主舞台的终极清单虫洞 (DRY 极简重构版)
// ============================================================
window.startPlaylistFromProject = function(plId) {
  // 1. 护城河拦截：如果有任务正在进行，绝对禁止强行切台
  if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor') {
      if (typeof showToast === 'function') {
          showToast('⚠️ 当前已有专注任务！请先结算后，再开启专属清单隧道。');
      }
      return;
  }

  // 2. 优雅退隐：彻底关闭大展厅
  if (typeof closeProjectConsole === 'function') {
      closeProjectConsole();
  } else if (window.closeProjectConsole) {
      window.closeProjectConsole();
  }
  const consoleOverlay = document.getElementById('projectConsoleOverlay');
  if (consoleOverlay) consoleOverlay.style.display = 'none';

  // 3. 强制清场：撤销黑幕、清空一切残留的抽卡表现层 (防塔罗/扭蛋穿帮)
  if (typeof hideAllGachaLayers === 'function') hideAllGachaLayers();
  if (typeof exitImmersiveMode === 'function') exitImmersiveMode();
  const resultCard = document.getElementById('resultCard');
  if (resultCard) resultCard.style.display = 'none';

  // 4. 👉 伟大的 DRY 原则：移交兵权！直接呼叫底层正规军
  // (sendPlaylistToStage 内部自带了设值、切屏、呼出 Overlay 且带有完美 Emoji 的全部逻辑)
  if (typeof sendPlaylistToStage === 'function') {
      sendPlaylistToStage(plId);
  } else {
      if (typeof showToast === 'function') showToast('⚠️ 找不到底层引路特工，请检查代码完整性。');
  }
};

// 👉 v8.2.X 神经剥离：将预制清单从战略项目中解绑
window.unbindPlaylistFromProject = function(plId, projId) {
    if (!confirm('✂️ 确定将此清单从该项目中解绑吗？\n(放心，清单本身不会被删除，仅解除归属关系)')) return;
    const pIdx = customPlaylists.findIndex(p => p && String(p.id) === String(plId));
    if (pIdx > -1) {
        delete customPlaylists[pIdx].projectId;
        if (typeof savePlaylists === 'function') savePlaylists();
        if (typeof window.renderProjectConsoleInner === 'function') window.renderProjectConsoleInner(projId);
        if (typeof renderCabinet === 'function') renderCabinet();
        if (typeof showToast === 'function') showToast('✂️ 清单已解绑');
    }
};

// 大展厅左脑：通过任务 id 调起操作弹窗（避免整对象塞进 HTML 属性）
window.showTaskActionDialogByConsole = function(taskId) {
    var t = (typeof db !== 'undefined') ? db.find(function (x) { return x && String(x.id) === String(taskId); }) : null;
    if (!t || typeof showTaskActionDialog !== 'function') return;
    showTaskActionDialog(t, '对该任务执行操作：');
};

// 👉 v8.2.X：项目大展厅专属影子记忆放映机 (双轨大一统)
window.showProjectShadowMemory = function(itemType, itemId) {
  let memoryText = '';
  let displayTitle = '';
  let displayIcon = '';

  // --- 轨道 A：单次任务老兵 ---
  if (itemType === 'task') {
      if (typeof archive === 'undefined' || !Array.isArray(archive)) return;
      const idx = archive.findIndex(a => String(a.id) === String(itemId));
      if (idx > -1 && typeof showHistoryTaskDetail === 'function') {
          showHistoryTaskDetail('archive', idx);
          return; // 任务老兵直接复用旧放映机
      } else if (typeof showToast === 'function') {
          showToast('⚠️ 未找到该任务的记忆档案');
      }
      return;
  }

  // --- 轨道 B：清单堡垒长卷 ---
  if (itemType === 'playlist') {
      if (typeof customPlaylists === 'undefined' || !Array.isArray(customPlaylists)) return;
      const pl = customPlaylists.find(p => String(p.id) === String(itemId));
      if (!pl) {
          if (typeof showToast === 'function') showToast('⚠️ 未找到该清单的档案');
          return;
      }

      displayTitle = pl.title || pl.name || '专属清单';
      displayIcon = pl.icon || '📑';

      // 1. 顶部身份区分 (SOP vs Once)
      if (pl.playlistType === 'sop') {
          memoryText += `<div style="margin-bottom:12px; color:#FF9AA2; font-weight:bold; font-size: 0.9rem;">🏆 累计循环: ${pl.completeCount || 0} 次</div>`;
      } else {
          memoryText += `<div style="margin-bottom:12px; color:#4E9A51; font-weight:bold; font-size: 0.9rem;">✨ 阶段性清单已攻克</div>`;
      }

      // 2. 规模简述
      const subCount = pl.items ? pl.items.length : (pl.tasks ? pl.tasks.length : 0);
      memoryText += `<div style="margin-bottom:6px; font-size:0.85rem; color:#666;">🔖 规模: 共 ${subCount} 个子任务</div>`;

      // 3. 追溯专属岁月长卷（根据 playlistId 从 dailyLog 精准打捞）
      if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
          const plLogs = dailyLog.filter(l => String(l.playlistId) === String(pl.id));
          if (plLogs.length > 0) {
              let timelineHtml = `<div style="margin-top:16px; padding-top:12px; border-top:1px dashed #e0e0e0;">
                  <details>
                      <summary style="font-size:0.85rem; font-weight:bold; color:#8C7A6B; cursor:pointer; outline:none; list-style:none; display:flex; justify-content:space-between; align-items:center;">
                          <span>📜 展开专属岁月长卷</span>
                          <span style="font-size:0.75rem; color:#aaa; font-weight:normal;">(共 ${plLogs.length} 条足迹) ▾</span>
                      </summary>
                      <div style="margin-top:12px; max-height:220px; overflow-y:auto; font-size:0.8rem; color:#555; padding-left:12px; border-left:2px solid #f0f1f5;">`;
              
                      plLogs.forEach(l => {
                        // 1. 中式日期解析
                        let shortDate = '未知';
                        if (l.date) {
                            const dObj = new Date(l.date);
                            if (!isNaN(dObj.getTime())) {
                                shortDate = dObj.getFullYear() + '/' + (dObj.getMonth() + 1) + '/' + dObj.getDate();
                            } else {
                                shortDate = l.date; // 兜底
                            }
                        }
                        const exactTime = l.timeStr ? `<span style="color:#999; font-size:0.75rem; margin-left:6px; font-family:monospace;">${l.timeStr}</span>` : '';
                        
                        // 👉 2. v8.2.X 新增：打捞并渲染子任务的专属记忆（时长、书签）
                        const timeHint = l.lastAddMinutes ? `<span style="color:#75B79E; font-weight:bold; margin-left:6px;">⏱+${l.lastAddMinutes}m</span>` : '';
                        const bmkHint = l.bookmarkSnapshot ? `<span style="color:#8C7A6B; margin-left:6px;">🔖 ${l.bookmarkSnapshot}</span>` : '';
    
                        // 3. 区分整体完成与单次步进
                        const isOverall = (l.type === 'playlist_done');
                        const textStyle = isOverall ? 'color:#d65a64; font-weight:bold;' : 'color:#555;';
                        const dotColor = isOverall ? '#d65a64' : '#d6a8a8';
    
                        // 4. 组装头部
                        let logItemHtml = `<div style="margin-bottom:12px; position:relative;">
                            <span style="position:absolute; left:-17px; top:4px; font-size:0.4rem; color:${dotColor};">●</span>
                            <div style="margin-bottom:4px; display:flex; align-items:center; flex-wrap:wrap;">
                                <span style="color:#888; font-family:monospace;">${shortDate}</span>${exactTime}
                                <span style="${textStyle} margin-left:6px;">${l.title}</span>
                                ${timeHint} ${bmkHint}
                            </div>`;
                            
                        // 👉 5. v8.2.X 新增：补全历史切片的备注快照，采用柔和的淡灰底色块区分
                        if (l.noteSnapshot && String(l.noteSnapshot).trim()) {
                            logItemHtml += `<div style="margin-top:4px; padding:6px 8px; background:#f5f6f8; border-radius:6px; font-size:0.75rem; color:#666; line-height:1.5;">${l.noteSnapshot.replace(/\n/g, '<br>')}</div>`;
                        }
                        
                        logItemHtml += `</div>`;
                        timelineHtml += logItemHtml;
                    });
    
              
              timelineHtml += `</div></details></div>`;
              memoryText += timelineHtml;
          }
      }

      // 4. 装载入弹窗
      const htTitleEl = document.getElementById('htTitle');
      const htMsgEl = document.getElementById('htMessage');
      const dlg = document.getElementById('historyTaskDialog');
      if (!htTitleEl || !htMsgEl || !dlg) return;

      htTitleEl.innerText = `${displayIcon} ${displayTitle}`;

      // 👉 v8.2.X 新增：动态去底层数组中找出该清单的真实物理索引 (pIdx)
      const pIdx = (typeof customPlaylists !== 'undefined') ? customPlaylists.findIndex(function(p) { return String(p.id) === String(pl.id); }) : -1;
      
      // 👉 核心复用：直接调用原生 restoreArchivedPlaylist 齿轮，并传入算好的 pIdx
      let resurrectHtml = '';
      if (pIdx > -1) {
          resurrectHtml = `
          <button onclick="if(typeof restoreArchivedPlaylist === 'function') restoreArchivedPlaylist(${pIdx})"
                  style="margin-top:16px; width:100%; background:#e8f5e9; color:#2e7d32; border:none; padding:10px; border-radius:8px; font-size:0.95rem; font-weight:bold; cursor:pointer; transition: opacity 0.2s;"
                  onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
              ♻️ 唤醒此清单，重返活跃区
          </button>`;
      }
      
      htMsgEl.innerHTML = `<div style="text-align:left; background:#f9fafb; padding:12px 14px; border-radius:10px; font-size:0.9rem; color:#444; box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">${memoryText}</div>` + resurrectHtml;
      
      // 隐藏多余按钮
      const btnEditTime = document.getElementById('btnEditHistoryTime');
      if (btnEditTime) btnEditTime.style.display = 'none';
      const btnEditMemory = document.getElementById('btnEditHistoryMemory');
      if (btnEditMemory) btnEditMemory.style.display = 'none';
      const btnResurrect = document.getElementById('btnResurrectHistory');
      if (btnResurrect) btnResurrect.style.display = 'none'; // 清单由档案柜自身管理，不提供单个任务复活

      dlg.style.display = 'flex';
  }
};

// 👉 v8.2.X：项目任务/清单离场安检逻辑 (双轨兼容)
let pendingDepartureItemId = null;
let pendingDepartureProjectId = null;
let pendingDepartureItemType = 'task'; // 'task' 或 'playlist'

window.handleProjectTaskDeparture = function(itemId, projId, type = 'task') {
    pendingDepartureItemId = itemId;
    pendingDepartureProjectId = projId;
    pendingDepartureItemType = type;
    const dlg = document.getElementById('projectDepartureDialog');
    if (dlg) dlg.style.display = 'flex';
};

window.execProjectDeparture = function(action) {
    const dlg = document.getElementById('projectDepartureDialog');
    if (dlg) dlg.style.display = 'none';
    if (!pendingDepartureItemId) return;

    if (pendingDepartureItemType === 'playlist') {
        // --- 清单离场处理 ---
        if (action === 'unbind') {
            if (typeof unbindPlaylistFromProject === 'function') unbindPlaylistFromProject(pendingDepartureItemId, pendingDepartureProjectId);
        } else if (action === 'archive') {
            const pIdx = (typeof customPlaylists !== 'undefined') ? customPlaylists.findIndex(p => String(p.id) === String(pendingDepartureItemId)) : -1;
            if (pIdx > -1) {
                customPlaylists[pIdx].isArchived = true;
                customPlaylists[pIdx].archivedDate = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString();
                if (typeof savePlaylists === 'function') savePlaylists();
                if (typeof renderCabinet === 'function') renderCabinet();
                // 👉 v8.2.X 修复：强制传入 pendingDepartureProjectId，避免无参调用导致大展厅刷新失效
                if (typeof window.renderProjectConsoleInner === 'function' && pendingDepartureProjectId != null) {
                  window.renderProjectConsoleInner(pendingDepartureProjectId);
              }
                if (typeof showToast === 'function') showToast('🏆 清单已化作永恒堡垒');
                if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
            }
        }
    } else {
        // --- 任务离场处理 ---
        if (action === 'unbind') {
            if (typeof unbindTaskFromProject === 'function') unbindTaskFromProject(pendingDepartureItemId, pendingDepartureProjectId);
        } else if (action === 'archive') {
            const tIdx = (typeof db !== 'undefined') ? db.findIndex(t => String(t.id) === String(pendingDepartureItemId)) : -1;
            if (tIdx > -1) {
                const task = db[tIdx];
                db.splice(tIdx, 1);
                if (typeof archive !== 'undefined') {
                    archive.unshift(Object.assign({}, task, {
                        finishDate: (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString()
                    }));
                }
                if (typeof save === 'function') save();
                if (typeof renderList === 'function') renderList();
                if (typeof renderArchive === 'function') renderArchive();
                if (typeof window.renderProjectConsoleInner === 'function') window.renderProjectConsoleInner();
                if (typeof showToast === 'function') showToast('🏆 已彻底归档至荣誉殿堂');
                if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
            }
        }
    }
    pendingDepartureItemId = null;
    pendingDepartureProjectId = null;
};

// 👉 v8.2 渲染大展厅内脏：战术左脑与岁月右脑
window.renderProjectConsoleInner = function(projectId) {
  if (typeof customPlaylists === 'undefined') return;
  var projIdx = customPlaylists.findIndex(function(p) { return p && String(p.id) === String(projectId); });
  if (projIdx === -1) return;
  var proj = customPlaylists[projIdx];
// 👉 v8.2.X 大展厅题头：情绪色彩隔离舱 (Dynamic Mood Header)
var subType = proj.projectSubType || 'infinite';
var themeColor, themeBg, themeIcon, themeTitle, themeSlogan;

if (subType === 'infinite') {
    themeColor = '#4E9A51'; themeBg = '#e8f5e9'; themeIcon = '🌱'; 
    themeTitle = '无限工程'; themeSlogan = '没有 KPI，纯粹积累，享受过程';
} else if (subType === 'finite') {
    themeColor = '#1565C0'; themeBg = '#e3f2fd'; themeIcon = '🎯'; 
    themeTitle = '进度项目'; themeSlogan = '绝对刻度 · 完成不缩水 · 绝不倒退';
} else if (subType === 'deadline') {
    themeColor = '#d65a64'; themeBg = '#ffe2e2'; themeIcon = '⏳'; 
    themeTitle = '期限旅程'; themeSlogan = '倒数沙漏 · 专注当下';
}

// 👉 v8.2.X 核心数据抓取：为大展厅题头注入真实进度与统计
var statsHtml = '';
if (subType === 'infinite') {
    var internalMins = 0;
    if (proj.items) proj.items.forEach(function(i) { internalMins += (i.totalMinutes || 0); });
    var externalMins = proj.linkedTotalMinutes || 0;
    var totalMins = internalMins + externalMins;
    var hStat = Math.floor(totalMins / 60);
    var mStat = totalMins % 60;
    var timeStr = hStat > 0 ? hStat + 'h ' + mStat + 'm' : mStat + 'm';
    // 👉 v8.2.X 纯粹的寻花雷达：只在日常足迹中打捞属于本项目的真实 🌸 灵魂锚点
    var flowers = 0;
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        flowers = dailyLog.filter(function(log) {
            return String(log.projectId) === String(proj.id) && (log.isMilestone === true || log.icon === '🌸');
        }).length;
    }
    // 👉 v8.2.X 视觉微调：收紧分割线间距防止换行，并弱化竖线颜色
    statsHtml = '⏱️ 累计沉浸: <span style="color:#333; font-weight:bold;">' + timeStr + '</span> <span style="margin:0 4px; color:#ccc;">|</span> 🌸 结出花朵: <span style="color:#333; font-weight:bold;">' + flowers + '</span> 朵';
  } else if (subType === 'finite') {
    // ==========================================
    // 🎯 进度项目：保留绝对刻度与玻璃管进度条
    // ==========================================
    var internalTotal = proj.items ? proj.items.length : 0;
    var internalDone = proj.items ? proj.items.filter(function(i) { return i.done; }).length : 0;
    var externalPending = (typeof db !== 'undefined') ? db.filter(function(t) { return String(t.projectId) === String(proj.id); }).length : 0;
    var externalCompleted = proj.linkedCompletedCount || 0;
    
    var totalStat = internalTotal + externalPending + externalCompleted;
    var doneStat = internalDone + externalCompleted;
    // 👉 v8.3 核心魔法：权重分数换算器 (Weight Calculator)
    let totalWeight = 0;
    let doneWeight = 0;

    function calcTaskWeight(t) {
        // 提取目标值与当前值（兼容 bookmarkText 与 bookmarkTotal，或 completeCount）
        const targetVal = parseFloat(t.bookmarkTotal) || 0;
        const currentVal = parseFloat(t.bookmarkText) || (t.completeCount || 0);
        const hasTarget = targetVal > 0;
        const isRecurring = t.recurrence && t.recurrence !== 'none';

        // 铁律 1：无目标的重复任务/SOP，完全不参与 % 计算（权重为 0）
        if (isRecurring && !hasTarget) {
            return { w: 0, d: 0 };
        }

        // 铁律 2：有目标进度的任务，按比例折算分数
        if (hasTarget) {
            let progress = currentVal / targetVal;
            if (progress > 1) progress = 1; // 封顶 100%
            if (progress < 0) progress = 0;
            return { w: 1, d: progress };
        }

        // 铁律 3：普通一次性任务（0 或 1 分）
        return { w: 1, d: t.done ? 1 : 0 };
    }

    // 1. 累加内部子任务权重
    if (proj.items) {
        proj.items.forEach(function(i) {
            const res = calcTaskWeight(i);
            totalWeight += res.w;
            doneWeight += res.d;
        });
    }

    // 2. 累加外部挂载的未完成任务权重
    if (typeof db !== 'undefined') {
        db.filter(function(t) { return String(t.projectId) === String(proj.id); }).forEach(function(t) {
            const res = calcTaskWeight(t);
            totalWeight += res.w;
            doneWeight += res.d;
        });
    }

    // 3. 加上已经归档的外部任务（每一个被荣誉归档的关联任务，算 1 份满分权重）
    totalWeight += externalCompleted;
    doneWeight += externalCompleted;

    // 👉 最终玻璃管百分比解耦计算
    var percent = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;
    if (percent > 100) percent = 100;

    var internalMins = 0;
    if (proj.items) proj.items.forEach(function(i) { internalMins += (i.totalMinutes || 0); });
    var externalMins = proj.linkedTotalMinutes || 0;
    var totalMins = internalMins + externalMins;
    var hStat = Math.floor(totalMins / 60);
    var mStat = totalMins % 60;
    var timeStr = hStat > 0 ? hStat + 'h ' + mStat + 'm' : mStat + 'm';

    // 👉 v8.3 视觉升级：宽屏双行排版法 (终极大看板加粗版)
    // 💡 核心旋钮：height:14px 控制玻璃管粗细！如果觉得还不够，可以改成 16px
    var cssBar = `<div style="flex:1; height:11px; background:rgba(0,0,0,0.06); border-radius:999px; overflow:hidden; box-shadow: inset 0 2px 5px rgba(0,0,0,0.08);">
        <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #A0E7E5, #FFB7B2); border-radius:999px; transition:width 0.5s ease-out;"></div>
    </div>`;

    statsHtml = `
    <div style="display:flex; flex-direction:column; width:100%; margin-top:12px; padding: 4px 0;">
        <!-- 第一行：自适应拉伸的加粗玻璃管 + 核心百分比 -->
        <div style="display:flex; align-items:center; gap:16px; width:100%;">
            ${cssBar}
            <span style="font-weight:900; color:#75B79E; font-size:1.15rem; min-width:48px; text-align:right;">${percent}%</span>
        </div>
        
        <!-- 第二行：物理数据做底托 -->
        <div style="display:flex; align-items:center; font-size:0.85rem; color:#888; margin-top:12px;">
            <span>🎯 进度: <strong style="color:#555;">${doneStat} / ${totalStat}</strong> 项</span>
            <span style="margin:0 12px; color:#ddd;">|</span> 
            <span>⏱️ 累计: <strong style="color:#555;">${timeStr}</strong></span>
        </div>
    </div>`;
} else if (subType === 'deadline') {
    // ==========================================
    // ⏳ 限期旅程：彻底剥离进度焦虑，居中微卡片，专注时空
    // ==========================================
    var internalMinsD = 0;
    if (proj.items) proj.items.forEach(function(i) { internalMinsD += (i.totalMinutes || 0); });
    var externalMinsD = proj.linkedTotalMinutes || 0;
    var totalMinsD = internalMinsD + externalMinsD;
    var hStatD = Math.floor(totalMinsD / 60);
    var mStatD = totalMinsD % 60;
    var timeStrD = hStatD > 0 ? hStatD + 'h ' + mStatD + 'm' : mStatD + 'm';

    // 👉 恢复 4 位年份的岁月厚重感 (如 2026.03.08)
    var startD = proj.deadlineStart ? proj.deadlineStart.replace(/-/g, '.') : '未定';
    var endD = proj.deadlineEnd ? proj.deadlineEnd.replace(/-/g, '.') : '未定';
    
    var countdownHtml = '';
    if (proj.deadlineEnd) {
        var endDt = new Date(proj.deadlineEnd);
        endDt.setHours(23, 59, 59, 999); 
        var nowDt = new Date();
        var diffDays = Math.ceil((endDt - nowDt) / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            countdownHtml = `<span style="color:#d65a64;">距离目标还有 ${diffDays} 天</span>`;
        } else if (diffDays === 0) {
            countdownHtml = `<span style="color:#e65100;">就是今天！</span>`;
        } else {
            countdownHtml = `<span style="color:#999;">已逾期 ${Math.abs(diffDays)} 天</span>`;
        }
    }

    // 👉 What & Why: [回归自然流排版] 放弃强制拉伸导致的空间坍缩。
    // 使用普通的 flex-wrap 布局，找回 | 竖杠视觉支点，和进度项目保持绝对大一统。
    statsHtml = `
    <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="font-size: 0.75rem; color: #888; font-family: monospace;">
            🗓️ 周期：${startD} - ${endD}
        </div>
        <div style="font-size: 1.05rem; font-weight: bold; color: #333; display: flex; align-items: center; flex-wrap: wrap; width: 100%;">
            <span>⏳ ${countdownHtml}</span>
            <span style="margin: 0 10px; color: #ddd; font-weight: normal;">|</span> 
            <span style="font-size: 0.8rem; color: #666; margin-right: 4px; font-weight: normal;">⏱️ 累计:</span> 
            <span style="color: #333;">${timeStrD}</span>
        </div>
    </div>`;
}


    // 👉 重新拼接带有【数据仪表盘】与【极简生命周期入口】的极强包裹感头部看板
    var headerHtml = `
        <div style="background:${themeBg}; border-radius:16px; width: 100%; max-width: 100%; box-sizing: border-box; padding:20px; margin-bottom:1px; position:relative; overflow:hidden; box-shadow:inset 0 2px 10px rgba(255,255,255,0.5);">
            <div style="position:absolute; right:-10px; top:-20px; font-size:6rem; opacity:0.1; filter:grayscale(100%); pointer-events:none;">${themeIcon}</div>
            
            <div style="display:flex; align-items:flex-start; margin-bottom:12px; width: 100%; max-width: 800%; box-sizing: border-box; position:relative; z-index:2;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:2.2rem; text-shadow:0 2px 6px rgba(0,0,0,0.1);">${proj.icon || '🚀'}</span>
                    <div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.35rem; font-weight:900; color:#333; letter-spacing:1px;">${proj.title || proj.name}</span>
                            <!-- 👉 核心补充：新增项目一键直达抽卡台的通道 -->
                            <span onclick="window.sendPlaylistToStage('${proj.id}')" style="cursor:pointer; font-size:1.05rem; color:#1565c0; opacity:0.4; transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.4'" title="开启项目隧道">▶️</span>
                            <span onclick="window.editProject('${proj.id}')" style="cursor:pointer; font-size:0.95rem; opacity:0.4; transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.4'" title="修改项目大纲">✏️</span>
                            <span onclick="window.handleProjectManage('${proj.id}')" style="cursor:pointer; font-size:1.05rem; opacity:0.4; transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.4'" title="项目生命周期设定">⚙️</span>
                        </div>
                        <div style="font-size:0.8rem; font-weight:bold; color:${themeColor}; margin-top:2px;">${themeIcon} ${themeTitle}</div>
                    </div>
                </div>
            </div>

            <div style="position:relative; z-index:2; background:rgba(255,255,255,0.65); padding:8px 12px; border-radius:8px; font-size:0.85rem; color:#666; font-family:monospace; margin-bottom:10px; display:inline-block; border:1px solid rgba(255,255,255,0.8); box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                ${statsHtml}
            </div>
            
            <br>
            <div style="position:relative; z-index:2; font-size:0.8rem; color:#666; background:rgba(255,255,255,0.5); display:inline-block; padding:4px 10px; border-radius:6px; font-weight:500;">
                ${themeSlogan}
            </div>
        </div>
    `;
   // --- 1. 渲染左脑：战术执行区 (Sub-tasks) ---
   var leftHtml = '';
   leftHtml += '<div style="font-size:0.95rem; font-weight:bold; color:#555; margin-bottom:16px; line-height:1.4;">🛠️ 战术执行<br><span style="font-size:0.75rem; font-weight:normal; color:#999; font-family:monospace;">(Sub-tasks)</span></div>';

  // 👉 v8.X 优化: 招募池入口改为“关闭即保存”，显式透传 projectId 以便收起时立刻归编
  leftHtml += '<button onclick="if(window.toggleRecruitZone) window.toggleRecruitZone(\'' + projectId + '\')" style="width: 100%; background: #f8fbff; color: #1565c0; border: 1px dashed #bbd4f0; padding: 12px; border-radius: 10px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);" onmouseover="this.style.background=\'#e3f2fd\'" onmouseout="this.style.background=\'#f8fbff\'">➕ 招募闲置任务</button>';

  var unassignedTasks = (typeof db !== 'undefined') ? db.filter(function(t) { return !t.projectId && t.inColdStorage !== true && t.type !== 'playlist' && t.type !== 'ritual'; }) : [];
  // 👉 v8.3.1 体验修复：让最新招募/创建的任务永远置顶
  unassignedTasks.sort(function (a, b) {
    var aNum = Number(a.id);
    var bNum = Number(b.id);
    if (!isNaN(aNum) && !isNaN(bNum)) return bNum - aNum;
    return String(b.id).localeCompare(String(a.id));
  });
  var unassignedPlaylists = (typeof customPlaylists !== 'undefined' && Array.isArray(customPlaylists)) ? customPlaylists.filter(function(pl) {
      return pl && !pl.projectId && pl.playlistType !== 'project' && pl.inColdStorage !== true && pl.isArchived !== true;
  }) : [];
  // 👉 v6.X 优化: 闲置任务 + 闲置专属清单混排，并按 id 倒序保证“最新在最前”
  var recruitMixedPool = [];
  unassignedTasks.forEach(function(t) {
      recruitMixedPool.push({ recruitType: 'task', id: t.id, payload: t });
  });
  unassignedPlaylists.forEach(function(pl) {
      recruitMixedPool.push({ recruitType: 'playlist', id: pl.id, payload: pl });
  });
  recruitMixedPool.sort(function(a, b) {
      var aNum = Number(a.id);
      var bNum = Number(b.id);
      var aNumValid = !isNaN(aNum);
      var bNumValid = !isNaN(bNum);
      if (aNumValid && bNumValid) return bNum - aNum;
      return String(b.id).localeCompare(String(a.id));
  });
   leftHtml += '<div id="pcRecruitZone" style="display: none; background: #fff; border: 1px solid #bbd4f0; border-radius: 10px; padding: 14px; margin-bottom: 16px; max-height: 240px; overflow-y: auto; overflow-x: hidden; width: 100%; box-sizing: border-box; box-shadow: 0 6px 16px rgba(0,0,0,0.06);">';
  leftHtml += '<div style="margin-bottom:12px; text-align:center;"><button type="button" style="width:100%; background:#f0f7ff; color:#1565C0; border:1px dashed #90CAF9; border-radius:8px; padding:10px; font-weight:bold; cursor:pointer;" onclick="if(window.openTaskEditorModal) window.openTaskEditorModal(null, \'' + projectId + '\')">➕ 为该项目新建专属任务</button></div>';
  if (recruitMixedPool.length > 0) {
       leftHtml += '<div style="font-size: 0.75rem; color: #666; margin-bottom: 12px; font-weight: bold;">选择要编入本组的任务（历史时长将同步汇入）：</div>';
      recruitMixedPool.forEach(function(entry) {
          var isTask = entry.recruitType === 'task';
          var row = entry.payload || {};
          var rowId = entry.id;
          var rowLabel = '';
          if (isTask) {
              var tIcon = row.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(row) : '✨');
              var dowryTag = (row.totalMinutes && row.totalMinutes > 0) ? (' <span style="color:#75B79E; font-size:0.7rem; font-weight:bold;">(自带 ' + row.totalMinutes + 'm)</span>') : '';
              rowLabel = tIcon + ' ' + (row.title || '未知任务') + dowryTag;
          } else {
              // 👉 v6.X 优化: 清单在招募池内使用专属视觉格式，帮助用户快速区分实体类型
              var plName = (row.title || row.name || '未命名清单');
              var plCount = (row.items ? row.items.length : 0);
              rowLabel = (row.icon || '📑') + ' [清单] ' + plName + ' (' + plCount + '项)';
          }
           leftHtml += '<label style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 14px; font-size: 0.85rem; cursor: pointer; color: #444; width: 100%; word-break: break-all;">';
          leftHtml += '<input type="checkbox" class="recruit-cb" value="' + entry.recruitType + ':' + rowId + '" data-recruit-type="' + entry.recruitType + '" data-recruit-id="' + rowId + '" style="margin-top: 3px; flex-shrink: 0; width: 16px; height: 16px;">';
          leftHtml += '<span style="flex: 1; line-height: 1.5;">' + rowLabel + '</span>';
           leftHtml += '</label>';
       });
   } else {
       leftHtml += '<div style="font-size: 0.8rem; color: #999; text-align: center; padding: 16px 0; font-style: italic;">人才市场暂无闲置任务</div>';
   }
   leftHtml += '</div>';

   // 👉 1.1 渲染绑定的专属清单 (Playlists)
   var linkedPlaylists = (typeof customPlaylists !== 'undefined' ? customPlaylists : []).filter(function(p) {
    return p && String(p.projectId) === String(projectId) && p.playlistType !== 'project' && p.inColdStorage !== true;
});

// 👉 v8.2.X 新增：分离活跃清单与归档清单
var activePls = linkedPlaylists.filter(function(p) { return !p.isArchived; });
var donePls = linkedPlaylists.filter(function(p) { return p.isArchived; });

if (activePls.length > 0) {
    activePls.forEach(function(pl) {
        var pic = pl.icon || '📑';
        var nm = (pl.title || pl.name || '未命名').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        var items = pl.items || [];
        var tot = items.length || ((pl.tasks && pl.tasks.length) || 0);
        var doneC = items.filter(function(i){ return i && i.done; }).length;

        var plBadge = '';
        if (pl.playlistType !== 'once') {
            if (pl.completeCount && pl.completeCount > 0) plBadge = '<span style="font-size:0.65rem; background:#e8f5e9; color:#2e7d32; padding:2px 4px; border-radius:4px; margin-left:6px;">🏆 ' + pl.completeCount + '次</span>';
            else plBadge = '<span style="font-size:0.65rem; background:#f5f5f5; color:#888; padding:2px 4px; border-radius:4px; margin-left:6px;">🔄</span>';
        }

        leftHtml += `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px dashed #eee;">
            <div style="cursor:pointer; display:flex; align-items:flex-start; gap:8px; flex:1; min-width:0;" onclick="if(window.startPlaylistFromProject) window.startPlaylistFromProject('${pl.id}')" title="点击开启沉浸连抽">
                <span style="font-size:1.15rem; flex-shrink:0; margin-top:2px;">${pic}</span>
                <div style="flex:1; min-width:0; line-height:1.5; word-break:break-word;">
                    <span style="font-size:0.9rem; font-weight:500; color:#333;">${nm}</span><span style="display:inline-flex; align-items:center;">${plBadge}</span>
                    <span style="font-size:0.7rem; color:#999; background:#f5f5f5; padding:2px 6px; border-radius:4px; font-family:monospace; margin-left:6px; vertical-align:text-bottom;">${doneC}/${tot}</span>
                </div>
            </div>
            <!-- 👉 注意这里的 'playlist' 暗号 -->
            <div style="cursor:pointer; font-size:0.85rem; color:#aaa; padding:4px 8px; flex-shrink:0; margin-top:2px;" onclick="if(typeof window.handleProjectTaskDeparture === 'function') window.handleProjectTaskDeparture('${pl.id}', '${projectId}', 'playlist')" title="离场处理">✂️</div>
        </div>`;
    });
}

  // 👉 1.2 渲染绑定的零散任务 (活跃 Tasks)
  var linkedTasks = (typeof db !== 'undefined' ? db : []).filter(function(t) {
    return t && String(t.projectId) === String(projectId) && t.inColdStorage !== true;
  });

  // 👉 v8.2.X 新增：提取已完结的项目单次任务 (从底层 archive 中找回影子)
  var doneTasks = (typeof archive !== 'undefined' ? archive : []).filter(function(t) {
    return t && String(t.projectId) === String(projectId);
  });

  // 渲染活跃任务
  if (linkedTasks.length > 0) {
   linkedTasks.forEach(function(item) {
     var pic = item.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(item) : '✨');
     var nm = (item.title || '未知').replace(/</g, '&lt;').replace(/"/g, '&quot;');

     // 1. 周期与完成状态计算
     var anchorD = typeof getAnchorDate === 'function' ? getAnchorDate() : new Date();
     var todayStr = anchorD.toDateString();
     var isDoneInCycle = false;

     if (item.recurrence && item.recurrence !== 'none' && item.lastDone) {
         var lastD = new Date(item.lastDone);
         if (item.recurrence === 'daily' && item.lastDone === todayStr) { 
             isDoneInCycle = true; 
         } else if (item.recurrence === 'weekly') {
             var mon = new Date(anchorD); mon.setHours(0,0,0,0); mon.setDate(anchorD.getDate() - (anchorD.getDay()||7) + 1);
             if (lastD >= mon) isDoneInCycle = true;
         } else if (item.recurrence === 'monthly') {
             var first = new Date(anchorD.getFullYear(), anchorD.getMonth(), 1);
             if (lastD >= first) isDoneInCycle = true;
         }
     }

     // 2. 最极简的外层样式与透明度划线
     var liStyle = 'display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed #eee; transition: opacity 0.2s;';
     var textStyle = 'position:relative; font-size:0.9rem; color:#555;'; 
     if (isDoneInCycle) {
         liStyle += ' opacity: 0.4; text-decoration: line-through;';
     }

     // 3. 专属生命周期胶囊 (动态响应循环完成状态)
     var cycleBadge = '';
     if (item.recurrence === 'long_term' || item.type === 'long_term') {
         cycleBadge = '<span class="list-badge" style="background:#fff3e0; color:#e65100; border:none; padding:2px 5px;">🚀</span>';
     } else if (item.recurrence === 'daily') {
         cycleBadge = '<span class="list-badge" style="background:#e8f5e9; color:#2e7d32; border:none; padding:2px 5px;">' + (isDoneInCycle ? '今天✅' : '日') + '</span>';
     } else if (item.recurrence === 'weekly') {
         cycleBadge = '<span class="list-badge" style="background:#e3f2fd; color:#1565c0; border:none; padding:2px 5px;">' + (isDoneInCycle ? '本周✅' : '周') + '</span>';
     } else if (item.recurrence === 'monthly') {
         cycleBadge = '<span class="list-badge" style="background:#f3e5f5; color:#4527a0; border:none; padding:2px 5px;">' + (isDoneInCycle ? '本月✅' : '月') + '</span>';
     }

     var extraBadges = '';
     if (item.isFrog) extraBadges += '<span class="list-badge lb-frog" style="font-weight:bold; padding:2px 5px;">🐸</span>';
     if (item.isQuick) extraBadges += '<span class="list-badge lb-flash" style="padding:2px 5px;">⚡️</span>';

     // 4. 提取原汁原味的小圆点
     var hasMemory = (item.bookmarkText && String(item.bookmarkText).trim()) || (item.totalMinutes && item.totalMinutes > 0) || (item.noteText && String(item.noteText).trim());
     var memoryDot = hasMemory ? '<span style="position:absolute;top:-2px;right:-8px;width:4px;height:4px;background:#6b9bd1;border-radius:50%;"></span>' : '';

     // 👉 核心缝合：完美复用 T型三按钮 与 离场安检门
     leftHtml += `
     <div style="${liStyle}">
         <div style="display:flex; align-items:center; gap:5px; cursor:pointer; flex:1; min-width:0;" onclick="if(typeof window.manualCompleteFromList === 'function') window.manualCompleteFromList(${item.id})" title="点击操作该任务">
             <span style="width:20px; text-align:center; font-size:1.15rem; flex-shrink:0;">${pic}</span>
             <span style="${textStyle}">${nm}${memoryDot}</span>
             ${cycleBadge}${extraBadges}
         </div>
         <div style="cursor:pointer; font-size:0.85rem; color:#aaa; padding:4px 8px; flex-shrink:0;" onclick="if(typeof window.handleProjectTaskDeparture === 'function') window.handleProjectTaskDeparture(${item.id}, '${projectId}', 'task')" title="离场处理">✂️</div>
     </div>`;
   });
  }

  // 👉 v8.2.X 新增：渲染已完结的影子阵列 (包含归档清单 + 归档单次任务)
  if (doneTasks.length > 0 || donePls.length > 0) {
    leftHtml += '<div style="text-align:center; margin: 24px 0 12px 0; position:relative;"><span style="background:#fafafa; padding:0 12px; color:#bbb; font-size:0.75rem; position:relative; z-index:2;">── 已攻克的堡垒 ──</span><div style="position:absolute; top:50%; left:0; right:0; border-top:1px dashed #e0e0e0; z-index:1;"></div></div>';
    
    // 🟢 1. 渲染【归档清单】的影子
    donePls.forEach(function(pl) {
        var pic = pl.icon || '📑';
        var nm = (pl.title || pl.name || '未命名').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        var items = pl.items || [];
        var tot = items.length || ((pl.tasks && pl.tasks.length) || 0);
        var doneC = items.filter(function(i){ return i && i.done; }).length;
        
        var plBadge = '';
        if (pl.playlistType !== 'once') {
            if (pl.completeCount && pl.completeCount > 0) plBadge = '<span style="font-size:0.65rem; background:#e8f5e9; color:#2e7d32; padding:2px 4px; border-radius:4px; margin-left:6px;">🏆 ' + pl.completeCount + '次</span>';
            else plBadge = '<span style="font-size:0.65rem; background:#f5f5f5; color:#888; padding:2px 4px; border-radius:4px; margin-left:6px;">🔄</span>';
        }
        
        var liStyle = 'display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed #eee; opacity: 0.6;';
        var textStyle = 'font-size:0.9rem; font-weight:500; color:#4E9A51; text-decoration:line-through;'; 
        var absoluteDoneMark = '<span style="font-size:0.8rem; margin-left:6px;" title="永久攻克">✅</span>';
        
        // 👉 核心缝合：清单放映机暗号 'playlist'
        var clickLogic = `if(typeof window.showProjectShadowMemory === 'function') window.showProjectShadowMemory('playlist', '${pl.id}')`;

        leftHtml += `
        <div style="${liStyle}">
            <div style="display:flex; align-items:flex-start; gap:8px; flex:1; min-width:0; cursor:pointer;" onclick="${clickLogic}" title="查看岁月记忆">
                <span style="font-size:1.15rem; flex-shrink:0; margin-top:2px;">${pic}</span>
                <div style="flex:1; min-width:0; line-height:1.5; word-break:break-word;">
                    <span style="${textStyle}">${nm}</span><span style="display:inline-flex; align-items:center;">${plBadge}${absoluteDoneMark}</span>
                    <span style="font-size:0.7rem; color:#999; background:#f5f5f5; padding:2px 6px; border-radius:4px; font-family:monospace; margin-left:6px; vertical-align:text-bottom;">${doneC}/${tot}</span>
                </div>
            </div>
            <div style="cursor:pointer; font-size:0.85rem; color:#aaa; padding:4px 8px; flex-shrink:0; margin-top:2px;" onclick="if(typeof unbindPlaylistFromProject === 'function') unbindPlaylistFromProject('${pl.id}', '${projectId}')" title="解绑">✂️</div>
        </div>`;
    });

    // 🟢 2. 渲染【归档单次任务】的影子
    doneTasks.forEach(function(item) {
        var pic = item.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(item) : '✨');
        var nm = (item.title || '未知').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        
        var liStyle = 'display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed #eee; opacity: 0.6;';
        var textStyle = 'position:relative; font-size:0.9rem; color:#4E9A51; text-decoration:line-through;'; 
        var absoluteDoneMark = '<span style="font-size:0.8rem; margin-left:6px;" title="永久攻克">✅</span>';
        
        var extraBadges = '';
        if (item.isFrog) extraBadges += '<span class="list-badge lb-frog" style="font-weight:bold; padding:2px 5px;">🐸</span>';
        if (item.isQuick) extraBadges += '<span class="list-badge lb-flash" style="padding:2px 5px;">⚡️</span>';
        
        var hasMemory = (item.bookmarkText && String(item.bookmarkText).trim()) || (item.totalMinutes && item.totalMinutes > 0) || (item.noteText && String(item.noteText).trim());
        var memoryDot = hasMemory ? '<span style="position:absolute;top:-2px;right:-8px;width:4px;height:4px;background:#6b9bd1;border-radius:50%;"></span>' : '';
        
        // 👉 核心缝合：任务放映机暗号 'task' (修复了你刚才问的问题！)
        var clickLogic = `if(typeof window.showProjectShadowMemory === 'function') window.showProjectShadowMemory('task', '${item.id}')`;

        leftHtml += `
        <div style="${liStyle}">
            <div style="display:flex; align-items:center; gap:5px; flex:1; min-width:0; cursor:pointer;" onclick="${clickLogic}" title="查看岁月记忆">
                <span style="width:20px; text-align:center; font-size:1.15rem; flex-shrink:0;">${pic}</span>
                <span style="${textStyle}">${nm}${memoryDot}${absoluteDoneMark}</span>
                ${extraBadges}
            </div>
            <div style="cursor:pointer; font-size:0.85rem; color:#aaa; padding:4px 8px; flex-shrink:0;" onclick="if(typeof unbindTaskFromProject === 'function') unbindTaskFromProject(${item.id}, '${projectId}')" title="解绑">✂️</div>
        </div>`;
    });
}



if (activePls.length === 0 && donePls.length === 0 && linkedTasks.length === 0 && doneTasks.length === 0) {
    leftHtml += '<div style="color:#aaa; font-size:0.85rem; text-align:center; margin-top:30px; font-style:italic;">暂无战术拆解。<br><span style="font-size:0.75rem;">请使用上方按钮招募，或在 02 区新建。</span></div>';
  }

  // --- 2. 渲染右脑：岁月编年史 (Timeline) ---
  var rightHtml = '';

  // 👉 v8.2.X：动态构建右脑题头与全宽里程碑入口，实现左右脑对称美学
  rightHtml += '<div style="font-size:0.95rem; font-weight:bold; color:#555; margin-bottom:16px; line-height:1.4;">🕰️ 岁月编年史<br><span style="font-size:0.75rem; font-weight:normal; color:#999; font-family:monospace;">(Timeline)</span></div>';
  rightHtml += '<button onclick="const z=document.getElementById(\'pmZone\'); z.style.display=z.style.display===\'none\'?\'block\':\'none\'" style="width: 100%; background: #fff0f5; color: #d87093; border: 1px dashed #f8bbd0; padding: 12px; border-radius: 10px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);" onmouseover="this.style.background=\'#ffe4e1\'" onmouseout="this.style.background=\'#fff0f5\'">🌸 记录项目里程碑</button>';

  rightHtml += '<div id="pmZone" style="display:none; margin-bottom:16px; background:#fafafa; border:1px dashed #f8bbd0; padding:12px; border-radius:8px; text-align:center;">';
  rightHtml += '<input type="text" id="inpProjectMilestone" placeholder="记录当前项目的高光进展..." style="width:100%; padding:8px; border:1px solid #eee; border-radius:6px; font-size:0.85rem; outline:none; margin-bottom:8px; box-sizing:border-box;">';
  rightHtml += '<button onclick="if(window.saveProjectMilestone) window.saveProjectMilestone(\'' + projectId + '\')" style="width:100%; background:#d87093; color:#fff; border:none; padding:8px; border-radius:6px; font-size:0.85rem; font-weight:bold; cursor:pointer;">✨ 镌刻里程碑</button>';
  rightHtml += '</div>';

  var projLogs = [];
  if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
      projLogs = dailyLog.map(function(log, idx) {
          var newLog = Object.assign({}, log);
          newLog._absIndex = idx;
          return newLog;
        }).filter(function(log) {
          // 1. 核心骨干：本身就是这个大项目发出的足迹
          if (String(log.playlistId) === String(projectId)) return true;

          // 👉 2. v8.2.X 新增：顺藤摸瓜！如果足迹属于某个清单，去查该清单是否挂载于本项目
          if (log.playlistId && typeof customPlaylists !== 'undefined') {
              var parentPl = customPlaylists.find(function(p) { return String(p.id) === String(log.playlistId); });
              if (parentPl && String(parentPl.projectId) === String(projectId)) return true;
          }

          // 3. 关联的单次任务/普通任务 (双轨溯源)
          if (log.taskId) {
              var tDb = (typeof db !== 'undefined') ? db.find(function(t) { return t.id === log.taskId; }) : null;
              var tArc = (typeof archive !== 'undefined') ? archive.find(function(t) { return t.id === log.taskId; }) : null;
              var finalT = tDb || tArc;
              if (finalT && String(finalT.projectId) === String(projectId)) return true;
          }

          // 🚨 4. 彻底删除原先盲目放行 (log.title.indexOf('【整体完成】') !== -1) 的危险漏洞代码
          // (因为上面的 playlistId 溯源已经能完美且精准地囊括本项目的整体完成记录了)

          // 5. 灵魂锚点
          if (log.isMilestone && String(log.projectId) === String(projectId)) return true;

          return false;
      });
  }

  if (projLogs.length > 0) {
      // 整体向左推，给右侧留足空间
      rightHtml += '<div style="border-left: 2px solid #e0e4e8; margin-left: -3px; padding-left: 16px; padding-top: 0px;">';

      projLogs.forEach(function(log) {
          var dObj = new Date(log.date);
          var dateStr = isNaN(dObj) ? (log.date || '') : (dObj.getFullYear() + '/' + (dObj.getMonth() + 1) + '/' + dObj.getDate());
          var timeStr = log.timeStr || '';

          var durationHint = (log.lastAddMinutes && log.lastAddMinutes > 0) ? '<span style="color:#75B79E; font-weight:bold; font-size:0.75rem;">⏱ +' + log.lastAddMinutes + 'm</span>' : '';
          var bookmarkHint = (log.bookmarkSnapshot && log.bookmarkSnapshot.trim()) ? '<span style="color:#64B5F6; font-weight:bold; font-size:0.75rem;">🔖 ' + log.bookmarkSnapshot + '</span>' : '';
          var noteHint = (log.noteSnapshot) ? '<div style="margin-top:8px; font-size:0.85rem; color:#777; background:#f9fafb; padding:10px; width:100%; box-sizing:border-box; text-align:center; border-radius:8px; border:1px solid #eee; line-height:1.6;">📝 ' + log.noteSnapshot.replace(/\n/g, '<br>') + '</div>' : '';

          var isMS = log.isMilestone || log.icon === '🌸';
          var titleColor = isMS ? '#d87093' : '#444';
          var titleBg = '';
          var dotBorder = isMS ? 'border:2px solid #d87093;' : 'border:2px solid #bbd4f0;';

          rightHtml += '<div style="position:relative; margin-bottom:26px; padding-left:4px; display:flex; flex-direction:column; align-items:center; text-align:center;">' +
                       '<div style="position:absolute; left:-23px; top:6px; width:10px; height:10px; border-radius:50%; background:#fff; ' + dotBorder + ' box-sizing:border-box; z-index:2;"></div>' +
                       '<div style="font-size:0.8rem; color:#999; margin-bottom:6px; font-family:monospace; letter-spacing:0.5px;">' + dateStr + '<br>' + timeStr + '</div>' +
                       '<div style="font-size:1.05rem; color:' + titleColor + '; font-weight:bold; margin-bottom:8px; cursor:pointer; display:inline-block; transition:opacity 0.2s; ' + titleBg + '" onmouseover="this.style.opacity=\'0.7\'" onmouseout="this.style.opacity=\'1\'" onclick="if(window.showHistoryTaskDetail) window.showHistoryTaskDetail(\'log\', ' + log._absIndex + ', true)">' +
                       (log.icon || '✨') + ' ' + (log.title || '未知记录') + '</div>' +
                       '<div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:8px;">' + durationHint + bookmarkHint + '</div>' +
                       noteHint +
                       '</div>';
      });

      rightHtml += '</div>';
  } else {
      // 🚨 极其致命的覆盖 Bug 修复：这里必须是 +=，否则会把上面画好的里程碑入口全洗掉！
      rightHtml += '<div style="color:#aaa; font-size:0.85rem; text-align:center; margin-top:40px; font-style:italic;">岁月静好，暂无沉淀。<br><span style="font-size:0.75rem;">完成属于该项目的任务后，这里会结出时间的果实。</span></div>';
  }

 // 👉 v8.2.X 终极缝合：将情绪题头置于顶层，左右脑置于下方（完美触底滑动版）
 var container = document.querySelector('#projectConsoleBox > div:nth-child(2)');
 if (container) {
   var finalConsoleHtml =
     '<div style="flex:1; display:flex; flex-direction:column; min-height:0; overflow:hidden; width:100%;">' +
       headerHtml +
       // 🚨 核心修复：将 flex-start 改为 stretch，让左右脑强行触底并恢复独立滚动条！
       '<div style="display:flex; flex:1.15; gap:20px; align-items:stretch; min-height:0; overflow:hidden;">' +
         '<div id="pcLeftBrain" style="flex:1.15; min-width:0; overflow-y:auto; border-right:1px solid #f0f1f5; padding:16px 8px 16px 20px; background:#fafafa;">'+
           '<div id="pcTaskList" style="width:100%;">' + leftHtml + '</div>' +
         '</div>' +
         '<div id="pcRightBrain" style="flex:1.1; min-width:0; overflow-y:auto; padding:16px 20px 16px 12px; background:#fff;">' +
           '<div id="pcTimeline" style="width:100%;">' + rightHtml + '</div>' +
         '</div>' +
       '</div>' +
     '</div>';
   container.innerHTML = finalConsoleHtml;
 }
};

// 👉 v8.2.X 和平解约引擎：将任务移出项目，并严格执行财务平账 (Dowry Reversal)
window.unbindTaskFromProject = function(taskId, projectId) {
  if (!confirm('确定要将该任务移出当前项目吗？\n其附带的历史投入时长将从项目总进度中扣除。')) return;
  if (typeof db === 'undefined' || typeof customPlaylists === 'undefined') return;
  
  var tIdx = db.findIndex(function(t) { return String(t.id) === String(taskId); });
  if (tIdx === -1) return;
  
  var task = db[tIdx];
  var dowryMins = task.totalMinutes || 0;
  
  // 1. 财务平账：从归属项目的存钱罐中扣除该任务带走的时间
  if (projectId) {
      var pIdx = customPlaylists.findIndex(function(p) { return p && String(p.id) === String(projectId); });
      if (pIdx > -1) {
          customPlaylists[pIdx].linkedTotalMinutes = Math.max(0, (customPlaylists[pIdx].linkedTotalMinutes || 0) - dowryMins);
          if (typeof savePlaylists === 'function') savePlaylists();
      }
  }
  
  // 2. 剪断红线：解除项目的关联
  task.projectId = null;
  if (typeof save === 'function') save();
  
  // 3. 刷新全域视图
  if (typeof renderCabinet === 'function') renderCabinet(); // 刷新 03 区外部档案柜进度
  if (typeof renderList === 'function') renderList();       // 刷新主任务池
  if (typeof window.renderProjectConsoleInner === 'function') window.renderProjectConsoleInner(projectId); // 刷新大展厅内脏
  
  if (typeof showToast === 'function') showToast('✂️ 已和平解约，任务退回 03 区人才市场');
};

// 👉 v8.X 专属项目：镌刻灵魂锚点 (Milestone)
window.saveProjectMilestone = function(projectId) {
  const inp = document.getElementById('inpProjectMilestone');
  if (!inp || !inp.value.trim()) {
      if (typeof showToast === 'function') showToast("请先写下值得纪念的一句话哦~");
      return;
  }
  
  const text = inp.value.trim();
  // 遵守夜猫子时钟基准
  const anchorDate = typeof getAnchorDate === 'function' ? getAnchorDate() : new Date();
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');

  // 核心：携带 isMilestone 与 projectId 盖下钢印，存入 dailyLog
  if (typeof dailyLog !== 'undefined') {
      dailyLog.unshift({
          id: Date.now(),
          title: text,
          type: 'milestone',
          icon: '🌸',
          isMilestone: true,
          projectId: projectId, // 🚨 这个是它归属于该项目的防伪标！
          date: anchorDate.toDateString(),
          timeStr: timeStr
      });
  }

  // 保存并刷新多端视图
  if (typeof save === 'function') save();
  if (typeof renderLog === 'function') renderLog();
  if (typeof renderHistory === 'function') renderHistory();
  if (typeof renderCabinet === 'function') renderCabinet();
  // 👉 局部刷新：瞬间将刚才种下的花渲染到右脑长卷中！
  if (typeof window.renderProjectConsoleInner === 'function') window.renderProjectConsoleInner(projectId);
  
  if (typeof showToast === 'function') showToast("🌸 里程碑已永远镌刻在岁月中！");
};


// 👉 v6.X 优化: 招募池改为“关闭即保存”，减少额外确认动作，提升项目编排心流
window.toggleRecruitZone = function(projectId) {
  var zone = document.getElementById('pcRecruitZone');
  if (!zone) return;
  var isClosed = zone.style.display === 'none' || zone.style.display === '';
  if (isClosed) {
      zone.style.display = 'block';
      return;
  }
  if (typeof window.confirmRecruitTasks === 'function') window.confirmRecruitTasks(projectId, { silentWhenEmpty: true });
  zone.style.display = 'none';
};

window.confirmRecruitTasks = function(projectId, options) {
  if (typeof db === 'undefined' || typeof customPlaylists === 'undefined') return;
  
  var cbs = document.querySelectorAll('.recruit-cb:checked');
  var opts = options || {};
  if (cbs.length === 0) {
      if (!opts.silentWhenEmpty && typeof showToast === 'function') showToast('请至少勾选一个任务');
      return;
  }
  
  var totalDowry = 0;
  var count = 0;
  var playlistCount = 0;
  
  // 👉 v6.X 优化: 基于 checkbox 的 data 属性区分 task / playlist，确保绑定写入到正确数据源
  cbs.forEach(function(cb) {
      var recruitType = cb.getAttribute('data-recruit-type') || 'task';
      var recruitId = cb.getAttribute('data-recruit-id') || cb.value;
      if (recruitType === 'playlist') {
          var pl = customPlaylists.find(function(p) { return p && String(p.id) === String(recruitId); });
          if (pl && pl.playlistType !== 'project') {
              pl.projectId = projectId;
              playlistCount++;
          }
      } else {
          var task = db.find(function(t) { return t && String(t.id) === String(recruitId); });
          if (task) {
              task.projectId = projectId;
              totalDowry += (task.totalMinutes || 0);
              count++;
          }
      }
  });
  
  // 2. 财务大平账：将总嫁妆一次性汇入新项目
  if (totalDowry > 0 && projectId) {
      var pIdx = customPlaylists.findIndex(function(p) { return p && p.playlistType === 'project' && String(p.id) === String(projectId); });
      if (pIdx > -1) {
          customPlaylists[pIdx].linkedTotalMinutes = (customPlaylists[pIdx].linkedTotalMinutes || 0) + totalDowry;
      }
  }
  
  // 👉 v6.X 优化: 任何内存写入后立即双存档，严格保持 db/customPlaylists 一致性
  if (typeof save === 'function') save();
  if (typeof savePlaylists === 'function') savePlaylists();

  // 3. 落盘与全域刷新
  if (typeof renderList === 'function') renderList();
  if (typeof renderCabinet === 'function') renderCabinet();
  if (typeof window.renderProjectConsoleInner === 'function') window.renderProjectConsoleInner(projectId);
  
  if (typeof showToast === 'function') showToast('✅ 成功招募 ' + (count + playlistCount) + ' 个兵力入组！');
};

  function openNewSopCreator() {
    editingPlaylistIndex = -1;
    var i = document.getElementById('newPlIcon');
    var t = document.getElementById('newPlTitle');
    var ta = document.getElementById('newPlTasks');
    var np = document.getElementById('newPlProject');
    if (i) { i.value = ''; i.placeholder = '📑'; }
    if (t) t.value = '';
    // 废弃 textarea，启用动态 Input 列表
    if (typeof currentEditSubtasks !== 'undefined') {
        currentEditSubtasks = [];
        if (typeof addPlTaskInput === 'function') addPlTaskInput();
    }
    if (np) np.value = '';
    showPlaylistCreator('sop');

    // 👉 v8.1 空间折跃：新建清单时，飞往 02 区对焦
    if (typeof window.anchorSwiper !== 'undefined' && window.anchorSwiper) {
        window.anchorSwiper.slideTo(2, 400);
    }
    setTimeout(function () {
      var creator = document.getElementById('playlistCreator');
      if (creator) {
          const room02 = creator.closest('.room-02');
          if (room02) room02.scrollTo({ top: creator.offsetTop - 20, behavior: 'smooth' });
      }
  }, 450);
  }

  function hidePlaylistCreator() {
    var el = document.getElementById('playlistCreator');
    if (el) el.style.display = 'none';
    editingPlaylistIndex = -1;
  }

// 👉 v8.2 核心修复：为每个子步骤分发独立 Input 和隐形 ID
let currentEditSubtasks = []; // 临时存放正在编辑的子任务

// 👉 v8.2 核心补漏：在重绘前，强制将 DOM 里的文本反向同步到内存，防止用户正在输入的心血被清空
function syncEditSubtasks() {
  const inputs = document.querySelectorAll('.subtask-input');
  inputs.forEach((node, idx) => {
      if (currentEditSubtasks[idx]) {
          currentEditSubtasks[idx].text = node.value; // 故意不用 trim()，防止吞掉用户正在敲的空格
      }
  });
}

// 👉 核心修复：回归客观极简的带序号占位符
function renderPlTaskInputs() {
  const container = document.getElementById('plTasksContainer');
  if (!container) return;
  container.innerHTML = '';
  
  currentEditSubtasks.forEach((sub, idx) => {
      const row = document.createElement('div');
      row.style.cssText = "display:flex; gap:6px; align-items:center;";
      
      // 生成客观清晰的序号占位符
      const phText = '输入子步骤 ' + (idx + 1) + '...';

      row.innerHTML = `
          <input type="text" class="subtask-input" data-id="${sub.id}" value="${sub.text.replace(/"/g, '&quot;')}" placeholder="${phText}" 
          onkeydown="if(event.key==='Enter'){ event.preventDefault(); if(typeof window.addPlTaskInput === 'function') window.addPlTaskInput(); }" 
          style="flex:1; border:1px solid #ddd; padding:8px; border-radius:8px; font-size:0.85rem; outline:none; box-sizing:border-box;">
          <span style="cursor:pointer; color:#999; font-size:1rem; padding:4px;" onclick="if(typeof window.removePlTaskInput === 'function') window.removePlTaskInput(${idx})">🗑️</span>
      `;
      container.appendChild(row);
  });
}

// 👉 核心修复：移动端键盘保卫战 (增量添加代替全局重绘，打破异步失焦魔咒)
window.addPlTaskInput = function addPlTaskInput() {
  if (typeof syncEditSubtasks === 'function') syncEditSubtasks(); // 1. 先把刚才敲的字存好
  
  const newId = 'sub_' + Date.now() + Math.floor(Math.random()*100);
  const newSub = { id: newId, text: '', done: false };
  currentEditSubtasks.push(newSub);

  const container = document.getElementById('plTasksContainer');
  if (container) {
      const idx = currentEditSubtasks.length - 1;
      const row = document.createElement('div');
      row.style.cssText = "display:flex; gap:6px; align-items:center;";
      
      const phText = '输入子步骤 ' + (idx + 1) + '...';

      // 2. 增量生成单行，直接贴在尾部，绝对不破坏旧 DOM 的焦点状态
      row.innerHTML = `
          <input type="text" class="subtask-input" data-id="${newId}" value="" placeholder="${phText}" 
          onkeydown="if(event.key==='Enter'){ event.preventDefault(); if(typeof window.addPlTaskInput === 'function') window.addPlTaskInput(); }" 
          style="flex:1; border:1px solid #ddd; padding:8px; border-radius:8px; font-size:0.85rem; outline:none; box-sizing:border-box;">
          <span style="cursor:pointer; color:#999; font-size:1rem; padding:4px;" onclick="if(typeof window.removePlTaskInput === 'function') window.removePlTaskInput(${idx})">🗑️</span>
      `;
      container.appendChild(row);

      // 3. 瞬间同步聚焦 (废除 setTimeout)，并让滚动条自动追到底部防遮挡
      const inputs = container.querySelectorAll('.subtask-input');
      if (inputs && inputs.length > 0) {
          inputs[inputs.length - 1].focus();
      }
      container.scrollTop = container.scrollHeight;
  }
};

// 👉 同理颁发通行证，并执行记忆同步
window.removePlTaskInput = function removePlTaskInput(idx) {
  syncEditSubtasks(); // 🚨 删除某一项前，必须保住其他项用户敲的字！
  currentEditSubtasks.splice(idx, 1);
  renderPlTaskInputs();
};


  function createDailyTodo() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    showPlaylistCreator('once');
    var i = document.getElementById('newPlIcon');
    if (i) { i.value = ''; i.placeholder = '⚡️'; }
    var titleEl = document.getElementById('newPlTitle');
    if (titleEl) titleEl.value = '今日待办 ' + m + '/' + day;
    // 👉 v8.2 UX升级：清空真实文字，将提示语让位给 HTML 原生 placeholder，减少删除摩擦
    if (typeof currentEditSubtasks !== 'undefined') {
      currentEditSubtasks = [{ id: 'sub_' + Date.now(), text: '', done: false }];
      if (typeof renderPlTaskInputs === 'function') renderPlTaskInputs();
  }
    var np = document.getElementById('newPlProject');
    if (np) np.value = '';
    editingPlaylistIndex = -1;
    
    // 👉 v8.1 空间折跃：一键生成待办时，飞往 02 区并自动唤起键盘
    if (typeof window.anchorSwiper !== 'undefined' && window.anchorSwiper) {
        window.anchorSwiper.slideTo(2, 400);
    }
    setTimeout(function () { 
      var inputs = document.querySelectorAll('.subtask-input');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
      var creator = document.getElementById('playlistCreator');
      if (creator) {
          const room02 = creator.closest('.room-02');
          if (room02) room02.scrollTo({ top: creator.offsetTop - 20, behavior: 'smooth' });
      }
  }, 450);
  }


  function submitNewPlaylist() {
    var iconInput = document.getElementById('newPlIcon');
    var iconRaw = (iconInput && iconInput.value.trim()) || (iconInput && iconInput.placeholder) || '📑';
    var titleRaw = (document.getElementById('newPlTitle') && document.getElementById('newPlTitle').value.trim()) || '未命名清单';
    var projEl = document.getElementById('newPlProject');
    var projectIdVal = (projEl && projEl.value) ? projEl.value : null;
    
    // 👉 采集所有动态 Input 框的内容和隐形 ID，继承勾选状态
    var inputNodes = document.querySelectorAll('.subtask-input');
    var newItems = [];
    inputNodes.forEach(function(node) {
        var text = node.value.trim();
        if (text) {
            var oldMatch = (typeof currentEditSubtasks !== 'undefined') ? currentEditSubtasks.find(function(sub) { return sub.id === node.getAttribute('data-id'); }) : null;
            newItems.push({
                id: node.getAttribute('data-id') || ('sub_' + Date.now() + Math.floor(Math.random()*1000)),
                text: text,
                done: oldMatch ? oldMatch.done : false
            });
        }
    });

    if (newItems.length === 0) { 
        if (typeof showToast === 'function') showToast('至少输入一个子任务哦'); 
        return; 
    }
    if (editingPlaylistIndex > -1 && customPlaylists[editingPlaylistIndex]) {
      var pl = customPlaylists[editingPlaylistIndex];
      pl.title = titleRaw; pl.name = titleRaw; pl.icon = iconRaw;
      pl.projectId = projectIdVal;
      pl.items = newItems;
      pl.tasks = newItems.map(function(i){ return i.text; });
      if (typeof showToast === 'function') showToast('✅ 清单已更新');
    } else {
      var newPl = {
        id: Date.now(), title: titleRaw, name: titleRaw, type: 'playlist',
        playlistType: pendingCreatorType, icon: iconRaw,
        items: newItems,
        tasks: newItems.map(function(i){ return i.text; }), completeCount: 0, isArchived: false,
        createdDate: getAnchorDate().toDateString(),
        projectId: projectIdVal
      };
      customPlaylists.unshift(newPl);
      if (typeof showToast === 'function') showToast('✅ 清单已落盘');
    }
    hidePlaylistCreator();
    savePlaylists();
    if (typeof renderCabinet === 'function') renderCabinet();

    // 👉 v8.1 空间折跃：保存完毕后，极其有仪式感地飞回 03 区展示成果
    if (typeof window.anchorSwiper !== 'undefined' && window.anchorSwiper) {
        window.anchorSwiper.slideTo(3, 400); 
    }
    setTimeout(function () {
        var drawerActive = document.getElementById('drawerActive');
        if (drawerActive) {
            drawerActive.open = true; // 确保 03 区的抽屉处于展开状态
            if (drawerActive.scrollIntoView) drawerActive.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 450);
  }

  function renderPlaylistDropdown() {
    var sel = document.getElementById('selPlaylist');
    if (!sel) return;
    var currentVal = sel.value;
    sel.innerHTML = '<option value="">🔮 --- 默认 (不限定清单) ---</option>';
    (customPlaylists || []).forEach(function (p) {
      // 严禁被冷冻或已归档的清单进入抽卡筛选器
      if (p.inColdStorage === true || p.isArchived === true) return;
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = (p.icon || '📑') + ' ' + (p.title || p.name || '未命名');
      sel.appendChild(opt);
    });
    sel.value = currentVal;
  }

  function editPlaylist(pIdx) {
    if (!customPlaylists[pIdx]) return;
    var pl = customPlaylists[pIdx];
    editingPlaylistIndex = pIdx;
    showPlaylistCreator(pl.playlistType || 'sop');
    var i = document.getElementById('newPlIcon');
    if (i) { i.value = ''; i.placeholder = pl.icon || '📑'; }
    var t = document.getElementById('newPlTitle');
    if (t) t.value = pl.title || pl.name || '';
    // 👉 极度安全的向下兼容：为旧版数组颁发新版 ID 身份证
    if (typeof currentEditSubtasks !== 'undefined') {
        currentEditSubtasks = (pl.items || []).map(function(item) {
            return {
                id: item.id || ('sub_' + Date.now() + Math.floor(Math.random()*1000)),
                text: item.text || item.title || '',
                done: item.done || false
            };
        });
        if (currentEditSubtasks.length === 0) {
            currentEditSubtasks.push({ id: 'sub_' + Date.now(), text: '', done: false });
        }
        if (typeof renderPlTaskInputs === 'function') renderPlTaskInputs();
    }
    var np = document.getElementById('newPlProject');
    if (np) np.value = pl.projectId ? String(pl.projectId) : '';

    // 👉 v8.1 空间折跃：先带用户飞到 02 区，再平滑对焦兵工厂
    if (typeof window.anchorSwiper !== 'undefined' && window.anchorSwiper) {
        window.anchorSwiper.slideTo(2, 400); 
    }
    setTimeout(function () {
      var creator = document.getElementById('playlistCreator');
      if (creator) {
          const room02 = creator.closest('.room-02');
          if (room02) room02.scrollTo({ top: creator.offsetTop - 20, behavior: 'smooth' });
      }
  }, 450);
  }

  function dedupeChecklistTwins(logs) {
    // v6.9.5：历史/足迹视图去重工具 —— 隐藏“主任务 + 清单子任务”的视觉重复
    // 🚨 核心修复：彻底废除过度智能的去重逻辑，保留所有子任务的真实打卡历史！
    // 这样 SOP 在第 N 次循环时，所有的打钩足迹都能如实显示，不再相互抵消隐身。
    return logs;
  }

  function renderList() {
    var dailyList = document.getElementById('dailyList');
    var mediaList = document.getElementById('mediaList');
    var coldList = document.getElementById('coldList');
    if (!dailyList || !mediaList) return;
    dailyList.innerHTML = '';
    mediaList.innerHTML = '';
    if (coldList) coldList.innerHTML = '';
    var dCount = 0, mCount = 0, cCount = 0;
    var todayTime = new Date(getAnchorDate().toDateString()).getTime();
    var sortedDB = db.slice().sort(function (a, b) {
        const aHasDdl = a.deadline ? 1 : 0;
        const bHasDdl = b.deadline ? 1 : 0;
        if (aHasDdl !== bHasDdl) return bHasDdl - aHasDdl; // DDL优先
        if (aHasDdl && bHasDdl) {
            const timeA = new Date(a.deadline).getTime();
            const timeB = new Date(b.deadline).getTime();
            if (timeA !== timeB) return timeA - timeB; // 越近的越靠前
        }
        return b.id - a.id; // 否则按创建顺序倒序
    });
    var todayStr = getAnchorDate().toDateString();

    sortedDB.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'task-item';
      var isDoneInCycle = false;
      var cycleBadgeText = '🔄';
      if (item.recurrence && item.recurrence !== 'none' && item.lastDone) {
        var lastD = new Date(item.lastDone);
        if (item.recurrence === 'daily' && item.lastDone === todayStr) { isDoneInCycle = true; cycleBadgeText = '今天✅'; }
        else if (item.recurrence === 'weekly') {
          var mon = new Date(getAnchorDate());
          mon.setHours(0, 0, 0, 0);
          mon.setDate(mon.getDate() - (mon.getDay() || 7) + 1);
          if (lastD >= mon) { isDoneInCycle = true; cycleBadgeText = '本周✅'; }
        } else if (item.recurrence === 'monthly') {
          var first = new Date(getAnchorDate().getFullYear(), getAnchorDate().getMonth(), 1);
          if (lastD >= first) { isDoneInCycle = true; cycleBadgeText = '本月✅'; }
        }
      }
      if (isDoneInCycle) li.classList.add('task-status-done');
      var seriesBadge = item.isSeries ? '<span class="list-badge">∞系列</span>' : '';
      // 👉 What & Why: 视觉大一统，右侧状态栏化。未完成显示彩色周期胶囊，完成时继承色系显示 ✅
      var cycleBadge = '';
      if (item.recurrence === 'long_term' || item.type === 'long_term') {
        cycleBadge = '<span class="list-badge">🚀</span>';
      } else if (['daily', 'weekly', 'monthly'].indexOf(item.recurrence) !== -1) {
        if (isDoneInCycle) {
          // 已完成状态：色彩与周期保持一致
          if (item.recurrence === 'daily') {
            cycleBadge = '<span class="list-badge" style="background:#e8f5e9; color:#2e7d32; border-color:#c8e6c9;">' + cycleBadgeText + '</span>';
          } else if (item.recurrence === 'weekly') {
            cycleBadge = '<span class="list-badge" style="background:#e3f2fd; color:#1565c0; border-color:#bbdefb;">' + cycleBadgeText + '</span>';
          } else if (item.recurrence === 'monthly') {
            cycleBadge = '<span class="list-badge" style="background:#f3e5f5; color:#4527a0; border-color:#e1bee7;">' + cycleBadgeText + '</span>';
          }
        } else {
          // 未完成状态：马卡龙胶囊完全替代旧版的 🔄
          if (item.recurrence === 'daily') {
            cycleBadge = '<span class="list-badge" style="background:#e8f5e9; color:#2e7d32; border-color:#c8e6c9;">日</span>';
          } else if (item.recurrence === 'weekly') {
            cycleBadge = '<span class="list-badge" style="background:#e3f2fd; color:#1565c0; border-color:#bbdefb;">周</span>';
          } else if (item.recurrence === 'monthly') {
            cycleBadge = '<span class="list-badge" style="background:#f3e5f5; color:#4527a0; border-color:#e1bee7;">月</span>';
          }
        }
      }
      // 👉 v8.3 DDL 徽章：有期限则显示（并与排序逻辑一致）
      let ddlBadge = '';
      if (item.deadline) {
        const ddlTime = new Date(item.deadline).getTime();
        const diffDays = Math.ceil((ddlTime - todayTime) / (1000 * 60 * 60 * 24));
        let ddlText = diffDays < 0 ? '逾期' : (diffDays === 0 ? '今' : diffDays + '天');
        let ddlColor = diffDays <= 3 ? '#d65a64' : '#888'; // ≤3天变粉红警示
        let ddlBg = diffDays <= 3 ? '#ffe2e2' : '#f0f0f0';
        ddlBadge = `<span class="list-badge" style="color:${ddlColor}; background:${ddlBg}; border:none; padding:2px 6px;">⏳ ${ddlText}</span>`;
      }

      var extraBadges = (item.isFrog ? '<span class="list-badge lb-frog">🐸</span>' : '') + ddlBadge + (item.isQuick ? '<span class="list-badge lb-flash">⚡️</span>' : '');
      var tDisplay = (item.time === 0) ? '<span style="font-size:0.7rem;color:#ccc;margin-left:5px;">任意</span>' : (item.time ? '<span style="font-size:0.7rem;color:#ccc;margin-left:5px;">' + item.time + 'm</span>' : '');
      // 👉 v8.0 找回：计算任务是否包含记忆（书签、时长或备注）
      var hasMemory = (item.bookmarkText && String(item.bookmarkText).trim()) ||
        (item.totalMinutes && item.totalMinutes > 0) ||
        (item.noteText && String(item.noteText).trim());
      // 生成 4px 小圆点
      var memoryDot = hasMemory ? '<span style="position:absolute;top:-2px;right:-8px;width:4px;height:4px;background:#6b9bd1;border-radius:50%;"></span>' : '';
      var isCold = item.inColdStorage === true;
      var actionHtml = isCold
        ? '<div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:#ccc;"><span style="cursor:pointer;" onclick="window.restoreFromColdStorage && window.restoreFromColdStorage(' + item.id + ')">♻️</span><span style="cursor:pointer;" onclick="window.tryDeleteItem && window.tryDeleteItem(' + item.id + ')">🗑️</span></div>'
        : '<div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:#ccc;"><span style="cursor:pointer;" onclick="window.handleColdOrDelete && window.handleColdOrDelete(' + item.id + ')">🧊</span></div>';
      var titleSpanHtml = isCold
        ? '<span style="position:relative;font-size:0.9rem;color:#555;">' + (item.title || '') + memoryDot + '</span>'
        : '<span style="position:relative;font-size:0.9rem;color:#555;cursor:pointer;" title="点击标记今天已完成" onclick="window.manualCompleteFromList && window.manualCompleteFromList(' + item.id + ')">' + (item.title || '') + memoryDot + '</span>';
      li.innerHTML = '<div style="display:flex;align-items:center;gap:5px;"><span style="width:20px;text-align:center;">' + (typeof getSmartIcon === 'function' ? getSmartIcon(item) : '') + '</span>' + titleSpanHtml + seriesBadge + cycleBadge + extraBadges + tDisplay + '</div>' + actionHtml;
      if (isCold) { if (coldList) { coldList.appendChild(li); cCount++; } }
      else if (item.type === 'culture' || item.type === 'vinyl') { mediaList.appendChild(li); mCount++; }
      else { dailyList.appendChild(li); dCount++; }
    });

    (customPlaylists || []).forEach(function (pl, pIdx) {
      if (!pl.inColdStorage) return;
      var li = document.createElement('li');
      li.className = 'task-item';
      // 👉 v8.2.X 修复：根据真实类型赋予冷库标签与图标
      const typeLabel = pl.playlistType === 'project' ? '【项目】' : '【清单】';
      const fallbackIcon = pl.playlistType === 'project' ? '🚀' : '📑';
      const icon = pl.icon || fallbackIcon;
      li.innerHTML = '<div style="display:flex;align-items:center;gap:5px;"><span style="width:20px;text-align:center;">' + icon + '</span><span style="font-size:0.9rem;color:#555;"><span style="color:#999;">' + typeLabel + '</span> ' + (pl.title || pl.name || '') + '</span></div><div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:#ccc;"><span style="cursor:pointer;" onclick="window.restorePlaylistFromCold && window.restorePlaylistFromCold(' + pIdx + ')">♻️</span><span style="cursor:pointer;" onclick="window.deletePlaylistFromCold && window.deletePlaylistFromCold(' + pIdx + ')">🗑️</span></div>';
      if (coldList) { coldList.appendChild(li); cCount++; }
    });

    var dc = document.getElementById('dailyCount');
    var mc = document.getElementById('mediaCount');
    var cc = document.getElementById('coldCount');
    if (dc) dc.innerText = dCount;
    if (mc) mc.innerText = mCount;
    if (cc) cc.innerText = cCount;
  }

  function restorePlaylistFromCold(pIdx) {
    if (customPlaylists[pIdx]) {
      customPlaylists[pIdx].inColdStorage = false;
      savePlaylists();
      if (typeof renderCabinet === 'function') renderCabinet();
      renderList();
      if (typeof showToast === 'function') showToast('♻️ 清单已解冻，回到档案柜');
    }
  }
  function deletePlaylistFromCold(pIdx) {
    if (confirm('确定要彻底删除这条清单吗？此操作不可恢复。')) {
      customPlaylists.splice(pIdx, 1);
      savePlaylists();
      if (typeof renderCabinet === 'function') renderCabinet();
      renderList();
      if (typeof showToast === 'function') showToast('🗑️ 清单已彻底删除');
    }
  }

  function renderArchive() {
    var list = document.getElementById('archiveList');
    if (!list) return;
    list.innerHTML = '';
    var arcCount = document.getElementById('arcCount');
    if (arcCount) arcCount.innerText = archive.length;
    archive.forEach(function (item, i) {
      // 👉 v8.2.X 拦截器：如果是普通的项目隐藏资产，不在此处污染大殿（由项目展厅内部展示）
      if (item._isProjectHiddenAsset) return;
      var div = document.createElement('div');
      div.className = 'archive-item';
      var icon = item.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(item) : '');
      var badge = (item.isFrog || item.type === 'important') ? ' 🏅' : '';
      // 👉 v8.0 找回：荣誉殿堂也继承记忆小圆点
      var hasMemory = (item.bookmarkText && String(item.bookmarkText).trim()) ||
        (item.totalMinutes && item.totalMinutes > 0) ||
        (item.noteText && String(item.noteText).trim());
      var memoryDot = hasMemory ? '<span style="position:absolute;top:-2px;right:-6px;width:4px;height:4px;background:#6b9bd1;border-radius:50%;"></span>' : '';
      div.innerHTML = '<span style="flex:1; cursor:pointer; color:#555;" onclick="window.showHistoryTaskDetail && window.showHistoryTaskDetail(\'archive\',' + i + ')"><span style="position:relative; display:inline-block;">' + icon + ' ' + (item.title || '') + badge + memoryDot + '</span></span><span class="archive-del" onclick="window.deleteArchiveItem && window.deleteArchiveItem(' + i + ')">🗑️</span>';
      list.appendChild(div);
    });
  }

  function renderLog() {
    const list = document.getElementById('logList');
    if (!list) return;
    list.innerHTML = '';
    const today = getAnchorDate().toDateString();
    const todayLogsRaw = Array.isArray(dailyLog) ? dailyLog.filter((log) => log.date === today) : [];
    const todayLogs = dedupeChecklistTwins(todayLogsRaw);
    let count = 0;
    todayLogs.forEach((log, idx) => {
      // 👉 v8.X 修复：花（Milestone）是高光，必须常驻；隐私开关仅控制压舱石
      if (log.isBallastStone && typeof isSanctuaryVisible !== 'undefined' && !isSanctuaryVisible) {
        return;
      }
      count++;
      const li = document.createElement('li');
      li.className = 'task-item';
      const suffix = log.isTrailer ? ' 🐾' : (log.isRetroactive ? ' ✨' : (log.done ? ' ✅' : ''));
      // 👉 提取快照数据，恢复 v7 的高级降噪排版
      const displayLastAdd = (log.lastAddMinutes && log.lastAddMinutes > 0) ? log.lastAddMinutes : null;
      let timeAreaHint = "";
      if (displayLastAdd) {
        const h = Math.floor(displayLastAdd / 60);
        const m = displayLastAdd % 60;
        const durationStr = h > 0 ? (m > 0 ? `${h}h${m}m` : `${h}h`) : `${m}m`;
        // 加上绿色的时长角标
        timeAreaHint = ` <span class="manual-tag" style="color:#75B79E; font-weight:bold;">⏱ +${durationStr}</span>`;
      }

      li.innerHTML = `
<div style="display:flex;align-items:center;gap:6px;width:100%;font-size:0.8rem; flex-wrap:wrap;">
    <span class="footprint-time" style="color:#999; font-size:0.75rem; white-space:nowrap;">${log.timeStr || ''}${timeAreaHint}</span>
    <span class="footprint-item" style="flex:1; min-width:120px; cursor:pointer;" onclick="showHistoryTaskDetail('log', ${idx})">${log.icon || ''} ${log.title}${suffix}</span>
    <span style="cursor:pointer;color:#c44;margin-left:auto;" title="删除" onclick="deleteLogEntry(${idx})">🗑️</span>
</div>
`;
      list.appendChild(li);
    });
    const cntEl = document.getElementById('logCount');
    if (cntEl) cntEl.innerText = count;
  }

  // v6.3-edit-buttons-enter：删除今日足迹记录（支持智能撤销时长）
  function deleteLogEntry(idx) {
    if (!Array.isArray(dailyLog) || idx < 0 || idx >= dailyLog.length) return;
    var log = dailyLog[idx];

    // 1. 第一层确认：是否删除足迹
    if (!confirm('确定从今日足迹删除这条记录吗？')) return;

    // 2. 第二层智能拦截：如果这条足迹包含了新增时长，询问是否连带撤销
    if (log && log.taskId && log.lastAddMinutes && log.lastAddMinutes > 0) {
      var wantDeduct = confirm(
        '⚠️ 这条记录包含了 ⏱ ' + log.lastAddMinutes + ' 分钟的投入时长。\n\n'
        + '是否要同时从该任务的总时长中【撤销】这部分时间？\n\n'
        + '[确定] = 连同总时长一起扣除\n'
        + '[取消] = 仅删除足迹，保留总时长'
      );

      if (wantDeduct) {
        // 全域追踪：先去任务库找
        var targetTask = Array.isArray(db) ? db.find(function (t) { return t.id === log.taskId; }) : null;

        // 如果任务库找不到，去荣誉殿堂找（可能刚被归档）
        if (!targetTask && Array.isArray(archive)) {
          targetTask = archive.find(function (t) { return t.id === log.taskId; });
        }

        if (targetTask) {
          // 执行撤销：总时长减去当次新增，确保不小于0
          var currentTotal = typeof targetTask.totalMinutes === 'number' ? targetTask.totalMinutes : 0;
          targetTask.totalMinutes = Math.max(0, currentTotal - log.lastAddMinutes);
          targetTask.totalUpdatedAt = Date.now();
          if (typeof showToast === 'function') {
            showToast('↩️ 已撤销 ' + log.lastAddMinutes + ' 分钟专注时长');
          }

          // 👉 第四把刀：撤销时长时同步扣减归属项目的 linkedTotalMinutes（仅战略项目账本）
          if (targetTask.projectId && typeof customPlaylists !== 'undefined') {
            var pIdxDel = customPlaylists.findIndex(function (p) {
              return p && p.playlistType === 'project' && String(p.id) === String(targetTask.projectId);
            });
            if (pIdxDel > -1) {
              customPlaylists[pIdxDel].linkedTotalMinutes = Math.max(0, (customPlaylists[pIdxDel].linkedTotalMinutes || 0) - log.lastAddMinutes);
              if (typeof savePlaylists === 'function') savePlaylists();
              if (typeof renderCabinet === 'function') renderCabinet();
            }
          }

          // 如果当时是最后一次添加，撤销后可以把 lastAddMinutes 清空，防止误导
          if (targetTask.lastAddMinutes === log.lastAddMinutes) {
            targetTask.lastAddMinutes = 0;
          }
        }
      }
    }

    // 3. 周期任务的撤销打卡拦截（后悔药）
    if (log && log.taskId) {
      var targetTask = Array.isArray(db) ? db.find(function (t) { return t.id === log.taskId; }) : null;
      if (!targetTask && Array.isArray(archive)) {
        targetTask = archive.find(function (t) { return t.id === log.taskId; });
      }
      if (targetTask) {
        // 👉 What & Why: 新增智能拦截 B：撤销周期打卡状态
        // 如果是周期任务，且最后一次打卡恰好是“今天”，允许用户吃后悔药，恢复未打卡状态
        var isCycleTask = ['daily', 'weekly', 'monthly'].indexOf(targetTask.recurrence) !== -1;
        var anchorTodayStr = typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString();

        if (isCycleTask && targetTask.lastDone === anchorTodayStr) {
          var wantRevokeCycle = confirm('⚠️ 这是一个周期任务（' + (targetTask.recurrence === 'daily' ? '每日' : targetTask.recurrence === 'weekly' ? '每周' : '每月') + '循环）。\n\n是否要同时【撤销】它今天的打卡完成状态？\n\n[确定] = 取消划线，并扣除 1 次累计打卡\n[取消] = 仅删除足迹，保持卡片已完成');
          if (wantRevokeCycle) {
            targetTask.lastDone = ''; // 擦除打卡印记，触发 UI 取消划线
            targetTask.completeCount = Math.max(0, (targetTask.completeCount || 1) - 1); // 扣除次数，保底不为负
            if (typeof showToast === 'function') showToast('↩️ 已撤销打卡状态，恢复未完成');
          }
        }
      }
    }

    // 4. 执行删除足迹与保存刷新
    dailyLog.splice(idx, 1);
    if (typeof save === 'function') save();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof renderList === 'function') renderList();
    if (typeof renderArchive === 'function') renderArchive();
  }

  // 👉 v8.X 岁月织线：优雅且抗干扰的智能开关
  window.toggleHistorySearch = function (e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    var details = document.getElementById('historyDetails');
    var box = document.getElementById('historySearchBox');
    var inp = document.getElementById('historySearchInput');

    if (!box) return;

    var isHidden = window.getComputedStyle(box).display === 'none';

    if (isHidden) {
      if (details && !details.open) details.open = true;
      box.style.display = 'block';
      if (inp) setTimeout(function () { inp.focus(); }, 100);
    } else {
      box.style.display = 'none';
      if (inp) {
        inp.value = '';
        if (typeof window.renderHistory === 'function') window.renderHistory();
      }
    }
  };

  function renderHistory() {
    var container = document.getElementById('historyContent');
    if (!container) return;
    var listMount = document.getElementById('historyListContainer');
    var outEl = listMount || container;

    // 👉 v8.3 岁月织线：获取检索关键词
    var searchInput = document.getElementById('historySearchInput');
    var keyword = searchInput ? String(searchInput.value || '').trim().toLowerCase() : '';

    if (!Array.isArray(dailyLog) || dailyLog.length === 0) {
      outEl.innerHTML = '<p style="font-size:0.8rem; color:#777;">最近暂无完成记录。</p>';
      return;
    }
    var byDate = {};
    dailyLog.forEach(function (log, idx) {
      // 👉 v8.X 修复：花（Milestone）是高光，必须常驻；隐私开关仅控制压舱石
      if (log.isBallastStone && typeof isSanctuaryVisible !== 'undefined' && !isSanctuaryVisible) {
        return;
      }
      if (!log.date) return;
      // 👉 全息多维匹配：关键词须命中标题、备注、书签或图标之一
      if (keyword) {
        var titleMatch = (log.title || '').toLowerCase().includes(keyword);
        var noteMatch = (log.noteSnapshot || '').toLowerCase().includes(keyword);
        var bookmarkMatch = (log.bookmarkSnapshot || '').toLowerCase().includes(keyword);
        var iconMatch = (log.icon || '').toLowerCase().includes(keyword);
        if (!titleMatch && !noteMatch && !bookmarkMatch && !iconMatch) return;
      }
      if (!byDate[log.date]) byDate[log.date] = [];
      var copy = Object.assign({}, log);
      copy._index = idx;
      byDate[log.date].push(copy);
    });
    var dateKeys = Object.keys(byDate).sort(function (a, b) { return new Date(b) - new Date(a); });
    var maxDays = 180;
    var htmlStr = '';
    dateKeys.slice(0, maxDays).forEach(function (dateStr) {
      var dayLogs = byDate[dateStr];
      var dedupedLogs = dedupeChecklistTwins(dayLogs);
      var dateLabel = new Date(dateStr).toLocaleDateString();
      htmlStr += '<div style="margin-bottom:12px;">';
      htmlStr += '<div style="font-size:0.8rem; color:#666; margin-bottom:4px;">' + dateLabel + '</div>';

      // 👉 视觉加冕：只有无归属的【全局一朵花】，才能作为当天的统治级标题
      var milestone = dedupedLogs.find(function (l) { return l && l.isMilestone && !l.projectId; });
      // What & Why: 只剔除「皇冠本尊」这一条，保留同日多朵里程碑（旧花）在列表中
      var regularLogs = milestone ? dedupedLogs.filter(function (l) {
        return l && milestone && String(l.id) !== String(milestone.id);
      }) : dedupedLogs;

      if (milestone) {
        htmlStr += '<div style="font-size:0.95rem; font-weight:bold; color:#FF9AA2; margin-bottom:8px; padding-left:2px;">' +
          (milestone.icon || '🌸') + ' ' + milestone.title + '</div>';
      }

      var foundNextDayLog = false;
      var insertedDivider = false;

      regularLogs.forEach((log) => {
        const suffix = log.isTrailer ? ' 🐾' : (log.isRetroactive ? ' ✨' : (log.done ? ' ✅' : ''));
        let isNext = false;
        if (log.timeStr) {
          const h = parseInt(log.timeStr.split(':')[0], 10);
          const offset = typeof getDayStartOffset === 'function' ? getDayStartOffset() : 0;
          if (h >= 0 && h < offset) isNext = true;
        }

        if (isNext) {
          foundNextDayLog = true;
        } else if (foundNextDayLog && !insertedDivider) {
          htmlStr += `<div style="display:flex; align-items:center; gap:6px; margin: 6px 0 8px;">
    <div style="flex:1; border-top:1px dashed #d0d0d0;"></div>
    <span style="flex:none; font-size:0.7rem; color:#b0b0b0; white-space:nowrap; letter-spacing:1px;">🌙 跨日线</span>
    <div style="flex:1; border-top:1px dashed #d0d0d0;"></div>
</div>`;
          insertedDivider = true;
        }

        // 👉 恢复历史记录的快照提取与情报框拼接
        let displayBookmark = (log.bookmarkSnapshot && log.bookmarkSnapshot.trim()) ? log.bookmarkSnapshot : null;
        const targetSnap = (log.targetProgressSnapshot || '').trim();
        if (displayBookmark && targetSnap && !displayBookmark.includes('/')) {
          displayBookmark = displayBookmark + ' / ' + targetSnap;
        }
        const displayNote = (log.noteSnapshot && log.noteSnapshot.trim()) ? log.noteSnapshot : null;
        const displayLastAddMinutes = (log.lastAddMinutes && log.lastAddMinutes > 0) ? log.lastAddMinutes : null;

        let memoryInfo = "";
        const hasMemory = displayLastAddMinutes || displayBookmark || displayNote;
        if (hasMemory) {
          if (displayLastAddMinutes) {
            const hours = Math.floor(displayLastAddMinutes / 60);
            const mins = displayLastAddMinutes % 60;
            let timeDisplay = hours > 0 ? (mins > 0 ? `${hours}h${mins}m` : `${hours}h`) : `${mins}m`;
            memoryInfo += ` <span class="manual-tag">⏱ +${timeDisplay}</span>`;
          }
          if (displayBookmark) {
            memoryInfo += ` <span class="manual-tag">🔖 ${displayBookmark}</span>`;
          }
          if (displayNote) {
            const notePreview = displayNote.split('\n')[0].substring(0, 15);
            const noteId = `note_${log._index || Math.random()}`;
            memoryInfo += ` <span class="manual-tag note-preview" data-note-id="${noteId}" data-note-full="${displayNote.replace(/"/g, '&quot;')}" style="cursor:pointer;" onclick="toggleNotePreview('${noteId}')">📝 ${notePreview}${notePreview.length >= 15 ? '...' : ''}</span>`;
          }
        }

        htmlStr += `<div style="font-size:0.8rem; color:#444; display:flex; align-items:center; gap:4px; margin-bottom:2px;">
    <span style="flex:1; cursor:pointer;" onclick="showHistoryTaskDetail('log', ${log._index})">${log.icon || ''} ${log.title}${suffix}</span>
    <span style="font-size:0.75rem; color:#999;">${memoryInfo}</span>
</div>`;
      });

      htmlStr += '</div>';
    });

    if (!htmlStr) {
      outEl.innerHTML = keyword
        ? '<p style="font-size:0.8rem; color:#777;">未找到匹配当前检索词的历史记录。</p>'
        : '<p style="font-size:0.8rem; color:#777;">最近暂无完成记录。</p>';
    } else {
      outEl.innerHTML = htmlStr;
    }
  }

  function renderHeatmap() {
    var grid = document.getElementById('heatmapGrid');
    if (!grid) return;
    var logMap = {};
    (dailyLog || []).forEach(function (log) {
      // 👉 v8.X 修复：花（Milestone）是高光，必须常驻；隐私开关仅控制压舱石
      if (log.isBallastStone && typeof isSanctuaryVisible !== 'undefined' && !isSanctuaryVisible) {
        return;
      }
      var d = new Date(log.date);
      if (isNaN(d.getTime())) return;
      var dateKey = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      if (!logMap[dateKey]) logMap[dateKey] = [];
      logMap[dateKey].push(log);
    });
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var todayKey = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var offsetToSunday = (7 - today.getDay()) % 7;
    var endDate = new Date(today);
    endDate.setDate(today.getDate() + offsetToSunday);
    var totalDays = 26 * 7;
    var html = '';
    for (var i = totalDays - 1; i >= 0; i--) {
      var d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      var dateKey = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      var displayDate = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
      var isFuture = d > today;
      if (isFuture) {
        html += '<div class="heatmap-cell level-0" data-date="' + dateKey + '" data-display="' + displayDate + '" title="' + displayDate + ' (未到来)"></div>';
      } else {
        var rawItems = logMap[dateKey] || [];
        var items = dedupeChecklistTwins(rawItems);
        var count = items.length;
        var level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count >= 3 && count <= 4) level = 2;
        else if (count >= 5 && count <= 6) level = 3;
        else if (count >= 7) level = 4;
        var isToday = (dateKey === todayKey);
        html += '<div class="heatmap-cell level-' + level + '" data-date="' + dateKey + '" data-display="' + displayDate + '" data-count="' + count + '"' + (isToday ? ' id="heatmapToday"' : '') + ' title="' + displayDate + ' : ' + count + '件事"></div>';
      }
    }
    grid.innerHTML = html;
    var scroll = document.getElementById('heatmapScroll');
    if (scroll) setTimeout(function () { scroll.scrollLeft = scroll.scrollWidth; }, 100);
    setTimeout(function () {
      var todayCell = document.getElementById('heatmapToday');
      if (todayCell && typeof showHeatmapDay === 'function') showHeatmapDay(todayKey, '今天', todayCell);
    }, 50);
  }

  function showHeatmapDay(dateKey, displayDate, cellElement) {
    var projDate = document.getElementById('hmProjDate');
    var projList = document.getElementById('hmProjList');
    if (!projDate || !projList) return;

    document.querySelectorAll('.heatmap-cell.selected').forEach(function (el) { el.classList.remove('selected'); });
    if (cellElement) cellElement.classList.add('selected');

    var parts = dateKey.split('-');
    var dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var todayPure = new Date();
    todayPure.setHours(0, 0, 0, 0);
    if (dObj > todayPure) {
      projDate.innerText = '📅 ' + displayDate + ' · 完成 0 项';
      projList.innerHTML = '<div style=\"color:#aaa; font-size:0.8rem; font-style:italic; padding:8px 0;\">🌱 这一天还没到来，不着急。</div>';
      return;
    }

    var itemsRaw = (dailyLog || []).filter(function (log) {
      // 👉 v8.X 修复：花（Milestone）是高光，必须常驻；隐私开关仅控制压舱石
      if (log.isBallastStone && typeof isSanctuaryVisible !== 'undefined' && !isSanctuaryVisible) {
        return false;
      }
      var d = new Date(log.date);
      if (isNaN(d.getTime())) return false;
      return (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()) === dateKey;
    });
    var items = dedupeChecklistTwins(itemsRaw);

    // What & Why: 皇冠仅对应「全局花」高光；石头走列表，不在此抢位
    var milestone = items.find(function (l) {
      return l && !l.projectId && !l.isBallastStone && l.icon !== '🪨' && (l.isMilestone === true || l.type === 'milestone' || l.isSoulFlower === true || l.icon === '🌸');
    });
    // What & Why: 只剔除皇冠本尊，放过同日多朵旧花（同为 isMilestone 的其余条目）
    var regularItems = milestone ? items.filter(function (l) {
      return l && String(l.id) !== String(milestone.id);
    }) : items;

    var totalMins = 0;
    regularItems.forEach(function (log) { totalMins += (log.lastAddMinutes || 0); });

    var timeHtml = '';
    if (totalMins > 0) {
      var h = Math.floor(totalMins / 60);
      var m = totalMins % 60;
      var timeStr = h > 0 ? (m > 0 ? (h + 'h ' + m + 'm') : (h + 'h')) : (m + 'm');
      timeHtml = ' <span style="font-weight:normal; font-size:0.8rem; color:#888;">(共专注 ' + timeStr + ')</span>';
    }

    projDate.innerHTML = '📅 ' + displayDate + ' · 完成 ' + regularItems.length + ' 项' + timeHtml;

    // 👉 终极留白判定：既没有全局花，也没有真实的普通任务，才显示休息留白
    if (regularItems.length === 0 && !milestone) {
      projList.innerHTML = '<div style="color:#aaa; font-size:0.8rem; font-style:italic; padding:8px 0;">🍃 这一天，你选择了留白与休息。</div>';
      return;
    }

    var listHtml = '';
    if (milestone) {
      listHtml += '<div style="font-size:1rem; font-weight:bold; color:#FF9AA2; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #eee;">' +
        (milestone.icon || '🌸') + ' ' + milestone.title + '</div>';
    }

    // 👉 只有存在普通任务时，才去画这个 <ul> 的空壳，避免出现多余的排版缝隙
    if (regularItems.length > 0) {
      listHtml += '<ul style="margin:0; padding-left:20px;">';
      var foundNextDayLog = false;
      var insertedDivider = false;

      regularItems.forEach((log) => {
        const title = log.title || '未知记录';
        const icon = log.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(log) : '');
        let isNext = false;
        if (log.timeStr) {
          const h = parseInt(log.timeStr.split(':'), 10);
          const offset = typeof getDayStartOffset === 'function' ? getDayStartOffset() : 0;
          if (h >= 0 && h < offset) isNext = true;
        }
        const timeNote = log.timeStr ? `<span style="color:#aaa; font-size:0.75rem; margin-left:4px;">${log.timeStr}</span>` : '';
        
        // 👉 高信息密度折叠：把 [进度, 时长, 备注] 塞进一个括号里
        let innerArr = [];
        if (log.bookmarkSnapshot && log.bookmarkSnapshot.trim()) {
            let b = log.bookmarkSnapshot.trim();
            const tSnap = (log.targetProgressSnapshot || '').trim();
            if (tSnap && !b.includes('/')) b = b + ' / ' + tSnap;
            innerArr.push(b);
        }
        if (log.lastAddMinutes && log.lastAddMinutes > 0) {
            innerArr.push(`${log.lastAddMinutes}m`);
        }
        if (log.noteSnapshot && log.noteSnapshot.trim()) {
            // 将备注里的换行替换为空格，保持单行
            innerArr.push(log.noteSnapshot.trim().replace(/\n/g, ' '));
        }

        let snapshot = '';
        if (innerArr.length > 0) {
            snapshot = `<span style="color:#81C784; font-size:0.75rem; margin-left:6px;">[${innerArr.join(', ')}]</span>`;
        }

        // 👉 核心修正 1：先判断并画“跨日线”（必须在渲染当前任务之前）
        if (isNext) {
          foundNextDayLog = true;
        } else if (foundNextDayLog && !insertedDivider) {
          listHtml += `<li style="margin:6px 0 8px; list-style:none;">
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="flex:1; border-top:1px dashed #d0d0d0;"></div>
              <span style="flex:none; font-size:0.7rem; color:#b0b0b0; white-space:nowrap; letter-spacing:1px;">🌙 跨日线</span>
              <div style="flex:1; border-top:1px dashed #d0d0d0;"></div>
            </div>
          </li>`;
          insertedDivider = true;
        }

         // 👉 核心视觉修正：判定是否为局部一朵花
         const isLocalFlower = (icon === '🌸');
         // 利用原生 <li> 的 color 属性改变自带小圆点的颜色
         const dotColor = isLocalFlower ? '#FF9AA2' : '#555'; 
         
         listHtml += `<li style="margin-bottom:4px; color:${dotColor};">
             <span style="color:#555;">${icon} ${title} ${timeNote} ${snapshot}</span>
         </li>`;
      });
      
      listHtml += '</ul>';
    }

    projList.innerHTML = listHtml;
}

  function toggleNotePreview(noteId) {
    var el = document.querySelector('[data-note-id=\"' + noteId + '\"]');
    if (!el) return;
    var isExpanded = el.dataset.expanded === 'true';
    var noteFull = el.dataset.noteFull || '';
    if (isExpanded) {
      var notePreview = noteFull.split('\n')[0].substring(0, 15);
      el.innerHTML = '📝 ' + notePreview + (notePreview.length >= 15 ? '...' : '');
      el.dataset.expanded = 'false';
      el.style.whiteSpace = 'nowrap';
    } else {
      el.innerHTML = '📝 ' + noteFull.replace(/\\n/g, '<br>');
      el.dataset.expanded = 'true';
      el.style.whiteSpace = 'normal';
    }
  }

  function autoArchivePlaylists() {
    if (!Array.isArray(customPlaylists)) return;
    var todayStr = getAnchorDate().toDateString();
    var hasChanges = false;
    customPlaylists.forEach(function (pl) {
      if (pl.playlistType !== 'once' || pl.isArchived || pl.inColdStorage) return;
      if (!pl.items || pl.items.length === 0) return;
      var isAllDone = pl.items.every(function (i) { return i && (i.done === true || i.skipped === true); });
      if (isAllDone && pl.createdDate && pl.createdDate !== todayStr) {
        pl.isArchived = true;
        var d = typeof getAnchorDate === 'function' ? getAnchorDate() : new Date();
        pl.archivedDate = (d.getMonth() + 1) + '/' + d.getDate();
            hasChanges = true;
        }
    });
    if (hasChanges) savePlaylists();
}

  function renderCabinet() {
    if (typeof autoArchivePlaylists === 'function') autoArchivePlaylists();
    var container = document.getElementById('cabinetContent');
    if (!container) return;
    var drawerA = container.querySelector('#drawerActive');
    var drawerB = container.querySelector('#drawerArchived');
    var activeIsOpen = drawerA && drawerA.open ? 'open' : '';
    var archivedIsOpen = drawerB && drawerB.open ? 'open' : '';
    var scrollBox = container.querySelector('.cabinet-scroll-area') || container.querySelector('details[open] > div');
    var savedScrollTop = scrollBox ? scrollBox.scrollTop : 0;
    var activeHtml = '';
    var archivedHtml = '';
    var projectHtml = '';
    var projectCount = 0;
    var activeCount = 0;
    var archivedCount = 0;
    if (typeof customPlaylists !== 'undefined' && customPlaylists.length > 0) {
      customPlaylists.forEach(function (pl, pIdx) {
        if (!pl) return;
        
        // 👉 核心分支：渲染战略级项目卡片 (Surface Cards)
        if (pl.playlistType === 'project') {
            // 👉 v8.2.X 修复：冷库中的战略项目绝对不准在核心专案夹露脸
            if (pl.inColdStorage) return;
            let metaHtml = '';
            let cardClass = 'proj-type-infinite'; // 默认无限工程
            
            // 1. 无限工程 (The Infinite Domain)
            if (pl.projectSubType === 'infinite') {
                // 👉 v8.X：全域时间雷达（合并内部子项时间与外部红线时间）
                let internalMins = 0;
                if (Array.isArray(pl.items)) {
                    pl.items.forEach(it => { internalMins += (it.totalMinutes || 0); });
                }
                const externalMins = pl.linkedTotalMinutes || 0;
                const totalProjMins = internalMins + externalMins;
                
                let timeStr = '0h 0m';
                if (totalProjMins > 0) {
                    const h = Math.floor(totalProjMins / 60);
                    const m = totalProjMins % 60;
                    timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                }
                // 👇 在 metaHtml 赋值的【正上方】，插入这段寻花雷达代码：
    var realFlowers = 0;
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        realFlowers = dailyLog.filter(function(log) {
            return String(log.projectId) === String(pl.id) && (log.isMilestone === true || log.icon === '🌸');
        }).length;
    }

                // 👉 v8.2.X 数据连线修复：无限工程的花朵数必须读取 linkedCompletedCount
                metaHtml = '<div style="font-size:0.75rem; color:#4E9A51; margin-top:4px; font-weight:normal; letter-spacing:0.5px;">🌱 生命之树 · ' + (realFlowers > 0 ? '结出 ' + realFlowers + ' 朵花 · ' : '') + '沉浸 ' + timeStr + '</div>';
            } 
            // 2. 有限进度 (The Finite Project)
            else if (pl.projectSubType === 'finite') {
              cardClass = 'proj-type-finite';
              
              // 👉 1. 物理库存统计 (用于底层文本显示)
              const internalTotal = Array.isArray(pl.items) ? pl.items.length : 0;
              const internalDone = Array.isArray(pl.items) ? pl.items.filter(i => i.done).length : 0;
              const externalPending = (typeof db !== 'undefined') ? db.filter(t => String(t.projectId) === String(pl.id)).length : 0;
              const externalCompleted = pl.linkedCompletedCount || 0;
              
              const total = internalTotal + externalPending + externalCompleted;
              const done = internalDone + externalCompleted;

              // 👉 2. v8.3 核心修复：引入“权重换算器”，让微缩卡片与大展厅的 % 绝对一致！
              let totalWeight = 0;
              let doneWeight = 0;

              function calcTaskWeight(t) {
                  const targetVal = parseFloat(t.bookmarkTotal) || 0;
                  const currentVal = parseFloat(t.bookmarkText) || (t.completeCount || 0);
                  const hasTarget = targetVal > 0;
                  const isRecurring = t.recurrence && t.recurrence !== 'none';
                  // 无目标的重复任务/SOP 不计入进度分母
                  if (isRecurring && !hasTarget) return { w: 0, d: 0 };
                  if (hasTarget) {
                      let p = currentVal / targetVal;
                      if (p > 1) p = 1; if (p < 0) p = 0;
                      return { w: 1, d: p };
                  }
                  return { w: 1, d: t.done ? 1 : 0 };
              }

              if (pl.items && Array.isArray(pl.items)) {
                  pl.items.forEach(i => {
                      const res = calcTaskWeight(i);
                      totalWeight += res.w;
                      doneWeight += res.d;
                  });
              }
              if (typeof db !== 'undefined') {
                  db.filter(t => String(t.projectId) === String(pl.id)).forEach(t => {
                      const res = calcTaskWeight(t);
                      totalWeight += res.w;
                      doneWeight += res.d;
                  });
              }
              totalWeight += externalCompleted;
              doneWeight += externalCompleted;

              let percent = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;
              if (percent > 100) percent = 100;
              
              // 👉 3. 汇总所有时间（内部清单时长 + 外部红线时长）
              let internalMins = 0;
              if (pl.items && Array.isArray(pl.items)) {
                  pl.items.forEach(i => { internalMins += (i.totalMinutes || 0); });
              }
              const totalMins = internalMins + (pl.linkedTotalMinutes || 0);
              const hStat = Math.floor(totalMins / 60);
              const mStat = totalMins % 60;
              const timeStr = hStat > 0 ? `${hStat}h ${mStat}m` : `${mStat}m`;

             // 👉 4. v8.3.X 视觉升级：单行微缩地平线排版 (强制大一统)
              // Why: 列表视图必须保持单行高度一致。隐藏 x/x 项（点开可见），保留最核心的价值进度(%)与时间复利(⏱️)
              const cssBar = `<div style="display:inline-block; vertical-align:middle; width:70px; height:6px; background:rgba(0,0,0,0.06); border-radius:999px; overflow:hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.04); margin:0 4px;">
                  <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, #90CAF9, #1565C0); border-radius:999px; transition:width 0.3s ease-out;"></div>
              </div>`;
              
              metaHtml = `
              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:4px; font-size:0.75rem; color:#888;">
                  <!-- 左侧：微缩进度条与百分比 -->
                  <span style="display:flex; align-items:center;">
                      <span style="font-size:0.8rem; color:#1565C0;">🎯</span>
                      ${cssBar}
                      <span style="font-weight:bold; color:#1565C0;">${percent}%</span>
                  </span>
                  
                  <!-- 分割线 -->
                  <span style="color:#eee;">|</span> 
                  
                  <!-- 右侧：时间复利底托 -->
                  <span>⏱️ <strong style="color:#666;">${timeStr}</strong></span>
              </div>`;
          }
            // 3. 期限旅程 (The Deadline Sprint)
            else if (pl.projectSubType === 'deadline') {
                cardClass = 'proj-type-deadline';
                let daysText = '未设定日期';
                if (pl.deadlineEnd) {
                    const end = new Date(pl.deadlineEnd);
                    end.setHours(23, 59, 59, 999);
                    const now = typeof getAnchorDate === 'function' ? getAnchorDate() : new Date();
                    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                    if (diffDays > 0) daysText = `距离目标还有 <span class="proj-highlight" style="color:#d65a64;font-size:0.9rem;">${diffDays}</span> 天`;
                    else if (diffDays === 0) daysText = `<span class="proj-highlight" style="color:#d65a64;">🚨 就是今天！</span>`;
                    else daysText = `<span style="color:#aaa;">已逾期 ${Math.abs(diffDays)} 天</span>`;
                }
                metaHtml = `⏳ ${daysText}`;
            }

            var projectCardHtml = `
                <div class="project-surface-card ${cardClass}" onclick="window.openProjectConsole('${pl.id}')">
                    <div class="proj-header">
                        <div class="proj-icon">${pl.icon || '🚀'}</div>
                        <div class="proj-title">${pl.title || pl.name}</div>
                    </div>
                    <div class="proj-meta">${metaHtml}</div>
                </div>
            `;
            // 👉 v8.2.X 核心路由修正：已结项工程的归宿
            if (pl.isArchived) {
                archivedCount++;
                archivedHtml += projectCardHtml;
            } else {
                projectCount++;
                projectHtml += projectCardHtml;
            }
            return; // 项目渲染完毕，跳过下方普通 SOP 的渲染
        }
        if (pl.inColdStorage) return;
        var plIcon = pl.icon || '📑';
        var plHtml = '<div style="padding: 10px 4px; border-bottom: 1px dashed #f0f1f5;">';

        // 👉 v8.2.X：档案柜视觉大一统，极致降噪 (修复 Cursor 变量名脱节 Bug)
        var countBadge = '';
        if (pl.playlistType !== 'once') {
            if (pl.completeCount && pl.completeCount > 0) {
                countBadge = '<span class="manual-tag" style="margin-left:6px; background:#e8f5e9; color:#2e7d32; font-weight:bold; font-size:0.7rem; border:none;" title="累计循环完成次数">🏆 ' + pl.completeCount + '次</span>';
            } else {
                countBadge = '<span class="manual-tag" style="margin-left:6px; background:#f5f5f5; color:#888; font-weight:normal; font-size:0.7rem; border:none; padding:2px 4px;" title="SOP 循环清单">🔄</span>';
            }
        }
        var dateStamp = pl.archivedDate
          ? '<span style="font-size:0.7rem; color:#887A6A; background:#FDF6E3; padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:normal; border:1px solid #F5E6C4;">🏷️ 归档于 ' + pl.archivedDate + '</span>'
          : '';
        plHtml += '<div style="display:flex; justify-content:space-between; align-items:center;"><div style="font-size:0.85rem; font-weight:bold; color:#555; display:flex; align-items:center;"><span>' + plIcon + ' ' + (pl.title || pl.name || '未命名清单') + ' ' + dateStamp + ' ' + countBadge + '</span></div><div style="display:flex; gap:8px; align-items:center;">';
        if (pl.isArchived) {
          plHtml += '<span style="font-size:0.75rem; color:#999; cursor:pointer;" onclick="restoreArchivedPlaylist(' + pIdx + ')" title="唤醒/解档">♻️</span><span style="font-size:0.75rem; color:#bbb; cursor:pointer;" onclick="deleteArchivedPlaylist(' + pIdx + ')" title="彻底删除">🗑️</span>';
        } else {
          plHtml += '<span style="font-size:0.7rem; color:#4A90E2; background:#EBF4FF; padding:2px 8px; border-radius:6px; cursor:pointer; margin-right:6px; font-weight:normal;" onclick="sendPlaylistToStage(\'' + pl.id + '\')" title="一键送上抽卡台">▶️ 开启</span><span style="font-size:0.75rem; color:#999; cursor:pointer;" onclick="editPlaylist(' + pIdx + ')" title="编辑">✏️</span><span style="font-size:0.75rem; color:#999; cursor:pointer;" onclick="handlePlaylistColdOrDelete(' + pIdx + ')" title="操作">🧊</span>';
        }
        plHtml += '<span style="font-size:0.75rem; color:#999;">' + (pl.items ? pl.items.filter(function (i) { return i.done; }).length : 0) + '/' + (pl.items ? pl.items.length : 0) + '</span></div></div>';
        if (pl.items && pl.items.length > 0) {
          plHtml += '<div style="display:flex; flex-direction:column; gap:8px; padding-left: 22px; margin-top: 10px;">';
          pl.items.forEach(function (item, iIdx) {
            if (pl.isArchived) {
              var isSOP = pl.playlistType === 'sop';
              var icon = '⏳';
              var textStyle = 'color:#888;';
              var cursorStyle = 'cursor:pointer;';
              var clickAction = 'onclick="if(confirm(' + String.fromCharCode(39) + '✨ 要跨越时空，追认完成这项任务吗？' + String.fromCharCode(39) + ')) toggleCabinetItem(' + pIdx + ', ' + iIdx + ', true, false, false)"';
              var titleHint = '点击追认打卡';
              if (isSOP) {
                icon = item.done ? '✅' : '<span style="color:#ddd;">➖</span>';
                textStyle = item.done ? 'text-decoration:line-through; color:#aaa;' : 'color:#bbb;';
                cursorStyle = 'cursor:default;';
                clickAction = '';
                titleHint = item.done ? '已完成' : '已过期';
              } else if (item.done) {
                icon = item.isRetroactive ? '✨' : '✅';
                textStyle = item.isRetroactive ? 'text-decoration:line-through; color:#d6a8a8;' : 'text-decoration:line-through; color:#aaa;';
                cursorStyle = 'cursor:default;';
                clickAction = '';
                titleHint = '已完成';
              }
              plHtml += '<div style="display:flex; align-items:flex-start; gap:6px; font-size:0.85rem; ' + cursorStyle + '" ' + clickAction + ' title="' + titleHint + '"><span style="width:18px; text-align:center;">' + icon + '</span><span style="flex:1; ' + textStyle + '">' + (item.text || item.title || '') + '</span></div>';
            } else {
              var isDone = item.done === true;
              var isSkipped = item.skipped === true;
              var checkedAttr = isDone ? 'checked' : '';
              var textStyle = 'color:#555;';
              if (isDone) textStyle = 'text-decoration:line-through; color:#aaa;';
              else if (isSkipped) textStyle = 'text-decoration:line-through; color:#ef9a9a; font-style:italic; opacity:0.8;';
              plHtml += '<div style="display:flex; align-items:flex-start; gap:6px; font-size:0.85rem;">'
                + '<input type="checkbox" class="pl-step-checkbox" ' + checkedAttr + ' onchange="toggleCabinetItem(' + pIdx + ', ' + iIdx + ', this.checked, true, false)" style="margin-top:3px; width:16px; height:16px;">'
                + '<span style="flex:1; ' + textStyle + '">' + (item.text || item.title || '') + '</span>'
                + '<span onclick="toggleSkipItem(\'' + pl.id + '\',' + iIdx + ')" style="cursor:pointer; font-size:0.8rem; color:#bbb; padding:0 4px;" title="不需要/跳过">⏭️</span>'
                + '</div>';
            }
          });
          plHtml += '</div>';
        }
        plHtml += '</div>';
        if (pl.isArchived) { archivedCount++; archivedHtml += plHtml; } else { activeCount++; activeHtml += plHtml; }
      });
    }
    // 兜底空状态提示
    if (projectCount === 0) projectHtml = '<div style="font-size:0.75rem; color:#bbb; padding:10px 4px; text-align:center;">暂无立项的专案</div>';
    if (activeCount === 0) activeHtml = '<div style="font-size:0.75rem; color:#bbb; padding:10px 4px; text-align:center;">暂无案头手边事</div>';
    if (archivedCount === 0) archivedHtml = '<div style="font-size:0.75rem; color:#bbb; padding:10px 4px; text-align:center;">暂无归档手账本</div>';

    var drawerStyle = 'background: #fcfcfc; border: 1px solid #f0f1f5; border-radius: 12px; padding: 6px 12px; margin-bottom: 8px;';
    var summaryStyle = 'font-size:0.85rem; font-weight:bold; color:#555; padding: 4px 0; cursor:pointer; display:flex; align-items:center;';

    // 👉 v8.X 架构重组：开始像搭积木一样，构建三联排立柜
    var finalHtml = '';
    
    // 抽屉 1：🗂️ 核心专案夹 (永远置顶)
    finalHtml += '<details id="drawerProjects" style="' + drawerStyle + '" open>';
    // 👉 v8.2.X UX 优化：统一隐喻体系
    finalHtml += '<summary class="cabinet-summary" style="' + summaryStyle + '">🗂️ 核心专案夹 <span style="font-size:0.75rem; font-weight:normal; color:#999; margin-left:6px;">(' + projectCount + ') ——</span></summary>';
    finalHtml += '<div class="cabinet-scroll-area" style="padding-top: 8px; max-height: 280px; overflow-y: auto;">' + projectHtml + '</div>';
    finalHtml += '</details>';

    // 抽屉 2：🪴 案头手边事 (SOP与一次性清单)
    finalHtml += '<details id="drawerActive" style="' + drawerStyle + '" ' + activeIsOpen + '>';
    finalHtml += '<summary class="cabinet-summary" style="' + summaryStyle + '">🪴 案头手边事 <span style="font-size:0.75rem; font-weight:normal; color:#999; margin-left:6px;">(' + activeCount + ') ——</span></summary>';
    finalHtml += '<div class="cabinet-scroll-area" style="padding-top: 8px; max-height: 220px; overflow-y: auto;">' + activeHtml + '</div>';
    finalHtml += '</details>';

    // 抽屉 3：📔 归档手账本 (已完成结项的清单)
    finalHtml += '<details id="drawerArchived" style="' + drawerStyle + '" ' + archivedIsOpen + '>';
    finalHtml += '<summary class="cabinet-summary" style="' + summaryStyle + '">📔 归档手账本 <span style="font-size:0.75rem; font-weight:normal; color:#999; margin-left:6px;">(' + archivedCount + ') ——</span></summary>';
    finalHtml += '<div class="cabinet-scroll-area" style="padding-top: 8px; max-height: 220px; overflow-y: auto;">' + archivedHtml + '</div>';
    finalHtml += '</details>';

    // 统一装入物理容器
    container.innerHTML = finalHtml;

    // 账本对齐：更新档案柜总数量（加上项目数量）
    var countEl = document.getElementById('cabinetCountDisplay');
    if (countEl) countEl.innerText = '(' + (activeCount + archivedCount + projectCount) + ')';
    
    // 恢复滚动高度，防跳动
    var newScrollBox = container.querySelector('.cabinet-scroll-area') || container.querySelector('details[open] > div');
    if (newScrollBox) newScrollBox.scrollTop = savedScrollTop;
  }

  function handleColdOrDelete(id) {
    var item = db.filter(function (t) { return t.id === id; })[0];
    if (!item) return;
    pendingColdId = id;
    pendingColdIsPlaylist = false;
    var dlg = document.getElementById('coldDialog');
    if (dlg) {
      var titleEl = dlg.querySelector('.cold-dialog-title');
      if (titleEl) titleEl.innerText = '要怎么处理这条任务？';
      var btnContainer = dlg.querySelector('.cold-dialog-buttons');
      if (btnContainer) {
        btnContainer.innerHTML = '<button type="button" class="cold-btn-delete" data-cold-action="delete">🗑️ 删除</button><button type="button" class="cold-btn-cold" data-cold-action="cold">🧊 冷库</button><button type="button" class="cold-btn-cancel" data-cold-action="cancel">🔙 取消</button>';
        btnContainer.querySelectorAll('[data-cold-action]').forEach(function (btn) {
          btn.addEventListener('click', function () { confirmColdAction(btn.getAttribute('data-cold-action')); });
        });
      }
      var cancelBtn = dlg.querySelector('.cold-btn-cancel');
      if (cancelBtn) { cancelBtn.textContent = '🏆 归档'; cancelBtn.setAttribute('data-cold-action', 'archive'); }
      dlg.style.display = 'flex';
    }
  }

  function confirmColdAction(action) {
    var dlg = document.getElementById('coldDialog');
    if (dlg) dlg.style.display = 'none';
    var id = pendingColdId;
    pendingColdId = null;
    if (id === undefined || id === null) return;

    // 👉 v8.2.X 核心修复：战略工程 (Project) 生命线拦截 (必须在获取到 id 之后！)
    if (window.pendingColdIsProject) {
        window.pendingColdIsProject = false;
        var pIdx = customPlaylists.findIndex(function(p) { return p && String(p.id) === String(id); });
        if (pIdx > -1) {
            var proj = customPlaylists[pIdx];
            if (action === 'delete') {
                if (confirm('⚠️ 警告：确定要彻底删除该工程吗？\n删除后其历史痕迹将失去归属，此操作不可挽回。')) {
                    customPlaylists.splice(pIdx, 1);
                    if (typeof savePlaylists === 'function') savePlaylists();
                    if (typeof renderCabinet === 'function') renderCabinet();
                    if (typeof closeProjectConsole === 'function') closeProjectConsole();
                    else if (typeof window.closeProjectConsole === 'function') window.closeProjectConsole();
                    if (typeof showToast === 'function') showToast('🗑️ 工程已彻底抹除');
                }
            } else if (action === 'cold') {
                proj.inColdStorage = true;
                if (typeof savePlaylists === 'function') savePlaylists();
                if (typeof renderCabinet === 'function') renderCabinet();
                if (typeof renderList === 'function') renderList();
                if (typeof closeProjectConsole === 'function') closeProjectConsole();
                else if (typeof window.closeProjectConsole === 'function') window.closeProjectConsole();
                if (typeof showToast === 'function') showToast('🧊 工程已进入休眠舱');
            } else if (action === 'archive_project') {
                if (confirm('🎉 确定要将【' + (proj.title || proj.name) + '】光荣结项吗？\n它将同时被载入归档手账本与最高荣誉殿堂。')) {
                    proj.isArchived = true;
                    proj.archivedDate = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString();
                    if (typeof savePlaylists === 'function') savePlaylists();

                    if (typeof archive !== 'undefined' && Array.isArray(archive)) {
                        var doneSub = proj.items ? proj.items.filter(function(i) { return i.done; }).length : 0;
                        archive.unshift({
                            id: 'arch_proj_' + Date.now(),
                            title: '[光荣结项] ' + (proj.title || proj.name),
                            type: 'project_done',
                            icon: '🏆',
                            finishDate: proj.archivedDate,
                            totalMinutes: proj.linkedTotalMinutes || 0,
                            noteText: '完成了共计 ' + doneSub + ' 项底层任务。'
                        });
                        if (typeof save === 'function') save();
                        if (typeof renderArchive === 'function') renderArchive();
                    }

                    if (typeof renderCabinet === 'function') renderCabinet();
                    if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
                    if (typeof closeProjectConsole === 'function') closeProjectConsole();
                    else if (typeof window.closeProjectConsole === 'function') window.closeProjectConsole();
                    if (typeof showToast === 'function') showToast('🏆 结项礼成！工程已载入最高荣誉殿堂！');
                }
            }
        }
        return;
    }

    if (pendingColdIsPlaylist) {
      pendingColdIsPlaylist = false;
      if (action === 'cold') {
        if (customPlaylists[id]) { customPlaylists[id].inColdStorage = true; savePlaylists(); if (typeof renderCabinet === 'function') renderCabinet(); renderList(); if (typeof showToast === 'function') showToast('🧊 清单已冻结'); }
      } else if (action === 'delete') {
        if (confirm('确定要彻底删除这条清单吗？此操作不可恢复。') && customPlaylists[id]) {
          customPlaylists.splice(id, 1); savePlaylists(); if (typeof renderCabinet === 'function') renderCabinet(); renderList(); if (typeof showToast === 'function') showToast('🗑️ 清单已彻底删除');
        }
      } else if (action === 'archive_playlist') {
        if (customPlaylists[id]) {
          customPlaylists[id].isArchived = true;
          customPlaylists[id].archivedDate = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString();
          savePlaylists();
          if (typeof renderCabinet === 'function') renderCabinet();
          if (typeof showToast === 'function') showToast('🗄️ 清单已归档至手账本');
        }
      }
      return;
    }
    var item = db.filter(function (t) { return t.id === id; })[0];
    if (!item) return;
    if (action === 'archive') {
      if (!confirm('确定已彻底完成【' + (item.title || '该任务') + '】并将其移入荣誉殿堂吗？')) return;
      db = db.filter(function (t) { return t.id !== id; });
      archive.unshift(Object.assign({}, item, { finishDate: new Date().toLocaleDateString() }));
      save();
      renderList();
      renderArchive();
      // 👉 v8.1.4 找回遗失的庆典：归档大长篇必须撒花！
    if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
    if (typeof showToast === 'function') {
        showToast("🏆 伟大里程碑！已收入荣誉殿堂");
    }
    } else if (action === 'cold') {
      item.inColdStorage = true;
      save();
      renderList();
      if (typeof showToast === 'function') showToast('🧊 已移入冷库');
    } else if (action === 'delete') {
      if (!confirm('确定要彻底删除这条任务吗？此操作不可恢复。')) return;
      db = db.filter(function (t) { return t.id !== id; });
      save();
      renderList();
      if (typeof showToast === 'function') showToast('🗑️ 已删除');
    }
    var dlg = document.getElementById('coldDialog');
    if (dlg) {
      var cancelBtn = dlg.querySelector('.cold-btn-cancel');
      if (cancelBtn) { cancelBtn.textContent = '🔙 取消'; cancelBtn.setAttribute('data-cold-action', 'cancel'); }
    }
  }

  function moveToColdStorage(id) {
    var item = db.filter(function (t) { return t.id === id; })[0];
    if (!item) return;
    item.inColdStorage = true;
    save();
    renderList();
    if (typeof showToast === 'function') showToast('🧊 已移入冷库');
  }

  function restoreFromColdStorage(id) {
    var item = db.filter(function (t) { return t.id === id; })[0];
    if (!item) return;
    item.inColdStorage = false;
    save();
    renderList();
    if (typeof showToast === 'function') showToast('♻️ 已从冷库赦免');
  }

  function tryDeleteItem(id) {
    if (!confirm('确定删除吗？')) return;
    db = db.filter(function (item) { return item.id !== id; });
    save();
    renderList();
    if (typeof showToast === 'function') showToast('🗑️ 已删除');
  }

  function deleteArchiveItem(index) {
    if (index < 0 || index >= archive.length) return;
    if (!confirm('确定从荣誉殿堂删除这条记录吗？')) return;
    archive.splice(index, 1);
    save();
    renderArchive();
    if (typeof showToast === 'function') showToast('🗑️ 已删除');
  }

  function handlePlaylistColdOrDelete(pIdx) {
    pendingColdId = pIdx;
    pendingColdIsPlaylist = true;
    var dlg = document.getElementById('coldDialog');
    if (dlg) {
      var titleEl = dlg.querySelector('.cold-dialog-title');
      if (titleEl) titleEl.innerText = '要怎么处理这条清单？';
      var btnContainer = dlg.querySelector('.cold-dialog-buttons');
      if (btnContainer) {
        btnContainer.innerHTML = `
      <button type="button" class="cold-btn-delete" onclick="confirmColdAction('delete')">🗑️ 彻底删除</button>
      <button type="button" class="cold-btn-cold" onclick="confirmColdAction('cold')">🧊 搁置(冷库)</button>
      <button type="button" class="cold-btn-cancel" onclick="confirmColdAction('archive_playlist')" style="font-weight:bold; color:#e65100;">🗄️ 结束并归档</button>
    `;
      }
      dlg.style.display = 'flex';
    }
  }

  function restoreArchivedPlaylist(pIdx) {
    if (customPlaylists[pIdx]) {
        const pl = customPlaylists[pIdx];
        
        // 1. 撕掉退役钢印
        delete pl.archivedDate;
        delete pl.completedDate;
        pl.isArchived = false;
        
        // 2. 存盘并刷新基础档案柜
        savePlaylists();
        if (typeof renderCabinet === 'function') renderCabinet();
        
        // 👉 3. v8.2.X 新增：如果在项目大展厅里，实时刷新左脑活跃区
        if (typeof window.renderProjectConsoleInner === 'function' && pl.projectId) {
            window.renderProjectConsoleInner(pl.projectId);
        }
        
        // 👉 4. v8.2.X 新增：如果是从记忆放映机里点击的，顺手关闭弹窗
        const dlg = document.getElementById('historyTaskDialog');
        if (dlg && dlg.style.display !== 'none') {
            dlg.style.display = 'none';
        }
        
        if (typeof showToast === 'function') showToast('♻️ 清单已重返案头与活跃区');
    }
}

  function deleteArchivedPlaylist(pIdx) {
    if (!confirm('确定要彻底销毁这份手账本吗？此操作不可恢复。')) return;
    customPlaylists.splice(pIdx, 1);
    savePlaylists();
    if (typeof renderCabinet === 'function') renderCabinet();
    if (typeof showToast === 'function') showToast('🗑️ 手账已销毁');
  }

  function sendPlaylistToStage(plId) {
    // 👉 防呆拦截：有专注任务时绝对禁止切台
    if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor') {
      if (typeof showToast === 'function') {
        showToast('⚠️ 当前已有专注任务！请先结算后，再开启专属清单隧道。');
      }
      return;
    }

    // 触发下拉框联动
    var sel = document.getElementById('selPlaylist');
    if (sel) {
      sel.value = plId;
      if (typeof handlePlaylistChange === 'function') handlePlaylistChange();
    }

    // 👉 v8.X 核心修复：真正调用 draw 打开浮层，关闭高级筛选抽屉，并平滑滚动
    if (typeof draw === 'function') draw();
    
    // 👉 What & Why: 升级为 const 现代写法。因为 drawer 这个变量一旦找到目标，就不需要再变了，使用 const 极大地保护了内存安全。
    const drawer = document.getElementById('filterDrawer');
    if (drawer) {
      // 使用同一套折叠机制，避免破坏 v8 现有 Swiper / DOM 结构
      drawer.classList.remove('expanded');
    }
    // 👉 补充修复：顺手关掉 03 区的档案柜抽屉，防止门没关
    const cabinetDetails = document.getElementById('cabinetDetails');
    if (cabinetDetails) cabinetDetails.open = false;

    // 👉 v8.X 核心追加：扯下挡住视线的“项目展厅”眼罩！
    // What & Why: 因为展厅是一个全局悬浮的 Overlay，如果不关掉它，用户折跃到 01 区后依然会被它遮挡视线。
    // 🚨 Cursor 提示：请根据 index.html 中实际的项目展厅容器 ID 进行精确替换（如 projectConsole, projectCreator 等）
    const projectConsole = document.getElementById('projectConsole') || document.getElementById('projectConsoleOverlay') || document.getElementById('projectDialog');
    if (projectConsole) {
        projectConsole.style.display = 'none';
    }
    
    // 如果还有附带的全屏黑幕遮罩（Backdrop），一并关闭以防幽灵拦截
    const consoleBackdrop = document.getElementById('projectConsoleBackdrop');
    if (consoleBackdrop) {
        consoleBackdrop.style.display = 'none';
    }

    // 👉 修复：v8.0 空间架构下，必须使用 Swiper 的 API 或我们封装的 backToCenter 回到主舞台
    setTimeout(function () {
      if (typeof window.backToCenter === 'function') {
        window.backToCenter();
      } else {
        var outer = document.querySelector('.outer-swiper');
        // 👉 修复：横向空间已开启循环，必须使用 slideToLoop
        if (outer && outer.swiper) outer.swiper.slideToLoop(1);
        var inner = document.querySelector('.inner-swiper');
        if (inner && inner.swiper) inner.swiper.slideTo(1); // 纵向不循环，保持 slideTo 即可
      }
    }, 150);

    if (typeof showToast === 'function') {
      showToast('🎯 已为您直达专属清单！');
    }
  }

  // 👉 v8.0 核心引擎：严格对齐 v7.1.4 金标准，修复幻觉与足迹丢失
  window.toggleCabinetItem = function(pIdx, iIdx, isChecked, fromCard = false, isSilentSkip = false) {
    if (typeof customPlaylists === 'undefined' || !customPlaylists[pIdx]) return;
    let pl = customPlaylists[pIdx];

    // 1. 数据结构兼容补全
    let items = Array.isArray(pl.items) ? pl.items : null;
    if ((!items || items.length === 0) && Array.isArray(pl.tasks) && pl.tasks.length > 0) {
        items = pl.tasks.map(text => ({ text, done: false, skipped: false }));
        pl.items = items;
    }
    if (!items || !items[iIdx]) return;

    const item = items[iIdx];
    item.done = isChecked;

    // 👉 What & Why: 找回 v7.1.4 丢失的“海关盖章”逻辑。
    // 只有在这里给 item 盖上 isRetroactive 的时空钢印，
    // 下面的 dailyLog.unshift 才能真正读到这个值，放映机才会渲染 ✨。
    if (pl.isArchived) {
        if (isChecked) {
            item.isRetroactive = true;
        } else {
            delete item.isRetroactive;
        }
    }

    // 2. 底层状态保存
    if (typeof savePlaylists === 'function') savePlaylists();

    // 3. 时间与变量度量衡（严格禁用英文长日期，统一时空标准）
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const anchorDateStr = typeof getAnchorDate === 'function' ? getAnchorDate().toDateString() : new Date().toDateString();
    const taskName = item.text || item.title || '未知子任务';
    const plIcon = pl.icon || '📑';
    const plTitle = pl.title || pl.name || '清单';
    
    // 👉 What & Why: 找回 v7.1.4 丢失的“追认文案”前缀逻辑。
    // 如果清单是归档状态，动态在前缀插入“追认·”，否则为空，完美还原历史底片。
    const prefix = pl.isArchived ? '追认·' : '';
    const logTitle = `【${prefix}${plTitle}】${taskName}`;

    // 4. 单条子任务足迹引擎 (受 isSilentSkip 严格保护)
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        if (isChecked && !isSilentSkip) {
            // 👉 核心修复：拆除 !existed 去重拦截！
            // 确保 SOP 清单在第 N 次循环时，每一次打钩都能如实生成当次足迹
            dailyLog.unshift({
                id: Date.now(),
                title: logTitle,
                icon: plIcon,
                timeStr: timeStr,
                date: anchorDateStr,
                done: true,
                type: 'checklist_item',
                playlistId: pl.id,
                isRetroactive: item.isRetroactive // 👉 同步追认烙印
            });
            if (typeof save === 'function') save();
            if (typeof renderLog === 'function') renderLog();
            if (typeof renderHistory === 'function') renderHistory();
        } else if (!isChecked && !item.skipped) {
            // 撤销打卡：从足迹中抹除
            const targetIdx = dailyLog.findIndex(l => l.date === anchorDateStr && l.title === logTitle && l.type === 'checklist_item');
            if (targetIdx > -1) {
                dailyLog.splice(targetIdx, 1);
                if (typeof save === 'function') save();
                if (typeof renderLog === 'function') renderLog();
                if (typeof renderHistory === 'function') renderHistory();
                if (typeof showToast === 'function') showToast('↩️ 已撤销打卡记录');
            }
        }
    }

    // 5. 终局大一统结算 (SOP / Once)
    const allProcessed = pl.items.every(i => i && (i.done === true || i.skipped === true));

    if (allProcessed) {
        if (typeof showToast === 'function') showToast(`🎉 恭喜！「${plTitle}」已全部走完！`);

        if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
            
            // 👉 What & Why: 找回 v7.1.4 金标准。将橡皮擦关回“一次性清单”的房间！
            // 查杀重复的旧终局足迹，绝不误伤 SOP 的历史轮回
            if (pl.playlistType === 'once' || !pl.playlistType) {
                const doneIdx = dailyLog.findIndex(l => l.date === anchorDateStr && l.type === 'playlist_done' && l.playlistId === pl.id);
                if (doneIdx > -1) dailyLog.splice(doneIdx, 1);

                // ⚡️ Once：写入整体完成足迹，但【绝不即时删除】
                dailyLog.unshift({
                    id: Date.now(),
                    title: `【整体完成】${plTitle}`,
                    icon: '🏆',
                    timeStr: timeStr,
                    date: anchorDateStr,
                    done: true,
                    type: 'playlist_done',
                    playlistId: pl.id
                });
                
                // 将 100% 满格的清单留在档案柜作为今日战利品，留给明日自动归档
                if (typeof showToast === 'function') showToast('🎉 100% 达成！将作为战利品展示至次日');
              } else {
                // 🔄 SOP：循环计次
                pl.completeCount = (pl.completeCount || 0) + 1;
                dailyLog.unshift({
                    id: Date.now(),
                    // 👉 What & Why: 恢复 v7.1.4 纯净语义。数字代表的是“累积达到了第几次”，剔除引起逻辑歧义的“本次”二字。
                    title: `【+${pl.completeCount}】${plTitle}`,
                    icon: '🏆',
                    timeStr: timeStr,
                    date: anchorDateStr,
                    done: true,
                    type: 'playlist_done',
                    playlistId: pl.id
                });
                // 重置轮回
                if (Array.isArray(pl.items)) {
                    pl.items.forEach(it => { if (it) { it.done = false; it.skipped = false; } });
                }
            }
        }

        // 统一存盘与刷新
        if (typeof savePlaylists === 'function') savePlaylists();
        if (typeof renderCabinet === 'function') renderCabinet();
        if (typeof save === 'function') save();
        if (typeof renderLog === 'function') renderLog();
        if (typeof renderHistory === 'function') renderHistory();

        // 卡片触发终局，安全关闭 Overlay
        if (fromCard) {
            setTimeout(() => {
                if (typeof closePlaylistOverlay === 'function') closePlaylistOverlay(true);
            }, 1000);
        }
    } else {
        // 未完结时的视觉反馈
        if (isChecked && !isSilentSkip && typeof safeVibrate === 'function') safeVibrate();
    }

    // 6. 实时刷新档案柜 UI
    if (typeof renderCabinet === 'function') renderCabinet();
  }

  function exportToFile() {
    var backupData = getBackupDataObj();
    var blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    var safeName = currentUsername === 'Anchor' ? 'backup' : currentUsername;
    var dateStr = new Date().toISOString().slice(0, 10);
    a.download = 'anchor_' + safeName + '_' + dateStr + '.json';
    a.click();
  }

  var pendingImportData = null;

  function executeImport(isCloud) {
    if (isCloud === void 0) isCloud = false;
    var area = document.getElementById('dataArea');
    var str = area ? area.value : '';
    if (!str || str.trim().length === 0) {
      alert('⚠️ 请先粘贴代码！');
      return;
    }
    try {
      var json = JSON.parse(str);
      var incomingDB;
      var incomingArchive;
      var incomingDailyLog;
      var incomingStats;
      var parsedData = null;
      var localData = null;
      var backupVersion = json.version || '';
      var hasCustomPlaylists = false;
      var hasUsername = false;

      if (json.version && json.data) {
        parsedData = json.data;
        incomingDB = json.data.db || [];
        incomingArchive = json.data.archive || [];
        incomingDailyLog = json.data.dailyLog || [];
        incomingStats = json.data.userStats || {};
        localData = json.local || null;
        if (json.data && json.data.customPlaylists !== void 0) {
          if (!localData) localData = {};
          if (localData.customPlaylists === void 0 || localData.customPlaylists === null) {
            localData.customPlaylists = json.data.customPlaylists;
          }
        }
      } else {
        parsedData = json.data || null;
        incomingDB = json.db || (Array.isArray(json) ? json : []);
        incomingArchive = json.archive || [];
        incomingDailyLog = json.dailyLog || [];
        incomingStats = json.userStats || {};
      }

      if (!Array.isArray(incomingDB)) throw new Error('格式错误：db 必须是数组');
      if (!Array.isArray(incomingArchive)) incomingArchive = [];
      if (!Array.isArray(incomingDailyLog)) incomingDailyLog = [];
      if (typeof incomingStats !== 'object' || incomingStats === null) incomingStats = {};

      var parsedDb = incomingDB;
      var parsedArchive = incomingArchive;
      var parsedLog = incomingDailyLog;

      if (localData) {
        hasCustomPlaylists = Object.prototype.hasOwnProperty.call(localData, 'customPlaylists');
        hasUsername = Object.prototype.hasOwnProperty.call(localData, 'username');
      }

      var hasLocalData = !!(localData && (
        localData.ritualMorning ||
        localData.ritualNight ||
        localData.openedDays ||
        localData.posterShownDay ||
        hasCustomPlaylists ||
        localData.playlistStats ||
        hasUsername ||
        Object.prototype.hasOwnProperty.call(localData, 'dayStartOffset') ||
        Object.prototype.hasOwnProperty.call(localData, 'energyMode') ||
        Object.prototype.hasOwnProperty.call(localData, 'visitedV66') ||
        Object.prototype.hasOwnProperty.call(localData, 'stardustTexts') ||
        Object.prototype.hasOwnProperty.call(localData, 'blackholeTexts')
      ));

      if (!localData) localData = {};
      if (!hasCustomPlaylists) localData.customPlaylists = [];
      if (!hasUsername) localData.username = 'Anchor';

      var titleEl = document.getElementById('backupDialogTitle');
      // 👉 v8.X 修复：高容错数据统计，包含清单、项目、标签与专属筛选
      let taskCount = Array.isArray(parsedDb) ? parsedDb.length : 0;
      let archiveCount = Array.isArray(parsedArchive) ? parsedArchive.length : 0;
      let logCount = Array.isArray(parsedLog) ? parsedLog.length : 0;
      let stardustCount = (hasLocalData && Array.isArray(localData.stardustTexts)) ? localData.stardustTexts.length : 0;
      let blackholeCount = (hasLocalData && Array.isArray(localData.blackholeTexts)) ? localData.blackholeTexts.length : 0;

      // 兼容新旧版本的清单/项目、自定义标签、专属筛选统计
      let playlistCount = 0, tagsCount = 0, filtersCount = 0;
      const sourceData = parsedData || localData || {}; // 兼容不同备份格式
      if (Array.isArray(sourceData.customPlaylists)) playlistCount = sourceData.customPlaylists.length;
      if (Array.isArray(sourceData.customTags)) tagsCount = sourceData.customTags.length;
      if (Array.isArray(sourceData.customFilters)) filtersCount = sourceData.customFilters.length;

      let dialogTitle = "解析成功";
      if (titleEl) {
          let statsHtml = `<span style="font-size:0.8rem; font-weight:normal; color:#666;">解析到 ${taskCount} 个任务、${archiveCount} 个归档、${logCount} 条足迹、${stardustCount} 颗星尘、${blackholeCount} 缕黑洞残影<br>包含 ${playlistCount} 个清单/项目、${tagsCount} 个自定义标签、${filtersCount} 个专属筛选。</span>`;
          if (isCloud) {
              dialogTitle = `☁️ 云端数据已就绪<br>${statsHtml}`;
          } else {
              dialogTitle = `选择导入方式<br>${statsHtml}`;
          }
          titleEl.innerHTML = dialogTitle;
      }

      pendingImportData = {
        incomingDB: incomingDB,
        incomingArchive: incomingArchive,
        incomingDailyLog: incomingDailyLog,
        incomingStats: incomingStats,
        localData: localData,
        backupVersion: backupVersion,
        taskCount: taskCount,
        archiveCount: archiveCount,
        logCount: logCount,
        hasLocalData: hasLocalData,
        hasCustomPlaylists: hasCustomPlaylists,
        hasUsername: hasUsername
      };

      // 👉 核心修复：必须呼叫原版的 backupDialog
      var dialog = document.getElementById('backupDialog');
      if (dialog) {
        dialog.style.display = 'flex';
      } else {
        console.error('找不到 backupDialog 弹窗！');
      }
    } catch (e) {
      alert('❌ 导入失败：' + e.message);
      console.error('导入错误详情', e);
    }
  }

  function confirmBackupAction(action) {
    function restoreStardustTextsForImport(ld, act) {
      if (!ld || !Object.prototype.hasOwnProperty.call(ld, 'stardustTexts')) return;
      try {
        if (act === 'overwrite') {
          localStorage.setItem('anchor_stardust_texts', JSON.stringify(ld.stardustTexts || []));
        } else if (act === 'merge') {
          var currentStardust = [];
          var existingSd = localStorage.getItem('anchor_stardust_texts');
          if (existingSd) {
            try { currentStardust = JSON.parse(existingSd); } catch (e0) { currentStardust = []; }
          }
          if (!Array.isArray(currentStardust)) currentStardust = [];
          var incomingSd = ld.stardustTexts || [];
          if (!Array.isArray(incomingSd)) incomingSd = [];
          incomingSd.forEach(function (inItem) {
            if (!inItem) return;
            var idx = currentStardust.findIndex(function (c) { return c && c.id === inItem.id; });
            if (idx > -1) currentStardust[idx] = inItem;
            else currentStardust.push(inItem);
          });
          localStorage.setItem('anchor_stardust_texts', JSON.stringify(currentStardust));
        }
        var sdNext = [];
        try {
          sdNext = JSON.parse(localStorage.getItem('anchor_stardust_texts') || '[]');
        } catch (e1) { sdNext = []; }
        if (!Array.isArray(sdNext)) sdNext = [];
        if (typeof window !== 'undefined') window.stardustTexts = sdNext;
        if (typeof stardustTexts !== 'undefined') stardustTexts = sdNext;
        if (typeof renderStardustTexts === 'function') renderStardustTexts();
      } catch (e) {
        console.warn('恢复 stardustTexts 失败', e);
      }
    }

    var dialog = document.getElementById('backupDialog');
    if (dialog) dialog.style.display = 'none';
    if (!pendingImportData) return;
    if (action === 'cancel') {
      pendingImportData = null;
      return;
    }

    var incomingDB = pendingImportData.incomingDB;
    var incomingArchive = pendingImportData.incomingArchive;
    var incomingDailyLog = pendingImportData.incomingDailyLog;
    var incomingStats = pendingImportData.incomingStats;
    var localData = pendingImportData.localData;
    var hasCustomPlaylists = pendingImportData.hasCustomPlaylists;
    pendingImportData = null;

    if (action === 'overwrite') {
      db = incomingDB.map(function (item) {
        if (!item.id) item.id = Date.now() + Math.floor(Math.random() * 10000);
        if (item.time === void 0) item.time = 30;
        return item;
      });
      archive = incomingArchive.slice();
      dailyLog = incomingDailyLog.slice();
      // 👉 What & Why: [修复] 情绪资产的 Merge 绝对不能盲目覆盖！必须使用 Math.max 永远保留最大值，防止高价值被低价值跌破冲洗。
      if (typeof userStats !== 'object' || !userStats) userStats = { willpower: 0, joy: 0 };
      if (typeof incomingStats === 'object' && incomingStats) {
          userStats.willpower = Math.max((userStats.willpower || 0), (incomingStats.willpower || 0));
          userStats.joy = Math.max((userStats.joy || 0), (incomingStats.joy || 0));
      }
      // 👉 恢复星尘宇宙文本碎片（覆盖）
      restoreStardustTextsForImport(localData, 'overwrite');
    } else if (action === 'merge') {
      var existingIds = new Set(db.map(function (item) { return item.id; }));
      var mergedDB = db.slice();
      incomingDB.forEach(function (item) {
        if (!item.id) item.id = Date.now() + Math.floor(Math.random() * 10000);
        if (item.time === void 0) item.time = 30;
        if (existingIds.has(item.id)) {
          var idx = mergedDB.findIndex(function (it) { return it.id === item.id; });
          if (idx >= 0) mergedDB[idx] = item;
        } else {
          mergedDB.push(item);
          existingIds.add(item.id);
        }
      });
      db = mergedDB;

      var archiveMap = new Map();
      archive.forEach(function (item) {
        if (item && item.title) archiveMap.set(item.title + '|' + (item.date || ''), item);
      });
      incomingArchive.forEach(function (item) {
        if (!item || !item.title) return;
        var key = item.title + '|' + (item.date || '');
        if (!archiveMap.has(key)) archiveMap.set(key, item);
      });
      archive = Array.from(archiveMap.values());

      var logMap = new Map();
      dailyLog.forEach(function (item) {
        if (item && item.date) logMap.set(item.date + '|' + (item.timeStr || ''), item);
      });
      incomingDailyLog.forEach(function (item) {
        if (!item || !item.date) return;
        var key = item.date + '|' + (item.timeStr || '');
        if (!logMap.has(key)) logMap.set(key, item);
      });
      dailyLog = Array.from(logMap.values());

      try {
        if (!userStats) userStats = { willpower: 0, joy: 0 };
        if (!incomingStats) incomingStats = { willpower: 0, joy: 0 };
        // 4. 合并 userStats：保留两端的最高历史记录
        userStats = {
            willpower: Math.max(userStats.willpower || 0, incomingStats.willpower || 0),
            joy: Math.max(userStats.joy || 0, incomingStats.joy || 0)
        };
      } catch (e) {
        console.warn('合并 userStats 时出错', e);
      }

      // 👉 核心修复：清单的无损合并策略
      if (hasCustomPlaylists && localData.customPlaylists !== undefined) {
          let incomingPl = localData.customPlaylists;
          if (typeof incomingPl === 'string') {
              try { incomingPl = JSON.parse(incomingPl); } catch(e) { incomingPl = []; }
          }
          if (Array.isArray(incomingPl)) {
              let existingPl = [];
              try { existingPl = JSON.parse(localStorage.getItem('anchor_custom_playlists') || '[]'); } catch(e) {}
              if (!Array.isArray(existingPl)) existingPl = [];

              incomingPl.forEach(inc => {
                  if (!inc) return;
                  // 兼容远古时期没有 ID 的旧项目
                  if (!inc.id) inc.id = 'pl_old_' + Date.now() + Math.floor(Math.random() * 1000);
                  
                  const idx = existingPl.findIndex(ex => ex && String(ex.id) === String(inc.id));
                  if (idx > -1) {
                      existingPl[idx] = inc; // ID相同，云端覆盖本地旧版本
                  } else {
                      existingPl.push(inc);  // ID不同，绝对保留本地已有资产，将云端新资产追加到末尾
                  }
              });
              
              localStorage.setItem('anchor_custom_playlists', JSON.stringify(existingPl));
              if (typeof customPlaylists !== 'undefined') {
                  customPlaylists.splice(0, customPlaylists.length, ...existingPl); // 同步内存
              }
          }
      }
      // 👉 恢复星尘宇宙文本碎片（合并）
      restoreStardustTextsForImport(localData, 'merge');
    }

    if (localData && typeof localData === 'object') {
      try {
        if (localData.ritualMorning) localStorage.setItem(KEY_RITUAL_MORNING, JSON.stringify(localData.ritualMorning));
        if (localData.ritualNight) localStorage.setItem(KEY_RITUAL_NIGHT, JSON.stringify(localData.ritualNight));
        // 👉 v8 修复：openedDays 在 merge 模式下应合并去重，而非直接覆盖（v7 已有此逻辑，v8 迁移时遗漏）
        if (localData.openedDays && Array.isArray(localData.openedDays)) {
          if (action === 'merge') {
            var currentOpenedDays = [];
            try {
              var storedOD = localStorage.getItem(KEY_OPENED_DAYS);
              if (storedOD) {
                currentOpenedDays = JSON.parse(storedOD);
                if (!Array.isArray(currentOpenedDays)) currentOpenedDays = [];
              }
            } catch (eOD) { currentOpenedDays = []; }
            var mergedDaysArr = currentOpenedDays.concat(localData.openedDays).filter(function(d) {
              return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
            });
            var mergedDaysUniq = Array.from(new Set(mergedDaysArr));
            localStorage.setItem(KEY_OPENED_DAYS, JSON.stringify(mergedDaysUniq));
          } else {
            localStorage.setItem(KEY_OPENED_DAYS, JSON.stringify(localData.openedDays));
          }
        }
        if (localData.posterShownDay) localStorage.setItem(KEY_POSTER_SHOWN_DAY, localData.posterShownDay);
        if (Object.prototype.hasOwnProperty.call(localData, 'customPlaylists') && action !== 'merge') {
          localStorage.setItem('anchor_custom_playlists', JSON.stringify(localData.customPlaylists || []));
        }
        if (Object.prototype.hasOwnProperty.call(localData, 'customTags')) {
          var tagsOut = [];
          if (action === 'merge') {
            var curTagsMerge = [];
            try { curTagsMerge = JSON.parse(localStorage.getItem('anchor_custom_tags') || '[]'); } catch (eTM) { curTagsMerge = []; }
            if (!Array.isArray(curTagsMerge)) curTagsMerge = [];
            var incTagsMerge = Array.isArray(localData.customTags) ? localData.customTags : [];
            incTagsMerge.forEach(function (inT) {
              if (!inT) return;
              if (inT.id === undefined || inT.id === null || inT.id === '') {
                curTagsMerge.push(inT);
                return;
              }
              var ti = curTagsMerge.findIndex(function (c) { return c && String(c.id) === String(inT.id); });
              if (ti >= 0) curTagsMerge[ti] = inT;
              else curTagsMerge.push(inT);
            });
            tagsOut = curTagsMerge;
          } else {
            tagsOut = Array.isArray(localData.customTags) ? localData.customTags : [];
          }
          localStorage.setItem('anchor_custom_tags', JSON.stringify(tagsOut));
          if (typeof customTags !== 'undefined') customTags = tagsOut;
        }
        if (Object.prototype.hasOwnProperty.call(localData, 'customFilters')) {
          var filtOut = [];
          if (action === 'merge') {
            var curFiltMerge = [];
            try { curFiltMerge = JSON.parse(localStorage.getItem('anchor_custom_filters') || '[]'); } catch (eFM) { curFiltMerge = []; }
            if (!Array.isArray(curFiltMerge)) curFiltMerge = [];
            var incFiltMerge = Array.isArray(localData.customFilters) ? localData.customFilters : [];
            incFiltMerge.forEach(function (inF) {
              if (!inF) return;
              if (inF.id === undefined || inF.id === null || inF.id === '') {
                curFiltMerge.push(inF);
                return;
              }
              var fi = curFiltMerge.findIndex(function (c) { return c && String(c.id) === String(inF.id); });
              if (fi >= 0) curFiltMerge[fi] = inF;
              else curFiltMerge.push(inF);
            });
            filtOut = curFiltMerge;
          } else {
            filtOut = Array.isArray(localData.customFilters) ? localData.customFilters : [];
          }
          localStorage.setItem('anchor_custom_filters', JSON.stringify(filtOut));
          if (typeof customFilters !== 'undefined') customFilters = filtOut;
        }
        if (localData.playlistStats) {
          localStorage.setItem('anchor_playlist_stats', JSON.stringify(localData.playlistStats));
        }
        if (Object.prototype.hasOwnProperty.call(localData, 'username')) {
          var newName = (localData.username || '').trim();
          if (newName) {
            currentUsername = newName;
            localStorage.setItem(KEY_USERNAME, currentUsername);
          }
        }
        if (Object.prototype.hasOwnProperty.call(localData, 'dayStartOffset')) {
          localStorage.setItem('anchor_day_start_offset', String(localData.dayStartOffset || 0));
        }
        if (Object.prototype.hasOwnProperty.call(localData, 'visitedV66')) {
          localStorage.setItem('anchor_has_visited_v66', localData.visitedV66 ? '1' : '0');
        }
        if (Object.prototype.hasOwnProperty.call(localData, 'energyMode')) {
          localStorage.setItem('energyMode', localData.energyMode || '');
        }
        // 👉 恢复情绪隐私边界状态
        if (Object.prototype.hasOwnProperty.call(localData, 'sanctuaryVisible')) {
          try {
            const isVis = localData.sanctuaryVisible !== false;
            localStorage.setItem('anchor_sanctuary_visible', isVis ? 'true' : 'false');
            if (typeof isSanctuaryVisible !== 'undefined') isSanctuaryVisible = isVis;
            const chkSanc = document.getElementById('settingShowSanctuary');
            if (chkSanc) chkSanc.checked = isVis;
            if (typeof window.renderLog === 'function') window.renderLog();
            if (typeof window.renderHistory === 'function') window.renderHistory();
            if (typeof window.renderHeatmap === 'function') window.renderHeatmap();
          } catch (e) { console.warn('恢复 sanctuaryVisible 失败', e); }
        }
        // 👉 v8 修复：补回跨端 ING 装甲状态恢复（v7 第12769行有此逻辑，v8 迁移时完全遗漏）
        if (Object.prototype.hasOwnProperty.call(localData, 'liveState')) {
          try {
            var LIVE_KEY_IMPORT = typeof KEY_LIVE_STATE !== 'undefined' ? KEY_LIVE_STATE : 'anchor_live_state_v69';
            if (localData.liveState) {
              var liveValToStore = typeof localData.liveState === 'string'
                ? localData.liveState
                : JSON.stringify(localData.liveState);
              localStorage.setItem(LIVE_KEY_IMPORT, liveValToStore);
            } else {
              localStorage.removeItem(LIVE_KEY_IMPORT);
            }
          } catch (eLive) { console.warn('恢复 liveState 失败', eLive); }
        }
        // 👉 恢复 V8 黑洞情绪残影（窗口期内可打捞为星尘，须随备份/云同步迁移）
        if (Object.prototype.hasOwnProperty.call(localData, 'blackholeTexts')) {
          var incomingBh = localData.blackholeTexts;
          if (!Array.isArray(incomingBh)) incomingBh = [];
          if (action === 'overwrite') {
            localStorage.setItem('anchor_blackhole', JSON.stringify(incomingBh));
          } else if (action === 'merge') {
            var currentBh = [];
            try {
              var exBh = localStorage.getItem('anchor_blackhole');
              if (exBh) currentBh = JSON.parse(exBh);
            } catch (eBh) { currentBh = []; }
            if (!Array.isArray(currentBh)) currentBh = [];
            incomingBh.forEach(function (inItem) {
              if (!inItem) return;
              if (inItem.id === undefined || inItem.id === null || inItem.id === '') {
                currentBh.push(inItem);
                return;
              }
              var bhIdx = currentBh.findIndex(function (c) {
                return c && String(c.id) === String(inItem.id);
              });
              if (bhIdx > -1) currentBh[bhIdx] = inItem;
              else currentBh.push(inItem);
            });
            localStorage.setItem('anchor_blackhole', JSON.stringify(currentBh));
          }
          if (typeof window.renderBlackholeRemnants === 'function') {
            window.renderBlackholeRemnants();
          }
        }
      } catch (e) {
        console.warn('应用 local 配置时出错', e);
      }
    }
    // 确保将这一段替换/补充完整：
    if (localData && localData.dayStartOffset !== undefined && localData.dayStartOffset !== null) {
        try {
            localStorage.setItem('anchor_day_start_offset', localData.dayStartOffset);
        } catch (e) { console.warn('恢复 dayStartOffset 失败', e); }
    }
    if (typeof saveCustomMeta === 'function') saveCustomMeta();
    if (typeof setMode === 'function' && typeof mode !== 'undefined') setMode(mode);

    save();
    if (typeof renderList === 'function') renderList();
    if (typeof renderArchive === 'function') renderArchive();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof updateStatsUI === 'function') updateStatsUI();

    // 👉 v8.X 补充：新纪元核心 UI 的重绘大喇叭 (保证所见即所得，无需手动刷新)
    // 1. 重绘 03 区档案柜 (SOP与项目)
    if (typeof renderCabinet === 'function') renderCabinet();
    // 2. 重绘 03 区岁月热力图
    if (typeof renderHeatmap === 'function') renderHeatmap();
    // 3. 重绘 01/02 区的动态下拉菜单 (防止新导入的清单无法被选中)
    if (typeof renderPlaylistDropdown === 'function') renderPlaylistDropdown();
    if (typeof window.renderProjectDropdown === 'function') window.renderProjectDropdown();
    // 4. 重绘 02 区自定义标签
    if (typeof window.renderCustomTagsIn02 === 'function') window.renderCustomTagsIn02();
     // 6. 重绘 00 区三时漫步星光航迹 (玻璃小船)
     if (typeof updateTimeHorizon === 'function') updateTimeHorizon();
    // 5. 重绘 04 区夜猫子时钟拨盘，防止 UI 与底层数据脱节
    const offsetSel = document.getElementById('dayStartOffset');
    if (offsetSel && typeof getDayStartOffset === 'function') {
    offsetSel.value = getDayStartOffset();
}
    if (typeof showToast === 'function') {
      if (action === 'overwrite') {
        showToast('✅ 已用备份数据覆盖当前进度');
      } else if (action === 'merge') {
        showToast('✅ 已合并备份与当前进度');
      }
    }
  }

  function copyToClip() {
    // 👉 What & Why: [修复] 废弃零散拼接，强制调用 v6.8 以来的超级打包器，确保项目、清单一字不落！
    if (typeof getBackupDataObj !== 'function') {
        alert("⚠️ 核心打包引擎缺失，无法复制");
        return;
    }
    
    var backupData = getBackupDataObj();
    var str = JSON.stringify(backupData, null, 2);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(str).then(function () {
            if (typeof showToast === 'function') showToast('📋 数据代码已全量复制');
            else alert('✅ 已复制');
        }).catch(function () {
            var area = document.getElementById('dataArea');
            if (area) area.value = str;
            alert('⚠️ 自动复制失败，请手动全选复制');
        });
    } else {
        var area2 = document.getElementById('dataArea');
        if (area2) area2.value = str;
        alert('⚠️ 浏览器不支持直接写入，请手动全选复制');
    }
}

  function triggerImport() {
    var inp = document.getElementById('fileInput');
    if (inp) inp.click();
  }

  function importFromFile(input) {
      const file = input.files && input.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
          const area = document.getElementById('dataArea');
          if (area) {
              area.value = e.target.result;
              // 👉 修复：读取完成后自动触发解析引擎
              if (typeof executeImport === 'function') {
                  executeImport(false);
              }
          }
          input.value = ''; // 清空 input，允许重复导入同一个文件
      };
      reader.readAsText(file);
  }

  function tryResetAll() {
    if (confirm('⚠️ 确定清空？')) {
      db = [];
      archive = [];
      dailyLog = [];
      userStats = { willpower: 0, joy: 0 };
      save();
      if (typeof renderList === 'function') renderList();
      if (typeof renderArchive === 'function') renderArchive();
      if (typeof renderLog === 'function') renderLog();
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof updateStatsUI === 'function') updateStatsUI();
      if (typeof showToast === 'function') showToast('已格式化');
    }
  }

  function getBackupDataObj() {
    var ritualMorning = null;
    var ritualNight = null;
    var openedDays = [];
    var posterShownDay = null;
    var localCustomPlaylists = [];
    var localCustomTags = [];
    var localCustomFilters = [];
    var playlistStats = {};
    var usernameForBackup = currentUsername || 'Anchor';
    var dayStartOffsetVal = 0;
    var visitedV66 = null;
    var energyModeBackup = null;
    var sanctuaryVisibleBackup = true; // 默认放行
    var localStardustTexts = [];
    var localBlackhole = [];
    try {
      var storedSanc = localStorage.getItem('anchor_sanctuary_visible');
      if (storedSanc !== null) {
        sanctuaryVisibleBackup = storedSanc !== 'false';
      } else if (typeof isSanctuaryVisible !== 'undefined') {
        sanctuaryVisibleBackup = isSanctuaryVisible;
      }
    } catch (e) { console.warn(e); }
    var liveStateRaw = localStorage.getItem(typeof KEY_LIVE_STATE !== 'undefined' ? KEY_LIVE_STATE : 'anchor_live_state') || null;
    var liveStateParsed = null;
    if (liveStateRaw) {
      try { liveStateParsed = JSON.parse(liveStateRaw); } catch (e) { console.warn(e); }
    }
    try {
      var storedMorning = localStorage.getItem(KEY_RITUAL_MORNING);
      var storedNight = localStorage.getItem(KEY_RITUAL_NIGHT);
      if (storedMorning) ritualMorning = JSON.parse(storedMorning);
      if (storedNight) ritualNight = JSON.parse(storedNight);
      var storedDays = localStorage.getItem(KEY_OPENED_DAYS);
      if (storedDays) {
        openedDays = JSON.parse(storedDays);
        if (!Array.isArray(openedDays)) openedDays = [];
      }
      posterShownDay = localStorage.getItem(KEY_POSTER_SHOWN_DAY);
      var storedPlaylists = localStorage.getItem('anchor_custom_playlists');
      if (storedPlaylists) {
        if (storedPlaylists.trim().charAt(0) === '#' ||
          (storedPlaylists.trim() && storedPlaylists.trim().charAt(0) !== '[')) {
          localCustomPlaylists = storedPlaylists;
        } else {
          localCustomPlaylists = JSON.parse(storedPlaylists);
        }
      }
      var storedStats = localStorage.getItem('anchor_playlist_stats');
      if (storedStats) playlistStats = JSON.parse(storedStats);
      var storedTags = localStorage.getItem('anchor_custom_tags');
      if (storedTags) {
        try {
          var parsedTags = JSON.parse(storedTags);
          localCustomTags = Array.isArray(parsedTags) ? parsedTags : [];
        } catch (e) {
          localCustomTags = [];
        }
      } else if (typeof customTags !== 'undefined' && Array.isArray(customTags)) {
        localCustomTags = customTags.slice();
      }
      var storedFilters = localStorage.getItem('anchor_custom_filters');
      if (storedFilters) {
        try {
          var parsedFilters = JSON.parse(storedFilters);
          localCustomFilters = Array.isArray(parsedFilters) ? parsedFilters : [];
        } catch (e) {
          localCustomFilters = [];
        }
      } else if (typeof customFilters !== 'undefined' && Array.isArray(customFilters)) {
        localCustomFilters = customFilters.slice();
      }
      var storedUsername = localStorage.getItem(KEY_USERNAME);
      if (storedUsername && storedUsername.trim()) usernameForBackup = storedUsername.trim();
      dayStartOffsetVal = getDayStartOffset();
      visitedV66 = localStorage.getItem('anchor_visited_v66') || null;
      try {
        var storedEnergy = localStorage.getItem('energyMode');
        if (storedEnergy) energyModeBackup = storedEnergy;
        else if (typeof energyMode !== 'undefined') energyModeBackup = energyMode;
      } catch (e) {
        energyModeBackup = typeof energyMode !== 'undefined' ? energyMode : null;
      }
      // 👉 备份星尘宇宙文本碎片
      var storedStardust = localStorage.getItem('anchor_stardust_texts');
      if (storedStardust) {
        try { localStardustTexts = JSON.parse(storedStardust); } catch (e) { console.warn(e); }
      }
      if (!Array.isArray(localStardustTexts)) localStardustTexts = [];
      // 👉 备份黑洞残影及 V8 新增配置（与上方 tags/filters/sanctuary 读取闭环；blackhole 单独刻入 local.blackholeTexts）
      try {
        var bhRaw = localStorage.getItem('anchor_blackhole');
        if (bhRaw) {
          var parsedBh = JSON.parse(bhRaw);
          localBlackhole = Array.isArray(parsedBh) ? parsedBh : [];
        }
      } catch (ebh) {
        console.warn(ebh);
        localBlackhole = [];
      }
    } catch (e) {
      console.warn('读取 localStorage 数据时出错', e);
    }
    return {
      version: 'v8.X-backup',
      exportedAt: new Date().toISOString(),
      data: {
        db: db,
        archive: archive,
        dailyLog: dailyLog,
        userStats: userStats,
        customPlaylists: localCustomPlaylists,
        customTags: localCustomTags,
        customFilters: localCustomFilters
      },
      local: {
        ritualMorning: ritualMorning,
        ritualNight: ritualNight,
        openedDays: openedDays,
        posterShownDay: posterShownDay,
        customPlaylists: localCustomPlaylists,
        customTags: localCustomTags,
        customFilters: localCustomFilters,
        playlistStats: playlistStats,
        username: usernameForBackup,
        dayStartOffset: dayStartOffsetVal,
        visitedV66: visitedV66,
        energyMode: energyModeBackup,
        sanctuaryVisible: sanctuaryVisibleBackup, // 👉 补全隐私结界参数
        liveState: liveStateParsed,
        stardustTexts: localStardustTexts,
        blackholeTexts: localBlackhole
      }
    };
  }

  var CLOUD_API_BASE = 'https://anchor-api.dawnharbour.com/api/data';

  async function syncToCloud(isSilent) {
    if (isSilent === void 0) isSilent = false;
    if (currentUsername === 'Anchor' || !currentUsername) {
      if (!isSilent && typeof showToast === 'function') showToast('⚠️ 请先在上方设置你的专属身份标识（名字）！');
      return;
    }
    var btn = document.getElementById('btnSyncCloud');
    if (btn && !isSilent) btn.innerText = '☁️ 正在同步...';
    try {
      isRadarPaused = true;
      var payload = getBackupDataObj();
      var res = await fetch(CLOUD_API_BASE + '/' + currentUsername, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Anchor-Auth': currentPassword || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 403 || res.status === 401) {
        if (!isSilent && typeof showToast === 'function') showToast('🔒 密码错误或无权限覆盖该身份的数据！');
        return;
      }
      if (res.ok) {
        if (!isSilent && typeof showToast === 'function') showToast('☁️ 已成功同步到云端！');
      } else {
        if (!isSilent && typeof showToast === 'function') showToast('⚠️ 云端同步失败，请检查机房');
      }
    } catch (e) {
      console.error(e);
      if (!isSilent && typeof showToast === 'function') showToast('⚠️ 无法连接到本地服务器，大姐可能下班了');
    } finally {
      if (btn && !isSilent) btn.innerText = '☁️ 推送当前进度至云端';
      setTimeout(function () { isRadarPaused = false; }, 2000);
    }
  }

  async function fetchFromCloud() {
    if (currentUsername === 'Anchor' || !currentUsername) {
      if (typeof showToast === 'function') showToast('⚠️ 请先输入并更新你想拉取身份标识！');
      return;
    }
    var btn = document.getElementById('btnPullCloud');
    if (btn) btn.innerText = '☁️ 拉取中...';
    try {
      var res = await fetch(CLOUD_API_BASE + '/' + currentUsername, {
        headers: { 'X-Anchor-Auth': currentPassword || '' }
      });
      if (res.status === 403 || res.status === 401) {
        if (typeof showToast === 'function') showToast('🔒 密码错误，无法拉取该身份的数据！');
        return;
      }
      var json = await res.json();

      // 👉 核心修复：拿到云端数据后，严禁直接入库！必须送入中转站并呼叫原版安全弹窗
      var dataArea = document.getElementById('dataArea');
      if (dataArea) {
        dataArea.value = JSON.stringify(json, null, 2);
        if (typeof executeImport === 'function') {
          executeImport(true); // 传入 true 代表来自云端
        } else if (typeof showToast === 'function') {
          showToast('⚠️ 导入引擎缺失，请检查 executeImport 函数');
        }
      }
    } catch (e) {
      console.error(e);
      if (typeof showToast === 'function') showToast('⚠️ 无法连接到本地服务器');
    } finally {
      if (btn) btn.innerText = '☁️ 从云端拉取存档';
    }
  }

  // ============================================================
  // v8 修复：从 v7 迁移并补齐快捷指令收件箱引擎
  // ============================================================
  async function processCloudInbox(isManual = false) {
      if (!currentUsername || currentUsername === 'Anchor') {
          if (isManual) showToast("⚠️ 请先在上方设置你的专属身份标识");
          return;
      }
      if (typeof CLOUD_API_BASE === 'undefined') return;

      try {
          if (isManual) showToast("📡 雷达扫描中...正在去传达室看信");

          const res = await fetch(`${CLOUD_API_BASE}/${currentUsername}`, {
              headers: { 'X-Anchor-Auth': currentPassword || '' }
          });

          if (!res.ok) {
              if (isManual) showToast(`🔒 收信失败！密码错误或大姐拦截 (状态码: ${res.status})`);
              console.warn("📥 云端收件箱拉取被拦截，状态码:", res.status);
              return;
          }

          const json = await res.json();

          if (json.inbox && Array.isArray(json.inbox) && json.inbox.length > 0) {
              console.log(`📥 发现 ${json.inbox.length} 条收件箱任务，准备消化...`);
              const inp = document.getElementById('inpTitle');
              const originalVal = inp ? inp.value : '';
              let successCount = 0;

              try {
                  json.inbox.forEach(taskText => {
                      if (inp) {
                          // 强制洗手：清空残影
                          document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
                          const defaultTag = document.querySelector('.tag[data-v="indoor"]');
                          if (defaultTag) defaultTag.classList.add('active');
                          if (typeof switchState !== 'undefined') {
                              switchState.cycle = false;
                              switchState.flash = false;
                          }

                          inp.value = taskText;
                          if (typeof autoTag === 'function') autoTag();
                          if (typeof addNew === 'function') addNew();
                          successCount++;
                      }
                  });
              } catch (err) {
                  console.error(`❌ 处理信件时出错:`, err);
              } finally {
                  // 必须保证输入框恢复
                  if (inp) inp.value = originalVal;
              }

              if (successCount > 0) {
                  showToast(`📥 成功消化 ${successCount} 条云端灵感入库！`);
                  // v8 防御性补丁：无论当前是否在 02 页面，强制刷新列表视图
                  if (typeof renderList === 'function') renderList();
                  // 阅后即焚：推送覆盖后端以清空 inbox
                  if (typeof getBackupDataObj === 'function') {
                      const payload = getBackupDataObj();
                      await fetch(`${CLOUD_API_BASE}/${currentUsername}`, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                              'X-Anchor-Auth': currentPassword || ''
                          },
                          body: JSON.stringify(payload)
                      });
                  }
              }
          } else {
              // 抽屉是空的
              if (isManual) showToast(`📭 [${currentUsername}] 的云端传达室目前没有新信件。`);
              console.log("📥 收件箱为空。");
          }
      } catch (e) {
          console.error("📥 底层网络错误:", e);
          if (isManual) showToast("⚠️ 网络连接失败，无法收信。");
      }
  }
  // 暴露到全局，确保 index.html 内联 onclick 及外部模块均可调用
  window.processCloudInbox = processCloudInbox;

  // 👉 v8.X：投递信件至云端 NAS
  async function submitFeedbackToNAS() {
    const fbInput = document.getElementById('feedbackInput');
    if (!fbInput) return;
    const content = fbInput.value.trim();
    if (!content) { if (typeof showToast === 'function') showToast('⚠️ 信件内容不能为空哦'); return; }
    
    const btn = fbInput.nextElementSibling;
    if (btn) btn.innerText = "📨 投递中...";

    const payload = {
        username: (typeof currentUsername !== 'undefined' && currentUsername !== 'Anchor') ? currentUsername : '匿名水手',
        content: content,
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(`${CLOUD_API_BASE}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        // 现阶段假设只要网络通了就给鼓励，不管后端是否写了该接口
        if (typeof showToast === 'function') showToast('✨ 投递成功！岛主已收到你的心意。');
        fbInput.value = '';
    } catch (e) {
        console.error('Feedback error:', e);
        if (typeof showToast === 'function') showToast('⚠️ 暂时无法连接到云端信箱，请稍后再试。');
    } finally {
        if (btn) btn.innerText = "📨 投递至信箱";
    }
  }

  // ============================================================
  // v6.9.X 云端雷达 (Cloud Radar) - 监听小方块的物理动作
  // ============================================================
  async function checkCloudLiveState() {
    if (isRadarPaused) return;
    if (typeof currentStatus === 'undefined' || currentStatus !== 'anchor') return;
    if (!currentUsername || currentUsername === 'Anchor') return;
    if (typeof CLOUD_API_BASE === 'undefined') return;

    try {
      var res = await fetch(CLOUD_API_BASE + '/' + currentUsername, {
        headers: { 'X-Anchor-Auth': currentPassword || '' }
      });
      if (!res.ok) return;
      var json = await res.json();
      if (!json || Object.keys(json).length === 0) return;

      var rawLocal = (json.local && typeof json.local === 'object')
        ? json.local
        : (json.data && json.data.local && typeof json.data.local === 'object'
          ? json.data.local
          : null);

      var cloudLive = rawLocal && rawLocal.liveState;

      var iotTimestamp = 0;
      if (rawLocal && rawLocal.iotCommand && typeof rawLocal.iotCommand === 'object') {
        var ts1 = rawLocal.iotCommand.timestamp;
        var n1 = Number(ts1);
        if (!Number.isNaN(n1) && n1 > 0) iotTimestamp = n1;
      } else if (json.data && json.data.local && json.data.local.iotCommand) {
        var ts2 = json.data.local.iotCommand.timestamp;
        var n2 = Number(ts2);
        if (!Number.isNaN(n2) && n2 > 0) iotTimestamp = n2;
      }

      // 如果云端认为仍在 ING，则说明还没有“清盘”事件，直接返回并保留 lastIotTimestamp（用于后续对比）
      if (cloudLive) {
        return;
      }

      // 只有当云端给出的 IoT 时间戳严格大于 lastIotTimestamp 时，才视为一条新的“清盘/切牌”指令
      if (!cloudLive && iotTimestamp > lastIotTimestamp) {
        lastIotTimestamp = iotTimestamp;
        console.log('📡 云端雷达：探测到小方块已经终结了任务！(ts =', iotTimestamp, ')');

        var cloudLog = (json.data && Array.isArray(json.data.dailyLog)) ? json.data.dailyLog : (Array.isArray(json.dailyLog) ? json.dailyLog : null);
        var cloudDB = (json.data && Array.isArray(json.data.db)) ? json.data.db : (Array.isArray(json.db) ? json.db : null);

        // 安全合并大姐更新后的足迹账本
        if (cloudLog) {
          var logMap = new Map();
          if (Array.isArray(dailyLog)) dailyLog.forEach(function (item) { logMap.set(JSON.stringify(item), item); });
          cloudLog.forEach(function (item) { logMap.set(JSON.stringify(item), item); });
          dailyLog = Array.from(logMap.values());
          dailyLog.sort(function (a, b) {
            var dateA = new Date(a.date || 0).getTime();
            var dateB = new Date(b.date || 0).getTime();
            if (dateA !== dateB) return dateB - dateA;
            return b.id - a.id;
          });
        }

        // 安全合并任务库总时长
        if (cloudDB) {
          var mergedDB = Array.isArray(db) ? db.slice() : [];
          cloudDB.forEach(function (cloudItem) {
            var existingIndex = mergedDB.findIndex(function (localItem) { return String(localItem.id) === String(cloudItem.id); });
            if (existingIndex >= 0) {
              if ((cloudItem.totalMinutes || 0) > (mergedDB[existingIndex].totalMinutes || 0)) {
                mergedDB[existingIndex] = cloudItem;
              }
            } else {
              mergedDB.push(cloudItem);
            }
          });
          db = mergedDB;
        }

        // 本地认为还在 ING，但云端已清空，说明小方块物理结束了任务
        if (typeof currentTask !== 'undefined' && currentTask && typeof finishTask === 'function') {
          finishTask();
        }

        if (typeof save === 'function') save();
        if (typeof renderLog === 'function') renderLog();
        if (typeof renderHistory === 'function') renderHistory();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveUsername() {
    var inp = document.getElementById('settingUsernameInp');
    var btn = document.querySelector('button[onclick="saveUsername()"]');
    if (!inp) return;
    var newName = inp.value.trim();

    // 若为空，重置为默认
    if (!newName) {
      newName = 'Anchor';
      currentUsername = newName;
      localStorage.setItem(KEY_USERNAME, currentUsername);
      if (typeof updateUsernameUI === 'function') updateUsernameUI();
      if (typeof showToast === 'function') showToast('✨ 身份已重置为默认');
      return;
    }

    // 👉 逻辑 1：名字没变但已有密码时，给机会修改/重新验证
    if (newName === currentUsername && currentPassword && currentUsername !== 'Anchor') {
      var wantChange = confirm('当前身份已经是 [' + currentUsername + ']。\n是否需要修改/重新验证云端通行证密码？');
      if (!wantChange) {
        inp.value = currentUsername === 'Anchor' ? '' : currentUsername;
        return;
      }
    }

    // 👉 逻辑 2：索要密码
    var inputPwd = prompt(
      '👋 欢迎来到云端，' + newName + '！\n\n' +
      '请输入你的专属通行密码：\n' +
      '(新身份将自动绑定此密码，已有身份请输入原密码)\n\n' +
      '💡 提示：忘记密码可输入万能钥匙 SccAdmin2026 重置。'
    );
    if (inputPwd === null) {
      inp.value = currentUsername === 'Anchor' ? '' : currentUsername; // UI 回滚
      return;
    }
    var pwdTrimmed = inputPwd.trim();
    if (!pwdTrimmed) {
      alert('⚠️ 密码不能为空！');
      inp.value = currentUsername === 'Anchor' ? '' : currentUsername;
      return;
    }

    // 👉 逻辑 3：向云端核验
    try {
      if (typeof CLOUD_API_BASE !== 'undefined') {
        var oldBtnText = btn ? btn.innerText : '更新身份';
        if (btn) btn.innerText = '验证中...';

        var res = await fetch(CLOUD_API_BASE + '/' + newName, {
          headers: { 'X-Anchor-Auth': pwdTrimmed }
        });

        if (btn) btn.innerText = oldBtnText;

        if (res.status === 403 || res.status === 401) {
          alert('🔒 档案室大姐拦截：密码错误！\n该身份已被注册，请重新输入正确的密码，或更换一个新的身份标识。');
          inp.value = currentUsername === 'Anchor' ? '' : currentUsername;
          return;
        }
        if (res.ok) {
          var json = await res.json();
          var isNewUser = Object.keys(json).length === 0;

          currentUsername = newName;
          currentPassword = pwdTrimmed;
          localStorage.setItem(KEY_USERNAME, currentUsername);
          localStorage.setItem(KEY_PASSWORD, currentPassword);
          if (typeof updateUsernameUI === 'function') updateUsernameUI();

          if (currentPassword === 'SccAdmin2026') {
            if (typeof showToast === 'function') showToast('🔑 万能钥匙验证成功！请再次点击【更新身份】设定新密码');
          } else if (isNewUser) {
            if (typeof showToast === 'function') showToast('✨ 欢迎！身份 [' + currentUsername + '] 绑定成功');
          } else {
            if (typeof showToast === 'function') showToast('✨ 欢迎回来！身份 [' + currentUsername + '] 登录成功');
          }
          return;
        }
      }
    } catch (e) {
      console.warn('网络校验受阻', e);
      // 离线 / 本地保底
      currentUsername = newName;
      currentPassword = pwdTrimmed;
      localStorage.setItem(KEY_USERNAME, currentUsername);
      localStorage.setItem(KEY_PASSWORD, currentPassword);
      if (typeof updateUsernameUI === 'function') updateUsernameUI();
      if (typeof showToast === 'function') showToast('⚠️ 暂无云端连接，已在本地更新身份为 [' + currentUsername + ']');
    }
  }

  function toggleCardPlaylistItem(playlistId, taskIndex, isChecked) {
    if (typeof customPlaylists === 'undefined' || !Array.isArray(customPlaylists)) return;
    var pIdx = customPlaylists.findIndex(function (p) { return p && String(p.id) === String(playlistId); });
    if (pIdx > -1) {
      // 传入 fromCard = true 的信号（底层会做持久化 + 足迹写入 + 进度重算）
      toggleCabinetItem(pIdx, taskIndex, isChecked, true);

      // 内存级同步 currentTask，防止卡片被再次刷新时丢失状态
      if (typeof currentTask !== 'undefined' && currentTask && String(currentTask.id) === String(playlistId) && currentTask.items) {
        if (currentTask.items[taskIndex]) currentTask.items[taskIndex].done = isChecked;
      }

      // v8.0 补齐：把 activePlaylist 一并刻入墙壁，防止刷新后失去连抽上下文
      if (typeof KEY_LIVE_STATE !== 'undefined') {
        localStorage.setItem(KEY_LIVE_STATE, JSON.stringify({
          task: currentTask,
          startTime: (typeof anchorStartTime !== 'undefined' ? anchorStartTime : null),
          activePl: (typeof activePlaylist !== 'undefined' ? activePlaylist : null)
        }));
      }
    }
  }

  function showTaskActionDialog(task, message) {
    currentDialogTask = task;
    var dialog = document.getElementById('taskActionDialog');
    if (!dialog) return;
    var msgEl = document.getElementById('taskDialogMessage');
    var btnContainer = document.getElementById('taskDialogBtnContainer');
    if (!msgEl || !btnContainer) return;

    // 1. 构造记忆情报微卡片
    var statsHtml = '';
    var hasTime = task.totalMinutes && task.totalMinutes > 0;
    var hasBookmark = task.bookmarkText && String(task.bookmarkText).trim();
    // 👉 核心修复：增加目标进度的存在判定
    var hasBookmarkTotal = task.bookmarkTotal && String(task.bookmarkTotal).trim();
    var hasCount = task.completeCount && task.completeCount > 0;
    var hasProject = !!task.projectId; 
    const hasDdl = task.deadline ? true : false;

    // 👉 核心修复：加入 hasBookmarkTotal，保证一开始 0/300 也能亮起微卡片
    if (hasTime || hasBookmark || hasBookmarkTotal || hasCount || hasProject || hasDdl) {
      statsHtml += '<div style="background:#f9fafb; padding:10px 12px; border-radius:8px; font-size:0.85rem; color:#555; margin-top:12px; margin-bottom:4px; text-align:left; border:1px solid #eee;">';
      
      // 渲染红线归属项目
      if (hasProject && typeof customPlaylists !== 'undefined') {
          var pIdxMem = customPlaylists.findIndex(function (p) {
              return p && String(p.id) === String(task.projectId);
          });
          if (pIdxMem > -1) {
              var proj = customPlaylists[pIdxMem];
              var pIcon = proj.icon || '🚀';
              var pTitle = proj.title || proj.name;
              statsHtml += '<div style="margin-bottom:6px; color:#1565c0;">🔗 <b>归属项目:</b> ' + pIcon + ' ' + pTitle + '</div>';
          }
      }

      // 👉 核心精简：将“余 X 天”精简为“X天”或“今”
      if (hasDdl) {
        const ddlTime = new Date(task.deadline).getTime();
        const todayTime = new Date(getAnchorDate().toDateString()).getTime();
        const diffDays = Math.ceil((ddlTime - todayTime) / (1000 * 60 * 60 * 24));
        let ddlText = diffDays < 0 ? '逾期' : (diffDays === 0 ? '今' : `${diffDays}天`);
        statsHtml += `<div>⏳ <b>期限:</b> ${task.deadline} <span style="color:#d65a64; font-size:0.8rem;">(${ddlText})</span></div>`;
      }

      if (hasTime) {
        var h = Math.floor(task.totalMinutes / 60);
        var m = task.totalMinutes % 60;
        statsHtml += '<div style="margin-bottom:4px;">⏱ <b>累计投入:</b> ' + (h > 0 ? h + 'h ' : '') + m + 'm</div>';
      }
      if (hasCount) {
        statsHtml += '<div style="margin-bottom:4px; color:#FF9AA2; font-weight:bold;">💪 累计打卡: ' + task.completeCount + ' 次</div>';
      }
      
      // 👉 核心修复：处理只有目标没有当前进度时的 0/300 显示
      if (hasBookmark || hasBookmarkTotal) {
        var bTextD = hasBookmark ? String(task.bookmarkText).trim() : '0';
        var bTotalD = hasBookmarkTotal ? String(task.bookmarkTotal).trim() : '';
        var progressLabelD = bTotalD ? bTextD + ' / ' + bTotalD : bTextD;
        statsHtml += '<div>🔖 <b>当前进度:</b> ' + progressLabelD + '</div>';
      }
      statsHtml += '</div>';
       // 👉 v8.X T1.3：打捞该任务在全局日常足迹 (dailyLog) 中的专属编年史
    let historyHtml = '';
    const taskLogs = (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) 
        ? dailyLog.filter(l => String(l.taskId) === String(task.id)) 
        : [];
        
    if (taskLogs.length > 0) {
        historyHtml += `<div style="text-align: center; margin-top: 8px;">
            <span onclick="if(window.toggleTaskHistoryScroll) window.toggleTaskHistoryScroll()" id="taskHistoryToggleBtn" style="font-size: 0.8rem; color: #999; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#555'" onmouseout="this.style.color='#999'">﹀ 展开专属岁月长卷</span>
        </div>`;
        
        // 隐藏的岁月长卷容器
        historyHtml += `<div id="taskHistoryScrollZone" style="display: none; margin-top: 10px; max-height: 160px; overflow-y: auto; text-align: left; padding: 10px; background: #fafafa; border: 1px dashed #e0e0e0; border-radius: 8px; font-size: 0.8rem; color: #666; overscroll-behavior: contain;">`;
        
        taskLogs.forEach(log => {
          let lDate = log.date || '';
          if (lDate) {
              const dObj = new Date(lDate);
              if (!isNaN(dObj)) lDate = dObj.getFullYear() + '/' + (dObj.getMonth() + 1) + '/' + dObj.getDate();
          }
            const lTime = log.timeStr || '';
            const lMins = (log.lastAddMinutes && log.lastAddMinutes > 0) ? `<span style="color:#75B79E; font-weight:bold; margin-left:4px;">⏱ +${log.lastAddMinutes}m</span>` : '';
            const lBmk = (log.bookmarkSnapshot && log.bookmarkSnapshot.trim()) ? `<span style="margin-left:6px; color:#888;">🔖 ${log.bookmarkSnapshot}</span>` : '';
            const lNote = (log.noteSnapshot && log.noteSnapshot.trim()) ? `<div style="margin-top:4px; font-size:0.75rem; color:#888; background:#fff; padding:6px; border-radius:4px; border:1px solid #f0f0f0;">📝 ${log.noteSnapshot.replace(/\n/g, '<br>')}</div>` : '';
            const suffix = log.isTrailer ? ' 🐾' : (log.done ? ' ✅' : '');
            
            historyHtml += `<div style="margin-bottom: 12px; border-bottom: 1px solid #f5f5f5; padding-bottom: 8px;">
                <div style="font-family: monospace; font-size: 0.75rem; color: #aaa; margin-bottom: 2px;">${lDate} ${lTime}${suffix}</div>
                <div>${lMins}${lBmk}</div>
                ${lNote}
            </div>`;
        });
        historyHtml += `</div>`;
    }

    // 拼接到总的渲染区域中
    statsHtml += historyHtml;
    }
    msgEl.innerHTML = '<div style="font-weight:500;">' + (message || '') + '</div>' + statsHtml;

    // 2. 统一的极简 3 按钮布局（倒 T 型）
    btnContainer.style.display = 'grid';
    btnContainer.style.gridTemplateColumns = '1fr 1fr';
    btnContainer.style.gap = '8px';
    btnContainer.innerHTML = ''
      + '<button class="task-dialog-btn" style="background:#f5f5f5; color:#555;" onclick="if(window.handleTaskEdit) window.handleTaskEdit()">✏️ 修改</button>'
      + '<button class="task-dialog-btn" style="background:#e3f2fd; color:#1565c0;" onclick="if(window.handleTaskMemory) window.handleTaskMemory()">📝 记忆</button>'
      + '<button class="task-dialog-btn task-dialog-btn-complete" style="grid-column: 1 / -1;" onclick="if(window.handleTaskComplete) window.handleTaskComplete()">👉 去做</button>';

    dialog.style.display = 'flex';
  }

  let currentResurrectType = null;
  let currentResurrectIndex = -1;
  let currentResurrectItem = null;

  // 渲染历史任务记忆快照
  function showHistoryTaskDetail(type, index, isFromProject) {
    if (isFromProject === void 0) isFromProject = false;
    currentResurrectType = type;
    currentResurrectIndex = index;

    let item;
    if (type === 'archive') item = archive[index];
    else if (type === 'log') item = dailyLog[index];
    if (!item) return;

    currentResurrectItem = JSON.parse(JSON.stringify(item));
    let memoryText = "";

    // 👉 v8.X 核心修复：优先抓取 taskId！(修复历史记录因抓错时间戳 id 导致的查账失败)
    const realTaskId = item.taskId || item.id;
    let realCompleteCount = item.completeCount || 0;
    if (!realCompleteCount && realTaskId) {
        // 去活库找
        const tInDb = (typeof db !== 'undefined' ? db : []).find(t => String(t.id) === String(realTaskId));
        if (tInDb && tInDb.completeCount) {
            realCompleteCount = tInDb.completeCount;
        } else {
            // 去荣誉殿堂找
            const tInArc = (typeof archive !== 'undefined' ? archive : []).find(t => String(t.id) === String(realTaskId));
            if (tInArc && tInArc.completeCount) realCompleteCount = tInArc.completeCount;
        }
    }

    // 🌟 无论哪种状态（影子/足迹），只要有打卡次数，统一在最顶部挂上成就徽章
    if (realCompleteCount > 0) {
        memoryText += `<div style="margin-bottom:12px; color:#FF9AA2; font-weight:bold; font-size: 0.9rem;">💪 累计打卡: ${realCompleteCount} 次</div>`;
    }

    // 🌟 核心分流：纪念碑(Archive/影子) vs 时间切片(Log/足迹)
    if (type === 'archive') {
      if (item.totalMinutes) {
        const h = Math.floor(item.totalMinutes / 60);
        const m = item.totalMinutes % 60;
        memoryText += `<div style="margin-bottom:6px;">⏱ <b>累计投入:</b> ${h > 0 ? h + 'h ' : ''}${m}m</div>`;
      }
      if (item.bookmarkText) memoryText += `<div style="margin-bottom:6px;">🔖 <b>最终进度:</b> ${item.bookmarkText}</div>`;
      if (item.noteText) memoryText += `<div style="margin-top:10px; padding-top:10px; border-top:1px dashed #e0e0e0;">📝 <b>沉淀备注:</b> <br><span style="color:#666; font-size:0.85rem; line-height:1.5;">${item.noteText.replace(/\n/g, '<br>')}</span></div>`;

      // 👉 视觉大一统：完全复用普通活跃任务的“岁月长卷”UI结构
      if (realTaskId && typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
          const taskLogs = dailyLog.filter(l => String(l.taskId) === String(realTaskId));
          if (taskLogs.length > 0) {
              let historyHtml = `<div style="text-align: center; margin-top: 12px; padding-top: 8px; border-top: 1px dashed #e0e0e0;">
                  <span onclick="const z=document.getElementById('htHistoryScrollZone'); const b=this; if(z.style.display==='none'){z.style.display='block'; b.innerText='︿ 收起专属岁月长卷';}else{z.style.display='none'; b.innerText='﹀ 展开专属岁月长卷';}" style="font-size: 0.8rem; color: #999; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#555'" onmouseout="this.style.color='#999'">﹀ 展开专属岁月长卷</span>
              </div>`;
              
              // 隐藏的岁月长卷容器 (复用你的样式)
              historyHtml += `<div id="htHistoryScrollZone" style="display: none; margin-top: 10px; max-height: 160px; overflow-y: auto; text-align: left; padding: 10px; background: #fafafa; border: 1px dashed #e0e0e0; border-radius: 8px; font-size: 0.8rem; color: #666; overscroll-behavior: contain;">`;
              
              taskLogs.forEach(log => {
                  let lDate = log.date || '';
                  if (lDate) {
                      const dObj = new Date(lDate);
                      if (!isNaN(dObj)) lDate = dObj.getFullYear() + '/' + (dObj.getMonth() + 1) + '/' + dObj.getDate();
                  }
                  const lTime = log.timeStr || '';
                  const lMins = (log.lastAddMinutes && log.lastAddMinutes > 0) ? `<span style="color:#75B79E; font-weight:bold; margin-left:4px;">⏱ +${log.lastAddMinutes}m</span>` : '';
                  const lBmk = (log.bookmarkSnapshot && log.bookmarkSnapshot.trim()) ? `<span style="margin-left:6px; color:#888;">🔖 ${log.bookmarkSnapshot}</span>` : '';
                  const lNote = (log.noteSnapshot && log.noteSnapshot.trim()) ? `<div style="margin-top:4px; font-size:0.75rem; color:#888; background:#fff; padding:6px; border-radius:4px; border:1px solid #f0f0f0;">📝 ${log.noteSnapshot.replace(/\n/g, '<br>')}</div>` : '';
                  const suffix = log.isTrailer ? ' 🐾' : (log.done ? ' ✅' : '');
                  
                  historyHtml += `<div style="margin-bottom: 12px; border-bottom: 1px solid #f5f5f5; padding-bottom: 8px;">
                      <div style="font-family: monospace; font-size: 0.75rem; color: #aaa; margin-bottom: 2px;">${lDate} ${lTime}${suffix}</div>
                      <div>${lMins}${lBmk}</div>
                      ${lNote}
                  </div>`;
              });
              historyHtml += `</div>`;
              memoryText += historyHtml;
          }
      }

    } else {
      // 足迹切片(Log)：极度克制，只看当次
      if (item.lastAddMinutes) memoryText += `<div style="margin-bottom:6px;">⏱ <b>当次投入:</b> ${item.lastAddMinutes}m</div>`;
      if (item.bookmarkSnapshot) {
        let progressDisplay = (item.bookmarkSnapshot || '').trim();
        const targetDisplay = (item.targetProgressSnapshot || '').trim();
        if (progressDisplay && targetDisplay && !progressDisplay.includes('/')) {
          progressDisplay = progressDisplay + ' / ' + targetDisplay;
        }
        memoryText += `<div style="margin-bottom:6px;">🔖 <b>当次进度:</b> ${progressDisplay}</div>`;
      }
      if (item.noteSnapshot) memoryText += `<div style="margin-top:10px; padding-top:10px; border-top:1px dashed #e0e0e0;">📝 <b>当次备注:</b> <br><span style="color:#666; font-size:0.85rem; line-height:1.5;">${item.noteSnapshot.replace(/\n/g, '<br>')}</span></div>`;
    }

    if (!memoryText) memoryText = `<div style="color:#999; font-size:0.85rem; text-align:center; padding:10px 0;">(无附加记忆记录)</div>`;

    const htTitleEl = document.getElementById('htTitle');
    const htMsgEl = document.getElementById('htMessage');
    const dlg = document.getElementById('historyTaskDialog');
    if (!htTitleEl || !htMsgEl || !dlg) return;

    htTitleEl.innerText = `${item.icon || ''} ${item.title}`;
    htMsgEl.innerHTML = `<div style="text-align:left; background:#f9fafb; padding:12px 14px; border-radius:10px; font-size:0.9rem; color:#444;">${memoryText}</div>`;

    // 控制“修改时间”按钮仅对 log 生效
    const btnEditTime = document.getElementById('btnEditHistoryTime');
    if (btnEditTime) {
      btnEditTime.style.display = (type === 'log') ? 'block' : 'none';
    }
    const btnEditMemory = document.getElementById('btnEditHistoryMemory');
    // 仅对 dailyLog 允许修正记忆，且必须该记录有关联的 taskId
    if (btnEditMemory) {
      btnEditMemory.style.display = (type === 'log' && item.taskId) ? 'block' : 'none';
    }
    var btnResurrect = document.getElementById('btnResurrectHistory');
    if (btnResurrect) {
      btnResurrect.style.display = (typeof isFromProject !== 'undefined' && isFromProject) ? 'none' : 'inline-block';
    }
    dlg.style.display = 'flex';
  }

  // 无损一键回库
  function resurrectHistoryTask() {
    if (!currentResurrectItem) return;
    const dlg = document.getElementById('historyTaskDialog');
    if (dlg) dlg.style.display = 'none';

    const targetId = currentResurrectItem.taskId || currentResurrectItem.id;
    if (db.find(t => t.id === targetId)) {
      showToast("⚠️ 该任务已在任务库中，无需重复提取");
      return;
    }

    let newTask = Object.assign({}, currentResurrectItem);
    newTask.id = targetId || (Date.now() + Math.floor(Math.random() * 1000));

    const originalTask = archive.find(t => t.id === targetId) || db.find(t => t.id === targetId);
    if (originalTask) {
      newTask.type = originalTask.type;
      newTask.subtype = originalTask.subtype;
      newTask.isSeries = originalTask.isSeries;
      if (newTask.icon === '🏆') {
        newTask.icon = originalTask.icon;
      }
    }

    if (!newTask.type) {
      if (newTask.icon === '📖') { newTask.type = 'culture'; newTask.subtype = 'book'; }
      else if (newTask.icon === '🎬') { newTask.type = 'culture'; newTask.subtype = 'movie'; }
      else if (newTask.icon === '📺') { newTask.type = 'culture'; newTask.subtype = 'series'; newTask.isSeries = true; }
      else if (newTask.icon === '💿') { newTask.type = 'vinyl'; }
      else { newTask.type = 'indoor'; }
    }

    delete newTask.finishDate;
    delete newTask.done;
    delete newTask.timeStr;
    delete newTask.date;

    if (newTask.title) {
      newTask.title = newTask.title.replace(/^\[补录\]\s*/, '');
      newTask.title = newTask.title.replace(/^【整体完成】\s*/, '');
      newTask.title = newTask.title.replace(/^【\+\d+】\s*/, '');
    }

    if (newTask.bookmarkSnapshot) {
      const snap = newTask.bookmarkSnapshot.trim();
      if (snap.includes('/')) {
        const parts = snap.split('/');
        const cur = (parts[0] || '').trim();
        const total = (parts[1] || '').trim();
        if (cur) newTask.bookmarkText = cur;
        if (total) newTask.bookmarkTotal = total;
      } else {
        newTask.bookmarkText = snap;
      }
    }
    if (newTask.noteSnapshot) newTask.noteText = newTask.noteSnapshot;
    if (!newTask.totalMinutes && newTask.lastAddMinutes) newTask.totalMinutes = newTask.lastAddMinutes;

    db.unshift(newTask);

    if (currentResurrectType === 'archive' && currentResurrectIndex > -1) {
      archive.splice(currentResurrectIndex, 1);
      if (typeof renderArchive === 'function') renderArchive();
    }

    // 👉 v8.2.X 核心修复：物质守恒！如果复活的是项目任务，必须撤销其当年贡献的“已完成人头数”
    if (newTask.projectId && typeof customPlaylists !== 'undefined') {
      const pIdx = customPlaylists.findIndex(p => p && String(p.id) === String(newTask.projectId));
      if (pIdx > -1 && customPlaylists[pIdx].linkedCompletedCount > 0) {
          customPlaylists[pIdx].linkedCompletedCount--; // 撤销人头
          if (typeof savePlaylists === 'function') savePlaylists();
          if (typeof renderCabinet === 'function') renderCabinet(); // 实时刷新 03 区封面
      }
  }

  save();
  if (typeof renderList === 'function') renderList();

  // 👉 v8.2.X 修复：动态路由分流。判断复活的任务是否属于项目
  if (newTask.projectId && typeof window.renderProjectConsoleInner === 'function') {
      // 1. 如果是项目专属任务，原地实时刷新大展厅，禁止画面跳动乱滚
      window.renderProjectConsoleInner(newTask.projectId);
  } else {
        // 2. 如果是 03 区的日常单次任务，按老规矩平滑滚动到任务库
        const sec03 = document.querySelector('.section-list');
        if (sec03) sec03.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast("✨ 已携记忆无损回库！");
}

  function editHistoryTime() {
    if (currentResurrectType !== 'log' || currentResurrectIndex < 0) return;
    const log = dailyLog[currentResurrectIndex];
    if (!log) return;

    let startVal = '';
    let endVal = '';
    const oldTime = (log.timeStr || '').trim();
    if (oldTime.includes('-')) {
      const parts = oldTime.split('-').map(function (s) { return s.trim(); });
      startVal = parts[0] || '';
      endVal = parts[1] || '';
    } else {
      endVal = oldTime;
    }

    const startInp = document.getElementById('editTimeStart');
    const endInp = document.getElementById('editTimeEnd');
    if (startInp) startInp.value = startVal;
    if (endInp) endInp.value = endVal;

    document.getElementById('historyTaskDialog').style.display = 'none';
    document.getElementById('editTimeDialog').style.display = 'flex';
  }

  // 👉 历史时间轴修正：从 "HH:MM - HH:MM" 解析区间时长（分钟），非区间则返回 null
  function durationMinutesFromLogTimeStr(str) {
    str = (str || '').trim();
    if (!str || str.indexOf('-') === -1) return null;
    var parts = str.split('-').map(function (s) { return s.trim(); });
    if (parts.length < 2) return null;
    function toMins(t) {
      var m = (t || '').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      var h = parseInt(m[1], 10);
      var mm = parseInt(m[2], 10);
      if (isNaN(h) || isNaN(mm)) return null;
      return h * 60 + mm;
    }
    var sm = toMins(parts[0]);
    var em = toMins(parts[1]);
    if (sm == null || em == null) return null;
    var d = em - sm;
    if (d < 0) d += 24 * 60;
    return d;
  }

  function confirmEditHistoryTime() {
    if (currentResurrectType !== 'log' || currentResurrectIndex < 0) return;
    const log = dailyLog[currentResurrectIndex];
    if (!log) return;

    const startInp = document.getElementById('editTimeStart');
    const endInp = document.getElementById('editTimeEnd');
    const startVal = startInp ? startInp.value : '';
    const endVal = endInp ? endInp.value : '';

    if (!endVal && !startVal) {
      showToast("⚠️ 时间不能为空");
      return;
    }

    let newTimeStr = '';
    if (startVal && endVal && startVal !== endVal) {
      newTimeStr = startVal + ' - ' + endVal;
    } else {
      newTimeStr = endVal || startVal;
    }

    const oldTimeStr = (log.timeStr || '').trim();
    const oldDur = durationMinutesFromLogTimeStr(oldTimeStr);
    const newDur = durationMinutesFromLogTimeStr(newTimeStr);
    const deltaMins = (oldDur != null && newDur != null) ? (newDur - oldDur) : 0;

    log.timeStr = newTimeStr;
    if (oldDur != null && newDur != null) {
      log.lastAddMinutes = newDur;
    }

    if (log.taskId && deltaMins !== 0) {
      let taskInDb = db.find(function (t) { return t.id === log.taskId; });
      if (!taskInDb) taskInDb = archive.find(function (t) { return t.id === log.taskId; });
      if (taskInDb) {
        taskInDb.totalMinutes = Math.max(0, (taskInDb.totalMinutes || 0) + deltaMins);
        if (taskInDb.projectId && typeof customPlaylists !== 'undefined') {
          const pIdx = customPlaylists.findIndex(function (p) {
            return p && p.playlistType === 'project' && String(p.id) === String(taskInDb.projectId);
          });
          if (pIdx > -1) {
            customPlaylists[pIdx].linkedTotalMinutes = Math.max(0, (customPlaylists[pIdx].linkedTotalMinutes || 0) + deltaMins);
            if (typeof savePlaylists === 'function') savePlaylists();
            if (typeof renderCabinet === 'function') renderCabinet();
          }
        }
      }
    }
    if (typeof sortDailyLogByTime === 'function') sortDailyLogByTime();
    if (typeof save === 'function') save();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof renderHeatmap === 'function') renderHeatmap();

    showToast("⏱️ 时间轴已精准修正");
    document.getElementById('editTimeDialog').style.display = 'none';
  }

  function editHistoryMemory() {
    if (currentResurrectType !== 'log' || currentResurrectIndex < 0) return;
    const log = dailyLog[currentResurrectIndex];
    if (!log) return;

    const selH = document.getElementById('editMemH');
    const selM = document.getElementById('editMemM');
    const bmkInp = document.getElementById('editMemBookmark');

    if (selH && selH.options.length === 0) {
      for (let i = 0; i <= 24; i++) selH.add(new Option(i + 'h', i));
      for (let j = 0; j < 60; j++) selM.add(new Option(String(j).padStart(2, '0') + 'm', j));
    }

    const currentMins = log.lastAddMinutes || 0;
    if (selH) selH.value = Math.floor(currentMins / 60);
    if (selM) selM.value = currentMins % 60;
    if (bmkInp) bmkInp.value = log.bookmarkSnapshot || '';

    document.getElementById('historyTaskDialog').style.display = 'none';
    document.getElementById('editMemoryDialog').style.display = 'flex';
  }

  function confirmEditHistoryMemory() {
    if (currentResurrectType !== 'log' || currentResurrectIndex < 0) return;
    const log = dailyLog[currentResurrectIndex];
    if (!log) return;

    const selH = document.getElementById('editMemH');
    const selM = document.getElementById('editMemM');
    const bmkInp = document.getElementById('editMemBookmark');

    const newMins = (parseInt(selH.value, 10) || 0) * 60 + (parseInt(selM.value, 10) || 0);
    const newBookmark = bmkInp ? bmkInp.value.trim() : '';

    const oldMins = log.lastAddMinutes || 0;
    const deltaMins = newMins - oldMins;

    log.lastAddMinutes = newMins;
    log.bookmarkSnapshot = newBookmark;

    if (log.taskId) {
      let taskInDb = db.find(t => t.id === log.taskId);
      if (!taskInDb) taskInDb = archive.find(t => t.id === log.taskId);
      if (taskInDb) {
        if (deltaMins !== 0) {
          taskInDb.totalMinutes = Math.max(0, (taskInDb.totalMinutes || 0) + deltaMins);
          if (taskInDb.lastAddMinutes === oldMins) {
            taskInDb.lastAddMinutes = newMins;
          }
        }
        // 👉 v8.X 历史修正补丁：向归属项目同步时间差值
        if (taskInDb.projectId && deltaMins !== 0 && typeof customPlaylists !== 'undefined') {
          const pIdx = customPlaylists.findIndex(function (p) {
            return p && p.playlistType === 'project' && String(p.id) === String(taskInDb.projectId);
          });
          if (pIdx > -1) {
            customPlaylists[pIdx].linkedTotalMinutes = Math.max(0, (customPlaylists[pIdx].linkedTotalMinutes || 0) + deltaMins);
            if (typeof savePlaylists === 'function') savePlaylists();
            if (typeof renderCabinet === 'function') renderCabinet();
          }
        }
        taskInDb.bookmarkText = newBookmark;
      }
    }

    document.getElementById('editMemoryDialog').style.display = 'none';
    save();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory();
    if (typeof renderList === 'function') renderList();
    if (typeof renderArchive === 'function') renderArchive();
    if (typeof renderHeatmap === 'function') renderHeatmap();
    showToast("✅ 记忆与时长已修正并同步");
  }

  function closeTaskActionDialog() {
    var dialog = document.getElementById('taskActionDialog');
    if (dialog) dialog.style.display = 'none';
    currentDialogTask = null;
    if (typeof exitImmersiveMode === 'function') exitImmersiveMode();
  }

  // 触发唤起弹窗进行编辑（万能任务锻造舱，避免跳转 02 区丢失上下文）
  function handleTaskEdit() {
    if (!currentDialogTask) return;
    var task = currentDialogTask;
    closeTaskActionDialog();
    editingTaskId = task.id;
    try {
      editingTaskOriginal = JSON.parse(JSON.stringify(task));
    } catch (e) {
      editingTaskOriginal = Object.assign({}, task);
    }
    openTaskEditorModal(task);
  }

  function openTaskEditorModal(taskObj, projectId) {
    if (typeof projectId === 'undefined') projectId = null;
    var modal = document.getElementById('taskEditorModal');
    if (!modal) return;

    var selProj = document.getElementById('modalInpProject');
    if (selProj && typeof customPlaylists !== 'undefined') {
      var pOptions = '<option value="">🔗 归属项目：无</option>';
      customPlaylists.filter(function (p) { return p && p.playlistType === 'project'; }).forEach(function (p) {
        var label = (p.icon || '🚀') + ' ' + (p.title || p.name || '');
        label = String(label).replace(/</g, '&lt;').replace(/"/g, '&quot;');
        pOptions += '<option value="' + String(p.id).replace(/"/g, '&quot;') + '">' + label + '</option>';
      });
      selProj.innerHTML = pOptions;
    }

    // 👉 动态注入：实时同步用户的自定义标签（须在恢复 active 之前执行）
    var modalTagsRow = document.getElementById('modalTagsRow');
    if (modalTagsRow) {
      modalTagsRow.querySelectorAll('.custom-tag').forEach(function (el) { el.remove(); });
      var originalCustomTags = document.querySelectorAll(
        '.section-input .tags-row .tag[data-v="custom"], .section-input .tags-row .tag[data-type="custom"], #customTagsIn02Zone .tag'
      );
      originalCustomTags.forEach(function (tagEl) {
        if (!tagEl || tagEl.id === 'tagWormholeBtn') return;
        var clone = tagEl.cloneNode(true);
        clone.classList.add('custom-tag');
        clone.classList.remove('active');
        clone.removeAttribute('id');
        clone.setAttribute('onclick', 'if(window.pickTagForModal) window.pickTagForModal(this)');
        modalTagsRow.appendChild(clone);
      });
    }

    if (taskObj) {
      var titleEl = document.getElementById('editorModalTitle');
      if (titleEl) titleEl.innerText = '✏️ 修改任务';
      var inpTitle = document.getElementById('modalInpTitle');
      if (inpTitle) inpTitle.value = taskObj.title || '';
      var inpTime = document.getElementById('modalInpTime');
      if (inpTime) inpTime.value = taskObj.time != null ? String(taskObj.time) : '30';
      var inpRec = document.getElementById('modalInpRecurrence');
      if (inpRec) inpRec.value = taskObj.recurrence || 'none';
      var inpDdl = document.getElementById('modalInpDeadline');
      if (inpDdl) inpDdl.value = taskObj.deadline || '';
      var inpTgt = document.getElementById('modalInpTarget');
      if (inpTgt) inpTgt.value = taskObj.bookmarkTotal || '';
      if (selProj) selProj.value = taskObj.projectId ? String(taskObj.projectId) : '';


      editingTaskId = taskObj.id;

      var tags = document.querySelectorAll('#modalTagsRow .tag');
      tags.forEach(function (t) { t.classList.remove('active'); });
      var targetTag = null;
      var type = taskObj.type;
      if (type === 'culture') {
        if (taskObj.subtype === 'book') {
          targetTag = Array.prototype.find.call(tags, function (t) { return t.dataset.v === 'culture' && t.dataset.sub === 'book'; });
        } else if (taskObj.subtype === 'movie') {
          targetTag = Array.prototype.find.call(tags, function (t) { return t.dataset.v === 'culture' && t.dataset.sub === 'movie'; });
        } else if (taskObj.isSeries || taskObj.subtype === 'series') {
          targetTag = Array.prototype.find.call(tags, function (t) { return t.dataset.v === 'culture' && t.dataset.sub === 'series'; });
        } else if (taskObj.subtype === 'other') {
          targetTag = Array.prototype.find.call(tags, function (t) { return t.dataset.v === 'culture' && t.dataset.sub === 'other'; });
        }
        if (!targetTag) targetTag = Array.prototype.find.call(tags, function (t) { return t.dataset.v === 'culture'; });
      } else if (type === 'custom') {
        targetTag = Array.prototype.find.call(tags, function (t) {
          return t.dataset.v === 'custom' && String(t.dataset.sub || '') === String(taskObj.subtype || '');
        });
        if (!targetTag) {
          targetTag = Array.prototype.find.call(tags, function (t) {
            return t.dataset.customTagId != null && String(t.dataset.customTagId) === String(taskObj.subtype || '');
          });
        }
      } else {
        targetTag = Array.prototype.find.call(tags, function (t) { return t.dataset.v === type; });
      }
      if (targetTag) targetTag.classList.add('active');
     // 👉 核心修复：彻底删除半吊子的旧代码，全权交给“中央驱动”上物理黄漆
     if (window.toggleModalFlash) window.toggleModalFlash(!!taskObj.isQuick, false);
     window.modalUserOverrideFlash = false;
      toggleTimeInputForModal(type);
    } else {
      var titleEl2 = document.getElementById('editorModalTitle');
      if (titleEl2) titleEl2.innerText = '✨ 新建专属任务';
      var inpTitle2 = document.getElementById('modalInpTitle');
      if (inpTitle2) inpTitle2.value = '';
      var inpTime2 = document.getElementById('modalInpTime');
      if (inpTime2) inpTime2.value = '30';
      var inpRec2 = document.getElementById('modalInpRecurrence');
      if (inpRec2) inpRec2.value = 'none';
      var inpDdl2 = document.getElementById('modalInpDeadline');
      if (inpDdl2) inpDdl2.value = '';
      var inpTgt2 = document.getElementById('modalInpTarget');
      if (inpTgt2) inpTgt2.value = '';
      if (selProj && projectId) selProj.value = String(projectId);
       // 强制洗白速办物理状态，不触发用户覆盖
       if (window.toggleModalFlash) window.toggleModalFlash(false, false);
       window.modalUserOverrideFlash = false;

      document.querySelectorAll('#modalTagsRow .tag').forEach(function (t) { t.classList.remove('active'); });
      var defaultTag = document.querySelector('#modalTagsRow .tag[data-v="indoor"]');
      if (defaultTag) defaultTag.classList.add('active');

      editingTaskId = null;
      editingTaskOriginal = null;
      modalPrefillProjectId = projectId;
      modalFlashOn = false;
      modalUserOverrideFlash = false;
      var swFlashN = document.getElementById('modalFlashSwitch');
      if (swFlashN) swFlashN.classList.remove('active-flash');
      toggleTimeInputForModal('indoor');
    }

    modal.style.display = 'flex';
  }

  function closeTaskEditorModal() {
    var m = document.getElementById('taskEditorModal');
    if (m) m.style.display = 'none';
    editingTaskId = null;
    modalPrefillProjectId = null;
    editingTaskOriginal = null;
    modalFlashOn = false;
    modalUserOverrideFlash = false;
    var swF = document.getElementById('modalFlashSwitch');
    if (swF) swF.classList.remove('active-flash');
    var mt = document.getElementById('modalInpTime');
    if (mt) mt.classList.remove('disabled');
  }

  function toggleTimeInputForModal(type) {
    var sel = document.getElementById('modalInpTime');
    if (!sel) return;
    if (type === 'vinyl' || type === 'culture') sel.classList.add('disabled');
    else sel.classList.remove('disabled');
  }

  // 👉 v6.9.X：全能版速办状态机（解决透明、串色、时间不同步问题）
window.toggleModalFlash = function(forceState, isUserAction) {
  if (isUserAction === undefined) isUserAction = true;
  if (isUserAction) window.modalUserOverrideFlash = true;

  var sw = document.getElementById('modalFlashSwitch');
  
  // 1. 核心修复：支持强制设定状态（打破盲目的 toggle）
  if (forceState !== undefined) {
      window.modalFlashOn = forceState;
  } else {
      window.modalFlashOn = !window.modalFlashOn;
  }

  // 2. 物理洗漆：强制同步 class 与内联颜色
  if (sw) {
      if (window.modalFlashOn) {
          sw.classList.add('active-flash');
          sw.style.background = '#fff8e1';
          sw.style.borderColor = '#FBC02D';
      } else {
          sw.classList.remove('active-flash');
          sw.style.background = '#f9fafb';
          sw.style.borderColor = '#eee';
      }
  }

  // 3. 时间联动
  var sel = document.getElementById('modalInpTime');
  if (sel) {
      if (isUserAction) {
          sel.value = window.modalFlashOn ? '5' : '30';
      } else if (!window.modalFlashOn) {
          window.modalUserOverrideFlash = false;
      }
  }
};

  function pickTagForModal(tagEl) {
    if (!tagEl) return;
    document.querySelectorAll('#modalTagsRow .tag').forEach(function (t) { t.classList.remove('active'); });
    tagEl.classList.add('active');
    toggleTimeInputForModal(tagEl.getAttribute('data-v'));
  }

  function autoTagForModal() {
    var inp = document.getElementById('modalInpTitle');
    if (!inp) return;
    var raw = inp.value;
    var targetLine = (raw.split('\n')[0] || '').trim();
    var trimmed = targetLine;
    var parsed = parseTimeFromInput(raw.split('\n')[0] || '');
    var feedback = document.getElementById('modalTimeFeedback');
    if (feedback) { feedback.innerText = parsed.time ? '💡 识别: ' + parsed.time + ' min' : ''; }
    var t = null;
    var detectQuick = false;
    var firstChar = targetLine.charAt(0) || '';
    if (firstChar === '看' || firstChar === '影') t = 'culture';
    else if (firstChar === '读' || firstChar === '书') t = 'culture';
    else if (firstChar === '追' || firstChar === '剧') t = 'culture';
    else if (firstChar === '去') t = 'outdoor';
    else if (firstChar === '逛' || firstChar === '赏' || firstChar === '演' || firstChar === '观'
      || targetLine.indexOf('文娱') === 0
      || targetLine.indexOf('欣赏') === 0
      || targetLine.indexOf('观看') === 0
      || targetLine.indexOf('演出') === 0) {
      t = 'culture';
    }
    else if (/洗|刷|理|扔|拆|擦|扫|收|整理|收拾|浇|喂|剪|充|拖|换|叠|铺|挂|扔|喝/.test(targetLine)) { t = 'indoor'; detectQuick = true; }
    else if (firstChar === '唱' || firstChar === '听' || firstChar === '播' || trimmed.startsWith('播客') || trimmed.startsWith('电台')) {
      t = 'vinyl';
    }
    else if (/书|读|杂志/.test(targetLine)) t = 'culture';
    else if (/电影|影|片|剧|展|音乐会|演出|演唱会|音乐节|音乐剧|live/.test(targetLine)) t = 'culture';
    else if (/动|跑|球|舞|操|帕梅拉|瑜伽|健身|练/.test(targetLine)) t = 'sport';
    else if (/买|外|超市|商场|取快递|寄快递/.test(targetLine)) t = 'outdoor';
    else if (/脑|写|研究|作|编辑/.test(targetLine)) t = 'desktop';
    if (t) {
      document.querySelectorAll('#modalTagsRow .tag').forEach(function (tag) { tag.classList.remove('active'); });
      var sub = 'book';
      if (t === 'culture') {
        if (firstChar === '看' || firstChar === '影') sub = 'movie';
        else if (
          firstChar === '逛' || firstChar === '赏' || firstChar === '演' ||
          targetLine.indexOf('文娱') === 0 || targetLine.indexOf('欣赏') === 0 ||
          targetLine.indexOf('演出') === 0 || targetLine.indexOf('观看') === 0 ||
          /展|音乐会|话剧|舞剧|歌剧|音乐剧|音乐节|演唱会|脱口秀|live/.test(targetLine)
        ) {
          sub = 'other';
        }
        else if (firstChar === '追' || /第.+集/.test(targetLine) || targetLine.indexOf('剧') !== -1) sub = 'series';
      }
      var selector = (t === 'culture') ? '#modalTagsRow .tag[data-v="culture"][data-sub="' + sub + '"]' : '#modalTagsRow .tag[data-v="' + t + '"]';
      var activeTag = document.querySelector(selector) || document.querySelector('#modalTagsRow .tag[data-v="' + t + '"]');
      if (activeTag) activeTag.classList.add('active');
      toggleTimeInputForModal(t);
    }
    var recurSelect = document.getElementById('modalInpRecurrence');
    if (recurSelect) {
      if (targetLine.indexOf('每天') !== -1 || targetLine.indexOf('每日') !== -1) recurSelect.value = 'daily';
      else if (targetLine.indexOf('每周') !== -1) recurSelect.value = 'weekly';
      else if (targetLine.indexOf('每月') !== -1) recurSelect.value = 'monthly';
      else if (targetLine.indexOf('长期') !== -1) recurSelect.value = 'long_term';
    }
    // === 5. 自动速办 UI 联动逻辑 (终极净化版 + 时间同步) ===
    // 只有在用户没有手动干预过开关的情况下，系统才敢自动接管
    if (!window.modalUserOverrideFlash) {
      var isPhotoSort = targetLine.indexOf('整理') !== -1 && targetLine.indexOf('照片') !== -1;
      var selTime = document.getElementById('modalInpTime'); // 👉 获取弹窗的时间下拉框
      
      if (!isPhotoSort && detectQuick) {
          // 👉 命中速办：强制上马卡龙黄漆，并同步调至 5m
          if (window.toggleModalFlash) window.toggleModalFlash(true, false);
          if (selTime) selTime.value = '5';
      } else {
          // 👉 未命中或已删除：强制洗掉黄漆，并恢复默认 30m
          if (window.toggleModalFlash) window.toggleModalFlash(false, false);
          if (selTime) selTime.value = '30';
      }
  }
  }

  function saveTaskFromModal() {
    var inpModal = document.getElementById('modalInpTitle');
    if (!inpModal || !inpModal.value || !inpModal.value.trim()) {
      if (typeof showToast === 'function') showToast('任务描述不能为空');
      return;
    }
    var rawInput = inpModal.value;
    var lines = rawInput.split('\n').filter(function (line) { return line.trim() !== ''; });
    if (editingTaskId) {
      lines = [lines.join(' ')].filter(function (line) { return line.trim() !== ''; });
    }
    if (lines.length === 0) {
      if (typeof showToast === 'function') showToast('任务描述不能为空');
      return;
    }

    var activeTag = document.querySelector('#modalTagsRow .tag.active');
    var type = (activeTag && activeTag.getAttribute('data-v')) || 'indoor';
    var manualSubtype = (activeTag && activeTag.getAttribute('data-sub')) || '';
    var added = 0;
    var batchSubtype = manualSubtype || null;
    var recurEl = document.getElementById('modalInpRecurrence');
    var recurrence = (recurEl && recurEl.value) || 'none';
    var timeEl = document.getElementById('modalInpTime');
    var defaultTime = timeEl ? parseInt(timeEl.value, 10) : 30;
    var targetCount = document.getElementById('modalInpTarget') ? document.getElementById('modalInpTarget').value.trim() : '';
    var deadlineVal = document.getElementById('modalInpDeadline') ? document.getElementById('modalInpDeadline').value : '';

    if (!batchSubtype && lines.length > 0) {
      var firstRaw = lines[0];
      var first = firstRaw.toLowerCase();
      var isCleaning = /(理|整理|收拾|擦|扫|拖|洗|换|叠|铺|挂|扔|拆|装|喝)/.test(firstRaw);
      if (!isCleaning) {
        var fcBatch = firstRaw.charAt(0) || '';
        if (fcBatch === '读' || fcBatch === '书') {
          batchSubtype = 'book';
        } else if (fcBatch === '看' || fcBatch === '影') {
          batchSubtype = 'movie';
        } else if (['读', '书', '阅', 'book', 'read', '杂志'].some(function (k) { return first.indexOf(k) !== -1; })) {
          batchSubtype = 'book';
        } else if (['看', '影', '视', '片', 'movie'].some(function (k) { return first.indexOf(k) !== -1; })) {
          batchSubtype = 'movie';
        }
        if (batchSubtype && first.length <= 4 && lines.length > 1) {
          lines.shift();
        }
      }
    }

    var projSel = document.getElementById('modalInpProject');
    var finalProjectId = (projSel && projSel.value) ? projSel.value : null;
    var oldPid = (editingTaskId && editingTaskOriginal) ? editingTaskOriginal.projectId : null;

    var didApply = false;
    var modalDowryDone = false;

    lines.forEach(function (line) {
      var parsed = parseTimeFromInput(line);
      var title = (parsed.title || '').trim();
      if (!title) return;
      var subtype = batchSubtype;

      var isFrog = false;
      var rawTitle = title.replace(/^\s+/, '');
      if (/^[*＊!！]/.test(rawTitle)) {
        isFrog = true;
        rawTitle = rawTitle.replace(/^[*＊!！\s]+/, '');
      } else if (rawTitle.indexOf('重要') === 0) {
        isFrog = true;
        rawTitle = rawTitle.replace(/^重要\s*/, '');
      }
      title = rawTitle.trim();

      var isQuick = modalFlashOn;
      if (typeof modalUserOverrideFlash === 'boolean' ? !modalUserOverrideFlash : true) {
        if (!isQuick) {
          var isPhotoSort = title.indexOf('整理') !== -1 && title.indexOf('照片') !== -1;
          if (!isPhotoSort && type === 'indoor' &&
            /(洗|刷|发|联系|通知|拿|取|拆|装|擦|扫|倒|收|整理|收拾|浇|喂|剪|充|拖|换|叠|铺|挂|扔|喝)/.test(title)
          ) {
            isQuick = true;
          }
        }
      }

      var timeVal = parsed.time != null ? parsed.time : defaultTime;
      if (isQuick && (!timeVal || timeVal > 15)) timeVal = 5;
      if (type === 'vinyl' && !isQuick) timeVal = 0;
      else if (type === 'culture' && !isQuick) {
        if (subtype === 'movie') timeVal = 120;
        else timeVal = 0;
      }

      if (!isQuick && !subtype && type === 'culture') {
        var tNorm = (title || '').trim();
        var firstChar2 = tNorm.charAt(0) || '';
        if (firstChar2 === '读' || firstChar2 === '书') {
          subtype = 'book';
        } else if (firstChar2 === '看' || firstChar2 === '影') {
          subtype = 'movie';
        } else if (
          tNorm.indexOf('书') !== -1 || tNorm.indexOf('读') !== -1 || tNorm.indexOf('阅') !== -1 ||
          tNorm.indexOf('杂志') !== -1 || tNorm.indexOf('周刊') !== -1
        ) {
          subtype = 'book';
        } else if (
          tNorm.indexOf('电影') !== -1 || tNorm.indexOf('影') !== -1 || tNorm.indexOf('片') !== -1
        ) {
          subtype = 'movie';
        }
      }

      var rawForSeries = title.replace(/^(去|看展|看|读|听|做|逛|赏|展览|欣赏|演出|文娱|观看|音乐剧|话剧|舞剧|歌剧|追|播客|电台|小宇宙|唱片|cd|播)[:：\s]*/i, '').trim();

      var isSeries = false;
      if (type === 'culture' && subtype === 'series') {
        isSeries = true;
      }
      if (type === 'culture') {
        var firstCharSeries = rawForSeries.charAt(0) || '';
        if (firstCharSeries === '追' || firstCharSeries === '剧') {
          isSeries = true;
        }
        if (rawForSeries.indexOf('全集') !== -1 ||
          rawForSeries.indexOf('系列') !== -1 ||
          /第.+集/.test(rawForSeries)) {
          isSeries = true;
        }
      }

      var displayTitle = rawForSeries;
      if (type === 'culture' && isSeries && (displayTitle.indexOf('追') === 0 || displayTitle.indexOf('剧') === 0)) {
        displayTitle = displayTitle.slice(1).trim();
      }
      title = displayTitle;

      if (!isQuick && (type === 'vinyl' || (type === 'culture' && subtype !== 'other'))) {
        if (title && title.charAt(0) !== '《' && title.charAt(title.length - 1) !== '》') {
          title = '《' + title + '》';
        }
      }

      var modalRecurEl = document.getElementById('modalInpRecurrence');
      var localRecurrence = modalRecurEl ? modalRecurEl.value : recurrence;
      if (!localRecurrence || localRecurrence === 'none') {
        if (title.indexOf('每天') !== -1 || title.indexOf('每日') !== -1) localRecurrence = 'daily';
        else if (title.indexOf('每周') !== -1) localRecurrence = 'weekly';
        else if (title.indexOf('每月') !== -1) localRecurrence = 'monthly';
        else if (title.indexOf('长期') !== -1) localRecurrence = 'long_term';
      }
      if (localRecurrence && localRecurrence !== 'none') {
        title = title.replace(/每天|每日|每周|每月|长期[:：\s]*/g, '').trim();
      }
      if (modalRecurEl) modalRecurEl.value = localRecurrence || 'none';

      var finalIcon = null;
      if (type === 'culture' && subtype === 'other') {
        if (/(演出|音乐会|音乐节|演唱会|话剧|舞剧|歌剧|音乐剧|脱口秀|live|演)/i.test(line)) {
          finalIcon = '🎭';
        } else {
          finalIcon = '🖼️';
        }
      } else if (type === 'vinyl') {
        if (/(唱片|cd|黑胶|碟)/i.test(line)) {
          finalIcon = '💿';
        } else if (/(歌|音乐|网易云|qq音乐)/i.test(line)) {
          finalIcon = '🎵';
        } else {
          finalIcon = '🎙️';
        }
      }

      var item = {
        id: Date.now() + Math.random(),
        title: title,
        type: type,
        desc: '自定义',
        time: timeVal,
        inColdStorage: false
      };
      if (subtype) item.subtype = subtype;
      if (isSeries) item.isSeries = true;
      if (isFrog) item.isFrog = true;
      if (isQuick) item.isQuick = true;
      if (localRecurrence && localRecurrence !== 'none') item.recurrence = localRecurrence;

      if (finalIcon) item.icon = finalIcon;

      if (editingTaskId) {
        var idx = db.findIndex(function (t) { return t.id === editingTaskId; });
        if (idx > -1) {
          if (!modalDowryDone) {
            modalDowryDone = true;
            var dowryMins = db[idx].totalMinutes || 0;
            if (String(finalProjectId || '') !== String(oldPid || '') && dowryMins > 0 && typeof customPlaylists !== 'undefined') {
              if (oldPid) {
                var oldIdx2 = customPlaylists.findIndex(function (p) {
                  return p && p.playlistType === 'project' && String(p.id) === String(oldPid);
                });
                if (oldIdx2 > -1) {
                  customPlaylists[oldIdx2].linkedTotalMinutes = Math.max(0, (customPlaylists[oldIdx2].linkedTotalMinutes || 0) - dowryMins);
                }
              }
              if (finalProjectId) {
                var newIdx2 = customPlaylists.findIndex(function (p) {
                  return p && p.playlistType === 'project' && String(p.id) === String(finalProjectId);
                });
                if (newIdx2 > -1) {
                  customPlaylists[newIdx2].linkedTotalMinutes = Math.max(0, (customPlaylists[newIdx2].linkedTotalMinutes || 0) + dowryMins);
                }
              }
              if (typeof savePlaylists === 'function') savePlaylists();
              if (typeof renderCabinet === 'function') renderCabinet();
            }
          }
          if (item.icon) db[idx].icon = item.icon;
          db[idx].title = item.title;
          db[idx].type = item.type;
          db[idx].subtype = item.subtype;
          db[idx].isSeries = !!item.isSeries;
          db[idx].time = item.time;
          db[idx].isFrog = !!item.isFrog;
          db[idx].isQuick = !!item.isQuick;
          db[idx].recurrence = item.recurrence;
          db[idx].desc = item.desc;
          db[idx].projectId = finalProjectId || null;
          if (targetCount) db[idx].bookmarkTotal = targetCount;
          if (deadlineVal) db[idx].deadline = deadlineVal;
          if (!targetCount && db[idx].bookmarkTotal) delete db[idx].bookmarkTotal;
          if (!deadlineVal && db[idx].deadline) delete db[idx].deadline;
          didApply = true;
        }
      } else {
        item.projectId = finalProjectId || null;
        item.bookmarkTotal = targetCount || undefined;
        item.deadline = deadlineVal || undefined;
        db.unshift(item);
        added++;
        didApply = true;
      }
    });

    if (!didApply) {
      if (typeof showToast === 'function') {
        showToast(editingTaskId ? '无法保存，请检查任务内容或任务是否仍存在' : '任务描述不能为空');
      }
      return;
    }

    var wasEditing = !!editingTaskId;
    if (typeof showToast === 'function') {
      if (wasEditing) showToast('✅ 任务修改已保存');
      else showToast(added > 1 ? ('✅ 已入库 ' + added + ' 项') : '✅ 专属任务已入库');
    }

    if (typeof save === 'function') save();
    if (typeof renderList === 'function') renderList();
    if (typeof renderCabinet === 'function') renderCabinet();

    if (typeof window.renderProjectConsoleInner === 'function') {
      if (finalProjectId) window.renderProjectConsoleInner(finalProjectId);
      if (oldPid && String(oldPid) !== String(finalProjectId || '')) {
        window.renderProjectConsoleInner(oldPid);
      }
    }

    closeTaskEditorModal();
  }
  function handleTaskComplete() {
    if (!currentDialogTask) return;
    if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor') {
      // 👉 UX 回滚：恢复为原版的明确指引文案，告诉用户具体要点哪里
      if (typeof showToast === 'function') {
        showToast('⚠️ 当前已有专注任务！请先点击卡片的 [已完成] 或 [换一个] 结算。');
      }
      closeTaskActionDialog();
      return;
    }
    var task = currentDialogTask;
    // 👉 插入这行：如果有项目大展厅开着，强制关掉它
    if (typeof closeProjectConsole === 'function') closeProjectConsole();
    // Step 1: 关闭三选项弹窗
    closeTaskActionDialog();

    // 👉 v8.3.4 核心修复：在上新演员之前，强制撤下所有的旧幕布（专属清单与抽卡图层）
    // 这样可以实现：如果在没计时的情况下改主意，系统能丝滑替换，绝不发生两张卡片同台重叠！
    if (typeof closePlaylistOverlay === 'function') closePlaylistOverlay();
    if (typeof hideAllGachaLayers === 'function') hideAllGachaLayers();

    currentTask = task;
    if (typeof renderResultCard === 'function') renderResultCard(currentTask);
    if (typeof setCardAsAnchor === 'function') setCardAsAnchor();
    if (typeof safeVibrate === 'function') safeVibrate();
// 👉 v8.2.X 修复：废除原生滚动，防止物理页面强制下拉导致 04 区穿模
setTimeout(function () {
  if (typeof window.backToCenter === 'function') {
    window.backToCenter();
  } else {
    var outer = document.querySelector('.outer-swiper');
    if (outer && outer.swiper) outer.swiper.slideToLoop(1);
    var inner = document.querySelector('.inner-swiper');
    if (inner && inner.swiper) inner.swiper.slideTo(1);
  }
}, 300); // 维持 300ms 以等待前置弹窗动画彻底销毁
  }

  function handleTaskMemory() {
    if (!currentDialogTask) return;
    var task = currentDialogTask;
    closeTaskActionDialog();
    if (typeof openMemoryPanel === 'function') openMemoryPanel(task);
  }

  function handleTaskArchive() {
    var task = currentDialogTask || (typeof currentTask !== 'undefined' ? currentTask : null);
    if (!task) return;
    closeTaskActionDialog();
    db = db.filter(function (t) { return t.id !== task.id; });
    archive.unshift(Object.assign({}, task, { finishDate: new Date().toLocaleDateString() }));
    save();
    if (typeof renderList === 'function') renderList();
    if (typeof renderArchive === 'function') renderArchive();
    if (typeof showToast === 'function') showToast('🏆 已归档');
  }

  window.backToCenter = function () {
    var outer = document.querySelector('.outer-swiper');
    // 👉 修复：从虫洞返回时，必须用 slideToLoop 才能找到真实的 01 区
    if (outer && outer.swiper) outer.swiper.slideToLoop(1);
    var inner = document.querySelector('.inner-swiper');
    if (inner && inner.swiper) inner.swiper.slideTo(1);
  };

// 👉 v8.2 核心升级：上帝视角回正器 (仅校准当前坐标，绝不乱跳)
window.snapCurrentRoom = function() {
  var outer = document.querySelector('.outer-swiper');
  var inner = document.querySelector('.inner-swiper');
  
  // 1. 强制更新物理引擎状态
  if (outer && outer.swiper) outer.swiper.update();
  if (inner && inner.swiper) inner.swiper.update();

  // 2. 读取当前各自停留的坐标，并强制原位对齐 (吸附)
  try {
      if (outer && outer.swiper) {
          outer.swiper.slideTo(outer.swiper.activeIndex, 300);
      }
      if (inner && inner.swiper) {
          inner.swiper.slideTo(inner.swiper.activeIndex, 300);
      }
      // 3. 顺手刷新一下视觉星点
      if (typeof updateAstrolabe === 'function') updateAstrolabe();
  } catch(e) {
      console.warn('星盘回正异常', e);
  }
};


  window.toggleSkipItem = function(playlistId, iIdx, fromCard) {
    if (fromCard === void 0) fromCard = false;
    if (typeof customPlaylists === 'undefined' || !Array.isArray(customPlaylists)) return;
    var pIdx = customPlaylists.findIndex(function (p) { return p && String(p.id) === String(playlistId); });
    if (pIdx < 0 || !customPlaylists[pIdx].items || !customPlaylists[pIdx].items[iIdx]) return;

    var item = customPlaylists[pIdx].items[iIdx];
    item.skipped = !item.skipped;
    if (item.skipped) item.done = false; // 物理互斥

    if (typeof savePlaylists === 'function') savePlaylists();

    var allProcessed = customPlaylists[pIdx].items.every(function (i) { return i && (i.done === true || i.skipped === true); });

    if (allProcessed) {
        // 👉 影子替身法：伪装最后一次打钩触发终局结算，必须传入 isSilentSkip = true！
        item.done = true;
        if (typeof toggleCabinetItem === 'function') {
            // 第5个参数 true 代表静默，绝不记单条足迹
            toggleCabinetItem(pIdx, iIdx, true, fromCard, true); 
        }
        item.done = false; // 瞬间恢复跳过状态
        if (typeof savePlaylists === 'function') savePlaylists();
    } else {
        if (item.skipped && typeof showToast === 'function') showToast("⏭️ 已跳过，本次免做");
        if (typeof renderCabinet === 'function') renderCabinet();
        
        // 👉 核心修复：如果在 01 区卡片浮层上操作，必须进行精准的 DOM 物理涂装！
        if (fromCard) {
            var label = document.querySelector('label[for="plStep_' + iIdx + '"]');
            var cb = document.getElementById('plStep_' + iIdx);
            if (label) {
                if (item.skipped) {
                    label.style.textDecoration = 'line-through';
                    label.style.color = '#ef9a9a';
                    label.style.fontStyle = 'italic';
                    label.style.opacity = '0.8';
                    if (cb) cb.checked = false; // 强制取消打钩
                } else {
                    label.style.textDecoration = 'none';
                    label.style.color = '#555';
                    label.style.fontStyle = 'normal';
                    label.style.opacity = '1';
                }
            }
        }
    }
  };

  window.handleTaskEdit = handleTaskEdit;
  window.openTaskEditorModal = openTaskEditorModal;
  window.closeTaskEditorModal = closeTaskEditorModal;
  window.pickTagForModal = pickTagForModal;
  window.autoTagForModal = autoTagForModal;
  window.toggleModalFlash = toggleModalFlash;
  window.saveTaskFromModal = saveTaskFromModal;
  window.handleTaskComplete = handleTaskComplete;
  window.handleTaskMemory = handleTaskMemory;
  window.handleTaskArchive = handleTaskArchive;
  window.openMemoryPanel = openMemoryPanel;
  window.closeMemoryPanel = closeMemoryPanel;
  window.saveMemoryPanel = saveMemoryPanel;
  window.clearMemoryPanel = clearMemoryPanel;
  window.toggleCardPlaylistItem = toggleCardPlaylistItem;
  window.saveDayStartOffset = saveDayStartOffset;
  window.incrementStat = incrementStat;
  window.handleCandyButtonClick = handleCandyButtonClick;
  window.openCandyEngine = openCandyEngine;
  window.closeCandyEngine = closeCandyEngine;
  window.openHarvestDialogAsync = openHarvestDialogAsync;
  window.openRitual = openRitual;
  window.closeRitual = closeRitual;
  window.completeRitual = completeRitual;
  window.startPlaylist = startPlaylist;
  window.startTrailer = startTrailer;
  window.continueFromTrailer = continueFromTrailer;
  window.finishTrailer = finishTrailer;
  window.cancelTrailer = cancelTrailer;
  window.pickTag = pickTag;
  window.setMode = setMode;

  var currentViewedPosterDay = 1;

  function getPosterHistoryDateStr(dayNum) {
    try {
      var raw = localStorage.getItem(KEY_OPENED_DAYS);
      var arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && dayNum > 0 && dayNum <= arr.length) {
        var dateStr = arr[dayNum - 1];
        var parts = dateStr.split('-').map(Number);
        var y = parts[0], m = parts[1], d = parts[2];
        if (y && m && d) {
          var realDate = new Date(y, m - 1, d);
          return realDate.toDateString();
        }
      }
    } catch (e) {
      console.warn('读取历史日期账本失败，启用兜底算法', e);
    }
    var maxDay = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
    var diffDays = maxDay - dayNum;
    var baseDate = typeof getAnchorDate === 'function' ? getAnchorDate() : new Date();
    baseDate.setDate(baseDate.getDate() - diffDays);
    return baseDate.toDateString();
  }

  function updatePosterDisplay(dayNum) {
    var maxDay = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
    var imgEl = document.getElementById('dailyPosterImg');
    var daySpan = document.getElementById('dailyPosterDayCount');
    var dateEl = document.getElementById('dailyPosterDate');
    var prevBtn = document.querySelector('.poster-prev');
    var nextBtn = document.querySelector('.poster-next');
    if (imgEl && typeof DAILY_POSTER_IMAGES !== 'undefined' && DAILY_POSTER_IMAGES.length > 0) {
      var idx = (dayNum - 1) % DAILY_POSTER_IMAGES.length;
      var imageUrl = DAILY_POSTER_IMAGES[idx];
      var fallbackEl = document.getElementById('dailyPosterFallback');
      imgEl.style.opacity = '0';
      var settled = false;
      var loadTimeout = setTimeout(function () {
        if (!settled) {
          settled = true;
          imgEl.style.opacity = '0';
          imgEl.style.display = 'none';
          if (fallbackEl) fallbackEl.style.display = 'flex';
        }
      }, 5000);
      var finishSuccess = function () {
        if (settled) return;
        settled = true;
        clearTimeout(loadTimeout);
        imgEl.src = imageUrl;
        imgEl.style.display = 'block';
        imgEl.style.opacity = '1';
        if (fallbackEl) fallbackEl.style.display = 'none';
      };
      var finishError = function () {
        if (settled) return;
        settled = true;
        clearTimeout(loadTimeout);
        imgEl.style.opacity = '0';
        imgEl.style.display = 'none';
        if (fallbackEl) fallbackEl.style.display = 'flex';
        // 图片加载失败时，同样需要打破玄关/打卡图死锁
        try {
          var phase = (typeof getCurrentPhase === 'function') ? getCurrentPhase() : 'morning';
          var todayStr = (typeof getTodayDateStr === 'function') ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
          var phaseKey = 'anchor_poster_phase_v67_' + todayStr + '_' + phase;
          if (typeof markPosterPhase === 'function') markPosterPhase(phaseKey);
          if (typeof window.initLobby === 'function') window.initLobby();
        } catch (e) {
          // 安静失败，不影响 fallback 的展示
        }
      };
      var tempImg = new Image();
      tempImg.onload = finishSuccess;
      tempImg.onerror = finishError;
      tempImg.src = imageUrl;
    }
    if (daySpan) daySpan.textContent = dayNum;
    if (dateEl) {
      var historyDateStr = getPosterHistoryDateStr(dayNum);
      var historyDate = new Date(historyDateStr);
      var y = historyDate.getFullYear();
      var m = String(historyDate.getMonth() + 1).padStart(2, '0');
      var d = String(historyDate.getDate()).padStart(2, '0');
      var isToday = (dayNum === maxDay);
      var baseDesc = isToday ? '像一次短暂停靠，看看今天走到了哪里。' : '时光机：这是你过去留下的风景。';
      dateEl.textContent = y + '.' + m + '.' + d + ' | ' + baseDesc;
    }
    if (prevBtn) prevBtn.style.display = (dayNum > 1) ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = (dayNum < maxDay) ? 'flex' : 'none';
    var chkSoul = document.getElementById('chkSoulFlower');
    var inpSoul = document.getElementById('inpSoulFlower');
    if (chkSoul && inpSoul) {
      var historyDateStr2 = getPosterHistoryDateStr(dayNum);
      var globalFlower = null;
      var localFlower = null;
      if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        for (var fi = 0; fi < dailyLog.length; fi++) {
          var l = dailyLog[fi];
          if (l.date === historyDateStr2 && (l.isMilestone === true || l.type === 'milestone' || l.icon === '🌸')) {
            if (l.projectId) {
              if (!localFlower) localFlower = l.title;
            } else {
              if (!globalFlower) globalFlower = l.title;
            }
          }
        }
      }
      var flowerText = globalFlower || localFlower || '';
      var hasFlower = !!(globalFlower || localFlower);
      chkSoul.checked = hasFlower;
      inpSoul.value = flowerText;
      inpSoul.style.display = hasFlower ? 'block' : 'none';
    }
    if (typeof updatePosterPreview === 'function') updatePosterPreview();
  }

  function navigatePoster(delta, event) {
    if (event) event.stopPropagation();
    var maxDay = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
    var target = currentViewedPosterDay + delta;
    if (target < 1) target = 1;
    if (target > maxDay) target = maxDay;
    if (target !== currentViewedPosterDay) {
      currentViewedPosterDay = target;
      updatePosterDisplay(currentViewedPosterDay);
    }
  }

  function getPosterStatsByDay(dayNum) {
    var maxDay = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
    var diffDays = maxDay - dayNum;
    var targetDateStr = getPosterHistoryDateStr(dayNum);
    var count = 0;
    var mins = 0;
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
      var rawLogs = dailyLog.filter(function (log) { return log.date === targetDateStr; });
      var validLogs = typeof dedupeChecklistTwins === 'function' ? dedupeChecklistTwins(rawLogs) : rawLogs;
      validLogs.forEach(function (log) {
        if (log.done !== false && log.title.indexOf('【整体完成】') === -1 && log.title.indexOf('【本次+') === -1) count++;
        if (log.lastAddMinutes && !isNaN(log.lastAddMinutes)) mins += Number(log.lastAddMinutes);
      });
    }
    return { count: count, mins: mins, isToday: diffDays === 0 };
  }

  function openPosterStudio() {
    var dayNum = (typeof currentViewedPosterDay !== 'undefined') ? currentViewedPosterDay : (typeof initOpenedDays === 'function' ? initOpenedDays() : 1);
    var stats = getPosterStatsByDay(dayNum);
    var h = Math.floor(stats.mins / 60);
    var m = stats.mins % 60;
    var timeStr = h > 0 ? (h + 'h ' + m + 'm') : (m + 'm');
    document.getElementById('chkAnchorCount').checked = stats.count > 0;
    document.getElementById('chkFlowTime').checked = stats.mins > 0;
    var studioAnchorNum = document.getElementById('studioAnchorNum');
    var studioFlowNum = document.getElementById('studioFlowNum');
    if (studioAnchorNum) studioAnchorNum.textContent = stats.count;
    if (studioFlowNum) studioFlowNum.textContent = timeStr;
    document.getElementById('posterMainActions').style.display = 'none';
    document.getElementById('posterStudioPanel').style.display = 'flex';
    var saveBtn = document.querySelector('.poster-save-btn');
    if (saveBtn) saveBtn.style.display = 'none';
    if (typeof updatePosterPreview === 'function') updatePosterPreview();
  }

  function closePosterStudio() {
    document.getElementById('posterStudioPanel').style.display = 'none';
    document.getElementById('posterMainActions').style.display = 'flex';
    var saveBtn = document.querySelector('.poster-save-btn');
    if (saveBtn) saveBtn.style.display = 'inline-block';
    var preview = document.getElementById('posterPreviewStats');
    if (preview) preview.style.display = 'none';
  }

  function updatePosterPreview() {
    if (typeof currentViewedPosterDay === 'undefined') return;
    var stats = getPosterStatsByDay(currentViewedPosterDay);
    var dayLabel = stats.isToday ? '今日' : '该日';
    var studioAnchorNum = document.getElementById('studioAnchorNum');
    var studioFlowNum = document.getElementById('studioFlowNum');
    if (studioAnchorNum) {
      studioAnchorNum.textContent = stats.count;
      var textNode = studioAnchorNum.previousSibling;
      if (textNode && textNode.nodeType === 3) {
        textNode.nodeValue = textNode.nodeValue.replace(/今日|该日/, dayLabel);
      }
    }
    if (studioFlowNum) {
      var h = Math.floor(stats.mins / 60);
      var m = stats.mins % 60;
      studioFlowNum.textContent = h > 0 ? (h + 'h ' + m + 'm') : (m + 'm');
    }
    var elCount = document.getElementById('previewAnchorCount');
    var elFlow = document.getElementById('previewFlowTime');
    var elDivider = document.getElementById('previewDivider');
    var container = document.getElementById('posterPreviewStats');
    var chkCount = document.getElementById('chkAnchorCount');
    var chkFlow = document.getElementById('chkFlowTime');
    if (!elCount || !elFlow || !chkCount || !chkFlow) return;
    var h2 = Math.floor(stats.mins / 60);
    var m2 = stats.mins % 60;
    elCount.textContent = '📍 ' + dayLabel + '点亮了 ' + stats.count + ' 个生活锚点';
    elFlow.textContent = '🌊 心流沉浸 ' + (h2 > 0 ? h2 + 'h ' : '') + m2 + 'm';
    elCount.style.display = chkCount.checked ? 'inline' : 'none';
    elFlow.style.display = chkFlow.checked ? 'inline' : 'none';
    if (elDivider) elDivider.style.display = (chkCount.checked && chkFlow.checked) ? 'inline' : 'none';
    if (chkCount.checked || chkFlow.checked) {
      container.style.display = 'flex';
      container.style.animation = 'none';
      void container.offsetWidth;
      container.style.animation = 'tooltipPop 0.3s ease forwards';
    } else {
      container.style.display = 'none';
    }
    var dateEl = document.getElementById('dailyPosterDate');
    var chkSoul = document.getElementById('chkSoulFlower');
    var inpSoul = document.getElementById('inpSoulFlower');
    if (dateEl) {
      var maxDay = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
      var isHistory = typeof currentViewedPosterDay !== 'undefined' && currentViewedPosterDay < maxDay;
      var historyDateStr = getPosterHistoryDateStr(typeof currentViewedPosterDay !== 'undefined' ? currentViewedPosterDay : maxDay);
      var historyDate = new Date(historyDateStr);
      var y = historyDate.getFullYear();
      var m = String(historyDate.getMonth() + 1).padStart(2, '0');
      var d = String(historyDate.getDate()).padStart(2, '0');
      var dateLabel = y + '.' + m + '.' + d;
      var baseDesc = isHistory ? '时光机：这是你过去留下的风景。' : '像一次短暂停靠，看看今天走到了哪里。';
      var globalFlower = null;
      var localFlower = null;
      if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        for (var pi = 0; pi < dailyLog.length; pi++) {
          var pl = dailyLog[pi];
          if (pl.date === historyDateStr && (pl.isMilestone === true || pl.type === 'milestone' || pl.icon === '🌸')) {
            if (pl.projectId) {
              if (!localFlower) localFlower = pl.title;
            } else {
              if (!globalFlower) globalFlower = pl.title;
            }
          }
        }
      }
      var flowerText = (chkSoul && chkSoul.checked && inpSoul && inpSoul.value.trim() !== '') ? inpSoul.value.trim() : (globalFlower || localFlower || baseDesc);
      dateEl.textContent = dateLabel + ' | ' + flowerText;
    }
  }

  function toggleSoulFlowerInput() {
    var chk = document.getElementById('chkSoulFlower');
    var inp = document.getElementById('inpSoulFlower');
    if (chk && inp) {
      inp.style.display = chk.checked ? 'block' : 'none';
      if (chk.checked) inp.focus();
    }
    updatePosterPreview();
  }

  // 👉 What & Why: 找回 v7.1.4 原汁原味的三阶段时间法则
window.getCurrentPhase = function() {
  var h = new Date().getHours();
  if (h >= 4 && h < 12)  return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  return 'night';
};

window.initLobby = function() {
  var lobby = document.getElementById('anchorLobby');
  var greeting = document.getElementById('lobbyGreeting');
  if (!lobby || !greeting) return;

  // 👉 核心修复：防重叠结界！如果打卡图正在场上，玄关绝对不准出来抢戏！
  var posterOverlay = document.getElementById('dailyPosterOverlay');
  if (posterOverlay && (posterOverlay.style.display === 'flex' || posterOverlay.style.display === 'block')) {
      lobby.style.display = 'none';
      return;
  }

  // 👉 v8 修复：从 v7 迁移遗漏的雷达。如果当前有正在进行中的专注任务，玄关绝对不允许弹出！
  if (typeof currentStatus !== 'undefined' && currentStatus === 'anchor') {
    lobby.style.display = 'none';
    return;
  }
  // 👉 v8 修复：双判据 — runBoot 调用 initLobby 早于赋值时，currentStatus 可能尚未同步；直读装甲键防漏网
  try {
    var liveRaw = localStorage.getItem(KEY_LIVE_STATE);
    if (liveRaw) {
      var liveObj = JSON.parse(liveRaw);
      if (liveObj && liveObj.task && liveObj.startTime) {
        lobby.style.display = 'none';
        return;
      }
    }
  } catch (liveErr) {}

  var isNewUser = !localStorage.getItem(typeof ONBOARDING_VISITED_KEY !== 'undefined' ? ONBOARDING_VISITED_KEY : 'anchor_visited_v8_0_spatial');
  var phase = typeof window.getCurrentPhase === 'function' ? window.getCurrentPhase() : 'morning';
  var today = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
  var phaseKey = 'anchor_poster_phase_v67_' + today + '_' + phase;
  var willShowPoster = !localStorage.getItem(phaseKey);

  if (isNewUser || willShowPoster) {
      lobby.style.display = 'none';
      if (!isNewUser && willShowPoster && typeof showDailyPosterIfNeeded === 'function') {
          var openDaysCount = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
          showDailyPosterIfNeeded(openDaysCount);
      }
      return;
  }

  lobby.style.display = 'flex';
  lobby.classList.remove('hidden');
  lobby.classList.remove('lobby-morning', 'lobby-afternoon', 'lobby-night');
  lobby.classList.add('lobby-' + phase);

  if (phase === 'morning') greeting.innerText = '🌅 晨昕已至，要从哪里开始？';
  else if (phase === 'afternoon') greeting.innerText = '⛵️ 渡船时刻，要从哪里开始？';
  else greeting.innerText = '🌙 夜航静谧，要从哪里开始？';
};

window.lobbyEnter = function(action) {
  const lobby = document.getElementById('anchorLobby');
  if (lobby) {
      lobby.style.opacity = '0';
      lobby.style.visibility = 'hidden';
      lobby.style.pointerEvents = 'none';
      lobby.classList.add('hidden');
  }

  setTimeout(() => {
      if (action === 'candy') {
          if (typeof anchorSwiper !== 'undefined') anchorSwiper.slideTo(0);
          if (typeof openCandyEngine === 'function') openCandyEngine();
      } else if (action === 'gacha') {
          if (typeof anchorSwiper !== 'undefined') anchorSwiper.slideTo(1);
      } else if (action === 'input') {
          if (typeof anchorSwiper !== 'undefined') anchorSwiper.slideTo(2);
          const inp = document.getElementById('inpTitle');
          if (inp) setTimeout(() => inp.focus(), 400);
      } else if (action === 'escape') {
          // 👉 核心修复：现在点击后台管理，精准穿梭至 03 区（岁月档案）
          if (typeof anchorSwiper !== 'undefined') anchorSwiper.slideTo(3);
      }
  }, 300);
};

// 👉 终极通电开关
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
      if (typeof window.initLobby === 'function') window.initLobby();
  }, 600); 
});


  function closeDailyPoster(callback) {
    var overlay = document.getElementById('dailyPosterOverlay');
    var card = overlay ? overlay.querySelector('.daily-poster-card') : null;
    if (!overlay || !card) {
      if (overlay) overlay.style.display = 'none';
      if (typeof callback === 'function') callback();
      return;
    }
    var cleanup = function () {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = '';
      card.style.willChange = '';
      card.style.transition = '';
      card.style.transform = '';
      card.style.opacity = '';
      overlay.style.transition = '';
      overlay.style.background = '';
      
      // 👉 v7.1.3 经典原版灵魂：关闭打卡图时，直接让玄关也“逃跑（隐身）”
      // 👉 护盾：如果是新手引导期间，关闭日签绝对不触发玄关退场
const isObActive = (typeof obCurrentState !== 'undefined' && obCurrentState !== 'idle' && obCurrentState !== 'done');
if (typeof lobbyEnter === 'function' && !isObActive) {
    lobbyEnter('escape');
}
      
      if (typeof callback === 'function') callback();
    };
    var targetBtn = document.getElementById('btnDailyPoster');
    var cardRect = card.getBoundingClientRect();
    var targetX = window.innerWidth - 50;
    var targetY = 20;
    if (targetBtn) {
      var r = targetBtn.getBoundingClientRect();
      targetX = r.left + r.width / 2;
      targetY = r.top + r.height / 2;
    }
    var dx = targetX - (cardRect.left + cardRect.width / 2);
    var dy = targetY - (cardRect.top + cardRect.height / 2);
    overlay.style.pointerEvents = 'none';
    card.style.willChange = 'transform, opacity';
    requestAnimationFrame(function () {
      overlay.style.transition = 'background 0.22s ease';
      overlay.style.background = 'rgba(0,0,0,0)';
      card.style.transition = 'transform 0.22s ease-in, opacity 0.22s ease';
      card.style.transform = 'scale(0.35)';
      card.style.opacity = '0.8';
    });
    setTimeout(function () {
      requestAnimationFrame(function () {
        card.style.transition = 'transform 0.38s cubic-bezier(0.4, 0, 0.15, 1), opacity 0.32s ease-out';
        card.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.03)';
        card.style.opacity = '0';
      });
    }, 210);
    setTimeout(function () { cleanup(); }, 620);
  }

  function dailyPosterEatCandy() { 
    closeDailyPoster(function () { 
        // 👉 What & Why: v8.1 空间导航适配。海报收起后，呼叫十字引擎直达 00 区静室，再剥开糖纸。
        if (typeof anchorSwiper !== 'undefined') anchorSwiper.slideTo(0);
        if (typeof openCandyEngine === 'function') openCandyEngine(); 
    }); 
}

function dailyPosterSkipToGacha() { 
    closeDailyPoster(function () { 
        // 👉 What & Why: v8.1 空间导航适配。海报收起后，将电梯平稳降落至 01 区主舞台。
        if (typeof anchorSwiper !== 'undefined') {
            anchorSwiper.slideTo(1);
        } else if (typeof window.backToCenter === 'function') {
            window.backToCenter();
        }
        var candySec = document.getElementById('candySection'); 
        if (candySec) candySec.style.display = 'none';
        restoreSoulFlowerZone(); 
    }); 
}

  function saveDailyPoster() {
    var chkSoul = document.getElementById('chkSoulFlower');
    var inpSoul = document.getElementById('inpSoulFlower');
    if (chkSoul && chkSoul.checked && inpSoul && inpSoul.value.trim() !== '') {
      var flowerText = inpSoul.value.trim();
      var targetDateStr;
      if (typeof currentViewedPosterDay !== 'undefined') {
        targetDateStr = getPosterHistoryDateStr(currentViewedPosterDay);
      } else {
        targetDateStr = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toDateString();
      }
      var existingIdx = -1;
      if (Array.isArray(dailyLog)) {
        for (var i = 0; i < dailyLog.length; i++) {
          var l = dailyLog[i];
          // 🚨 核心拦截：日签只能认领并覆盖【全局一朵花】
          if (l.date === targetDateStr && (l.isMilestone === true || l.type === 'milestone' || l.icon === '🌸') && !l.projectId) {
              existingIdx = i;
              break;
          }
      }
      }
      if (existingIdx > -1) {
        dailyLog[existingIdx].title = flowerText;
      } else {
        var now = new Date();
        var hh = now.getHours();
        var mm = now.getMinutes();
        dailyLog.unshift({
          id: Date.now(),
          title: flowerText,
          type: 'milestone',
          icon: '🌸',
          isMilestone: true,
          date: targetDateStr,
          timeStr: (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm
        });
      }
      if (typeof save === 'function') save();
      if (typeof renderLog === 'function') renderLog();
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof renderHeatmap === 'function') renderHeatmap();
      if (typeof currentViewedPosterDay !== 'undefined' && typeof updatePosterDisplay === 'function') {
        updatePosterDisplay(currentViewedPosterDay);
      }
    }
    var imgEl = document.getElementById('dailyPosterImg');
    var daySpan = document.getElementById('dailyPosterDayCount');
    var dateEl = document.getElementById('dailyPosterDate');
    if (!imgEl || !imgEl.naturalWidth) {
      if (typeof showToast === 'function') showToast('图片还没加载好，稍等再试~');
      return;
    }
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var w = imgEl.naturalWidth;
    var h = imgEl.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(imgEl, 0, 0, w, h);
    var gradH = h * 0.25;
    var grad = ctx.createLinearGradient(0, h - gradH, 0, h);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - gradH, w, gradH);
    var caller = (typeof currentUsername !== 'undefined' && currentUsername && currentUsername !== 'Anchor') ? currentUsername : '你';
    var dayText = daySpan ? '这是 ' + caller + ' 和 Anchor 的第 ' + daySpan.textContent.trim() + ' 天' : '';
    var maxDaySub = typeof initOpenedDays === 'function' ? initOpenedDays() : 1;
    var dayNumSub = typeof currentViewedPosterDay !== 'undefined' ? currentViewedPosterDay : maxDaySub;
    var targetDateStrSub = getPosterHistoryDateStr(dayNumSub);
    var isHistorySub = dayNumSub < maxDaySub;
    var baseDescSub = isHistorySub ? '时光机：这是你过去留下的风景。' : '像一次短暂停靠，看看今天走到了哪里。';
    var globalFlowerSub = null;
    var localFlowerSub = null;
    if (typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
      for (var si = 0; si < dailyLog.length; si++) {
        var sl = dailyLog[si];
        if (sl.date === targetDateStrSub && (sl.isMilestone === true || sl.type === 'milestone' || sl.icon === '🌸')) {
          if (sl.projectId) {
            if (!localFlowerSub) localFlowerSub = sl.title;
          } else {
            if (!globalFlowerSub) globalFlowerSub = sl.title;
          }
        }
      }
    }
    var chkSoulSub = document.getElementById('chkSoulFlower');
    var inpSoulSub = document.getElementById('inpSoulFlower');
    var flowerTextSub = (chkSoulSub && chkSoulSub.checked && inpSoulSub && inpSoulSub.value.trim() !== '') ? inpSoulSub.value.trim() : (globalFlowerSub || localFlowerSub || baseDescSub);
    var historyDateSub = new Date(targetDateStrSub);
    var ySub = historyDateSub.getFullYear();
    var mSub = String(historyDateSub.getMonth() + 1).padStart(2, '0');
    var dSub = String(historyDateSub.getDate()).padStart(2, '0');
    var subText = ySub + '.' + mSub + '.' + dSub + ' | ' + flowerTextSub;
    var chkCount = document.getElementById('chkAnchorCount') && document.getElementById('chkAnchorCount').checked;
    var chkFlow = document.getElementById('chkFlowTime') && document.getElementById('chkFlowTime').checked;
    var elCount = document.getElementById('previewAnchorCount');
    var elFlow = document.getElementById('previewFlowTime');
    var padX = w * 0.05;
    var currentY = h - (w * 0.05);
    var subFontSize = Math.round(w * 0.024);
    ctx.font = subFontSize + 'px -apple-system, "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(subText, padX, currentY);
    currentY -= (subFontSize + w * 0.022);
    var statsTexts = [];
    if (chkFlow && elFlow && elFlow.textContent) statsTexts.push(elFlow.textContent);
    if (chkCount && elCount && elCount.textContent) statsTexts.push(elCount.textContent);
    if (statsTexts.length > 0) {
      var statFontSize = Math.round(w * 0.028);
      ctx.font = statFontSize + 'px -apple-system, "Helvetica Neue", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(statsTexts.join('  |  '), padX, currentY);
      currentY -= (statFontSize + w * 0.018);
    }
    currentY -= w * 0.005;
    var dayFontSize = Math.round(w * 0.038);
    ctx.font = 'bold ' + dayFontSize + 'px -apple-system, "Helvetica Neue", Arial, sans-serif';
    var titleWidth = ctx.measureText(dayText).width;
    ctx.beginPath();
    ctx.moveTo(padX, currentY);
    ctx.lineTo(padX + titleWidth, currentY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    currentY -= (w * 0.02);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(dayText, padX, currentY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    var pad = w * 0.02;
    var wmSize = Math.round(w * 0.022);
    ctx.font = wmSize + 'px -apple-system, "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Anchor ⚓️', w - pad, h - pad);

    ctx.textAlign = 'left';
    try {
      var dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      var todayStr = typeof getTodayDateStr === 'function' ? getTodayDateStr() : new Date().toISOString().slice(0, 10);
      var fileName = 'Anchor_' + todayStr + '.jpg';
      var link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        var darkRoom = document.createElement('div');
// 👉 核心修复：赋予暗房最高层级 99999 !important，彻底摆脱一切遮挡
darkRoom.style.cssText = 'position:fixed;inset:0;background:#111;z-index:99999 !important;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;';

// 👉 UX 优化：生成暗房的同时，静默关闭底层的日签弹窗和定制室
var overlay = document.getElementById('dailyPosterOverlay');
if (overlay) overlay.style.display = 'none';
if (typeof closePosterStudio === 'function') closePosterStudio();
       // 👉 v8.1 核心修复：升级为原生 button 演员，赋予绝对触控权限
       var closeBtn = document.createElement('button');
       closeBtn.innerHTML = '❮ 返回';
       closeBtn.style.cssText = 'position:absolute;top:max(20px, env(safe-area-inset-top));left:20px;padding:8px 16px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:99px;color:#fff;font-size:14px;border:1px solid rgba(255,255,255,0.2);cursor:pointer; z-index:100000 !important; pointer-events:auto;';
       
       // 👉 双重物理绑定：同时监听点击与手指抬起，绝对阻断底层的防滑动结界
       var closeAction = function (e) {
         if (e) { e.preventDefault(); e.stopPropagation(); }
         if (document.body.contains(darkRoom)) document.body.removeChild(darkRoom);
       };
       closeBtn.onclick = closeAction;
       closeBtn.ontouchend = closeAction;
        var imgEl2 = document.createElement('img');
        imgEl2.src = dataUrl;
        imgEl2.style.cssText = 'max-width:90%;max-height:80vh;object-fit:contain;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.5);';
        var hint = document.createElement('p');
        hint.innerText = '长按图片即可保存 📥';
        hint.style.cssText = 'margin-top:24px;font-size:14px;color:rgba(255,255,255,0.6);letter-spacing:1px;';
        darkRoom.appendChild(closeBtn);
        darkRoom.appendChild(imgEl2);
        darkRoom.appendChild(hint);
        document.body.appendChild(darkRoom);
        if (typeof showToast === 'function') showToast('📥 长按图片保存到相册');
      } else {
        link.click();
        if (typeof showToast === 'function') showToast('📥 海报已保存');
      }
    } catch (e) {
      console.warn('海报合成失败:', e);
      if (typeof showToast === 'function') showToast('保存失败，可能是图片加载异常');
    }
  }

  // 👉 唤醒日签暗房（代替原本的空壳提示）
  window.openDailyPosterManual = function () {
    var overlay = document.getElementById('dailyPosterOverlay');
    if (!overlay) {
      if (typeof showToast === 'function') showToast('日签模块 HTML 缺失，请检查 DOM。');
      return;
    }
    var daySpan = document.getElementById('dailyPosterDayCount');
    if (daySpan) {
      var openDaysCount = (typeof initOpenedDays === 'function') ? initOpenedDays() : 1;
      daySpan.textContent = openDaysCount;
      if (typeof currentViewedPosterDay !== 'undefined') {
        currentViewedPosterDay = openDaysCount;
        if (typeof updatePosterDisplay === 'function') updatePosterDisplay(currentViewedPosterDay);
      }
    }
    var unameEl = document.getElementById('dailyPosterUname');
    if (unameEl) {
      unameEl.textContent = (typeof currentUsername !== 'undefined' && currentUsername && currentUsername !== 'Anchor') ? currentUsername : '你';
    }
    overlay.style.display = 'flex';
  };
  window.navigatePoster = navigatePoster;
  window.closeDailyPoster = closeDailyPoster;
  window.dailyPosterEatCandy = dailyPosterEatCandy;
  window.dailyPosterSkipToGacha = dailyPosterSkipToGacha;
  window.openPosterStudio = openPosterStudio;
  window.closePosterStudio = closePosterStudio;
  window.saveDailyPoster = saveDailyPoster;
  window.updatePosterPreview = updatePosterPreview;
  window.toggleSoulFlowerInput = toggleSoulFlowerInput;
  window.exportToFile = exportToFile;
  window.triggerImport = triggerImport;
  window.importFromFile = importFromFile;
  window.copyToClip = copyToClip;
  window.executeImport = executeImport;
  window.confirmBackupAction = confirmBackupAction;
  window.tryResetAll = tryResetAll;
  window.syncToCloud = syncToCloud;
  window.fetchFromCloud = fetchFromCloud;
  window.submitFeedbackToNAS = submitFeedbackToNAS;
  window.saveUsername = saveUsername;
  // v8.0 历史记忆与时空修正专属神经连通
  window.resurrectHistoryTask = resurrectHistoryTask;
  window.editHistoryTime = editHistoryTime;
  window.confirmEditHistoryTime = confirmEditHistoryTime;
  window.editHistoryMemory = editHistoryMemory;
  window.confirmEditHistoryMemory = confirmEditHistoryMemory;
  // 👉 v8.X T0抢险：修复任务微面板按钮在全局作用域下找不到函数的 Bug
window.handleTaskEdit = typeof handleTaskEdit !== 'undefined' ? handleTaskEdit : null;
window.handleTaskMemory = typeof handleTaskMemory !== 'undefined' ? handleTaskMemory : null;
window.handleTaskComplete = typeof handleTaskComplete !== 'undefined' ? handleTaskComplete : null;
window.handleTaskArchive = typeof handleTaskArchive !== 'undefined' ? handleTaskArchive : null;
window.closeTaskActionDialog = typeof closeTaskActionDialog !== 'undefined' ? closeTaskActionDialog : null;
window.openTaskEditorModal = typeof openTaskEditorModal !== 'undefined' ? openTaskEditorModal : null;
window.closeTaskEditorModal = typeof closeTaskEditorModal !== 'undefined' ? closeTaskEditorModal : null;
window.pickTagForModal = typeof pickTagForModal !== 'undefined' ? pickTagForModal : null;
window.autoTagForModal = typeof autoTagForModal !== 'undefined' ? autoTagForModal : null;
window.toggleModalFlash = typeof toggleModalFlash !== 'undefined' ? toggleModalFlash : null;
window.saveTaskFromModal = typeof saveTaskFromModal !== 'undefined' ? saveTaskFromModal : null;
// 👉 v8.X T1.3 专属岁月长卷：控制折叠面板的魔法钥匙
window.toggleTaskHistoryScroll = function() {
  const zone = document.getElementById('taskHistoryScrollZone');
  const btn = document.getElementById('taskHistoryToggleBtn');
  if (!zone || !btn) return;
  
  if (zone.style.display === 'none') {
      zone.style.display = 'block';
      btn.innerText = '︿ 收起专属岁月长卷';
  } else {
      zone.style.display = 'none';
      btn.innerText = '﹀ 展开专属岁月长卷';
  }
};

  function manualCompleteFromList(id) {
    var task = (typeof currentTask !== 'undefined' && currentTask && currentTask.id === id) ? currentTask : db.filter(function (t) { return t.id === id; })[0];
    if (!task || (task.inColdStorage === true)) return;
    var msg = task.type === 'culture' ? '「' + (task.title || '') + '」今天有看/读/追一点吗？' : '要对「' + (task.title || '') + '」做什么操作？';
    if (typeof showTaskActionDialog === 'function') showTaskActionDialog(task, msg);
  }

  var currentMemoryTask = null;
  var memoryOriginalState = {};

  function openMemoryPanel(task) {
    if (!task) task = typeof currentTask !== 'undefined' ? currentTask : null;

    // 👉 核心修复：防止静默失效，如果找不到任务，必须弹窗告知原因！
    if (!task) {
      console.warn('Memory Panel: No task found.');
      if (typeof showToast === 'function') showToast('⚠️ 当前没有可记录状态的任务');
      return;
    }

    currentMemoryTask = task;
    memoryOriginalState = {
      bookmarkText: task.bookmarkText || '',
      bookmarkTotal: task.bookmarkTotal || '',
      totalMinutes: task.totalMinutes || 0,
      noteText: task.noteText || ''
    };

    var panel = document.getElementById('memoryPanel');
    if (!panel) {
      if (typeof showToast === 'function') showToast('⚠️ 系统组件丢失：找不到记忆面板');
      return;
    }

    // 强制提权，刺穿所有暗场和遮罩
    panel.style.zIndex = '20000';

    // 安全获取所有输入框
    var bookmarkInput = document.getElementById('memoryBookmark');
    var totalInput = document.getElementById('memoryTotal');
    var hoursSelect = document.getElementById('memoryHours');
    var minutesSelect = document.getElementById('memoryMinutes');
    var noteTextarea = document.getElementById('memoryNote');
    var clearBtn = document.getElementById('memoryBtnClear');

    if (bookmarkInput) bookmarkInput.value = task.bookmarkText || '';
    if (totalInput) totalInput.value = task.bookmarkTotal || '';
    if (noteTextarea) noteTextarea.value = task.noteText || '';

    var hhmm = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
    var tStart = document.getElementById('memoryTimeStart');
    var tEnd = document.getElementById('memoryTimeEnd');
    if (tStart) tStart.value = hhmm;
    if (tEnd) tEnd.value = hhmm;
    if (hoursSelect) {
      hoursSelect.innerHTML = '';
      for (var h = 0; h <= 23; h++) hoursSelect.appendChild(new Option(h + 'h', h));
    }
    if (minutesSelect) {
      minutesSelect.innerHTML = '';
      [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].forEach(function (m) {
        minutesSelect.appendChild(new Option(String(m).padStart(2, '0'), m));
      });
    }
    if (hoursSelect) hoursSelect.value = '0';
    if (minutesSelect) minutesSelect.value = '0';
    var isCurrentlyTicking = typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof currentTask !== 'undefined' && currentTask && currentTask.id === task.id;
    if (hoursSelect) hoursSelect.disabled = isCurrentlyTicking;
    if (minutesSelect) minutesSelect.disabled = isCurrentlyTicking;
    // 修复：连同时段输入框一起物理锁死，防止专注期间篡改
    var timeStartInp = document.getElementById('memoryTimeStart');
    var timeEndInp = document.getElementById('memoryTimeEnd');
    if (timeStartInp) timeStartInp.disabled = isCurrentlyTicking;
    if (timeEndInp) timeEndInp.disabled = isCurrentlyTicking;
    var lockHint = document.getElementById('memoryTimeLockHint');
    if (lockHint) lockHint.style.display = isCurrentlyTicking ? 'inline-block' : 'none';
    if (clearBtn) clearBtn.style.display = ((task.bookmarkText && task.bookmarkText.trim()) || (task.noteText && task.noteText.trim())) ? 'block' : 'none';
    panel.style.display = 'flex';
  }

  function closeMemoryPanel() {
    var panel = document.getElementById('memoryPanel');
    if (panel) panel.style.display = 'none';
    currentMemoryTask = null;
    memoryOriginalState = {};
  }

  function saveMemoryPanel() {
    if (!currentMemoryTask) return;
    var bookmarkInput = document.getElementById('memoryBookmark');
    var totalInput = document.getElementById('memoryTotal');
    var hoursSelect = document.getElementById('memoryHours');
    var minutesSelect = document.getElementById('memoryMinutes');
    var noteTextarea = document.getElementById('memoryNote');
    if (!bookmarkInput || !hoursSelect || !minutesSelect || !noteTextarea) return;
    var task = db.find(function (t) { return t.id === currentMemoryTask.id; }) || currentMemoryTask;
    var newBookmark = bookmarkInput.value.trim();
    var newTotal = totalInput ? totalInput.value.trim() : '';
    var newNote = noteTextarea.value.trim();
    task.bookmarkText = newBookmark;
    task.bookmarkTotal = newTotal;
    task.noteText = newNote;
    var hours = parseInt(hoursSelect.value, 10) || 0;
    var minutes = parseInt(minutesSelect.value, 10) || 0;
    var addMinutes = hours * 60 + minutes;
    var panelLinkedAddForProject = 0;
    if (addMinutes > 0) {
      task.totalMinutes = (task.totalMinutes || 0) + addMinutes;

      // 👉 第一把刀：补录时长须计入项目 linkedTotalMinutes（排除清单子任务；仅 playlistType === 'project'）
      var isSubtaskForProject = task.isPlaylist === true || task.type === 'playlist';
      if (task.projectId && !isSubtaskForProject) {
        panelLinkedAddForProject = addMinutes;
      }

      var isTicking = typeof currentStatus !== 'undefined' && currentStatus === 'anchor' && typeof currentTask !== 'undefined' && currentTask && currentTask.id === task.id;
      if (!isTicking && typeof dailyLog !== 'undefined' && Array.isArray(dailyLog)) {
        var tStart = document.getElementById('memoryTimeStart');
        var tEnd = document.getElementById('memoryTimeEnd');
        var timeStr = tStart && tEnd && tStart.value && tEnd.value ? tStart.value + ' - ' + tEnd.value : new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
        dailyLog.unshift({
          id: Date.now(),
          title: '[补录] ' + task.title,
          icon: task.icon || (typeof getSmartIcon === 'function' ? getSmartIcon(task) : '📝'),
          timeStr: timeStr,
          date: getAnchorDate().toDateString(),
          done: true,
          taskId: task.id,
          lastAddMinutes: addMinutes,
          // 👉 v8.1 补回：带上书签与备注快照
          bookmarkSnapshot: newBookmark,
          targetProgressSnapshot: newTotal,
          noteSnapshot: newNote
      });
        if (typeof sortDailyLogByTime === 'function') sortDailyLogByTime();
        // v7.1.4 补丁：补录时长时，同步更新周期任务的打卡钢印与计数
if (task.recurrence && ['daily', 'weekly', 'monthly'].includes(task.recurrence)) {
  task.lastDone = getAnchorDate().toDateString();
  task.completeCount = (task.completeCount || 0) + 1;
  // 穿透回主数据库更新真实躯体
  var updateIdx = db.findIndex(function(t) { return t.id === task.id; });
  if (updateIdx > -1) {
      db[updateIdx].lastDone = task.lastDone;
      db[updateIdx].completeCount = task.completeCount;
  }
}

      }
    }
    save();

    // 👉 v8.X 核心修复：智能寻根引擎。不论是单次任务还是子任务，都能准确找到最终的项目归属
    var isSubtask = currentMemoryTask && (currentMemoryTask.isPlaylist === true || currentMemoryTask.type === 'playlist');
    var targetProjectId = task.projectId; // 默认：普通任务直接从身上取 projectId

    // 如果是子任务，去档案柜找它的“父级清单”，看父级清单绑了哪个项目
    if (isSubtask && typeof customPlaylists !== 'undefined' && typeof activePlaylist !== 'undefined' && activePlaylist) {
      var parentPl = customPlaylists.find(function(p) { return p && String(p.id) === String(activePlaylist.id); });
      if (parentPl && parentPl.projectId) {
        targetProjectId = parentPl.projectId;
      }
    }

    // 👉 统一向上汇报手动补录的时间
    if (typeof panelLinkedAddForProject !== 'undefined' && panelLinkedAddForProject > 0 && targetProjectId && typeof customPlaylists !== 'undefined') {
      var pIdxMem = customPlaylists.findIndex(function (p) {
        return p && p.playlistType === 'project' && String(p.id) === String(targetProjectId);
      });
      if (pIdxMem > -1) {
        customPlaylists[pIdxMem].linkedTotalMinutes = Math.max(0, (customPlaylists[pIdxMem].linkedTotalMinutes || 0) + panelLinkedAddForProject);
        if (typeof savePlaylists === 'function') savePlaylists();
        if (typeof renderCabinet === 'function') renderCabinet();
      }
    }

    // 👉 核心修复：双通道 UI 实时同步与 ING 状态继承
    var isCurrentMatch = false;
    if (isSubtask) {
      isCurrentMatch = (typeof currentTask !== 'undefined' && currentTask && currentTask.isPlaylist && (currentTask.rawTaskText === task.text || currentTask.rawTaskText === task.title));
    } else {
      isCurrentMatch = (typeof currentTask !== 'undefined' && currentTask && currentTask.id === task.id);
    }

    if (isCurrentMatch) {
      currentTask = task; // 同步最新内存

      // 1. 记忆当前是否处于 ING 专注状态
      var wasAnchor = (typeof currentStatus !== 'undefined' && currentStatus === 'anchor');

      // 2. 强制重绘卡片（长出进度条）
      if (typeof renderResultCard === 'function') {
        renderResultCard(currentTask);
      }

      // 3. 状态强锁：如果刚才正在专注中，强制呼叫底层定锚函数！
      // 传入 true (keepTime) 代表时间动能继承，恢复时钟动画与秒表！
      if (wasAnchor && typeof setCardAsAnchor === 'function') {
        setCardAsAnchor(true);
      }
    }

    if (typeof renderList === 'function') renderList();
     // 👉 亲自补丁 1：如果这个任务属于某个项目，补录记忆后强制刷新大展厅！
     if (task.projectId && typeof window.renderProjectConsoleInner === 'function') {
      window.renderProjectConsoleInner(task.projectId);
  }
    if (typeof showToast === 'function') showToast('✅ 记忆与足迹已安全保存');

    // 👉 v7.1.2 核心：后台修改差值触发满格自动杀青 (独立防御版)
    const currentProgMem = (task.bookmarkText || '').trim();
    const targetProgMem = (task.bookmarkTotal || '').trim();
    const isProgressFullMem = currentProgMem && targetProgMem && currentProgMem === targetProgMem;
    const progressChanged = (currentProgMem !== memoryOriginalState.bookmarkText);

    if (isProgressFullMem && progressChanged) {
      const tempNow = new Date();
      const killTimeStr = tempNow.getHours().toString().padStart(2, '0') + ":" + tempNow.getMinutes().toString().padStart(2, '0');
      const anchorDateStr = (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toDateString();

      dailyLog.unshift({
        id: Date.now(),
        title: task.title,
        icon: '🏆',
        timeStr: killTimeStr,
        date: anchorDateStr,
        done: true,
        taskId: task.id,
        bookmarkSnapshot: currentProgMem + ' / ' + targetProgMem,
        noteSnapshot: task.noteText || '',
        lastAddMinutes: 0
      });

      if (typeof db !== 'undefined') db = db.filter(t => t.id !== task.id);
      if (typeof archive !== 'undefined') {
        archive.unshift({
          ...task,
          finishDate: (typeof getAnchorDate === 'function' ? getAnchorDate() : new Date()).toLocaleDateString()
        });
      }

      if (typeof spawnQuietConfetti === 'function') spawnQuietConfetti();
      if (typeof showToast === 'function') showToast("🏆 目标达成！伟大里程碑已自动归档");

      const isCurrentTarget = (typeof currentTask !== 'undefined' && currentTask && currentTask.id === task.id);
      if (isCurrentTarget) {
        const rCard = document.getElementById('resultCard');
        if (rCard) rCard.style.display = 'none';
        if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
        if (typeof anchorStartTime !== 'undefined') anchorStartTime = null;
        try { localStorage.removeItem(typeof KEY_LIVE_STATE !== 'undefined' ? KEY_LIVE_STATE : 'anchor_live_state'); } catch(e){}
        if (typeof liveTimerId !== 'undefined' && liveTimerId) clearInterval(liveTimerId);
        currentTask = null;
      }

      if (typeof save === 'function') save();
      if (typeof renderLog === 'function') renderLog();
      if (typeof renderHistory === 'function') renderHistory();
      if (typeof renderList === 'function') renderList();
      if (typeof renderArchive === 'function') renderArchive();
      if (typeof renderHeatmap === 'function') renderHeatmap();
    }

    closeMemoryPanel();
    if (typeof renderList === 'function') renderList();
    if (typeof renderLog === 'function') renderLog();
    if (typeof renderHistory === 'function') renderHistory(); // 刷新历史记录
      if (typeof renderHeatmap === 'function') renderHeatmap(); // 刷新热力图
      if (typeof renderArchive === 'function') renderArchive(); // 刷新荣誉殿堂
  }

  function clearMemoryPanel() {
    var bookmarkInput = document.getElementById('memoryBookmark');
    var totalInput = document.getElementById('memoryTotal');
    var noteTextarea = document.getElementById('memoryNote');
    if (bookmarkInput) bookmarkInput.value = '';
    if (totalInput) totalInput.value = '';
    if (noteTextarea) noteTextarea.value = '';
  }

  function loadAndRenderPlaylists() {
    var raw = localStorage.getItem('anchor_custom_playlists') || '';
    var list = [];
    if (raw.trim().indexOf('#') === 0 || (raw.trim() && raw.trim().indexOf('[') !== 0)) {
      var lines = raw.split('\n');
      var currentList = null;
      lines.forEach(function (line) {
        line = line.trim();
        if (!line) return;
        if (line.indexOf('#') === 0) {
          var name = line.substring(1).trim();
          if (name) {
            currentList = { id: 'pl_' + Date.now() + Math.random(), name: name, tasks: [] };
            list.push(currentList);
          }
        } else if (currentList) {
          currentList.tasks.push(line);
        }
      });
      try { localStorage.setItem('anchor_custom_playlists', JSON.stringify(list)); } catch (e) {}
      customPlaylists = list;
    } else if (raw) {
      try { customPlaylists = JSON.parse(raw); } catch (e) { customPlaylists = []; }
    } else {
      customPlaylists = [];
    }
    var zone = document.getElementById('playlistsEditorZone');
    if (zone && typeof renderPlaylistEditor === 'function') renderPlaylistEditor();
    if (typeof renderPlaylistDropdown === 'function') renderPlaylistDropdown();
  }

  function restoreLiveState() {
    try {
      var savedState = localStorage.getItem(KEY_LIVE_STATE);
      if (!savedState) return;
      var parsed = JSON.parse(savedState);
      if (!parsed.task || !parsed.startTime) return;
      currentTask = parsed.task;
      anchorStartTime = parsed.startTime;
      if (parsed.activePl) activePlaylist = parsed.activePl;
      var ph = document.getElementById('placeholder');
      if (ph) ph.style.display = 'none';
      if (typeof renderResultCard === 'function') renderResultCard(currentTask);
      currentStatus = 'anchor';
      // 👉 v8 修复：装甲恢复卡片后，强制命令玄关撤退，防止时序冲突导致遮挡
      var lobbyDismissIng = document.getElementById('anchorLobby');
      if (typeof window.lobbyEnter === 'function') {
        window.lobbyEnter('escape');
      } else if (lobbyDismissIng) {
        lobbyDismissIng.style.display = 'none';
        lobbyDismissIng.style.opacity = '0';
        lobbyDismissIng.style.pointerEvents = 'none';
        lobbyDismissIng.classList.add('hidden');
      }
      if (lobbyDismissIng) lobbyDismissIng.style.display = 'none';
      if (currentTask.type === 'playlist' && !currentTask.isPlaylist && typeof openPlaylistOverlay === 'function') {
        setTimeout(function () { openPlaylistOverlay(currentTask); }, 300);
      }
      var statusEl = document.getElementById('rStatus');
      var primaryBtn = document.getElementById('btnPrimary');
      var ingEl = document.getElementById('rIngPulse');
      var resultCard = document.getElementById('resultCard');
      var btnChange = document.getElementById('btnChange');
      if (statusEl) statusEl.style.display = 'block';
      if (ingEl) ingEl.style.display = 'block';
      if (primaryBtn) primaryBtn.innerText = '已完成';
      if (resultCard) resultCard.style.display = 'block';
      if (btnChange) btnChange.style.display = 'inline-block';
      if (typeof startLiveTimer === 'function') startLiveTimer();
    } catch (e) {}
  }

  function openPlaylistOverlay(playlistTask) {
    if (!playlistTask) return;
    var overlay = document.getElementById('playlistOverlay');
    var titleEl = document.getElementById('plOverlayTitle');
    var stepsUl = document.getElementById('plOverlaySteps');
    if (!overlay || !titleEl || !stepsUl) return;
    var targetPl = playlistTask;
    if (playlistTask.id && typeof customPlaylists !== 'undefined') {
      var found = customPlaylists.filter(function (p) { return p && String(p.id) === String(playlistTask.id); })[0];
      if (found) targetPl = found;
    }
    // 👉 请在这中间，插入这两行更新 Emoji 的代码
  var iconEl = overlay.querySelector('.card-icon') || document.getElementById('plOverlayIcon');
  if (iconEl) iconEl.textContent = targetPl.icon || '📑';
    titleEl.textContent = targetPl.title || targetPl.name || '清单';
    stepsUl.innerHTML = '';
    var tasks = (targetPl.tasks || []).slice();
    if (typeof getPlaylistTaskTexts === 'function') tasks = getPlaylistTaskTexts(targetPl) || tasks;
    tasks.forEach(function (t, i) {
      var li = document.createElement('li');
      li.style.cssText = 'display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; font-size:0.9rem;';
      var isDone = (targetPl.items && targetPl.items[i] && targetPl.items[i].done) === true;
      var isSkipped = (targetPl.items && targetPl.items[i] && targetPl.items[i].skipped) === true;
      var checkedAttr = isDone ? 'checked' : '';
      var textStyle = 'color:#555;';
      if (isDone) textStyle = 'text-decoration:line-through; color:#aaa;';
      else if (isSkipped) textStyle = 'text-decoration:line-through; color:#ef9a9a; font-style:italic; opacity:0.8;';
      var safeText = (t || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      li.innerHTML =
        '<input type="checkbox" class="pl-step-checkbox" id="plStep_' + i + '" data-task="' + safeText + '" ' +
        checkedAttr +
        ' onchange="toggleCardPlaylistItem(\'' + String(targetPl.id) + '\',' + i + ', this.checked)"' +
        ' style="margin-top:4px; width:16px; height:16px;">' +
        '<label for="plStep_' + i + '" style="cursor:pointer; flex:1; line-height:1.4;' + textStyle + '">' + (t || '') + '</label>' +
        '<span onclick="toggleSkipItem(\'' + String(targetPl.id) + '\',' + i + ', true)" style="display:inline-block; cursor:pointer; font-size:0.7rem; color:#999; background:rgba(0,0,0,0.04); padding:2px 8px; border-radius:999px; margin-left:4px; letter-spacing:0.5px; transition:all 0.2s;" onmouseover="this.style.background=\'rgba(0,0,0,0.08)\'" onmouseout="this.style.background=\'rgba(0,0,0,0.04)\'" title="不需要/跳过">⏭️ 跳过</span>';
      stepsUl.appendChild(li);
    });
    overlay.style.display = 'flex';
    try { localStorage.setItem('anchor_last_playlist_overlay', String(targetPl.id)); } catch (e) {}
  }

  window.handlePlaylistChange = function() {
    var sel = document.getElementById('selPlaylist');
    var btn = document.getElementById('mainBtn');
    if (sel && sel.value) {
        if (btn) {
            var targetPl = null;
            if (typeof customPlaylists !== 'undefined') {
                targetPl = customPlaylists.find(function(p) { return String(p.id) === String(sel.value); });
            }
            var isProj = targetPl && targetPl.playlistType === 'project';
            
            btn.innerText = isProj ? '🚀 开启专属项目' : '📂 开启专属清单';
            
            // 👉 恢复高级审美：统一薄荷绿底色，强制纯白字体！
            btn.style.background = '#A0E7E5'; 
            btn.style.color = '#ffffff';
        }
    } else {
        // 清理内联样式，让按钮恢复 CSS 中默认的渐变色和纯白字体
        if (btn) {
            btn.style.background = '';
            btn.style.color = '';
        }
        if (typeof setMode === 'function' && typeof mode !== 'undefined') setMode(mode);
    }
};

  function startPlaylist(playMode) {
    var sel = document.getElementById('selPlaylist');
    if (!sel || !sel.value) return;
    if (typeof customPlaylists === 'undefined' || !Array.isArray(customPlaylists)) return;
    var targetId = sel.value;
    var targetPl = customPlaylists.find(function (p) { return String(p.id) === String(targetId); });
    if (!targetPl) return;

    // 仅抽取档案柜中未完成且未跳过的任务
    var remainingTasks = [];
    if (targetPl.items && targetPl.items.length > 0) {
      targetPl.items.forEach(function (item, i) {
        var isDone = (targetPl.items && targetPl.items[i] && targetPl.items[i].done) === true;
        var isSkipped = (targetPl.items && targetPl.items[i] && targetPl.items[i].skipped) === true;
        if (!isDone && !isSkipped) {
          remainingTasks.push(item.text || item.title);
        }
      });
    }
    if (remainingTasks.length === 0) {
      if (typeof showToast === 'function') showToast("🎉 该清单所有任务均已完成！");
      return;
    }

    activePlaylist = {
      id: targetPl.id,
      name: targetPl.name,
      icon: targetPl.icon || '📑',
      tasks: remainingTasks,
      mode: playMode
    };

    closePlaylistOverlay();
    drawFromPlaylist();
  }

  function closePlaylistOverlay() {
    // 兼容旧调用：不传入参数时视为“未完成关闭”
    closePlaylistOverlay(false);
  }

  function closePlaylistOverlay(isCompleted) {
    if (isCompleted === void 0) isCompleted = false;

    var overlay = document.getElementById('playlistOverlay');
    if (overlay) overlay.style.display = 'none';

    // 1. 彻底清理下拉框与筛选器状态
    var needsRefresh = false;
    var selPl = document.getElementById('selPlaylist');
    if (selPl && selPl.value) {
      selPl.value = '';
      needsRefresh = true;
    }
    var selCtx = document.getElementById('selContext');
    if (selCtx && selCtx.value && selCtx.value.indexOf('pl_') === 0) {
      // 👉 修复：退出清单时必须重置为默认书桌前
      selCtx.value = 'desktop';
      needsRefresh = true;
    }
    if (needsRefresh) {
      if (typeof setMode === 'function' && typeof mode !== 'undefined') {
        setMode(mode);
      } else {
        // 无法恢复能量模式时，至少恢复按钮文案
        var mainBtn = document.getElementById('mainBtn');
        if (mainBtn) mainBtn.innerText = '🔮 帮我选 (混合)';
      }
    }

    // 2. 保持留白与状态重置 (仅在未完成关闭时执行)
    if (!isCompleted) {
      // 👉 What & Why: 将 var 升级为 const。这三个舞台元素是客观存在的实体，不可被中途替换，用 const 最为严谨。
      const placeholder = document.getElementById('placeholder');
      const gachaLayer = document.getElementById('gachaLayer');
      const resultCard = document.getElementById('resultCard');
      
      // 👉 绝对服从岛主的留白美学：彻底封杀扭蛋机！
      if (placeholder) placeholder.style.display = 'none';
      if (gachaLayer) gachaLayer.style.display = 'none';
      
      if (resultCard) {
        // 渲染一张干干净净的“暂无任务”空卡片
        if (typeof renderResultCard === 'function') renderResultCard(null);
        resultCard.style.display = 'block';
      }

      
      // 👉 核心修复：彻底清空当前任务状态，防止幽灵任务驻留
      if (typeof currentTask !== 'undefined') currentTask = null;
      if (typeof currentStatus !== 'undefined') currentStatus = 'idle';
    }

    try { localStorage.removeItem('anchor_last_playlist_overlay'); } catch (e) {}
  }

  function bindGlobalDialogs() {
    var taskDlg = document.getElementById('taskActionDialog');
    if (taskDlg) {
      var overlay = document.getElementById('taskDialogOverlay');
      if (overlay) overlay.addEventListener('click', closeTaskActionDialog);
      var btnEdit = document.getElementById('btnTaskEdit');
      if (btnEdit) btnEdit.addEventListener('click', handleTaskEdit);
      var btnMemory = document.getElementById('btnTaskMemory');
      if (btnMemory) btnMemory.addEventListener('click', handleTaskMemory);
      var btnArchive = document.getElementById('btnTaskArchive');
      if (btnArchive) btnArchive.addEventListener('click', handleTaskArchive);
      var btnComplete = document.getElementById('btnTaskComplete');
      if (btnComplete) btnComplete.addEventListener('click', handleTaskComplete);
    }
    var historyDlg = document.getElementById('historyTaskDialog');
    if (historyDlg) {
      var ho = document.getElementById('historyDialogOverlay');
      if (ho) {
        ho.addEventListener('click', function () {
          historyDlg.style.display = 'none';
          // 👉 防呆：关闭历史详情时同步清空当前索引与类型，避免后续误用旧索引
          if (typeof currentResurrectIndex !== 'undefined') currentResurrectIndex = -1;
          if (typeof currentResurrectType !== 'undefined') currentResurrectType = null;
        });
      }
      var btnClose = document.getElementById('btnCloseHistoryDialog');
      if (btnClose) {
        btnClose.addEventListener('click', function () {
          historyDlg.style.display = 'none';
          if (typeof currentResurrectIndex !== 'undefined') currentResurrectIndex = -1;
          if (typeof currentResurrectType !== 'undefined') currentResurrectType = null;
        });
      }
      var btnResurrect = document.getElementById('btnResurrectHistory');
      if (btnResurrect) btnResurrect.addEventListener('click', resurrectHistoryTask);
    }
    var memPanel = document.getElementById('memoryPanel');
    if (memPanel) {
      var memOverlay = document.getElementById('memoryPanelOverlay');
      var memHandle = document.getElementById('memoryPanelHandle');
      if (memOverlay) memOverlay.addEventListener('click', closeMemoryPanel);
      if (memHandle) memHandle.addEventListener('click', closeMemoryPanel);
      var btnSave = document.getElementById('memoryBtnSave');
      if (btnSave) btnSave.addEventListener('click', saveMemoryPanel);
      var btnClear = document.getElementById('memoryBtnClear');
      if (btnClear) btnClear.addEventListener('click', clearMemoryPanel);
    }
    var editMemDlg = document.getElementById('editMemoryDialog');
    if (editMemDlg) {
      var btnCloseEditMem = document.getElementById('btnCloseEditMemory');
      if (btnCloseEditMem) btnCloseEditMem.addEventListener('click', function () { editMemDlg.style.display = 'none'; });
      var btnConfirmEditMem = document.getElementById('btnConfirmEditMemory');
      if (btnConfirmEditMem) btnConfirmEditMem.addEventListener('click', function () { editMemDlg.style.display = 'none'; });
    }
    var plOverlay = document.getElementById('playlistOverlay');
    if (plOverlay) {
      var plBackdrop = document.getElementById('playlistOverlayBackdrop');
      if (plBackdrop) plBackdrop.addEventListener('click', closePlaylistOverlay);
      var btnClosePl = document.getElementById('btnClosePlaylistOverlay');
      if (btnClosePl) btnClosePl.addEventListener('click', closePlaylistOverlay);
      // 发牌按钮已通过 onclick="startPlaylist('random')" / startPlaylist('sequence') 绑定
    }
  }

  function autoTag() {
    var inp = document.getElementById('inpTitle');
    if (!inp) return;
    var raw = inp.value;
    var targetLine = (raw.split('\n')[0] || '').trim();
    var feedback = document.getElementById('timeFeedback');
    if (!targetLine) {
      // 👉 核心修复：当输入框被清空时，将标签和状态完美恢复出厂设置
      document.querySelectorAll('.tag').forEach(function (t) { t.classList.remove('active'); });
      var defaultTag = document.querySelector('.tag[data-v="indoor"]');
      if (defaultTag) defaultTag.classList.add('active');
      if (typeof toggleTimeInput === 'function') toggleTimeInput('indoor');
      if (feedback) feedback.innerText = '';
      return;
    }
    var trimmed = targetLine;
    var parsed = parseTimeFromInput(raw.split('\n')[0] || '');
    if (feedback) { feedback.innerText = parsed.time ? '💡 识别: ' + parsed.time + ' min' : ''; }
    if (targetLine.indexOf('每天') !== -1 || targetLine.indexOf('每日') !== -1) toggleCycle(true);
    var t = null, detectQuick = false;
    var firstChar = targetLine.charAt(0) || '';
    // v7.1.3 补充的“逛/赏/演/文娱/欣赏/演出”首字规则
    if (firstChar === '看' || firstChar === '影') t = 'culture';
    else if (firstChar === '读' || firstChar === '书') t = 'culture';
    else if (firstChar === '追' || firstChar === '剧') t = 'culture';
    else if (firstChar === '去') t = 'outdoor';
    // 👉 修复：补齐“观/观看”，确保所有文娱前缀都能正确触发 t = 'culture'
    else if (firstChar === '逛' || firstChar === '赏' || firstChar === '演' || firstChar === '观'
      || targetLine.indexOf('文娱') === 0
      || targetLine.indexOf('欣赏') === 0
      || targetLine.indexOf('观看') === 0
      || targetLine.indexOf('演出') === 0) {
      t = 'culture';
    }
    else if (/洗|刷|理|扔|拆|擦|扫|收|整理|收拾|浇|喂|剪|充|拖|换|叠|铺|挂|扔|喝/.test(targetLine)) { t = 'indoor'; detectQuick = true; }
    // 音频/播客触发：严格限定首字或前缀，避免误伤
    else if (firstChar === '唱' || firstChar === '听' || firstChar === '播' || trimmed.startsWith('播客') || trimmed.startsWith('电台')) {
      t = 'vinyl';
    }
    else if (/书|读|杂志/.test(targetLine)) t = 'culture';
    else if (/电影|影|片|剧|展|音乐会|演出|演唱会|音乐节|音乐剧|live/.test(targetLine)) t = 'culture';
    else if (/动|跑|球|舞|操|帕梅拉|瑜伽|健身|练/.test(targetLine)) t = 'sport';
    else if (/买|外|超市|商场|取快递|寄快递/.test(targetLine)) t = 'outdoor';
    else if (/脑|写|研究|作|编辑/.test(targetLine)) t = 'desktop';
    if (t) {
      document.querySelectorAll('.tag').forEach(function (tag) { tag.classList.remove('active'); });
      var sub = 'book';
      if (t === 'culture') {
        if (firstChar === '看' || firstChar === '影') sub = 'movie';
        // 文娱/展览/演艺：保留 v8 🎭/🖼️ 体系，同时扩充 v7.1.3 的强拦截词典
        else if (
          firstChar === '逛' || firstChar === '赏' || firstChar === '演' ||
          targetLine.indexOf('文娱') === 0 || targetLine.indexOf('欣赏') === 0 ||
          targetLine.indexOf('演出') === 0 || targetLine.indexOf('观看') === 0 ||
          /展|音乐会|话剧|舞剧|歌剧|音乐剧|音乐节|演唱会|脱口秀|live/.test(targetLine)
        ) {
          sub = 'other';
        }
        else if (firstChar === '追' || /第.+集/.test(targetLine) || targetLine.indexOf('剧') !== -1) sub = 'series';
      }
      var selector = (t === 'culture') ? '.tag[data-v="culture"][data-sub="' + sub + '"]' : '.tag[data-v="' + t + '"]';
      var activeTag = document.querySelector(selector) || document.querySelector('.tag[data-v="' + t + '"]');
      if (activeTag) activeTag.classList.add('active');
      toggleTimeInput(t);
    }
    var recurSelect = document.getElementById('inpRecurrence');
    if (recurSelect) {
      if (targetLine.indexOf('每天') !== -1 || targetLine.indexOf('每日') !== -1) recurSelect.value = 'daily';
      else if (targetLine.indexOf('每周') !== -1) recurSelect.value = 'weekly';
      else if (targetLine.indexOf('每月') !== -1) recurSelect.value = 'monthly';
      else if (targetLine.indexOf('长期') !== -1) recurSelect.value = 'long_term';
    }
    // === 02区：自动速办 UI 联动逻辑 (大一统净化版) ===
    // 如果用户没有手动去点过速办开关 (userOverrideFlash)，系统才自动接管
    if (typeof userOverrideFlash === 'undefined' || !userOverrideFlash) {
      var isPhotoSort = targetLine.indexOf('整理') !== -1 && targetLine.indexOf('照片') !== -1;
      var selTime02 = document.getElementById('inpTime'); // 👉 获取02区的时间下拉框
      
      if (!isPhotoSort && detectQuick) {
          // 命中速办：强制开灯，调至 5m
          if (typeof toggleSwitch === 'function') toggleSwitch('flash', true);
          if (selTime02) selTime02.value = '5';
      } else {
          // 未命中或删除了速办词：强制熄灯，恢复 30m
          if (typeof toggleSwitch === 'function') toggleSwitch('flash', false);
          if (selTime02) selTime02.value = '30';
      }
  }}

  function pickTag(el) {
    if (!el) return;
    document.querySelectorAll('.tag').forEach(function (t) { t.classList.remove('active'); });
    el.classList.add('active');
    toggleTimeInput(el.getAttribute('data-v'));
  }

  function handleEnter(e) {
    if (!e || e.key !== 'Enter') return;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 768);
    if (isMobile) return;
    if (!e.shiftKey) { e.preventDefault(); if (typeof addNew === 'function') addNew(); }
  }

  function addNew() {
    var inp = document.getElementById('inpTitle');
    if (!inp || !inp.value || !inp.value.trim()) return;
    var rawInput = inp.value;
    var lines = rawInput.split('\n').filter(function (line) { return line.trim() !== ''; });
    // v6.3-edit-buttons-enter：编辑模式仅取首行并覆盖原任务，防止一次编辑生成多条双胞胎
    if (editingTaskId) {
      lines = [lines.join(' ')].filter(function (line) { return line.trim() !== ''; });
    }
    if (lines.length === 0) return;
    var activeTag = document.querySelector('.tag.active');
    var type = (activeTag && activeTag.getAttribute('data-v')) || 'indoor';
    var manualSubtype = (activeTag && activeTag.getAttribute('data-sub')) || '';
    var added = 0;
    var batchSubtype = manualSubtype || null;
    var recurEl = document.getElementById('inpRecurrence');
    var recurrence = (recurEl && recurEl.value) || 'none';
    var timeEl = document.getElementById('inpTime');
    var defaultTime = timeEl ? parseInt(timeEl.value, 10) : 30;
    // 👉 v8.3 目标进度/期限（DDL）：兼容旧数据无字段的情况
    const targetCount = document.getElementById('inpTargetCount') ? document.getElementById('inpTargetCount').value.trim() : '';
    const deadlineVal = document.getElementById('inpDeadline') ? document.getElementById('inpDeadline').value : '';
    // 自动批量推断文化类子类型（仅在用户未手动选 subtype 时生效）
    if (!batchSubtype && lines.length > 0) {
      var firstRaw = lines[0];
      var first = firstRaw.toLowerCase();
      var isCleaning = /(理|整理|收拾|擦|扫|拖|洗|换|叠|铺|挂|扔|拆|装|喝)/.test(firstRaw);
      if (!isCleaning) {
        var firstChar = firstRaw.charAt(0) || '';
        if (firstChar === '读' || firstChar === '书') {
          batchSubtype = 'book';
        } else if (firstChar === '看' || firstChar === '影') {
          batchSubtype = 'movie';
        } else if (['读', '书', '阅', 'book', 'read', '杂志'].some(function (k) { return first.indexOf(k) !== -1; })) {
          batchSubtype = 'book';
        } else if (['看', '影', '视', '片', 'movie'].some(function (k) { return first.indexOf(k) !== -1; })) {
          batchSubtype = 'movie';
        }
        if (batchSubtype && first.length <= 4 && lines.length > 1) {
          lines.shift();
        }
      }
    }

    lines.forEach(function (line) {
      var parsed = parseTimeFromInput(line);
      var title = (parsed.title || '').trim();
      if (!title) return;
      var subtype = batchSubtype;

      // 重要事项标记：支持 行首 * / ＊ / ! / ！ / “重要 ”
      var isFrog = false;
      var rawTitle = title.replace(/^\s+/, '');
      if (/^[*＊!！]/.test(rawTitle)) {
        isFrog = true;
        rawTitle = rawTitle.replace(/^[*＊!！\s]+/, '');
      } else if (rawTitle.indexOf('重要') === 0) {
        isFrog = true;
        rawTitle = rawTitle.replace(/^重要\s*/, '');
      }
      title = rawTitle.trim();

      var isQuick = switchState.flash;

      // v7.1.3 家务自动速办：仅在用户未手动覆盖速办时，基于关键词/短时长自动提速
      if (typeof userOverrideFlash === 'boolean' ? !userOverrideFlash : true) {
        if (!isQuick) {
          var isPhotoSort = title.indexOf('整理') !== -1 && title.indexOf('照片') !== -1;
          if (!isPhotoSort && type === 'indoor' &&
            /(洗|刷|发|联系|通知|拿|取|拆|装|擦|扫|倒|收|整理|收拾|浇|喂|剪|充|拖|换|叠|铺|挂|扔|喝)/.test(title)
          ) {
            isQuick = true;
          }
        }
      }

      var timeVal = parsed.time != null ? parsed.time : defaultTime;
      if (isQuick && (!timeVal || timeVal > 15)) timeVal = 5;
      if (type === 'vinyl' && !isQuick) timeVal = 0;
      else if (type === 'culture' && !isQuick) {
        if (subtype === 'movie') timeVal = 120;
        else timeVal = 0;
      }

      // 文化类自动推断 subtype（在用户未手动指定时兜底）
      if (!isQuick && !subtype && type === 'culture') {
        var t = (title || '').trim();
        var firstChar2 = t.charAt(0) || '';
        if (firstChar2 === '读' || firstChar2 === '书') {
          subtype = 'book';
        } else if (firstChar2 === '看' || firstChar2 === '影') {
          subtype = 'movie';
        } else if (
          t.indexOf('书') !== -1 || t.indexOf('读') !== -1 || t.indexOf('阅') !== -1 ||
          t.indexOf('杂志') !== -1 || t.indexOf('周刊') !== -1
        ) {
          subtype = 'book';
        } else if (
          t.indexOf('电影') !== -1 || t.indexOf('影') !== -1 || t.indexOf('片') !== -1
        ) {
          subtype = 'movie';
        }
      }

      // 👉 v8.2.8 洗稿机升级：增加播客/音频类前缀，严格限定在句首 (^)，绝不误伤任务名内部词汇
      var rawForSeries = title.replace(/^(去|看展|看|读|听|做|逛|赏|展览|欣赏|演出|文娱|观看|音乐剧|话剧|舞剧|歌剧|追|播客|电台|小宇宙|唱片|cd|播)[:：\s]*/i, '').trim();

      var isSeries = false;
      if (type === 'culture' && subtype === 'series') {
        isSeries = true;
      }
      if (type === 'culture') {
        var firstCharSeries = rawForSeries.charAt(0) || '';
        if (firstCharSeries === '追' || firstCharSeries === '剧') {
          isSeries = true;
        }
        if (rawForSeries.indexOf('全集') !== -1 ||
          rawForSeries.indexOf('系列') !== -1 ||
          /第.+集/.test(rawForSeries)) {
          isSeries = true;
        }
      }

      // 规范展示用标题，这里顺手把“追 / 剧”前缀清洗掉
      var displayTitle = rawForSeries;
      if (type === 'culture' && isSeries && (displayTitle.indexOf('追') === 0 || displayTitle.indexOf('剧') === 0)) {
        displayTitle = displayTitle.slice(1).trim();
      }
      title = displayTitle;

      // 书影音加书名号，但文娱/展览（subtype: 'other'）豁免，保持文字清爽
      if (!isQuick && (type === 'vinyl' || (type === 'culture' && subtype !== 'other'))) {
        if (title && title.charAt(0) !== '《' && title.charAt(title.length - 1) !== '》') {
          title = '《' + title + '》';
        }
      }

      // 生命周期设定：智能识别 + 周期前缀清洗
      var recurSelect = document.getElementById('inpRecurrence');
      var localRecurrence = recurSelect ? recurSelect.value : recurrence;
      if (!localRecurrence || localRecurrence === 'none') {
        if (title.indexOf('每天') !== -1 || title.indexOf('每日') !== -1) localRecurrence = 'daily';
        else if (title.indexOf('每周') !== -1) localRecurrence = 'weekly';
        else if (title.indexOf('每月') !== -1) localRecurrence = 'monthly';
        else if (title.indexOf('长期') !== -1) localRecurrence = 'long_term';
      }
      if (localRecurrence && localRecurrence !== 'none') {
        title = title.replace(/每天|每日|每周|每月|长期[:：\s]*/g, '').trim();
      }
      if (recurSelect) recurSelect.value = localRecurrence || 'none';

      // 👉 终极图标锁定：绝对基于原始输入 (line) 判定，不受洗稿机影响！
      // 确保用 line 测试，因为 title 中的"演出/音乐剧"等前缀可能已被剥离
      var finalIcon = null;
      if (type === 'culture' && subtype === 'other') {
        if (/(演出|音乐会|音乐节|演唱会|话剧|舞剧|歌剧|音乐剧|脱口秀|live|演)/i.test(line)) {
          finalIcon = '🎭';
        } else {
          finalIcon = '🖼️'; // 静态展览默认
        }
      }
      // 👉 v8.2.8 播客大礼包底层引擎：基于原始输入 (line) 锁定音频类图标快照
      else if (type === 'vinyl') {
        if (/(唱片|cd|黑胶|碟)/i.test(line)) {
          finalIcon = '💿'; // 识别到明确的唱片实体词，发 💿
        } else if (/(歌|音乐|网易云|qq音乐)/i.test(line)) {
          finalIcon = '🎵'; // 音乐软件或歌曲，发 🎵
        } else {
          finalIcon = '🎙️'; // 默认播客兜底，与 02 区标签保持绝对一致
        }
      }

      var item = {
        id: Date.now() + Math.random(),
        title: title,
        type: type,
        desc: '自定义',
        time: timeVal,
        inColdStorage: false
      };
      if (subtype) item.subtype = subtype;
      if (isSeries) item.isSeries = true;
      if (isFrog) item.isFrog = true;
      if (isQuick) item.isQuick = true;
      if (localRecurrence && localRecurrence !== 'none') item.recurrence = localRecurrence;

      if (finalIcon) item.icon = finalIcon;

      // 👉 v8.X 红线大一统：抓取 02 区下拉框里的项目归属 (What & Why: 在任务落盘前，拿到用户选定的项目ID)
      var projSel = document.getElementById('inpProject');
      var finalProjectId = (projSel && projSel.value) ? projSel.value : null;

      // v6.3-edit-buttons-enter：编辑模式下就地覆盖原对象，而不是 push 新任务
      if (editingTaskId) {
        var idx = db.findIndex(function (t) { return t.id === editingTaskId; });
        if (idx > -1) {
          db[idx].title = item.title;
          // ... 现有的其他赋值代码 ...
          if (item.icon) db[idx].icon = item.icon;
          
          // 👉 v8.X：将红线 ID 写进旧任务的骨血里
          const oldProjectId = db[idx].projectId;
          db[idx].projectId = finalProjectId;

          // 👉 v8.X 架构级修复：红线资产转移 (Dowry Transfer)
                  // 如果用户修改了任务的归属项目，且这个任务原本已经有投入时间，必须进行时间资产的平滑转移
                  if (String(finalProjectId || '') !== String(oldProjectId || '')) {
                    const dowryMins = db[idx].totalMinutes || 0;
                    if (dowryMins > 0 && typeof customPlaylists !== 'undefined') {
                        // 1. 退旧账：从旧项目中扣除（如果有，且必须是战略项目 playlistType === 'project'）
                        if (oldProjectId) {
                            const oldIdx = customPlaylists.findIndex(function (p) {
                              return p && p.playlistType === 'project' && String(p.id) === String(oldProjectId);
                            });
                            if (oldIdx > -1) {
                                customPlaylists[oldIdx].linkedTotalMinutes = Math.max(0, (customPlaylists[oldIdx].linkedTotalMinutes || 0) - dowryMins);
                            }
                        }
                        // 2. 汇新账：加入新项目（如果有）
                        if (finalProjectId) {
                            const newIdx = customPlaylists.findIndex(function (p) {
                              return p && p.playlistType === 'project' && String(p.id) === String(finalProjectId);
                            });
                            if (newIdx > -1) {
                                customPlaylists[newIdx].linkedTotalMinutes = Math.max(0, (customPlaylists[newIdx].linkedTotalMinutes || 0) + dowryMins);
                            }
                        }
                        // 3. 实时刷新 03 区账本大盘
                        if (typeof savePlaylists === 'function') savePlaylists();
                        if (typeof renderCabinet === 'function') renderCabinet();
                    }
                }
        }
      } else {
         // 注意：在你的 db.push({...}) 的对象内部，找个地方加上 projectId 字段！
         // 比如：
         // db.push({
         //   id: ...,
         //   title: item.title,
         //   ...
         //   projectId: finalProjectId  // 👉 v8.X：新建任务时打上归属项目的钢印
         // });
      }

      // v6.3-edit-buttons-enter：编辑模式下就地覆盖原对象，而不是 push 新任务
      if (editingTaskId) {
        var idx = db.findIndex(function (t) { return t.id === editingTaskId; });
        if (idx > -1) {
          db[idx].title = item.title;
          db[idx].type = item.type;
          db[idx].subtype = item.subtype;
          db[idx].isSeries = !!item.isSeries;
          db[idx].time = item.time;
          db[idx].isFrog = !!item.isFrog;
          db[idx].isQuick = !!item.isQuick;
          db[idx].recurrence = item.recurrence;
          db[idx].desc = item.desc;
          if (item.icon) db[idx].icon = item.icon;
          
          // 👉 之前加的：如果是修改旧任务，把红线也更新一下
          db[idx].projectId = finalProjectId || null;

          // 👉 v8.3 编辑：落盘目标进度/期限，并允许清空删除
          if (targetCount) db[idx].bookmarkTotal = targetCount;
          if (deadlineVal) db[idx].deadline = deadlineVal;
          // 如果用户清空了，允许删除
          if (!targetCount && db[idx].bookmarkTotal) delete db[idx].bookmarkTotal;
          if (!deadlineVal && db[idx].deadline) delete db[idx].deadline;
        }
      } else {
        // 👉 v8.2 终极防漏：在作为新任务推入总池子之前，打上归属项目的钢印！
        item.projectId = finalProjectId || null; 
        
        // 👉 v8.3 新建：写入目标进度/期限（空值不落字段，保护旧数据）
        item.bookmarkTotal = targetCount || undefined;
        item.deadline = deadlineVal || undefined;
        
        db.push(item);
        added++;
      }
    });
    // 1. 落盘保存与刷新列表
    if (typeof save === 'function') save();
    if (typeof renderList === 'function') renderList();

    // 👉 What & Why: 核心修复！彻底打扫战场的“洗稿机”，抹除上一个任务的全部残留！
    const input = document.getElementById('inpTitle');
    if (input) {
        input.value = '';
        input.placeholder = "✅ 存入/更新成功！";
    }
    const feedback = document.getElementById('timeFeedback');
    if (feedback) feedback.innerText = "";

    if (typeof switchState !== 'undefined') {
        if (switchState.cycle && typeof toggleSwitch === 'function') toggleSwitch('cycle', false);
        if (switchState.flash && typeof toggleSwitch === 'function') toggleSwitch('flash', false);
    }

    // 2. 强制复位标签：砸碎电影/书籍带来的灰色枷锁，归位到默认的“室内”
    document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    const defaultTag = document.querySelector('.tag[data-v="indoor"]');
    if (defaultTag) defaultTag.classList.add('active');

    // 3. 强制复位时间
    const timeSel = document.getElementById('inpTime');
    if (timeSel) {
        timeSel.value = "30"; // 强制归位到默认 30m
        timeSel.classList.remove('disabled');
    }

    // 4. 强制复位生命周期
    const recurSelect = document.getElementById('inpRecurrence');
    if (recurSelect) recurSelect.value = 'none';

    // 5. 👉 v8.2 新增防线：强制复位关联项目下拉框！
    const projSelect = document.getElementById('inpProject');
    if (projSelect) projSelect.value = '';

    // 👉 v8.3 输入框复位：目标进度/期限 + 折叠区收起
    if (document.getElementById('inpTargetCount')) document.getElementById('inpTargetCount').value = '';
    if (document.getElementById('inpDeadline')) document.getElementById('inpDeadline').value = '';
    if (document.getElementById('endpointZone')) document.getElementById('endpointZone').style.display = 'none';

    // 6. 🚨 最致命的 BUG 修复：释放编辑状态的幽灵！
    editingTaskId = null;
    if (typeof editingTaskOriginal !== 'undefined') editingTaskOriginal = null;

    // 7. 视觉庆典与输入框复位
    let finalAddedCount = typeof addedCount !== 'undefined' ? addedCount : 1;
    if (typeof showToast === 'function') showToast(`🎉 操作成功！`);
    if (input) {
        setTimeout(() => { input.placeholder = "智能识别输入任务类别与时长..."; }, 1500);
    }
} // 结束 addNew 函数

  // 👉 v8.X 星尘孵化/删除：闭包内直连 db / save / renderList / showToast（HTML 经 window 调用）
  window.incubateStardustText = function() {
    if (window.activeStardustTextId == null || window.activeStardustTextId === '') return;

    var targetId = String(window.activeStardustTextId);
    var idx = stardustTexts.findIndex(function(t) { return String(t.id) === targetId; });

    if (idx > -1) {
      var textContent = stardustTexts[idx].text;

      try {
        var newTask = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: textContent,
          type: 'indoor',
          subtype: '',
          desc: '来自星尘宇宙的灵感',
          isSeries: false,
          time: 30,
          recurrence: 'none',
          isFrog: false,
          isQuick: false,
          lastDone: '',
          icon: '✨'
        };
        db.unshift(newTask);
        save();
        if (typeof renderList === 'function') renderList();
      } catch (e) {
        console.error('🚨 孵化入库发生致命错误', e);
        if (typeof showToast === 'function') showToast('⚠️ 孵化失败，已保护碎片不被删除！');
        return;
      }

      stardustTexts.splice(idx, 1);
      if (typeof window.saveStardustTexts === 'function') window.saveStardustTexts();
      if (typeof window.renderStardustTexts === 'function') window.renderStardustTexts();

      var dlg = document.getElementById('stardustTextDialog');
      if (dlg) dlg.style.display = 'none';
      if (typeof showToast === 'function') showToast('🌟 碎片已成功孵化入库！');
      if (typeof safeVibrate === 'function') safeVibrate([1, 2]);
    } else {
      console.warn('未能找到对应的灵感碎片', targetId);
    }
  };

  window.editStardustText = function () {
    if (window.activeStardustTextId == null || window.activeStardustTextId === '') return;
    var targetId = parseInt(window.activeStardustTextId, 10);
    var idx = stardustTexts.findIndex(function (t) {
      return parseInt(t.id, 10) === targetId;
    });
    if (idx > -1) {
      var oldText = stardustTexts[idx].text;
      var newText = prompt('✏️ 修改你的灵感碎片：', oldText);
      if (newText !== null && newText.trim() !== '') {
        stardustTexts[idx].text = newText.trim();
        if (typeof window.saveStardustTexts === 'function') window.saveStardustTexts();
        if (typeof window.renderStardustTexts === 'function') window.renderStardustTexts();
        if (typeof showToast === 'function') showToast('✨ 碎片已重新雕琢');
      }
    }
    var dlg = document.getElementById('stardustTextDialog');
    if (dlg) dlg.style.display = 'none';
  };

  window.deleteStardustText = function() {
    if (window.activeStardustTextId == null || window.activeStardustTextId === '') return;
    if (confirm('确定让这片星辰碎片随风消散吗？')) {
      var delTargetId = String(window.activeStardustTextId);
      stardustTexts = stardustTexts.filter(function(t) { return String(t.id) !== delTargetId; });
      if (typeof window.saveStardustTexts === 'function') window.saveStardustTexts();
      if (typeof window.renderStardustTexts === 'function') window.renderStardustTexts();
      var delDlg = document.getElementById('stardustTextDialog');
      if (delDlg) delDlg.style.display = 'none';
      if (typeof showToast === 'function') showToast('💨 碎片已随风消散');
    }
  };

  if (typeof window !== 'undefined') {
    window.restoreFromColdStorage = restoreFromColdStorage;
    window.tryDeleteItem = tryDeleteItem;
    window.handleColdOrDelete = handleColdOrDelete;
    window.manualCompleteFromList = manualCompleteFromList;
    window.showTaskActionDialog = showTaskActionDialog;
    window.showHistoryTaskDetail = showHistoryTaskDetail;
    window.renderHistory = renderHistory;
    window.deleteArchiveItem = deleteArchiveItem;
    window.deleteLogEntry = deleteLogEntry;
    window.restorePlaylistFromCold = restorePlaylistFromCold;
    window.deletePlaylistFromCold = deletePlaylistFromCold;
    window.sendPlaylistToStage = sendPlaylistToStage;
    window.editPlaylist = editPlaylist;
    window.handlePlaylistColdOrDelete = handlePlaylistColdOrDelete;

    window.restoreArchivedPlaylist = restoreArchivedPlaylist;
    window.deleteArchivedPlaylist = deleteArchivedPlaylist;
    window.toggleCabinetItem = toggleCabinetItem;
    window.showHeatmapDay = showHeatmapDay;
    window.closeTaskActionDialog = closeTaskActionDialog;
    window.openMemoryPanel = openMemoryPanel;
    window.closeMemoryPanel = closeMemoryPanel;
    window.openPlaylistOverlay = openPlaylistOverlay;
    window.closePlaylistOverlay = closePlaylistOverlay;
    window.handlePlaylistChange = handlePlaylistChange;
    window.startPlaylist = startPlaylist;
    window.confirmColdAction = confirmColdAction;
  }

  function initRoom0203() {
    var inpTitle = document.getElementById('inpTitle');
    if (inpTitle) { inpTitle.addEventListener('input', autoTag); inpTitle.addEventListener('keydown', handleEnter); }
    var btnAdd = document.getElementById('btnAddNew');
    if (btnAdd) btnAdd.addEventListener('click', addNew);
    document.querySelectorAll('.tag').forEach(function (tag) {
      tag.addEventListener('click', function () { pickTag(tag); });
    });
    var flashSw = document.getElementById('flashSwitch');
    if (flashSw) flashSw.addEventListener('click', function () { toggleSwitch('flash'); });
    var cheatTog = document.getElementById('cheatSheetToggle');
    if (cheatTog) cheatTog.addEventListener('click', function () { var b = document.getElementById('cheatSheetBox'); if (b) b.style.display = b.style.display === 'none' ? 'block' : 'none'; });
    var plCheatTog = document.getElementById('playlistCheatSheetToggle');
    if (plCheatTog) plCheatTog.addEventListener('click', function () { var b = document.getElementById('playlistCheatSheet'); if (b) b.style.display = b.style.display === 'none' ? 'block' : 'none'; });
    var btnNewSop = document.getElementById('btnNewSop');
    if (btnNewSop) btnNewSop.addEventListener('click', openNewSopCreator);
    var btnDaily = document.getElementById('btnDailyTodo');
    if (btnDaily) btnDaily.addEventListener('click', createDailyTodo);
    var btnSubmitPl = document.getElementById('btnSubmitPlaylist');
    if (btnSubmitPl) btnSubmitPl.addEventListener('click', submitNewPlaylist);
    var btnHidePl = document.getElementById('btnHidePlaylistCreator');
    if (btnHidePl) btnHidePl.addEventListener('click', hidePlaylistCreator);
    var coldDlg = document.getElementById('coldDialog');
    if (coldDlg) {
      coldDlg.querySelectorAll('[data-cold-action]').forEach(function (btn) {
        btn.addEventListener('click', function () { confirmColdAction(btn.getAttribute('data-cold-action')); });
      });
      coldDlg.addEventListener('click', function (e) { if (e.target === coldDlg) coldDlg.style.display = 'none'; });
    }
    var heatGrid = document.getElementById('heatmapGrid');
    if (heatGrid) heatGrid.addEventListener('click', function (e) {
      var cell = e.target;
      if (!cell || !cell.classList.contains('heatmap-cell')) return;
      var dateKey = cell.getAttribute('data-date');
      var display = cell.getAttribute('data-display');
      if (dateKey && typeof showHeatmapDay === 'function') showHeatmapDay(dateKey, display || dateKey, cell);
    });
    renderList();
    renderArchive();
    renderLog();
    renderHistory();
    renderHeatmap();
    renderCabinet();
    if (document.getElementById('selPlaylist')) renderPlaylistDropdown();
     // 👉 v8.1 终极防御：延时 150ms 渲染项目下拉框，让子弹飞一会，绝对避开初始加载时的 DOM 渲染冲突！
     setTimeout(() => {
      if (typeof window.renderProjectDropdown === 'function') {
          window.renderProjectDropdown();
      }
  }, 150);
  }

  // 开机流程由 01 区 runBoot() 统一调用 loadAndRenderPlaylists → restoreLiveState → bindRoom01Events → initRoom0203 → bindGlobalDialogs
  // ========== 02/03 区结束 ==========

  var astrolabeTimeout = null;

  // 👉 What & Why: 同步更新星盘亮点，给用户上帝视角的空间确认感
  function updateAstrolabe() {
    document.querySelectorAll('.astro-dot').forEach(function (dot) { dot.classList.remove('active'); });
    if (typeof outerSwiper !== 'undefined' && outerSwiper) {
      var outIdx = outerSwiper.realIndex !== undefined ? outerSwiper.realIndex : outerSwiper.activeIndex;
      if (outIdx === 0) {
        var d02 = document.getElementById('dot-02');
        if (d02) d02.classList.add('active');
      } else if (outIdx === 2) {
        var d03 = document.getElementById('dot-03');
        if (d03) d03.classList.add('active');
      } else if (outIdx === 1) {
        if (typeof innerSwiper !== 'undefined' && innerSwiper) {
          var inIdx = innerSwiper.activeIndex;
          if (inIdx === 0) { var d00 = document.getElementById('dot-00'); if (d00) d00.classList.add('active'); }
          else if (inIdx === 1) { var d01 = document.getElementById('dot-01'); if (d01) d01.classList.add('active'); }
          else if (inIdx === 2) { var d04 = document.getElementById('dot-04'); if (d04) d04.classList.add('active'); }
        } else {
          var d01Fallback = document.getElementById('dot-01');
          if (d01Fallback) d01Fallback.classList.add('active');
        }
      }
    }
  }

  // 👉 封装一个显示星盘并延迟隐藏的魔法函数
  function wakeUpAstrolabe() {
    var astrolabe = document.getElementById('spatialAstrolabe');
    if (!astrolabe) return;
    astrolabe.classList.add('show');
    updateAstrolabe();
    if (astrolabeTimeout) clearTimeout(astrolabeTimeout);
    astrolabeTimeout = setTimeout(function () {
      astrolabe.classList.remove('show');
    }, 1500);
  }

  // 先初始化内层（纵向），再初始化外层（横向循环）
  var innerSwiper = new Swiper('#innerSwiper', {
    direction: 'vertical',
    initialSlide: 1,
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 600,
    allowTouchMove: true,
    nested: true,
    resistance: true,
    resistanceRatio: 0.85
  });

  var outerSwiper = new Swiper('#outerSwiper', {
    direction: 'horizontal',
    loop: true,
    initialSlide: 1,
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 600,
    allowTouchMove: true,
    nested: true,
    resistance: true,
    resistanceRatio: 0.85
  });
  if (typeof window !== 'undefined') {
    // 暴露外层 Swiper，供跨区导航使用
    window.swiper = outerSwiper;
    // v8.0：统一 3D 空间入口，兼容一日三季玄关 + 新手引导
    window.anchorSwiper = {
      // target: 0=00,1=01,2=02,3=03,4=04
      slideTo: function (target, speed) {
        var spd = typeof speed === 'number' ? speed : 600;
        if (target === 0) {
          // 👉 修复：换用 slideToLoop 适应虫洞宇宙
          if (outerSwiper) outerSwiper.slideToLoop(1, spd); 
          if (innerSwiper) innerSwiper.slideTo(0, spd);
        } else if (target === 1) {
          if (outerSwiper) outerSwiper.slideToLoop(1, spd);
          if (innerSwiper) innerSwiper.slideTo(1, spd);
        } else if (target === 2) {
          if (outerSwiper) outerSwiper.slideToLoop(0, spd);
        } else if (target === 3) {
          // 03 万象生态舱：独立横向房间
          if (outerSwiper) outerSwiper.slideToLoop(2, spd);
        } else if (target === 4) {
          // 04 罗盘中枢：中心竖向 Swiper 的第三页
          if (outerSwiper) outerSwiper.slideToLoop(1, spd);
          if (innerSwiper) innerSwiper.slideTo(2, spd);
        }
      }
    };
  }

  if (outerSwiper) {
    outerSwiper.on('sliderMove', wakeUpAstrolabe);
    outerSwiper.on('slideChange', wakeUpAstrolabe);
  }
  if (innerSwiper) {
    innerSwiper.on('sliderMove', wakeUpAstrolabe);
    innerSwiper.on('slideChange', wakeUpAstrolabe);
  }

  // 00区 Z 轴浮层：展开/关闭（不触发展开 Swiper 切页）
  var overlay = document.getElementById('overlayTest');
  var btnOpen = document.getElementById('btnOpenOverlay');
  var btnClose = document.getElementById('btnCloseOverlay');
  if (overlay && btnOpen && btnClose) {
    btnOpen.addEventListener('click', function (e) {
      e.stopPropagation();
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    });
    btnClose.addEventListener('click', function (e) {
      e.stopPropagation();
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    });
  }
})();

// 👉 v8.2.0 星盘控制引擎
let astroDeg = 0;
function spinAstrolabe(index, centerText) {
  // 1. 转动星盘与文字反转
  astroDeg += 72; // 每次点击转动 72 度
  const ring = document.getElementById('astroMainRing');
  if (ring) ring.style.transform = `rotate(${astroDeg}deg)`;
  
   // 👉 v8.2.1 3D 万向节锁 (Gimbal Lock) 修正
  // What & Why: 当父级星轨转动 astroDeg 时，节点首先要绕 Z 轴反向转动以保证不倒立；
  // 紧接着必须绕 X 轴反向抬起 60 度，以抵抗星盘的整体倾斜。这样用户点击面永远是完美的正圆立牌！
  document.querySelectorAll('.astro-node').forEach(node => {
   // 保持万向节锁的同时，加上 15px 的 Z 轴装甲，彻底杜绝 3D 穿模
  node.style.transform = `translateZ(15px) rotateZ(${-astroDeg}deg) rotateX(-60deg)`;
  });

  
  const centerEl = document.getElementById('astroCenterText');
  if (centerEl) {
    centerEl.innerText = centerText;
    centerEl.style.color = '#FF8A65'; // 亮起激活色
  }

  // 2. 隐藏所有面板
  const panels = ['manualCardWrapper', 'panel-updates', 'panel-rituals', 'panel-prefs', 'settingSec'];
  panels.forEach(pid => {
    const el = document.getElementById(pid);
    if (el) el.style.display = 'none';
  });

  // 3. 显示目标面板，并强行展开其 <details> 以供阅览
  const targetId = panels[index];
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.style.display = 'block';
    // 如果里面有折叠框，自动帮用户拉开
    const details = targetEl.querySelector('details');
    if (details) details.open = true;
    
    // 👉 v8.2 修复：既然放弃了内部包裹，我们直接让整个 04 区房间瞬间滚回顶部！
    const sec04 = document.getElementById('sec04');
    if (sec04) sec04.scrollTop = 0;
  }
}

// 👉 v8.2 终极安全版：千人千面智能初始化
setTimeout(() => {
  try {
    // 绝对安全读取：不依赖全局变量，直接穿透底层
    const savedName = localStorage.getItem('anchor_live_username');
    // 判定老船长：名字存在，且不是默认的 'Anchor'
    const isVeteran = savedName && savedName !== 'Anchor';
    
    if (isVeteran) {
      if (typeof spinAstrolabe === 'function') spinAstrolabe(4, '📡 方舟'); 
    } else {
      if (typeof spinAstrolabe === 'function') spinAstrolabe(0, '📖 手册'); 
    }
  } catch(e) {
    // 🚨 终极防线：无论发生什么错误，绝不允许 04 区白屏
    if (typeof spinAstrolabe === 'function') spinAstrolabe(0, '📖 手册');
  }
}, 500);

// 👉 🌌 真空星尘：Canvas 2D 灵感孵化器引擎 (v6.0)
let stardustPanX = 0; let stardustPanY = 0; let stardustScale = 1;
let stardustTool = null;
let isSdInteracting = false;
let sdStartX = 0; let sdStartY = 0;
let _sdDragTextIdx = -1; // Canvas 下拖拽的目标索引
let _sdDragOffsetX = 0; let _sdDragOffsetY = 0;
let _sdDragTextTimer = null;
let _sdHighlightId = -1; let _sdHighlightTimer = null;
let _sdRafId = 0;

let stardustTexts = [];
try { stardustTexts = JSON.parse(localStorage.getItem('anchor_stardust_texts') || '[]'); } catch (e) {}

// 👉 v8.3.4 视觉升级：生成 400 颗绝对随机的宇宙星尘，避免缩放时的 CSS 网格穿帮
let stardustProceduralStars = [];
for (let _si = 0; _si < 400; _si++) {
  stardustProceduralStars.push({
    x: (Math.random() - 0.5) * 6000,
    y: (Math.random() - 0.5) * 6000,
    r: Math.random() * 1.5 + 0.4,
    alpha: Math.random() * 0.7 + 0.1
  });
}

window.saveStardustTexts = function() {
  try { localStorage.setItem('anchor_stardust_texts', JSON.stringify(stardustTexts)); } catch (e) {}
};

// ===== Canvas Retina：物理视口 + DPR 暴力对齐（不依赖容器 Rect） =====
function resizeStardustCanvas() {
  const canvas = document.getElementById('stardustMainCanvas');
  if (!canvas) return;

  // 👉 无论容器如何，全屏画板绝对信任 window 的物理视口
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  const targetW = Math.floor(w * dpr);
  const targetH = Math.floor(h * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    // 关键：尺寸改变后必须立刻重置矩阵上下文
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

window._stardustWinResizeHandler = function () {
  resizeStardustCanvas();
  if (typeof window.drawStardustScene === 'function') window.drawStardustScene();
};

// ===== 核心渲染管道 (按需调用，非持续 rAF) =====
window.drawStardustScene = function() {
  resizeStardustCanvas();
  var c = document.getElementById('stardustMainCanvas');
  if (!c) return;
  var ctx = c.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w = c.width / dpr; var h = c.height / dpr;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  // 摄像机平移像素对齐，减轻整层 Canvas 亚像素发糊（scale 保持连续以免与命中检测错位）
  ctx.translate(Math.round(stardustPanX), Math.round(stardustPanY));
  ctx.scale(stardustScale, stardustScale);

  // 👉 1. 绘制绝对无序的真实星空（融入世界坐标系，无网格感）
  ctx.fillStyle = '#ffffff';
  for (var sj = 0; sj < stardustProceduralStars.length; sj++) {
    var star = stardustProceduralStars[sj];
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.font = '16px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // 👉 2. 文本：像素对齐减轻亚像素模糊
  for (var i = 0; i < stardustTexts.length; i++) {
    var item = stardustTexts[i];
    var isDrag = (i === _sdDragTextIdx);
    var isHL = (item.id === _sdHighlightId);
    var drawX = Math.round(item.x);
    var drawY = Math.round(item.y);

    ctx.save();
    ctx.shadowColor = isHL ? 'rgba(160,231,229,0.9)' : 'rgba(255,255,255,0.35)';
    ctx.shadowBlur = isHL ? 18 : 8;
    ctx.fillStyle = isDrag ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)';
    ctx.fillText(item.text, drawX, drawY);

    if (isHL) {
      var tw = ctx.measureText(item.text).width;
      ctx.strokeStyle = 'rgba(160,231,229,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(drawX, drawY, tw / 2 + 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
};

// ===== renderStardustTexts → 统一触发重绘（其它模块调用保持兼容） =====
window.renderStardustTexts = function() { window.drawStardustScene(); };

// ===== Hitbox 命中检测：屏幕坐标 → 空间坐标 → 碰撞框 =====
function hitTestStardustText(clientX, clientY) {
  var spX = (clientX - stardustPanX) / stardustScale;
  var spY = (clientY - stardustPanY) / stardustScale;
  var c = document.getElementById('stardustMainCanvas');
  if (!c) return -1;
  var ctx = c.getContext('2d');
  ctx.font = '16px "PingFang SC", "Helvetica Neue", sans-serif';
  var lineH = 24;
  for (var i = stardustTexts.length - 1; i >= 0; i--) {
    var it = stardustTexts[i];
    var tw = ctx.measureText(it.text).width;
    var left = it.x - tw / 2 - 10;
    var right = it.x + tw / 2 + 10;
    var top = it.y - lineH / 2 - 6;
    var bottom = it.y + lineH / 2 + 6;
    if (spX >= left && spX <= right && spY >= top && spY <= bottom) return i;
  }
  return -1;
}

// ===== 空间变换辅助 =====
window.applyStardustSpaceTransform = function() {
  var space = document.getElementById('stardustSpace');
  if (space) {
    space.style.transform = 'translate(' + Math.round(stardustPanX) + 'px, ' + Math.round(stardustPanY) + 'px) scale(' + stardustScale + ')';
  }
  window.drawStardustScene();
};
window.clientToSpaceCoord = function(cx, cy) {
  return { x: (cx - stardustPanX) / stardustScale, y: (cy - stardustPanY) / stardustScale };
};
window.resetStardustViewport = function() {
  stardustPanX = 0; stardustPanY = 0; stardustScale = 1;
  window.applyStardustSpaceTransform();
};
window.setStardustTool = function(tool) {
  stardustTool = (stardustTool === tool) ? null : tool;
  document.querySelectorAll('.stardust-tool-btn[data-tool]').forEach(function (b) {
    b.classList.remove('stardust-tool-active');
    b.classList.remove('active');
  });
  if (stardustTool) {
    var btn = document.querySelector('.stardust-tool-btn[data-tool="' + stardustTool + '"]');
    if (!btn) {
      var cap = stardustTool.charAt(0).toUpperCase() + stardustTool.slice(1);
      btn = document.getElementById('btnTool' + cap);
    }
    if (btn) {
      btn.classList.add('stardust-tool-active');
      btn.classList.add('active');
    }
  }
  var vp = document.getElementById('stardustViewport');
  if (!vp) return;
  if (!stardustTool)           vp.style.cursor = 'grab';
  else if (stardustTool === 'text') vp.style.cursor = 'text';
};

// ===== 弹窗辅助 =====
function showStardustDialog(id) {
  var dialog = document.getElementById('stardustTextDialog');
  if (!dialog) return;
  window.activeStardustTextId = id;
  if (dialog.parentNode !== document.body) document.body.appendChild(dialog);
  dialog.style.setProperty('z-index', '99999', 'important');
  dialog.style.display = 'flex';
}

// ===== 灵感雷达 =====
window.openStardustRadar = function() {
  var dlg = document.getElementById('stardustRadarDialog');
  if (!dlg) return;
  if (dlg.parentNode !== document.body) document.body.appendChild(dlg);
  dlg.style.setProperty('z-index', '99999', 'important');
  dlg.style.display = 'flex';
  var inp = document.getElementById('stardustRadarInput');
  if (inp) { inp.value = ''; setTimeout(function() { inp.focus(); }, 80); }
  window.filterStardustRadar('');
};
window.filterStardustRadar = function(keyword) {
  var ul = document.getElementById('stardustRadarList');
  if (!ul) return;
  ul.innerHTML = '';
  var kw = (keyword || '').trim().toLowerCase();
  var list = stardustTexts.filter(function(t) { return !kw || t.text.toLowerCase().indexOf(kw) !== -1; });
  if (list.length === 0) {
    ul.innerHTML = '<li style="color:#666; text-align:center; padding:16px; font-size:0.85rem;">暂无碎片</li>';
    return;
  }
  list.forEach(function(item) {
    var li = document.createElement('li');
    li.style.cssText = 'padding:10px 12px; color:rgba(255,255,255,0.85); font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.06); cursor:pointer; transition: background 0.15s;';
    li.onmouseenter = function() { li.style.background = 'rgba(255,255,255,0.08)'; };
    li.onmouseleave = function() { li.style.background = 'transparent'; };
    li.innerText = item.text;
    li.onclick = function() {
      document.getElementById('stardustRadarDialog').style.display = 'none';
      if (typeof window.teleportToStardustText === 'function') window.teleportToStardustText(item.id);
    };
    ul.appendChild(li);
  });
};

// ===== 跃迁引擎 =====
window.teleportToStardustText = function(id) {
  var target = null;
  for (var i = 0; i < stardustTexts.length; i++) {
    if (String(stardustTexts[i].id) === String(id)) { target = stardustTexts[i]; break; }
  }
  if (!target) return;
  stardustScale = 1;
  stardustPanX = window.innerWidth / 2 - target.x;
  stardustPanY = window.innerHeight / 2 - target.y;
  window.applyStardustSpaceTransform();
  _sdHighlightId = target.id;
  window.drawStardustScene();
  if (_sdHighlightTimer) clearTimeout(_sdHighlightTimer);
  _sdHighlightTimer = setTimeout(function() { _sdHighlightId = -1; window.drawStardustScene(); }, 1500);
};

// ===== 交互引擎 =====
window.initStardustDragEngine = function() {
  var viewport = document.getElementById('stardustViewport');
  var space    = document.getElementById('stardustSpace');
  if (!viewport || !space) return;

  resizeStardustCanvas();
  window.removeEventListener('resize', window._stardustWinResizeHandler);
  window.addEventListener('resize', window._stardustWinResizeHandler);
  if (window.visualViewport && !window._stardustVvResizeBound) {
    window._stardustVvResizeBound = true;
    window.visualViewport.addEventListener('resize', window._stardustWinResizeHandler);
  }

  if (viewport._v6Start) {
    viewport.removeEventListener('pointerdown', viewport._v6Start);
    viewport.removeEventListener('pointermove', viewport._v6Move);
    window.removeEventListener('pointerup', viewport._v6End);
    viewport.removeEventListener('wheel', viewport._v6Wheel);
    viewport.removeEventListener('touchstart', viewport._v6TStart);
    viewport.removeEventListener('touchmove', viewport._v6TMove);
  }

  var _pinchDist0 = 0; var _pinchScale0 = 1;
  function touchDist(t) { var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY; return Math.sqrt(dx*dx+dy*dy)||1; }

  viewport._v6TStart = function(e) {
    if (e.touches.length === 2) { e.preventDefault(); _pinchDist0=touchDist(e.touches); _pinchScale0=stardustScale; }
  };
  viewport._v6TMove = function(e) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    stardustScale = Math.max(0.3, Math.min(_pinchScale0 * (touchDist(e.touches) / _pinchDist0), 4));
    window.applyStardustSpaceTransform();
  };

  viewport._sdPanArmed = false;
  var _pointerDownHitIdx = -1;

  viewport._v6Start = function(e) {
    // 👉 绝对豁免权：返回按钮、弹窗黑幕、以及黑洞里的残影文字，漫游引擎立刻放行！
    if (e.target && (
      e.target.closest('.stardust-back-btn') ||
      e.target.closest('.stardust-universe-back-btn') ||
      e.target.classList.contains('cold-dialog-backdrop') ||
      e.target.closest('.blackhole-remnant')
    )) {
      return;
    }
    if (e.target.closest('.stardust-tool-btn') || e.target.tagName.toLowerCase() === 'input') return;
    isSdInteracting = true;
    viewport._sdPanArmed = false;
    _pointerDownHitIdx = -1;
    var cx = e.clientX, cy = e.clientY;
    var sp = window.clientToSpaceCoord(cx, cy);
    var hitIdx = hitTestStardustText(cx, cy);

    if (!stardustTool && hitIdx >= 0) {
      _pointerDownHitIdx = hitIdx;
      _sdDragTextTimer = setTimeout(function() {
        _sdDragTextIdx = hitIdx;
        _sdDragOffsetX = sp.x - stardustTexts[hitIdx].x;
        _sdDragOffsetY = sp.y - stardustTexts[hitIdx].y;
        window.drawStardustScene();
        if (typeof safeVibrate === 'function') safeVibrate([2, 3]);
      }, 300);
    }

    if (!stardustTool) {
      if (hitIdx < 0) {
        viewport._sdPanArmed = true;
        viewport.style.cursor = 'grabbing';
        sdStartX = cx - stardustPanX; sdStartY = cy - stardustPanY;
      }
    } else if (stardustTool === 'text') {
      isSdInteracting = false;
      var screenX = cx;
      var screenY = cy;
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.style.cssText = 'position:fixed !important; left:' + screenX + 'px !important; top:' + screenY + 'px !important; z-index:100000 !important; background:transparent; border:none; outline:none; color:#fff; font-size:1.1rem; text-shadow:0 0 10px rgba(255,255,255,0.8); border-bottom:1px dashed rgba(255,255,255,0.5); transform:translate(-50%,-50%); text-align:center; pointer-events:auto;';
      inp.placeholder = '写下星辰...';
      inp.onblur = function() {
        if (inp.value.trim() !== '') {
          var targetSpaceX = (screenX - stardustPanX) / stardustScale;
          var targetSpaceY = (screenY - stardustPanY) / stardustScale;
          stardustTexts.push({ id: Date.now(), text: inp.value, x: targetSpaceX, y: targetSpaceY });
          window.saveStardustTexts();
          window.drawStardustScene();
        }
        inp.remove();
        window.setStardustTool(null);
      };
      inp.onkeydown = function(ke) { if (ke.key === 'Enter') inp.blur(); };
      document.body.appendChild(inp);
      setTimeout(function() { inp.focus(); }, 50);
    }
  };

  viewport._v6Move = function(e) {
    if (!isSdInteracting) return;
    e.preventDefault();
    var cx = e.clientX, cy = e.clientY;
    var sp = window.clientToSpaceCoord(cx, cy);

    if (_sdDragTextTimer && _sdDragTextIdx < 0) {
      clearTimeout(_sdDragTextTimer); _sdDragTextTimer = null;
    }

    if (_sdDragTextIdx >= 0) {
      stardustTexts[_sdDragTextIdx].x = sp.x - _sdDragOffsetX;
      stardustTexts[_sdDragTextIdx].y = sp.y - _sdDragOffsetY;
      window.drawStardustScene();
      return;
    }

    if (!stardustTool && viewport._sdPanArmed) {
      var PAN_LIMIT = 1500;
      stardustPanX = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, cx - sdStartX));
      stardustPanY = Math.max(-PAN_LIMIT, Math.min(PAN_LIMIT, cy - sdStartY));
      window.applyStardustSpaceTransform();
    }
  };

  viewport._v6End = function(e) {
    isSdInteracting = false;
    viewport._sdPanArmed = false;
    var wasTimerPending = (_sdDragTextTimer !== null);
    if (_sdDragTextTimer) { clearTimeout(_sdDragTextTimer); _sdDragTextTimer = null; }

    if (_sdDragTextIdx >= 0) {
      window.saveStardustTexts();
      _sdDragTextIdx = -1;
      window.drawStardustScene();
    } else if (wasTimerPending && _pointerDownHitIdx >= 0) {
      var hitItem = stardustTexts[_pointerDownHitIdx];
      if (hitItem) showStardustDialog(hitItem.id);
    }
    _pointerDownHitIdx = -1;
    if (!stardustTool) viewport.style.cursor = 'grab';
  };

  viewport._v6Wheel = function(e) {
    e.preventDefault();
    stardustScale = Math.max(0.3, Math.min(stardustScale * (1 + e.deltaY * -0.001), 4));
    window.applyStardustSpaceTransform();
  };

  viewport.addEventListener('pointerdown', viewport._v6Start);
  viewport.addEventListener('pointermove', viewport._v6Move);
  window.addEventListener('pointerup', viewport._v6End);
  viewport.addEventListener('wheel', viewport._v6Wheel, { passive: false });
  viewport.addEventListener('touchstart', viewport._v6TStart, { passive: false });
  viewport.addEventListener('touchmove', viewport._v6TMove, { passive: false });
};

// 在打开星尘宇宙时，激活全息引擎
var _originalOpenUniverseForDrag = window.openUniverse;
window.openUniverse = function(type) {
  if (_originalOpenUniverseForDrag) _originalOpenUniverseForDrag(type);
  if (type === 'stardust') {
    // 👉 v8.3.4核心修复：用户的神级直觉——「模拟第二次进入」。
    // 利用三段式脉冲重绘，彻底解决 display:none 瞬间布局未稳导致的 Canvas 亚像素模糊

    // 脉冲 1：立即重置并绘制（抢占首屏）
    if (typeof resizeStardustCanvas === 'function') resizeStardustCanvas();
    if (typeof window.drawStardustScene === 'function') window.drawStardustScene();

    // 脉冲 2：50ms后，等待 DOM 物理体积彻底展开后二次重绘（模拟第二次进入）
    setTimeout(function () {
      if (typeof resizeStardustCanvas === 'function') resizeStardustCanvas();
      if (typeof window.drawStardustScene === 'function') window.drawStardustScene();
    }, 50);

    // 脉冲 3：200ms后，等待所有系统动画尘埃落定后的终极高清覆写
    setTimeout(function () {
      if (typeof resizeStardustCanvas === 'function') resizeStardustCanvas();
      if (typeof window.drawStardustScene === 'function') window.drawStardustScene();
    }, 200);

    setTimeout(function() {
      window.initStardustDragEngine();
      window.drawStardustScene();
    }, 100);
  }
};

// ============================================================
// v8 修复：从 v7 迁移并补齐 - 静默唤醒神经
// ============================================================

// 👉 PWA 后台切回前台时，自动触发云端收件箱检查（保持与 v6.9.9 一致）
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (typeof processCloudInbox === 'function') {
            processCloudInbox();
        }
    }
});

// 👉 页面加载完毕后，延迟 1.5 秒静默检查并消化收件箱（让出首屏渲染性能）
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        if (typeof processCloudInbox === 'function') processCloudInbox();
    }, 1500);
});

//触发部署到