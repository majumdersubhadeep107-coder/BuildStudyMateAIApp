/**
 * StudyMate AI — Standalone Vanilla JavaScript Client
 * Calls /api/study/analyze (Node.js -> Python 3 Engine) with resilient client fallback.
 */
;(function () {
  const statusEl = document.getElementById('engineStatus')
  const titleEl = document.getElementById('topicTitle')
  const notesEl = document.getElementById('notesInput')
  const btnEl = document.getElementById('analyzeBtn')
  const outEl = document.getElementById('outputContainer')

  async function checkHealth() {
    try {
      const res = await fetch('/api/study/health')
      const data = await res.json()
      if (data && data.ok) {
        statusEl.textContent = (data.runtime?.gateway || 'Node.js') + ' · Python ' + (data.pythonVersion || '3.x')
        return
      }
    } catch (_err) {
      // Fallback mode when opened from static filesystem
    }
    statusEl.textContent = 'Browser JS Engine Ready'
  }

  function renderResult(data) {
    const keywords = (data.keywords || [])
      .map((k) => `<span class="pill">${k.term} (${Math.round(k.salience * 100)}%)</span>`)
      .join('')
    const summaryItems = (data.summary || []).map((s) => `<li>${s}</li>`).join('')
    const cards = (data.flashcards || [])
      .map(
        (c) =>
          `<div class="flashcard"><strong>Q: ${c.front}</strong><span style="color:#475467">A: ${c.back}</span></div>`,
      )
      .join('')

    outEl.innerHTML = `
      <div style="margin-bottom:10px;font-size:12px;color:#3b4fe4;font-weight:600;">
        Processed via ${data.runtime?.gateway || 'Browser JS'} &rarr; ${data.engine || 'StudyMate NLP'}
        ${data.runtime?.latencyMs ? `(${data.runtime.latencyMs} ms)` : ''}
      </div>
      <h3 style="font-size:14px;margin:12px 0 6px;color:#14151a;">Extracted Concepts</h3>
      <div class="pill-list">${keywords}</div>
      <h3 style="font-size:14px;margin:12px 0 6px;color:#14151a;">Executive Summary</h3>
      <ul style="padding-left:18px;color:#14151a;">${summaryItems}</ul>
      <h3 style="font-size:14px;margin:16px 0 8px;color:#14151a;">Generated Active-Recall Flashcards</h3>
      ${cards}
    `
  }

  btnEl.addEventListener('click', async () => {
    btnEl.disabled = true
    btnEl.textContent = 'Running Synthesis...'
    try {
      const res = await fetch('/api/study/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          title: titleEl.value,
          notes: notesEl.value,
        }),
      })
      const data = await res.json()
      renderResult(data)
    } catch (err) {
      outEl.textContent = 'Synthesis failed: ' + err.message
    } finally {
      btnEl.disabled = false
      btnEl.textContent = 'Synthesize with Node.js + Python'
    }
  })

  checkHealth()
})()
