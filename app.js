document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const creator = urlParams.get('ref');
    if (creator) {
        document.getElementById('algoModeBadge').textContent = `Tuning ${creator}'s Vibe Matrix`;
    }

    const tracks = [
        { el: document.getElementById('track1'), out: document.getElementById('val1') },
        { el: document.getElementById('track2'), out: document.getElementById('val2') },
        { el: document.getElementById('track3'), out: document.getElementById('val3') },
        { el: document.getElementById('track4'), out: document.getElementById('val4') }
    ];
    const scoreCircle = document.getElementById('luminousScore');
    const statusText = document.getElementById('statusText');

    function calculateLuminousMetrics() {
        let total = 0;
        tracks.forEach(t => {
            const val = parseInt(t.el.value);
            total += val;
            t.out.textContent = `${val}%`;
        });

        let averageScore = Math.round(total / 4);
        scoreCircle.textContent = `${averageScore}%`;

        if (averageScore >= 70) {
            scoreCircle.style.background = 'var(--match-high)';
            scoreCircle.style.boxShadow = '0 8px 24px rgba(74, 222, 128, 0.35)';
            statusText.textContent = "High Intensity Alignment Mode";
        } else if (averageScore >= 35) {
            scoreCircle.style.background = 'var(--match-mid)';
            scoreCircle.style.boxShadow = '0 8px 24px rgba(251, 146, 60, 0.35)';
            statusText.textContent = "Balanced Hybrid Alignment Mode";
        } else {
            scoreCircle.style.background = 'var(--match-low)';
            scoreCircle.style.boxShadow = '0 8px 24px rgba(248, 113, 113, 0.35)';
            statusText.textContent = "Standard Utility Focus";
        }
    }

    tracks.forEach(track => {
        track.el.addEventListener('input', calculateLuminousMetrics);
    });
    
    calculateLuminousMetrics();

    document.getElementById('lockMatrixBtn').addEventListener('click', () => {
        const payload = {
            cleanComposition: document.getElementById('track1').value,
            ethicalLabor: document.getElementById('track2').value,
            circularFootprint: document.getElementById('track3').value,
            budgetEfficiency: document.getElementById('track4').value
        };
        
        localStorage.setItem('vm_algo_payload', JSON.stringify(payload));
        window.location.href = 'compare.html';
    });
});
