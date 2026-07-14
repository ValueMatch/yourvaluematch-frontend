const RENDER_BASE_URL = 'https://yourvaluematch-backend.onrender.com';

// --- 1. BASELINE PILLAR LOGIC ---
// Array order MUST MATCH: [Clean, Cruelty, Vegan, Waste, Climate, Labor, Independent, Inclusion]
const pillarPresets = {
    'clean-composition': [100, 60, 50, 60, 50, 50, 50, 50],
    'ethical-labour':    [50, 50, 50, 50, 50, 100, 50, 90],
    'planet-first':      [60, 50, 50, 100, 100, 60, 50, 50],
    'animal-advocate':   [60, 100, 100, 50, 60, 50, 50, 50]
};

window.applyBaselinePillar = function(pillarName) {
    const values = pillarPresets[pillarName];
    if (!values) return;

    localStorage.setItem('userProfileScores', JSON.stringify(values));

    const sliderIds = ['sl_clean', 'sl_cruelty', 'sl_vegan', 'sl_waste', 'sl_climate', 'sl_labor', 'sl_independent', 'sl_inclusion'];
    sliderIds.forEach((id, index) => {
        const slider = document.getElementById(id);
        const outputText = document.getElementById(`valOut${index}`);
        if (slider && outputText) {
            slider.value = values[index];
            outputText.innerText = values[index] + '%';
        }
    });

    const firstSlider = document.getElementById(sliderIds[0]);
    if(firstSlider) firstSlider.dispatchEvent(new Event('input'));
};

document.addEventListener('DOMContentLoaded', async () => {
    // --- STRIPE PREMIUM CHECK ---
    const urlParams = new URLSearchParams(window.location.search);
    const hasUnlockedPremium = urlParams.has('session_id');

    // --- UI ELEMENTS ---
    const activeProfileLabel = document.getElementById('activeProfileLabel');
    const guestPanel = document.getElementById('guestConversionPanel');
    const resetEntireSessionLink = document.getElementById('resetEntireSessionLink');
    const scoreLabel = document.getElementById('computedScoreLabel');
    const alternativesContainer = document.getElementById('alternativesContainer');

    const sliderIds = ['sl_clean', 'sl_cruelty', 'sl_vegan', 'sl_waste', 'sl_climate', 'sl_labor', 'sl_independent', 'sl_inclusion'];
    const sliders = sliderIds.map(id => document.getElementById(id));
    const outputs = Array.from({length: 8}, (_, i) => document.getElementById(`valOut${i}`));
    
    let currentScannedMetrics = null;

    // --- 2. INJECT SAVED PRESETS ---
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
        activeProfileLabel.innerHTML = `ACTIVE PROFILE:<br><span style="color: #818cf8;">${savedEmail}</span>`;
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

    // --- 5. HERO SCORE RECALIBRATION ---
    function recalibrateHeroAlgorithm() {
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
            let avgRawVariance = totalVariance / 8;
            let finalHeroScore = Math.max(0, Math.min(100, Math.round(100 - avgRawVariance)));
            scoreLabel.textContent = finalHeroScore + '%';
            updateColorClass(scoreLabel, finalHeroScore);
        }
    }

    // --- 6. ALIGN VALUES™ (Alternative Math) ---
    function calculateAlignValues(userSliders, liveDatabase) {
        liveDatabase.forEach(product => {
            let totalWeight = 0;
            let earnedScore = 0;
            
            // Map array indices to keys
            const keys = ['clean', 'crueltyFree', 'vegan', 'waste', 'climate', 'labor', 'independent', 'inclusion'];

            for (let i = 0; i < 8; i++) {
                const sliderWeight = userSliders[i];
                if (sliderWeight > 0) {
                    totalWeight += sliderWeight;
                    const productScoreForValue = product.metrics[keys[i]] || 0;
                    earnedScore += (productScoreForValue / 100) * sliderWeight;
                }
            }
            product.computedMatchScore = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;
        });

        return liveDatabase.sort((a, b) => b.computedMatchScore - a.computedMatchScore);
    }

    // --- 7. PAYWALL RENDER LOOP ---
    function renderPaywallAlternatives(bestMatches) {
        alternativesContainer.innerHTML = "";
        
        if (bestMatches.length === 0) {
            alternativesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b;">No independent alternatives found yet.</div>`;
            return;
        }

        bestMatches.forEach(function(product, idx) {
            const card = document.createElement('div');
            card.className = "alternative-card";
            
            const blurStyle = hasUnlockedPremium ? "" : "filter: blur(8px); pointer-events: none; user-select: none;";
            
            card.innerHTML = `
                <div style="position: relative;">
                
                ${!hasUnlockedPremium ? `
                <div style="position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);">
                    <span style="background: #0f172a; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    ${product.computedMatchScore}% Match Found
                    </span>
                    
                    <a href="https://buy.stripe.com/eVq7sE8Jm0109KbeV05Ne00" style="background: var(--electric-lilac); color: white; padding: 16px 28px; border-radius: 14px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 24px rgba(129, 140, 248, 0.4); transition: transform 0.2s; cursor: pointer; display: inline-block;">
                    Unlock Alternative Matches - $15
                    </a>
                </div>
                ` : ''}
                
                <div style="${blurStyle}">
                    <div class="alt-top">
                    <div style="display:flex; gap:16px; align-items:center;">
                        <div class="media-box">
                        <img src="${hasUnlockedPremium ? product.img : 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=150&q=80'}" alt="Verified Match" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div>
                        <h4 class="alt-brand-name" style="margin:0;">${hasUnlockedPremium ? product.name : 'Verified Independent Brand'}</h4>
                        <span class="alt-pricing">Estimated Value Validation: ${product.price}</span>
                        </div>
                    </div>
                    <span class="badge-pill" id="scorePill_index_${idx}" style="border: 1px solid;">${product.computedMatchScore}% Match Alternative</span>
                    </div>
                    
                    <div class="log-container">
                    <strong>Verification Evidence Log:</strong> ${hasUnlockedPremium ? product.evidence : 'Data verified via independent corporate registry and environmental audits.'}
                    </div>
                    
                    <button class="swap-button" data-product-name="${product.name}" data-url="${product.targetUrl}">
                    Swap to ${hasUnlockedPremium ? product.name : 'Aligned Brand'}
                    </button>
                </div>
                </div>
            `;
            
            alternativesContainer.appendChild(card);
            const currentPill = document.getElementById(`scorePill_index_${idx}`);
            if (currentPill) {
                updatePillColor(currentPill, product.computedMatchScore);
            }
        });
    }

    // --- 8. JUST-IN-TIME MASTER PIPELINE ---
    async function executeValueAlignment(scannedCategory) {
        if (!scannedCategory) scannedCategory = "General";
        
        alternativesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b;">Checking verified database for ${scannedCategory}...</div>`;
        
        try {
            let verifiedAlternatives = [];
            const dbResponse = await fetch(`${RENDER_BASE_URL}/api/products?category=${encodeURIComponent(scannedCategory)}`);
            
            if (dbResponse.ok) {
                const data = await dbResponse.json();
                if (data.products && data.products.length > 0) verifiedAlternatives = data.products;
            }

            if (verifiedAlternatives.length === 0) {
                alternativesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #8b5cf6; font-weight: bold; animation: pulse 2s infinite;">
                    Database empty for "${scannedCategory}".<br>
                    Triggering Autonomous AI Agent to scout the web for verified independent brands... (Takes ~15 seconds)
                </div>`;

                const agentResponse = await fetch(`${RENDER_BASE_URL}/api/discover-alternatives`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: scannedCategory })
                });

                const agentData = await agentResponse.json();
                if (agentData.success) {
                    verifiedAlternatives = agentData.alternatives;
                } else {
                    throw new Error("AI Agent failed to discover alternatives.");
                }
            }

            alternativesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #64748b;">Running Align Values™ Algorithm...</div>`;
            const currentValues = sliders.map(s => parseInt(s.value) || 0);
            const bestMatches = calculateAlignValues(currentValues, verifiedAlternatives);
            renderPaywallAlternatives(bestMatches);

        } catch (error) {
            console.error("Execution Pipeline Failed:", error);
            alternativesContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #ef4444;">Pipeline Error: Could not align values at this time.</div>`;
        }
    }

    // --- 9. LIVE AI SCANNER INTEGRATION (The Trigger) ---
    document.getElementById('triggerScanBtn').addEventListener('click', async function() {
        const path = document.getElementById('itemUrlInput').value.trim();
        if(!path) return alert('Please enter a target product URL.');
        
        const scanBtn = this;
        scanBtn.textContent = 'Auditing...';
        scanBtn.style.background = '#818cf8'; 
        scanBtn.disabled = true;

        try {
            const urlObj = new URL(path);
            document.getElementById('displayDomain').textContent = urlObj.hostname.replace('www.', '');
            const currentValues = sliders.map(s => parseInt(s.value) || 0);

            // Phase 1: Audit the Hero Product
            const response = await fetch(`${RENDER_BASE_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    product: path, 
                    userEmail: savedEmail,
                    userValues: currentValues 
                })
            });

            const data = await response.json();
            
            if(data.success && data.auditedProduct) {
                const aiData = data.auditedProduct;
                document.getElementById('displayProductTitle').textContent = aiData.product_name || aiData.brand;
                
                const priceEl = document.getElementById('displayScannedPrice');
                priceEl.textContent = (aiData.price && aiData.price !== 'N/A') ? `Est. Price: ${aiData.price}` : 'Price Unavailable';
                priceEl.style.display = 'inline-block';
                
                const heroImage = document.querySelector('.scanned-hero-card img') || document.querySelector('.media-box img');
                if (heroImage) {
                    if (aiData.image_url && aiData.image_url.startsWith('http')) {
                        heroImage.src = aiData.image_url;
                    } else {
                        heroImage.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80";
                    }
                }
                
                currentScannedMetrics = [
                    aiData.metrics.clean, aiData.metrics.crueltyFree, aiData.metrics.vegan, 
                    aiData.metrics.waste, aiData.metrics.climate, aiData.metrics.labor, 
                    aiData.metrics.independent, aiData.metrics.inclusion
                ];

                let evidenceBox = document.getElementById('heroEvidenceLog');
                if(!evidenceBox) {
                    evidenceBox = document.createElement('div');
                    evidenceBox.id = 'heroEvidenceLog';
                    evidenceBox.className = 'log-container';
                    evidenceBox.style.marginTop = '16px';
                    document.querySelector('.scanned-hero-card').parentElement.insertBefore(evidenceBox, document.querySelector('.stream-title-row'));
                }
                
                evidenceBox.innerHTML = `<strong>AI Audit Evidence:</strong> ${aiData.evidence}`;
                evidenceBox.style.borderLeftColor = '#ef4444'; 
                
                recalibrateHeroAlgorithm(); 

                // Phase 2: Trigger JIT Pipeline for Alternatives
                const targetCategory = aiData.category || "General";
                await executeValueAlignment(targetCategory);
                
            } else {
                alert('Audit failed. Please check your backend terminal for errors.');
            }
        } catch(e) {
            console.error(e);
            document.getElementById('displayDomain').textContent = 'External Store Listing';
            alert('Failed to connect to the backend agent.');
        } finally {
            scanBtn.textContent = 'Scan';
            scanBtn.style.background = '#0f172a';
            scanBtn.disabled = false;
        }
    });

    // Re-run dynamic calculations if user drags sliders
    sliders.forEach(s => { 
        if(s) s.addEventListener('input', () => {
            recalibrateHeroAlgorithm();
            // In a production environment with massive datasets, you might debounce this call.
            // For MVP, we will only run alternative math if the JIT pipeline has already loaded items.
            if(alternativesContainer.children.length > 0) {
                 const currentValues = sliders.map(s => parseInt(s.value) || 0);
                 // We pull the raw verified list back from Render or cache it globally.
                 // For immediate UI feedback, let's prompt them to re-scan for fresh sorting.
            }
        }); 
    });
    recalibrateHeroAlgorithm();

    // --- 10. TELEMETRY ROUTING ---
    async function sendValueTelemetry(targetAlternative) {
        const currentEmail = savedEmail || "GUEST PROFILE";
        const currentValues = sliders.map(s => parseInt(s.value) || 0);
        const valuePayload = {
            email: currentEmail, 
            clicked_product: targetAlternative,
            clean_ingredients_score: currentValues[0], 
            cruelty_free_score: currentValues[1],
            vegan_score: currentValues[2], 
            low_waste_score: currentValues[3],
            climate_impact_score: currentValues[4], 
            ethical_labor_score: currentValues[5],
            independent_scale_score: currentValues[6], 
            inclusion_score: currentValues[7]
        };
        try {
            await fetch(`${RENDER_BASE_URL}/api/logs/click`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valuePayload), keepalive: true
            });
        } catch (err) { console.error("Telemetry failed:", err); }
    }

    alternativesContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('swap-button')) {
            const alternativeName = e.target.getAttribute('data-product-name');
            const url = e.target.getAttribute('data-url') || "https://www.google.com";
            await sendValueTelemetry(alternativeName);
            window.location.href = url; // Direct route to the independent brand
        }
    });

    // Reset handlers
    document.getElementById('resetInputLink').addEventListener('click', function() {
        document.getElementById('itemUrlInput').value = '';
        document.getElementById('itemUrlInput').focus();
    });

    if (resetEntireSessionLink) {
        resetEntireSessionLink.addEventListener('click', function() {
            try { 
                localStorage.clear(); 
                window.location.href = 'index.html';
            } catch(err){}
        });
    }
});
