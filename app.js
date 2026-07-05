<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YourValueMatch Engine</title>
    <style>
        :root {
            --bg-canvas: #faf9f6;
            --card-surface: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --electric-lilac: linear-gradient(135deg, #c084fc 0%, #818cf8 100%);
            --border-ui: rgba(129, 140, 248, 0.15);
            --match-green: #22c55e;
            --match-red: #ef4444;
        }

        body {
            margin: 0; padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
            background-color: var(--bg-canvas);
            color: var(--text-primary);
            display: flex; justify-content: center; min-height: 100vh;
        }

        .app-container {
            width: 100%; max-width: 1100px; padding: 32px 24px; box-sizing: border-box;
            display: flex; flex-direction: column; gap: 24px;
        }

        header {
            display: flex; justify-content: space-between; align-items: center;
            padding-bottom: 16px; border-bottom: 1px solid var(--border-ui);
        }

        .logo {
            font-size: 24px; font-weight: 800;
            background: var(--electric-lilac); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            letter-spacing: -1px; text-decoration: none;
        }

        .back-home { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-decoration: none; }

        .onboarding-banner {
            background: linear-gradient(135deg, rgba(192, 132, 252, 0.04) 0%, rgba(129, 140, 248, 0.04) 100%);
            border: 1px dashed #c084fc; border-radius: 20px; padding: 24px;
        }
        .banner-title { font-size: 15px; font-weight: 700; margin: 0 0 16px 0; }
        .steps-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .step-card { display: flex; gap: 12px; }
        .step-num { font-size: 12px; font-weight: 800; background: #818cf8; color: white; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; }
        .step-txt strong { display: block; font-size: 14px; margin-bottom: 4px; }
        .step-txt p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.4; }

        .workspace-grid { display: grid; grid-template-columns: 360px 1fr; gap: 28px; align-items: start; }

        /* Control Panel Column */
        .control-panel {
            background: var(--card-surface); border: 1px solid var(--border-ui);
            border-radius: 24px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.01);
        }
        .panel-title { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; }

        .url-box { position: relative; margin-bottom: 24px; }
        .url-input {
            width: 100%; padding: 14px 90px 14px 16px; border: 1px solid #cbd5e1;
            border-radius: 12px; font-size: 14px; box-sizing: border-box; outline: none;
        }
        .scan-btn {
            position: absolute; right: 8px; top: 8px; background: #0f172a;
            color: white; border: none; padding: 8px 14px; border-radius: 8px;
            font-size: 12px; font-weight: 700; cursor: pointer;
        }

        .slider-group { margin-bottom: 20px; }
        .slider-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #475569; }
        .slider-ui { width: 100%; height: 6px; background: #f1f5f9; border-radius: 10px; -webkit-appearance: none; outline: none; margin: 12px 0; }
        .slider-ui::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: white; border: 4px solid #818cf8; cursor: pointer; }

        .email-capture-box { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .email-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 13px; box-sizing: border-box; margin-bottom: 10px; outline: none; }
        .save-algorithm-btn { width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }

        /* Output Feed Column */
        .results-stream { display: flex; flex-direction: column; gap: 24px; }

        .comparison-hero {
            background: var(--card-surface); border: 1px solid var(--border-ui);
            border-radius: 24px; padding: 20px; display: flex; align-items: center; justify-content: space-between;
        }
        .product-meta { display: flex; align-items: center; gap: 16px; }
        
        .img-container {
            width: 56px; height: 56px; border-radius: 12px; background: #f1f5f9;
            overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; flex-shrink: 0;
        }
        .img-container img { width: 100%; height: 100%; object-fit: cover; }

        .product-title { font-weight: 800; font-size: 16px; margin: 0 0 4px 0; }
        .product-domain { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
        .score-val { font-size: 36px; font-weight: 900; color: var(--match-red); }

        .section-divider { font-size: 12px; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.5px; display: flex; justify-content: space-between; }
        .reset-link { color: #818cf8; text-decoration: none; cursor: pointer; }

        /* Alternative Recommendations Asset Cards */
        .alt-card { background: var(--card-surface); border: 1px solid var(--border-ui); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 18px; }
        .alt-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .alt-brand { font-size: 18px; font-weight: 800; margin: 0 0 4px 0; }
        .alt-price { font-size: 13px; color: var(--text-secondary); font-weight: 600; }
        .match-pill { background: rgba(34, 197, 94, 0.1); color: var(--match-green); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }

        .breakdown-table { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .table-node { background: #f8fafc; border: 1px solid #f1f5f9; padding: 12px; border-radius: 12px; }
        .node-lbl { font-size: 11px; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; margin-bottom: 4px; }
        .node-val { font-size: 13px; font-weight: 700; }

        .evidence-drawer { background: rgba(129, 140, 248, 0.03); border-left: 4px solid #818cf8; padding: 14px; border-radius: 0 12px 12px 0; font-size: 13px; line-height: 1.5; color: #475569; }

        .swap-action-btn { background: var(--electric-lilac); color: white; border: none; width: 100%; padding: 16px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; text-align: center; text-decoration: none; box-shadow: 0 4px 15px rgba(129, 140, 248, 0.15); }

        @media (max-width: 890px) {
            .workspace-grid { grid-template-columns: 1fr; }
            .steps-row { grid-template-columns: 1fr; gap: 16px; }
        }
    </style>
</head>
<body>

<div class="app-container">
    <header>
        <a href="index.html" class="logo">YourValueMatch</a>
        <a href="index.html" class="back-home">← Return Home</a>
    </header>

    <main class="onboarding-banner">
        <div class="banner-title">⚡ Operational Workspace View</div>
        <div class="steps-row">
            <div class="step-card">
                <span class="step-num">1</span>
                <div class="step-txt">
                    <strong>Adjust Value Thresholds</strong>
                    <p>Modify independent sliders to assign weights to clean ingredient ratios or cruelty-free tracking logs.</p>
                </div>
            </div>
            <div class="step-card">
                <span class="step-num">2</span>
                <div class="step-txt">
                    <strong>Paste Target & Swap</strong>
                    <p>Drop a raw product link inside the parsing field to inspect alternative alignment suggestions.</p>
                </div>
            </div>
        </div>
    </main>

    <div class="workspace-grid">
        <section class="control-panel">
            <h2 class="panel-title">1. Setup Matrix</h2>
            
            <div class="url-box">
                <input type="url" id="linkField" class="url-input" value="https://www.amazon.co.uk/Burts-Bees-Lip-Balm-Pomegranate">
                <button class="scan-btn" id="runAnalysis">Scan URL</button>
            </div>

            <div class="slider-group">
                <div class="slider-header"><span>🍃 Cruelty-Free</span><span id="txt1">85%</span></div>
                <input type="range" class="slider-ui" id="range1" min="0" max="100" value="85">
            </div>
            <div class="slider-group">
                <div class="slider-header"><span>🧪 Clean Ingredients</span><span id="txt2">90%</span></div>
                <input type="range" class="slider-ui" id="range2" min="0" max="100" value="90">
            </div>
            <div class="slider-group">
                <div class="slider-header"><span>📦 Low-Waste Pack</span><span id="txt3">20%</span></div>
                <input type="range" class="slider-ui" id="range3" min="0" max="100" value="20">
            </div>

            <div class="email-capture-box">
                <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: #475569;">Save Value Algorithm Parameters</label>
                <input type="email" id="userEmail" class="email-input" placeholder="Enter email address" required>
                <button class="save-algorithm-btn" id="btnSavePrefs">Save Custom Framework</button>
            </div>
        </section>

        <section class="results-stream">
            <div class="comparison-hero">
                <div class="product-meta">
                    <div class="img-container">
                        <img src="https://images.unsplash.com/photo-1617480708386-0445240111ef?auto=format&fit=crop&w=120&q=80" alt="Burt's Bees">
                    </div>
                    <div>
                        <h3 class="product-title" id="lblTitle">Burt's Bees Lip Balm Pomegranate</h3>
                        <span class="product-domain" id="lblDomain">amazon.co.uk</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 10px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Current Score</span>
                    <div class="score-val" id="lblScore">38%</div>
                </div>
            </div>

            <div class="section-divider">
                <span>2. Better Value Alignments Located</span>
                <span class="reset-link" id="clearSearch">Scan Another Link</span>
            </div>

            <div class="alt-card">
                <div class="alt-header">
                    <div style="display:flex; gap:16px; align-items:center;">
                        <div class="img-container">
                            <img src="https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=120&q=80" alt="Hurraw">
                        </div>
                        <div>
                            <h4 class="alt-brand" style="margin:0;">Hurraw! Balm</h4>
                            <span class="alt-price">Estimated Alternative Cost: £4.10</span>
                        </div>
                    </div>
                    <span class="match-pill">96% Matrix Match</span>
                </div>
                
                <div class="breakdown-table">
                    <div class="table-node"><div class="node-lbl">Composition</div><div class="node-val">100% Organic</div></div>
                    <div class="table-node"><div class="node-lbl">Labor Trace</div><div class="node-val">Cruelty-Free</div></div>
                    <div class="table-node"><div class="node-lbl">Packaging</div><div class="node-val">Eco-Polymer</div></div>
                </div>
                <div class="evidence-drawer">
                    <strong>Evidence Log Summary:</strong> Formulated from cold-pressed certified organic seeds and raw processing baselines. Manufacturing relies on dedicated independent regional distribution structures.
                </div>
                <button class="swap-action-btn" onclick="alert('Redirecting via affiliate link strategy...')">Swap to Hurraw! Balm</button>
            </div>

            <div class="alt-card">
                <div class="alt-header">
                    <div style="display:flex; gap:16px; align-items:center;">
                        <div class="img-container">
                            <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=120&q=80" alt="Dr Bronners">
                        </div>
                        <div>
                            <h4 class="alt-brand" style="margin:0;">Dr. Bronner's Organic</h4>
                            <span class="alt-price">Estimated Alternative Cost: £3.75</span>
                        </div>
                    </div>
                    <span class="match-pill" style="background:rgba(192, 132, 252, 0.1); color:#c084fc;">91% Matrix Match</span>
                </div>
                
                <div class="breakdown-table">
                    <div class="table-node"><div class="node-lbl">Composition</div><div class="node-val">USDA Organic</div></div>
                    <div class="table-node"><div class="node-lbl">Labor Trace</div><div class="node-val">Fair Trade Cert</div></div>
                    <div class="table-node"><div class="node-lbl">Packaging</div><div class="node-val">100% PCR Plastic</div></div>
                </div>
                <div class="evidence-drawer">
                    <strong>Evidence Log Summary:</strong> Integrates fair-trade certified botanical base inputs. Verifiable supply trace logs validate full regulatory compliance transparency at source manufacturing hubs.
                </div>
                <button class="swap-action-btn" onclick="alert('Redirecting via affiliate link strategy...')">Swap to Dr. Bronner's</button>
            </div>

        </section>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const ranges = [document.getElementById('range1'), document.getElementById('range2'), document.getElementById('range3')];
        const outputs = [document.getElementById('txt1'), document.getElementById('txt2'), document.getElementById('txt3')];
        const scoreDisplay = document.getElementById('lblScore');

        function reCalc() {
            let total = 0;
            ranges.forEach((r, idx) => {
                outputs[idx].textContent = `${r.value}%`;
                total += parseInt(r.value);
            });
            let parsedAvg = Math.round(total / ranges.length);
            let simulatedScore = Math.max(12, 106 - Math.round(parsedAvg * 0.85));
            scoreDisplay.textContent = `${simulatedScore}%`;
            scoreDisplay.style.color = simulatedScore > 55 ? "var(--match-green)" : "var(--match-red)";
        }
        ranges.forEach(r => r.addEventListener('input', reCalc));

        document.getElementById('btnSavePrefs').addEventListener('click', () => {
            const mail = document.getElementById('userEmail').value;
            if(!mail) return alert("Please enter a valid email address.");
            localStorage.setItem('vm_user_email', mail);
            alert(`Value preferences profile successfully synched for: ${mail}`);
        });

        document.getElementById('runAnalysis').addEventListener('click', () => {
            const val = document.getElementById('linkField').value;
            if(!val) return alert("Please specify an evaluation link target.");
            try {
                const url = new URL(val);
                document.getElementById('lblDomain').textContent = url.hostname.replace('www.', '');
                alert(`Querying validation matrix indices for ${url.hostname}...`);
            } catch(e) {
                document.getElementById('lblDomain').textContent = 'External Store Item';
            }
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('linkField').value = '';
            document.getElementById('linkField').focus();
        });
    });
</script>
</body>
</html>
