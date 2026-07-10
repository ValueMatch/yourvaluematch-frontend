const RENDER_BASE_URL = 'https://yourvaluematch-backend.onrender.com';
let sovrnMerchantCatalog = []; 

// --- NEW: BASELINE PILLAR LOGIC ---
// Array order MUST MATCH: [Clean, Cruelty, Vegan, Waste, Climate, Labor, Indie, Inclusion]
const pillarPresets = {
    'eco-warrior': [80, 70, 60, 100, 100, 50, 50, 50],
    'ethical-labor': [50, 50, 50, 50, 50, 100, 70, 90],
    'indie-champion': [50, 50, 50, 60, 50, 70, 100, 80]
};

// Global function so your HTML <select> onchange event can trigger it
window.applyBaselinePillar = function(pillarName) {
    const values = pillarPresets[pillarName];
    if (!values) return;

    // Save to localStorage so it persists on refresh
    localStorage.setItem('userProfileScores', JSON.stringify(values));

    const sliderIds = ['sl_clean', 'sl_cruelty', 'sl_vegan', 'sl_waste', 'sl_climate', 'sl_labor', 'sl_indie', 'sl_inclusion'];
    sliderIds.forEach((id, index) => {
        const slider = document.getElementById(id);
        const outputText = document.getElementById(`valOut${index}`);
        if (slider && outputText) {
            slider.value = values[index];
            outputText.innerText = values[index] + '%';
        }
    });

    // Fire a fake 'input' event on the first slider to force the algorithm to recalibrate
    const firstSlider = document.getElementById(sliderIds[0]);
    if(firstSlider) firstSlider.dispatchEvent(new Event('input'));
};


document.addEventListener('DOMContentLoaded', async () => {
    const activeProfileLabel = document.getElementById('activeProfileLabel');
    const guestPanel = document.getElementById('guestConversionPanel');
    const resetEntireSessionLink = document.getElementById('resetEntireSessionLink');
    const scoreLabel = document.getElementById('computedScoreLabel');
    const alternativesContainer = document.getElementById('alternativesContainer');

    // 8-Point Matrix (Fixed the outputs length to 8)
    const sliderIds = ['sl_clean', 'sl_cruelty', 'sl_vegan', 'sl_waste', 'sl_climate', 'sl_labor', 'sl_indie', 'sl_inclusion'];
    const sliders = sliderIds.map(id => document.getElementById(id));
    const outputs = Array.from({length: 8}, (_, i) => document.getElementById(`valOut${i}`));
    
    let currentScannedMetrics = null;

    // --- 1. FETCH LIVE PRODUCTS FROM POSTGRES ---
    try {
        const res = await fetch(`${RENDER_BASE_URL}/api/products`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.products) {
                sovrnMerchantCatalog = data.products.map(p => ({
                    name: p.name,
                    price: `£${p.price}`,
                    img: p.image_url || "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=150&q=80",
                    metrics: {
                        clean: p.clean_ingredients_score || 50,
                        crueltyFree: p.cruelty_free_score || 50,
                        vegan: p.cruelty_free_score > 70 ? 90 : 50, 
                        waste: p.low_waste_score || 50,
                        climate: p.low_waste_score || 50,
                        labor: p.ethical_labor_score || 50,
                        indie: p.indie_scale_score || 50, // Added safety fallback here
                        inclusion: p.inclusion_score || 50 // Added safety fallback here
                    },
                    evidence: `Verified database asset matching brand tier: ${p.brand_name}. In stock at ${p.merchant_name || 'Partner Merchant'}.`,
                    targetUrl: p.original_url || "https://www.google.com"
                }));
            }
        }
    } catch (err) {
        console.error("Failed to feed live catalog stream:", err);
    }

    // --- 2. THE HANDSHAKE: INJECT SAVED PRESETS ---
    const savedScoresJSON = localStorage.getItem('userProfileScores');
    if (savedScoresJSON) {
        const presetScores = JSON.parse(savedScoresJSON);
        sliders.forEach((slider, index) => {
            if (slider && presetScores[index] !== undefined) {
                slider.value = presetScores[index];
            }
        });
    }

    // --- 3. IDENTITY CHECK ---
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail && savedEmail.includes('@')) {
        activeProfileLabel.innerHTML = 'ACTIVE PROFILE:<br><span style="color: #818cf8;">' + savedEmail + '</span>';
        if (guestPanel) guestPanel.style.display = 'none';
    } else {
        activeProfileLabel.innerHTML = 'ACTIVE PROFILE:<br><span>GUEST PROFILE</span>';
        if (guestPanel) guestPanel.style.display = 'block';
    }

    if (document.getElementById('saveProfileBtn')) {
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            const emailInput = document.getElementById('conversionEmailInput').value.trim();
            if (!emailInput.includes('@')) return alert("Please enter a valid email address.");
            localStorage.setItem('savedEmail', emailInput);
            
            // Also save current slider state when anchoring profile
            const currentValues = sliders.map(s => parseInt(s.value) || 0);
            localStorage.setItem('userProfileScores', JSON.stringify(currentValues));

            alert("Value settings saved! Your zero-party profile is anchored.");
            window.location.reload(); 
        });
    }

    // --- 4. UI HELPER FUNCTIONS ---
    function updateColorClass(element, score) {
        if (!element) return;
        if (score >= 80) { element.style.color = "var(--match-green)"; } 
        else if (score >= 50) { element.style.color = "var(--match-orange)"; } 
        else { element.style.color = "var(--match-red)"; }
    }

    function updatePillColor(element, score) {
        if (!element) return;
        if (score >= 80) {
            element.style.backgroundColor = "rgba(34, 197, 94, 0.08)";
            element.style.color = "var(--match-green)";
            element.style.borderColor = "rgba(34, 197, 94, 0.1)";
        } else if (score >= 50) {
            element.style.backgroundColor = "rgba(249, 115, 22, 0.08)";
            element.style.color = "var(--match-orange)";
            element.style.borderColor = "rgba(249, 115, 22, 0.1)";
        } else {
            element.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
            element.style.color = "var(--match-red)";
            element.style.borderColor = "rgba(239, 68, 68, 0.1)";
        }
    }

    // --- 5. CORE ALGORITHM LOGIC (Updated for 8 Points) ---
    function recalibrateAlgorithm() {
        const userValues = sliders.map(s => parseInt(s.value) || 0);
        
        userValues.forEach((val, i) => {
            if(outputs[i]) outputs[i].textContent = val + '%';
        });

        if (currentScannedMetrics) {
            let totalVariance = 0;
            for(let i = 0; i < 8; i++) {
                let importanceMultiplier = (userValues[i] / 100) + 0.5; 
                totalVariance += Math.abs(currentScannedMetrics[i] - userValues[i]) * importanceMultiplier;
            }
