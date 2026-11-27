document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.__API_BASE__ || '';
    const form = document.getElementById('ask-form');
    const queryInput = document.getElementById('query');
    const askBtn = document.getElementById('ask-btn');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const emptyState = document.getElementById('empty-state');
    const answerEn = document.getElementById('answer-en');
    const answerKn = document.getElementById('answer-kn');
    const waStatus = document.getElementById('wa-status');

    // Suggestion chips fill the textarea
    document.querySelectorAll('.suggestion').forEach(chip => {
        chip.addEventListener('click', () => {
            queryInput.value = chip.getAttribute('data-query');
            queryInput.focus();
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = queryInput.value.trim();
        if (!query) return;

        // UI state: loading
        emptyState.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        loadingDiv.classList.add('flex');
        askBtn.disabled = true;
        askBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Asking…';

        try {
            const response = await fetch(`${API_BASE}/api/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Request failed');

            answerEn.textContent = result.data.answer_en || '—';
            answerKn.textContent = result.data.answer_kn || '—';

            const wa = result.whatsapp || {};
            if (wa.sent) {
                waStatus.className = 'text-sm flex items-center text-green-600';
                waStatus.innerHTML = '<i class="fas fa-circle-check mr-2"></i> Sent to WhatsApp';
            } else {
                waStatus.className = 'text-sm flex items-center text-gray-500';
                waStatus.innerHTML = '<i class="fas fa-circle-info mr-2"></i> WhatsApp not sent';
            }

            loadingDiv.classList.add('hidden');
            loadingDiv.classList.remove('flex');
            resultsDiv.classList.remove('hidden');
        } catch (err) {
            loadingDiv.classList.add('hidden');
            loadingDiv.classList.remove('flex');
            emptyState.classList.remove('hidden');
            emptyState.innerHTML = `<i class="fas fa-triangle-exclamation text-4xl mb-4 text-red-400"></i><p class="text-red-500">${err.message}</p>`;
        } finally {
            askBtn.disabled = false;
            askBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Ask';
        }
    });
});
