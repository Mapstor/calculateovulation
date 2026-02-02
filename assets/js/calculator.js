/* ============================================
   OVULATION CALCULATOR - MAIN JAVASCRIPT
   ============================================ */

// State
let state = {
  lastPeriodDate: null,
  cycleLength: 28,
  periodLength: 5,
  isIrregular: false
};

// Constants
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Fertility chances by day relative to ovulation
const FERTILITY_BY_DAY = {
  '-5': { chance: 5, level: 'low' },
  '-4': { chance: 9, level: 'low' },
  '-3': { chance: 15, level: 'medium' },
  '-2': { chance: 25, level: 'high' },
  '-1': { chance: 33, level: 'peak' },
  '0': { chance: 30, level: 'high' },  // Ovulation day
  '1': { chance: 18, level: 'medium' },
  '2': { chance: 5, level: 'low' }
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupDateInput();
  setupSliders();
  setupCheckbox();
  setupCalculateButton();
  setupFAQ();
  setupMobileNav();
  setDefaultDate();
}

function setDefaultDate() {
  const dateInput = document.getElementById('last-period-date');
  if (dateInput) {
    // Default to ~2 weeks ago
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 14);
    dateInput.valueAsDate = defaultDate;
    state.lastPeriodDate = defaultDate;
  }
}

function setupDateInput() {
  const dateInput = document.getElementById('last-period-date');
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      state.lastPeriodDate = dateInput.valueAsDate;
    });
  }
}

function setupSliders() {
  // Cycle length slider
  const cycleSlider = document.getElementById('cycle-length-slider');
  const cycleValue = document.getElementById('cycle-length-value');
  
  if (cycleSlider && cycleValue) {
    cycleSlider.addEventListener('input', () => {
      state.cycleLength = parseInt(cycleSlider.value);
      cycleValue.textContent = cycleSlider.value;
    });
  }
  
  // Period length slider
  const periodSlider = document.getElementById('period-length-slider');
  const periodValue = document.getElementById('period-length-value');
  
  if (periodSlider && periodValue) {
    periodSlider.addEventListener('input', () => {
      state.periodLength = parseInt(periodSlider.value);
      periodValue.textContent = periodSlider.value;
    });
  }
}

function setupCheckbox() {
  const checkbox = document.getElementById('irregular-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      state.isIrregular = checkbox.checked;
    });
  }
}

function setupCalculateButton() {
  const btn = document.querySelector('.calculate-btn');
  if (btn) {
    btn.addEventListener('click', calculate);
  }
}

function calculate() {
  if (!state.lastPeriodDate) {
    alert('Please select the first day of your last period.');
    return;
  }
  
  // Calculate ovulation date (cycle length - 14 days for luteal phase)
  const ovulationDate = new Date(state.lastPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() + state.cycleLength - 14);
  
  // Fertile window (5 days before ovulation to 1 day after)
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  // Next period
  const nextPeriod = new Date(state.lastPeriodDate);
  nextPeriod.setDate(nextPeriod.getDate() + state.cycleLength);
  
  // Due date if conceived (266 days from ovulation, or 280 from LMP)
  const dueDate = new Date(ovulationDate);
  dueDate.setDate(dueDate.getDate() + 266);
  
  // Cycle day
  const today = new Date();
  const cycleDay = Math.floor((today - state.lastPeriodDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // Display results
  displayResults({
    ovulationDate,
    fertileStart,
    fertileEnd,
    nextPeriod,
    dueDate,
    cycleDay
  });
  
  // Generate fertility chart
  generateFertilityChart(ovulationDate);
  
  // Generate 3-month calendar
  generateCalendars(state.lastPeriodDate, ovulationDate, state.cycleLength, state.periodLength);
  
  // Show results
  const resultsSection = document.querySelector('.results-section');
  if (resultsSection) {
    resultsSection.classList.add('visible');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function displayResults(results) {
  // Ovulation date - compact format
  const ovulationEl = document.getElementById('ovulation-date');
  if (ovulationEl) {
    ovulationEl.textContent = formatDateMedium(results.ovulationDate);
  }

  const ovulationDayEl = document.getElementById('ovulation-day');
  if (ovulationDayEl) {
    const dayNum = state.cycleLength - 14;
    ovulationDayEl.textContent = `Day ${dayNum}`;
  }

  // Best days (O-2, O-1, O)
  const bestDaysEl = document.getElementById('best-days-dates');
  if (bestDaysEl) {
    const bestStart = new Date(results.ovulationDate);
    bestStart.setDate(bestStart.getDate() - 2);
    const bestEnd = results.ovulationDate;
    bestDaysEl.textContent = `${formatDateShort(bestStart)} – ${formatDateShort(bestEnd)}`;
  }

  // Fertile window
  const fertileEl = document.getElementById('fertile-window');
  if (fertileEl) {
    fertileEl.textContent = `${formatDateShort(results.fertileStart)} – ${formatDateShort(results.fertileEnd)}`;
  }

  // Next period
  const periodEl = document.getElementById('next-period');
  if (periodEl) {
    periodEl.textContent = formatDateShort(results.nextPeriod);
  }

  // Due date
  const dueEl = document.getElementById('due-date');
  if (dueEl) {
    dueEl.textContent = formatDateShort(results.dueDate);
  }

  // Statistics grid
  displayStatistics(results);

  // Key dates table
  displayKeyDatesTable(results);

  // Pregnancy section
  displayPregnancySection(results);

  // Generate cycle timeline
  generateCycleTimeline(results.ovulationDate);
}

function displayStatistics(results) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Cycle day
  const cycleDayEl = document.getElementById('stat-cycle-day');
  if (cycleDayEl) {
    cycleDayEl.textContent = results.cycleDay > 0 ? results.cycleDay : '--';
  }

  // Days until ovulation
  const daysToOvEl = document.getElementById('stat-days-to-ovulation');
  if (daysToOvEl) {
    const daysToOv = Math.ceil((results.ovulationDate - today) / (1000 * 60 * 60 * 24));
    if (daysToOv > 0) {
      daysToOvEl.textContent = daysToOv;
    } else if (daysToOv === 0) {
      daysToOvEl.textContent = 'Today!';
      daysToOvEl.classList.add('primary');
    } else {
      daysToOvEl.textContent = `${Math.abs(daysToOv)} ago`;
    }
  }

  // Luteal phase (always 14 in our model)
  const lutealEl = document.getElementById('stat-luteal');
  if (lutealEl) {
    lutealEl.textContent = '14 days';
  }
}

function displayKeyDatesTable(results) {
  const tbody = document.getElementById('key-dates-tbody');
  if (!tbody) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = [
    { event: 'Fertile Window Starts', date: results.fertileStart, icon: '🌱' },
    { event: 'Peak Fertility Day', date: new Date(results.ovulationDate.getTime() - 24*60*60*1000), icon: '⭐', highlight: true },
    { event: 'Estimated Ovulation', date: results.ovulationDate, icon: '🌸', highlight: true },
    { event: 'Fertile Window Ends', date: results.fertileEnd, icon: '🌱' },
    { event: 'Next Period', date: results.nextPeriod, icon: '📅' },
    { event: 'Potential Due Date', date: results.dueDate, icon: '👶' }
  ];

  let html = '';
  dates.forEach(item => {
    const daysAway = Math.ceil((item.date - today) / (1000 * 60 * 60 * 24));
    let statusText = '';
    let statusClass = '';

    if (daysAway === 0) {
      statusText = 'Today';
      statusClass = 'soon';
    } else if (daysAway === 1) {
      statusText = 'Tomorrow';
      statusClass = 'soon';
    } else if (daysAway > 0 && daysAway <= 7) {
      statusText = `In ${daysAway} days`;
      statusClass = 'soon';
    } else if (daysAway > 7) {
      statusText = `In ${daysAway} days`;
    } else {
      statusText = `${Math.abs(daysAway)} days ago`;
    }

    const rowClass = item.highlight ? 'highlight-row' : '';
    html += `
      <tr class="${rowClass}">
        <td>${item.icon} ${item.event}</td>
        <td>${formatDateShort(item.date)}</td>
        <td><span class="days-away ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function displayPregnancySection(results) {
  const dueDate = results.dueDate;
  const ovulationDate = results.ovulationDate;

  // Due date display
  const dueDateEl = document.getElementById('pregnancy-due-date');
  if (dueDateEl) {
    dueDateEl.textContent = formatDateShort(dueDate);
  }

  // Season
  const seasonEl = document.getElementById('pregnancy-due-season');
  if (seasonEl) {
    const month = dueDate.getMonth();
    let season = '';
    if (month >= 2 && month <= 4) season = 'Spring Baby 🌷';
    else if (month >= 5 && month <= 7) season = 'Summer Baby ☀️';
    else if (month >= 8 && month <= 10) season = 'Fall Baby 🍂';
    else season = 'Winter Baby ❄️';
    seasonEl.textContent = season;
  }

  // Trimester dates (from LMP perspective, which is ovulation - 14 days)
  const lmp = new Date(ovulationDate);
  lmp.setDate(lmp.getDate() - 14);

  // 1st trimester: weeks 1-12 (0-84 days from LMP)
  const t1End = new Date(lmp);
  t1End.setDate(t1End.getDate() + 84);
  const t1El = document.getElementById('trimester-1-dates');
  if (t1El) {
    t1El.textContent = `${formatDateShort(lmp)} – ${formatDateShort(t1End)}`;
  }

  // 2nd trimester: weeks 13-26 (85-182 days from LMP)
  const t2Start = new Date(lmp);
  t2Start.setDate(t2Start.getDate() + 85);
  const t2End = new Date(lmp);
  t2End.setDate(t2End.getDate() + 182);
  const t2El = document.getElementById('trimester-2-dates');
  if (t2El) {
    t2El.textContent = `${formatDateShort(t2Start)} – ${formatDateShort(t2End)}`;
  }

  // 3rd trimester: weeks 27-40 (183-280 days from LMP)
  const t3Start = new Date(lmp);
  t3Start.setDate(t3Start.getDate() + 183);
  const t3El = document.getElementById('trimester-3-dates');
  if (t3El) {
    t3El.textContent = `${formatDateShort(t3Start)} – ${formatDateShort(dueDate)}`;
  }

  // Milestones
  const milestonesEl = document.getElementById('pregnancy-milestones');
  if (milestonesEl) {
    const milestones = [
      { week: 8, desc: 'First heartbeat detectable' },
      { week: 12, desc: 'End of 1st trimester' },
      { week: 20, desc: 'Anatomy scan / Gender reveal' },
      { week: 24, desc: 'Viability milestone' },
      { week: 28, desc: 'Third trimester begins' },
      { week: 37, desc: 'Full term begins' }
    ];

    let html = '';
    milestones.forEach(m => {
      const date = new Date(lmp);
      date.setDate(date.getDate() + (m.week * 7));
      html += `
        <div class="milestone">
          <div class="milestone-dot"></div>
          <span class="milestone-week">Week ${m.week}</span>
          <span>${m.desc} (${formatDateShort(date)})</span>
        </div>
      `;
    });
    milestonesEl.innerHTML = html;
  }
}

function formatDateMedium(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function generateCycleTimeline(ovulationDate) {
  const container = document.getElementById('cycle-timeline');
  if (!container) return;

  const cycleLength = state.cycleLength;
  const periodLength = state.periodLength;
  const ovulationDay = cycleLength - 14;

  // Calculate segment widths as percentages
  const periodWidth = (periodLength / cycleLength) * 100;
  const fertileStart = ovulationDay - 5;
  const follicularWidth = Math.max(0, ((fertileStart - periodLength) / cycleLength) * 100);
  const fertileLowWidth = (3 / cycleLength) * 100; // days -5, -4, -3
  const fertileHighWidth = (2 / cycleLength) * 100; // days -2, -1
  const ovulationWidth = (2 / cycleLength) * 100; // ovulation + day after
  const lutealWidth = ((cycleLength - ovulationDay - 2) / cycleLength) * 100;

  container.innerHTML = `
    <div class="timeline-wrapper">
      <div class="timeline-track">
        <div class="timeline-segment period" style="width: ${periodWidth}%" title="Period (Days 1-${periodLength})"></div>
        <div class="timeline-segment follicular" style="width: ${follicularWidth}%" title="Follicular Phase"></div>
        <div class="timeline-segment fertile-low" style="width: ${fertileLowWidth}%" title="Low Fertility"></div>
        <div class="timeline-segment fertile-high" style="width: ${fertileHighWidth}%" title="High Fertility"></div>
        <div class="timeline-segment ovulation" style="width: ${ovulationWidth}%" title="Ovulation Day ${ovulationDay}"></div>
        <div class="timeline-segment luteal" style="width: ${lutealWidth}%" title="Luteal Phase"></div>
      </div>
      <div class="timeline-days">
        <span class="timeline-day-marker">Day 1</span>
        <span class="timeline-day-marker highlight">Day ${ovulationDay}</span>
        <span class="timeline-day-marker">Day ${cycleLength}</span>
      </div>
    </div>
    <div class="timeline-legend">
      <span class="timeline-legend-item"><span class="timeline-legend-dot period"></span>Period</span>
      <span class="timeline-legend-item"><span class="timeline-legend-dot fertile"></span>Fertile</span>
      <span class="timeline-legend-item"><span class="timeline-legend-dot ovulation"></span>Ovulation</span>
      <span class="timeline-legend-item"><span class="timeline-legend-dot luteal"></span>Luteal</span>
    </div>
  `;
}

function generateFertilityChart(ovulationDate) {
  const container = document.getElementById('fertility-chart');
  if (!container) return;

  let html = '';

  for (let offset = -5; offset <= 2; offset++) {
    const date = new Date(ovulationDate);
    date.setDate(date.getDate() + offset);

    const fertility = FERTILITY_BY_DAY[offset.toString()] || { chance: 0, level: 'low' };
    const dayNum = state.cycleLength - 14 + offset;

    // Determine special classes
    let barClasses = 'fertility-bar';
    if (offset === -1) barClasses += ' is-peak';
    else if (offset === 0) barClasses += ' is-ovulation';

    // Format date compactly: "Jan 23"
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    html += `
      <div class="${barClasses}">
        <div class="fertility-bar-date">${dateStr} (D${dayNum})</div>
        <div class="fertility-bar-track">
          <div class="fertility-bar-fill ${fertility.level}" style="width: ${fertility.chance * 3}%"></div>
        </div>
        <div class="fertility-bar-percent">${fertility.chance}%</div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function generateCalendars(lastPeriod, ovulationDate, cycleLength, periodLength) {
  const container = document.getElementById('calendars-container');
  if (!container) return;
  
  // Generate 3 months starting from last period's month
  const startMonth = new Date(lastPeriod.getFullYear(), lastPeriod.getMonth(), 1);
  
  let html = '';
  
  for (let m = 0; m < 3; m++) {
    const monthDate = new Date(startMonth);
    monthDate.setMonth(monthDate.getMonth() + m);
    
    html += generateMonthCalendar(monthDate, lastPeriod, ovulationDate, cycleLength, periodLength);
  }
  
  container.innerHTML = html;
}

function generateMonthCalendar(monthDate, lastPeriod, ovulationDate, cycleLength, periodLength) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  let html = `
    <div class="calendar-month">
      <div class="calendar-month-header">${MONTHS[month]} ${year}</div>
      <div class="calendar-grid">
  `;
  
  // Day headers
  DAYS.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }
  
  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const classes = ['calendar-day'];
    
    // Check if today
    if (date.toDateString() === today.toDateString()) {
      classes.push('today');
    }
    
    // Calculate which cycle this day belongs to
    const dayType = getDayType(date, lastPeriod, ovulationDate, cycleLength, periodLength);
    if (dayType) {
      classes.push(dayType);
    }
    
    html += `<div class="${classes.join(' ')}">${day}</div>`;
  }
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

function getDayType(date, lastPeriod, ovulationDate, cycleLength, periodLength) {
  // Calculate for multiple cycles
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceLastPeriod = Math.floor((date - lastPeriod) / msPerDay);
  
  // Handle dates before last period
  if (daysSinceLastPeriod < 0) return null;
  
  // Calculate which cycle we're in
  const cycleNumber = Math.floor(daysSinceLastPeriod / cycleLength);
  const dayInCycle = daysSinceLastPeriod % cycleLength;
  
  // Period days (0 to periodLength-1)
  if (dayInCycle < periodLength) {
    return 'period';
  }
  
  // Ovulation day for this cycle
  const ovulationDay = cycleLength - 14;
  
  // Fertile window (5 days before to 1 day after ovulation)
  if (dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 1) {
    if (dayInCycle === ovulationDay) {
      return 'ovulation';
    } else if (dayInCycle >= ovulationDay - 2) {
      return 'fertile-high';
    } else {
      return 'fertile-low';
    }
  }
  
  return null;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
}

function setupFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      
      if (!wasOpen) {
        item.classList.add('open');
      }
    });
  });
}

function setupMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('active');
      }
    });
  }
}

// Copy results
function copyResults() {
  const ovulation = document.getElementById('ovulation-date')?.textContent || '';
  const fertile = document.getElementById('fertile-window')?.textContent || '';
  const nextPeriod = document.getElementById('next-period')?.textContent || '';
  const dueDate = document.getElementById('due-date')?.textContent || '';
  
  const text = `My Ovulation Calculator Results
================================
Ovulation Date: ${ovulation}
Fertile Window: ${fertile}
Next Period: ${nextPeriod}
Due Date (if conceived): ${dueDate}

Calculated at calculateovulation.org`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Results copied to clipboard!');
  });
}

// Share results
function shareResults() {
  const url = new URL(window.location.href);
  if (state.lastPeriodDate) {
    url.searchParams.set('lp', state.lastPeriodDate.toISOString().split('T')[0]);
    url.searchParams.set('cl', state.cycleLength);
    url.searchParams.set('pl', state.periodLength);
  }
  
  navigator.clipboard.writeText(url.toString()).then(() => {
    alert('Link copied to clipboard!');
  });
}

// Scroll to calculator (for "Calculate Again" buttons)
function scrollToCalculator() {
  const card = document.querySelector('.calculator-card');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Load from URL params
(function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('lp')) {
    window.addEventListener('DOMContentLoaded', () => {
      const dateInput = document.getElementById('last-period-date');
      const cycleSlider = document.getElementById('cycle-length-slider');
      const cycleValue = document.getElementById('cycle-length-value');
      const periodSlider = document.getElementById('period-length-slider');
      const periodValue = document.getElementById('period-length-value');
      
      const lp = params.get('lp');
      const cl = parseInt(params.get('cl')) || 28;
      const pl = parseInt(params.get('pl')) || 5;
      
      if (dateInput) {
        dateInput.value = lp;
        state.lastPeriodDate = new Date(lp + 'T00:00:00');
      }
      
      if (cycleSlider && cycleValue) {
        cycleSlider.value = cl;
        cycleValue.textContent = cl;
        state.cycleLength = cl;
      }
      
      if (periodSlider && periodValue) {
        periodSlider.value = pl;
        periodValue.textContent = pl;
        state.periodLength = pl;
      }
      
      setTimeout(calculate, 100);
    });
  }
})();

// ============================================
// MINI CALCULATOR (404 Page)
// ============================================

function initMiniCalc() {
  const btn = document.getElementById('mini-calc-btn');
  if (!btn) return;

  btn.addEventListener('click', function() {
    const dateInput = document.getElementById('mini-calc-date');
    const cycleSelect = document.getElementById('mini-calc-cycle');
    if (!dateInput || !dateInput.value) {
      alert('Please select the first day of your last period.');
      return;
    }

    const lastPeriod = new Date(dateInput.value + 'T00:00:00');
    const cycleLen = parseInt(cycleSelect.value) || 28;
    const ovDay = cycleLen - 14;

    const ovulationDate = new Date(lastPeriod);
    ovulationDate.setDate(ovulationDate.getDate() + ovDay);

    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);

    const fmt = function(d) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const resultEl = document.getElementById('mini-calc-result');
    if (resultEl) {
      resultEl.innerHTML =
        '<div class="result-row"><span>Estimated Ovulation</span><strong>' + fmt(ovulationDate) + '</strong></div>' +
        '<div class="result-row"><span>Fertile Window</span><strong>' + fmt(fertileStart) + ' – ' + fmt(fertileEnd) + '</strong></div>' +
        '<div class="result-row"><span>Next Period</span><strong>' + fmt(nextPeriod) + '</strong></div>';
      resultEl.classList.add('visible');
    }
  });
}

// ============================================
// CATEGORY FILTER (Blog Listing)
// ============================================

function initCategoryFilters() {
  const buttons = document.querySelectorAll('.category-btn');
  const cards = document.querySelectorAll('.blog-card[data-category]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const category = this.getAttribute('data-filter');

      // Toggle active state
      buttons.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');

      // Filter cards
      cards.forEach(function(card) {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.classList.remove('hidden-by-filter');
        } else {
          card.classList.add('hidden-by-filter');
        }
      });
    });
  });
}

// Initialize mini-calc and filters on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initMiniCalc();
  initCategoryFilters();
});
