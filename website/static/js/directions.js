// directions.js - Eligibility Calculator

document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.querySelector('.btn-calc');
  const resultsBox = document.getElementById('results-box');
  const finalAvgEl = document.getElementById('final-avg');
  const approxPointsEl = document.getElementById('approx-points');
  const behaviorStatusEl = document.getElementById('behavior-status');
  const pathwayResults = document.getElementById('pathway-results');

  calcBtn.addEventListener('click', calculateEligibility);

  async function calculateEligibility() {
    calcBtn.disabled = true;
    calcBtn.textContent = 'Пресметува...';
    resultsBox.style.display = 'none';

    // === Collect grades (only 6–9) ===
    const grades = [6, 7, 8, 9].map(i => {
      const input = document.getElementById(`success-${i}`);
      const val = parseFloat(input?.value) || NaN;
      return isNaN(val) ? null : val;
    });

    // === Collect behavior (6–9) ===
    const behaviors = [6, 7, 8, 9].map(i => {
      const select = document.getElementById(`behavior-${i}`);
      return parseInt(select?.value) || 5;
    });

    // Validation: all grades required
    if (grades.some(g => g === null)) {
      alert('Ве молиме пополнете го просекот за сите четири години (6–9).');
      resetButton();
      return;
    }

    // === Calculations ===
    const avgSuccess = grades.reduce((a, b) => a + b, 0) / 4;
    finalAvgEl.textContent = avgSuccess.toFixed(2);

    const avgBehavior = behaviors.reduce((a, b) => a + b, 0) / 4;

    // Behavior status
    let statusText = '';
    if (avgBehavior >= 4.8)      statusText = 'Одличен ученик 🏆';
    else if (avgBehavior >= 4.0) statusText = 'Многу добар ученик 👍';
    else if (avgBehavior >= 3.0) statusText = 'Добар ученик 🙂';
    else                         statusText = 'Потребно подобрување во однесувањето ⚠️';
    behaviorStatusEl.textContent = statusText;

    // === Approximate total points ===
    // Simplified Macedonian-style approximation:
    // Success: avg × 10
    // Behavior: 5→5, 4→3, 3→1, <3→0
    const behaviorPoints = behaviors.map(b => b >= 5 ? 5 : b >= 4 ? 3 : b >= 3 ? 1 : 0);
    const avgBehaviorPoints = behaviorPoints.reduce((a, b) => a + b, 0) / 4;
    const approxTotal = (avgSuccess * 10) + avgBehaviorPoints;
    approxPointsEl.textContent = approxTotal.toFixed(1);

    // === Determine eligible directions ===
    pathwayResults.innerHTML = '';
    let eligible = [];

    // Гимназија + билингвална (highest requirements)
    if (avgSuccess >= 4.20 && avgBehavior >= 4.50) {
      eligible.push(
        { text: "Гимназиско (Општествено-хуманистичко A)", link: "gim-oh-a.html" },
        { text: "Гимназиско (Општествено-хуманистичко B)", link: "gim-oh-b.html" },
        { text: "Гимназиско (Природно-математичко A)", link: "gim-pm-a.html" },
        { text: "Гимназиско (Природно-математичко B)", link: "gim-pm-b.html" },
        { text: "Билингвална паралелка (македонски + француски)", link: "gim-fr.html" }
      );
    }

    // Економија / Трговија
    if (avgSuccess >= 4.00) {
      eligible.push(
        { text: "Економска струка", link: "ekonomija.html" },
        { text: "Трговска струка", link: "trgovija.html" }
      );
    }

    // ЕКТИА / IT / Енергетика
    if (avgSuccess >= 3.80) {
      eligible.push(
        { text: "Електротехничар за компјутерска техника и автоматика", link: "it-avtomatika.html" },
        { text: "Електромеханичар за компјутерска техника (дуално)", link: "ektiia-dual.html" }
      );
    }
    if (avgSuccess >= 3.50) {
      eligible.push(
        { text: "Електротехничар енергетичар", link: "ektiia-energeticar.html" }
      );
    }

    // Хемија / Прехранбен
    if (avgSuccess >= 3.20) {
      eligible.push(
        { text: "Прехранбен техничар", link: "hrana.html" },
        { text: "Хемиски лабораториски техничар", link: "hemija.html" }
      );
    }

    // Render results
    if (eligible.length === 0) {
      const li = document.createElement('li');
      li.innerHTML = `<strong style="color:#f43f5e;">Со овој просек и однесување нема достапни смерови во нашето училиште.</strong>`;
      pathwayResults.appendChild(li);
    } else {
      eligible.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${item.link}" class="result-link" target="_blank">${item.text}</a>`;
        pathwayResults.appendChild(li);
      });
    }

    // Show results and scroll
    resultsBox.style.display = 'block';
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    resetButton();
  }

  function resetButton() {
    calcBtn.disabled = false;
    calcBtn.textContent = 'Провери достапни смерови';
  }
});