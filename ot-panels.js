<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deal Analyzer Calculator | OfferTermz</title>
    <meta name="description" content="Free deal analyzer for creative real estate investors. Enter your numbers and get instant recommendations on the best deal structure.">
    <meta property="og:title" content="Deal Analyzer Calculator | OfferTermz">
    <meta property="og:description" content="Free deal analyzer for creative real estate investors. Enter your numbers and get instant recommendations.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    color: #34434a;
    line-height: 1.6;
    min-height: 100vh;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}

    /* Subtle background pattern */
    body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: radial-gradient(#34434a 0.5px, transparent 0.5px);
        background-size: 20px 20px;
        opacity: 0.03;
        pointer-events: none;
        z-index: 0;
    }

    .calculator-container {
    .calculator-container {
    max-width: none;
    width: 100%;
    margin: 0;
    padding: 10px;
    position: relative;
    z-index: 1;
}
    .calculator-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 20px 0;
    }

    .logo {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 12px;
        letter-spacing: -0.5px;
    }

    .logo-main {
        color: #34434a;
    }

    .logo-accent {
        color: #f9603a;
    }

    .calculator-header h1 {
        font-size: 26px;
        font-weight: 700;
        color: #34434a;
        margin-bottom: 10px;
    }

    .calculator-header p {
        color: #6b7280;
        font-size: 15px;
        max-width: 500px;
        margin: 0 auto;
    }

    /* Step Container */
    .step-container {
        margin-bottom: 30px;
    }

    .step-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .step-number {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #f9603a 0%, #e54e2a 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        color: white;
        box-shadow: 0 4px 12px rgba(249, 96, 58, 0.3);
        flex-shrink: 0;
    }

    .step-info {
        flex: 1;
    }

    .step-title {
        font-size: 18px;
        font-weight: 700;
        color: #34434a;
        margin-bottom: 2px;
    }

    .step-description {
        font-size: 13px;
        color: #6b7280;
    }

    .calculator-form {
        background: white;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.02),
            0 10px 20px rgba(0, 0, 0, 0.04),
            0 20px 40px rgba(0, 0, 0, 0.03);
        transition: box-shadow 0.3s ease;
    }

    .calculator-form:hover {
        box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.03),
            0 10px 20px rgba(0, 0, 0, 0.05),
            0 25px 50px rgba(0, 0, 0, 0.04);
    }

    .form-section {
        margin-bottom: 28px;
    }

    .form-section:last-of-type {
        margin-bottom: 0;
    }

    .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #34434a;
        margin-bottom: 16px;
        padding-bottom: 10px;
        border-bottom: 2px solid #f9603a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
    }

    @media (max-width: 600px) {
        .form-grid {
            grid-template-columns: 1fr;
        }
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-group label {
        font-size: 12px;
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .label-helper {
        font-size: 10px;
        font-weight: 500;
        color: #9ca3af;
        text-transform: none;
        letter-spacing: 0;
        margin-top: 2px;
        display: block;
    }

    .input-wrapper {
        position: relative;
    }

    .input-wrapper input {
        width: 100%;
        padding: 14px 16px 14px 32px;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        font-size: 15px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        transition: all 0.2s ease;
        background: #fafafa;
    }

    .input-wrapper::before {
        content: "$";
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.2s ease;
    }

    .input-wrapper input:hover {
        border-color: #d1d5db;
        background: white;
    }

    .input-wrapper input:focus {
        outline: none;
        border-color: #f9603a;
        background: white;
        box-shadow: 0 0 0 4px rgba(249, 96, 58, 0.1);
    }

    .input-wrapper:focus-within::before {
        color: #f9603a;
    }

    .input-wrapper input::placeholder {
        color: #9ca3af;
        font-weight: 400;
    }

    .toggle-group {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: #fafafa;
        border-radius: 10px;
        border: 2px solid #e5e7eb;
        transition: all 0.2s ease;
    }

    .toggle-group:hover {
        border-color: #d1d5db;
        background: white;
    }

    .toggle-label {
        font-size: 14px;
        color: #4b5563;
        flex: 1;
    }

    .toggle-switch {
        position: relative;
        width: 52px;
        height: 28px;
        flex-shrink: 0;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #e5e7eb;
        transition: 0.3s;
        border-radius: 28px;
    }

    .toggle-slider:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggle-switch input:checked + .toggle-slider {
        background: linear-gradient(135deg, #f9603a 0%, #e54e2a 100%);
    }

    .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(24px);
    }

    .toggle-status {
        font-size: 13px;
        font-weight: 600;
        min-width: 32px;
        text-align: center;
    }

    .toggle-status.yes {
        color: #f9603a;
    }

    .toggle-status.no {
        color: #9ca3af;
    }

    /* Disclaimer Box */
    .disclaimer-box {
        margin-top: 24px;
        padding: 20px;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 12px;
        border: 2px solid #fbbf24;
        transition: all 0.3s ease;
    }

    .disclaimer-box.hidden-disclaimer {
        display: none;
    }

    .disclaimer-header {
        font-size: 15px;
        font-weight: 700;
        color: #92400e;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .disclaimer-header svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .disclaimer-text {
        font-size: 13px;
        color: #78350f;
        line-height: 1.6;
        margin-bottom: 16px;
    }

    .disclaimer-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 12px;
        background: white;
        border-radius: 8px;
        border: 2px solid #fbbf24;
        transition: all 0.2s ease;
    }

    .disclaimer-checkbox:hover {
        background: #fffbeb;
        border-color: #f59e0b;
    }

    .disclaimer-checkbox input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #f9603a;
    }

    .disclaimer-checkbox label {
        font-size: 14px;
        font-weight: 600;
        color: #92400e;
        cursor: pointer;
        flex: 1;
        text-transform: none;
        letter-spacing: normal;
        margin: 0;
    }

    /* Results Footer Disclaimer */
    .results-disclaimer {
        margin-top: 32px;
        padding: 20px;
        background: #f9fafb;
        border-radius: 10px;
        border-left: 3px solid #9ca3af;
    }

    .results-disclaimer-text {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.6;
    }

    .calculate-btn {
        width: 100%;
        padding: 18px;
        background: linear-gradient(135deg, #f9603a 0%, #e54e2a 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 20px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(249, 96, 58, 0.3);
    }

    .calculate-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(249, 96, 58, 0.4);
    }

    .calculate-btn:active:not(:disabled) {
        transform: translateY(0);
    }

    .calculate-btn:disabled {
        background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
        cursor: not-allowed;
        box-shadow: none;
        opacity: 0.6;
    }

    .calculate-btn.loading {
        pointer-events: none;
    }

    .calculate-btn.loading .btn-text {
        opacity: 0;
    }

    .calculate-btn.loading .btn-loader {
        opacity: 1;
    }

    .btn-text {
        transition: opacity 0.2s ease;
    }

    .btn-loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .btn-loader::after {
        content: '';
        display: block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Results Section */
    .results-container {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s ease;
        pointer-events: none;
    }

    .results-container.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    .results-placeholder {
        background: white;
        border-radius: 16px;
        padding: 60px 32px;
        text-align: center;
        box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.02),
            0 10px 20px rgba(0, 0, 0, 0.04);
        border: 2px dashed #e5e7eb;
    }

    .placeholder-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
    }

    .placeholder-icon svg {
        width: 28px;
        height: 28px;
        color: #9ca3af;
    }

    .placeholder-text {
        font-size: 15px;
        color: #6b7280;
        max-width: 280px;
        margin: 0 auto;
    }

    .results-active {
        display: none;
    }

    .results-container.visible .results-placeholder {
        display: none;
    }

    .results-container.visible .results-active {
        display: block;
    }

    .results-header {
        text-align: center;
        margin-bottom: 24px;
    }

    .results-header h2 {
        font-size: 20px;
        font-weight: 700;
        color: #34434a;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .success-check {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .success-check svg {
        width: 16px;
        height: 16px;
        color: white;
    }

    .deal-card {
        background: white;
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 16px;
        box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.02),
            0 10px 20px rgba(0, 0, 0, 0.04);
        border-left: 5px solid #e5e7eb;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }

    .deal-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .deal-card:hover {
        transform: translateY(-2px);
        box-shadow: 
            0 6px 12px rgba(0, 0, 0, 0.04),
            0 15px 30px rgba(0, 0, 0, 0.06);
    }

    .deal-card.rank-1 {
        border-left-color: #10b981;
    }

    .deal-card.rank-2 {
        border-left-color: #f9603a;
    }

    .deal-card.rank-3 {
        border-left-color: #6b7280;
    }

    .deal-card.not-recommended {
        border-left-color: #d1d5db;
        opacity: 0.6;
    }

    .deal-card.not-recommended:hover {
        opacity: 0.8;
    }

    .deal-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
    }

    .rank-badge {
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    .rank-badge.best {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        color: #065f46;
    }

    .rank-badge.alternative {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #991b1b;
    }

    .rank-badge.option {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        color: #4b5563;
    }

    .rank-badge.not-rec {
        background: #f3f4f6;
        color: #9ca3af;
    }

    .deal-type-name {
        font-size: 18px;
        font-weight: 700;
        color: #34434a;
    }

    .deal-numbers {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 18px;
        padding: 18px;
        background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        border-radius: 10px;
    }

    .deal-number-item {
        flex: 1;
        min-width: 100px;
        padding: 8px 12px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .deal-number-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 4px;
        font-weight: 600;
    }

    .deal-number-value {
        font-size: 17px;
        font-weight: 700;
        color: #34434a;
    }

    .deal-number-value.positive {
        color: #10b981;
    }

    .deal-number-value.negative {
        color: #ef4444;
    }

    .deal-explanation {
        font-size: 14px;
        color: #4b5563;
        line-height: 1.7;
    }

    .deal-explanation strong {
        color: #34434a;
        font-weight: 600;
    }

    .show-script-btn {
        margin-top: 20px;
        padding: 14px 24px;
        background: linear-gradient(135deg, #f9603a 0%, #e54e2a 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(249, 96, 58, 0.25);
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .show-script-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(249, 96, 58, 0.35);
    }

    .show-script-btn:active {
        transform: translateY(0);
    }

    .show-script-btn svg {
        width: 18px;
        height: 18px;
    }

    .hidden {
        display: none !important;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
        .calculator-container {
            padding: 20px 16px;
        }

        .calculator-form {
            padding: 24px 20px;
        }

        .step-header {
            gap: 12px;
        }

        .step-number {
            width: 38px;
            height: 38px;
            font-size: 16px;
        }

        .step-title {
            font-size: 16px;
        }

        .deal-numbers {
            gap: 8px;
        }

        .deal-number-item {
            min-width: 80px;
        }
    }
</style>

<div class="calculator-container">
    <div class="calculator-header">
        <div class="logo">
            <span class="logo-main">OfferTerm</span><span class="logo-accent">z</span>
        </div>
        <h1>Deal Analyzer Calculator</h1>
        <p>Enter the numbers from your seller conversation and get instant deal recommendations</p>
    </div>

    <!-- STEP 1 -->
    <div class="step-container">
        <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-info">
                <div class="step-title">Enter Property Details</div>
                <div class="step-description">Fill in the information you gathered from your seller conversation</div>
            </div>
        </div>

        <div class="calculator-form">
            <div class="form-section">
                <div class="section-title">Property Values</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="askingPrice">Asking Price</label>
                        <div class="input-wrapper">
                            <input type="number" id="askingPrice" placeholder="150,000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="arv">Property Value (Fixed Up)</label>
                        <div class="input-wrapper">
                            <input type="number" id="arv" placeholder="200,000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="repairs">Repair Costs</label>
                        <div class="input-wrapper">
                            <input type="number" id="repairs" placeholder="25,000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="monthlyRent">Monthly Rent</label>
                        <div class="input-wrapper">
                            <input type="number" id="monthlyRent" placeholder="1,500">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="section-title">Existing Mortgage</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="mortgageBalance">How Much Do They Still Owe?</label>
                        <div class="input-wrapper">
                            <input type="number" id="mortgageBalance" placeholder="0" value="0">
                        </div>
                    </div>
                    <div class="form-group" id="pitiGroup">
                        <label for="monthlyPiti">
                            Their Monthly Payment
                            <span class="label-helper">Principal, Interest, Taxes, Insurance</span>
                        </label>
                        <div class="input-wrapper">
                            <input type="number" id="monthlyPiti" placeholder="1,200">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="section-title">Down Payments</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="tenantDownPayment">Down Payment From Your Tenant-Buyer</label>
                        <div class="input-wrapper">
                            <input type="number" id="tenantDownPayment" placeholder="5,000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="sellerDownPayment">Down Payment Seller Wants</label>
                        <div class="input-wrapper">
                            <input type="number" id="sellerDownPayment" placeholder="10,000">
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <div class="section-title">Seller Flexibility</div>
                <div class="toggle-group">
                    <span class="toggle-label">Is Seller Open to Terms?</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="termsAvailable">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-status no" id="toggleStatus">No</span>
                </div>
            </div>

            <!-- Disclaimer Box -->
            <div class="disclaimer-box" id="disclaimerBox">
                <div class="disclaimer-header">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    Quick heads-up from SAM:
                </div>
                <div class="disclaimer-text">
                    This calculator helps you spot opportunities, not replace your brain. These numbers are educational - NOT a substitute for due diligence, professional advice, or your own common sense.<br><br>
                    Verify everything: comps, seller numbers, local market conditions. This is a starting point, not a finish line. Your deals, your responsibility.
                </div>
                <div class="disclaimer-checkbox">
                    <input type="checkbox" id="disclaimerCheck">
                    <label for="disclaimerCheck">I understand - show me the results</label>
                </div>
            </div>

            <button class="calculate-btn" id="calculateBtn" onclick="analyzeDeals()" disabled>
                <span class="btn-text">Analyze This Deal</span>
                <span class="btn-loader"></span>
            </button>
        </div>
    </div>

    <!-- STEP 2 -->
    <div class="step-container">
        <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-info">
                <div class="step-title">Your Deal Analysis</div>
                <div class="step-description">See which deal structures work best for this property</div>
            </div>
        </div>

        <div class="results-container" id="resultsContainer">
            <div class="results-placeholder">
                <div class="placeholder-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <p class="placeholder-text">Your results will appear here when you click "Analyze This Deal"</p>
            </div>

            <div class="results-active">
                <div class="results-header">
                    <h2>
                        <span class="success-check">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </span>
                        Analysis Complete
                    </h2>
                </div>
                <div id="resultsCards"></div>
                
                <!-- Results Footer Disclaimer -->
                <div class="results-disclaimer">
                    <div class="results-disclaimer-text">
                        <strong>Reminder:</strong> This calculator helps you spot opportunities, not replace your brain. These numbers are educational - NOT a substitute for due diligence, professional advice, or your own common sense. Verify everything: comps, seller numbers, local market conditions. This is a starting point, not a finish line. Your deals, your responsibility.
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Auto-format numbers with commas
    function formatNumberInput(input) {
        let value = input.value.replace(/[^\d]/g, '');
        if (value) {
            value = parseInt(value).toLocaleString();
        }
        input.value = value;
    }

    function getRawNumber(inputId) {
        const value = document.getElementById(inputId).value;
        return parseFloat(value.replace(/,/g, '')) || 0;
    }

    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.type = 'text';
        input.inputMode = 'numeric';
        input.addEventListener('input', function() {
            formatNumberInput(this);
        });
        input.addEventListener('blur', function() {
            formatNumberInput(this);
        });
    });

    const mortgageInput = document.getElementById('mortgageBalance');
    const pitiGroup = document.getElementById('pitiGroup');
    const termsToggle = document.getElementById('termsAvailable');
    const toggleStatus = document.getElementById('toggleStatus');
    const calculateBtn = document.getElementById('calculateBtn');
    const disclaimerCheck = document.getElementById('disclaimerCheck');
    const disclaimerBox = document.getElementById('disclaimerBox');

    disclaimerCheck.addEventListener('change', function() {
        calculateBtn.disabled = !this.checked;
    });

    mortgageInput.addEventListener('input', function() {
        const balance = getRawNumber('mortgageBalance');
        if (balance > 0) {
            pitiGroup.classList.remove('hidden');
        } else {
            pitiGroup.classList.add('hidden');
        }
    });

    termsToggle.addEventListener('change', function() {
        if (this.checked) {
            toggleStatus.textContent = 'Yes';
            toggleStatus.classList.remove('no');
            toggleStatus.classList.add('yes');
        } else {
            toggleStatus.textContent = 'No';
            toggleStatus.classList.remove('yes');
            toggleStatus.classList.add('no');
        }
    });

    pitiGroup.classList.add('hidden');

    // ═══════════════════════════════════════════════════════════════════════
    // URL PARAMETER HANDLING - Populate fields from GHL
    // ═══════════════════════════════════════════════════════════════════════
    function getURLParams() {
        var params = {};
        var queryString = window.location.search.substring(1);
        var pairs = queryString.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            if (pair[0]) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }
        return params;
    }
    
    function populateFromURL() {
        var params = getURLParams();
        console.log('📊 Calculator received params:', params);
        
        // Map URL params to form field IDs
        var fieldMap = {
            'askingPrice': 'askingPrice',
            'arv': 'arv',
            'repairs': 'repairs',
            'mortgageBalance': 'mortgageBalance',
            'monthlyPiti': 'monthlyPiti',
            'monthlyRent': 'monthlyRent',
            'tenantDownPayment': 'tenantDownPayment',
            'sellerDownPayment': 'sellerDownPayment'
        };
        
        for (var param in fieldMap) {
            if (params[param]) {
                var field = document.getElementById(fieldMap[param]);
                if (field) {
                    // Format number with commas
                    var value = params[param].replace(/[^0-9.]/g, '');
                    if (value) {
                        field.value = parseInt(value).toLocaleString();
                        console.log('✅ Set ' + param + ' = ' + field.value);
                    }
                }
            }
        }
        
        // Handle termsAvailable toggle
        if (params.termsAvailable === 'yes') {
            var toggle = document.getElementById('termsAvailable');
            if (toggle) {
                toggle.checked = true;
                toggleStatus.textContent = 'Yes';
                toggleStatus.classList.remove('no');
                toggleStatus.classList.add('yes');
                console.log('✅ Set termsAvailable = Yes');
            }
        }
        
        // Show PITI field if mortgage balance > 0
        var mortgageVal = params.mortgageBalance ? parseFloat(params.mortgageBalance) : 0;
        if (mortgageVal > 0) {
            pitiGroup.classList.remove('hidden');
        }
    }
    
    // Run on page load
    populateFromURL();

    function formatCurrency(amount) {
        return '$' + Math.round(amount).toLocaleString();
    }

    function analyzeDeals() {
        disclaimerBox.classList.add('hidden-disclaimer');
        calculateBtn.classList.add('loading');
        setTimeout(() => {
            performAnalysis();
            calculateBtn.classList.remove('loading');
        }, 600);
    }

    function performAnalysis() {
        const askingPrice = getRawNumber('askingPrice');
        const arv = getRawNumber('arv');
        const repairs = getRawNumber('repairs');
        const monthlyRent = getRawNumber('monthlyRent');
        const mortgageBalance = getRawNumber('mortgageBalance');
        const monthlyPiti = getRawNumber('monthlyPiti');
        const tenantDownPayment = getRawNumber('tenantDownPayment');
        const sellerDownPayment = getRawNumber('sellerDownPayment');
        const termsAvailable = document.getElementById('termsAvailable').checked;

        const assignmentFee = 10000;
        const closingCostPercent = 0.04;
        const deals = [];
        const equityGap = askingPrice - mortgageBalance;

        // 1. SELLER FINANCING
        if (mortgageBalance === 0 && termsAvailable) {
            const sellerFinanceMonthlyIncome = monthlyRent;
            let sellerFinanceExplanation = '';
            if (sellerFinanceMonthlyIncome >= 1500) {
                sellerFinanceExplanation = `<strong>PERFECT</strong> Seller Financing setup! No existing mortgage, seller is open to terms, and ${formatCurrency(sellerFinanceMonthlyIncome)}/month rent provides excellent cash flow. Offer the asking price of <strong>${formatCurrency(askingPrice)}</strong> with <strong>your payment terms</strong>. Collect ${formatCurrency(tenantDownPayment)} upfront from your tenant-buyer for immediate capital, then ride ${formatCurrency(sellerFinanceMonthlyIncome)}/month all the way to the bank. This is the cleanest creative deal structure.`;
            } else if (sellerFinanceMonthlyIncome >= 1000) {
                sellerFinanceExplanation = `Excellent Seller Financing opportunity. No mortgage to deal with, seller wants terms, and ${formatCurrency(sellerFinanceMonthlyIncome)}/month in rent gives you solid cash flow. Offer <strong>${formatCurrency(askingPrice)}</strong> at seller's asking price with <strong>your terms</strong>. Front-load with ${formatCurrency(tenantDownPayment)} from tenant, then collect monthly. Clean structure, no banks involved, pure profit.`;
            } else {
                sellerFinanceExplanation = `Good Seller Financing deal. No existing mortgage means clean title, seller is flexible on terms. Offer the asking price of <strong>${formatCurrency(askingPrice)}</strong> with <strong>your payment schedule</strong>. You'll collect ${formatCurrency(tenantDownPayment)} upfront from tenant-buyer, then ${formatCurrency(sellerFinanceMonthlyIncome)}/month covers your seller payment with profit built in. Simple structure without bank complications.`;
            }
            deals.push({
                type: 'Seller Financing',
                viable: true,
                recommended: true,
                priority: true,
                numbers: {
                    'Your Offer': formatCurrency(askingPrice),
                    'Monthly Income': formatCurrency(sellerFinanceMonthlyIncome),
                    'Tenant Down': formatCurrency(tenantDownPayment)
                },
                explanation: sellerFinanceExplanation
            });
        }

        // 2. SUBJECT-TO
        if (mortgageBalance > 0 && equityGap <= 35000) {
            const subToCashFlow = monthlyRent - monthlyPiti;
            let explanation = '';
            if (subToCashFlow >= 300) {
                explanation = `This is a <strong>HOME RUN</strong> Subject-To! Equity gap of ${formatCurrency(equityGap)} is perfect, you're getting ${formatCurrency(subToCashFlow)}/month positive cash flow, PLUS the Three Paydays: ${formatCurrency(tenantDownPayment)} upfront, monthly income, and massive backend profit when your tenant-buyer cashes you out. Take this deal!`;
            } else if (subToCashFlow >= 100) {
                explanation = `Solid Subject-To deal. Equity gap of ${formatCurrency(equityGap)} (well within the $35k threshold), positive ${formatCurrency(subToCashFlow)}/month cash flow, and ${formatCurrency(tenantDownPayment)} upfront from your tenant. Seller gets nothing now but you solve their problem. Backend equity capture makes this very profitable.`;
            } else if (subToCashFlow >= 0) {
                explanation = `Good Subject-To opportunity. Equity gap is ${formatCurrency(equityGap)} (within target). Cash flow of ${formatCurrency(subToCashFlow)}/month covers itself. Remember: with ${formatCurrency(tenantDownPayment)} upfront from tenant, you've got cushion. The real money is in the backend when they cash you out with equity + appreciation + mortgage paydown.`;
            } else if (subToCashFlow >= -200 && tenantDownPayment >= 5000) {
                const monthsCovered = Math.floor(tenantDownPayment / Math.abs(subToCashFlow));
                explanation = `Don't let the negative ${formatCurrency(subToCashFlow)}/month scare you - equity gap of ${formatCurrency(equityGap)} is perfect for Subject-To. Your tenant's ${formatCurrency(tenantDownPayment)} down payment covers you for <strong>${monthsCovered} months</strong> of negative carry. Remember the <strong>Three Paydays</strong>: (1) ${formatCurrency(tenantDownPayment)} upfront, (2) small monthly cost, (3) MASSIVE backend payday with equity capture + appreciation.`;
            } else {
                explanation = `Equity gap of ${formatCurrency(equityGap)} makes this Subject-To viable, but negative ${formatCurrency(subToCashFlow)}/month means you'll carry costs. This works if you believe in the backend equity play and can handle the monthly carry. The <strong>Three Paydays</strong> still apply: ${formatCurrency(tenantDownPayment)} upfront helps, you cover monthly shortfall, then capture all equity + appreciation when tenant buys.`;
            }
            deals.push({
                type: 'Subject-To',
                viable: true,
                recommended: true,
                priority: true,
                numbers: {
                    'Debt Takeover': formatCurrency(mortgageBalance),
                    'Equity Gap': formatCurrency(equityGap),
                    'Monthly Cash Flow': formatCurrency(subToCashFlow),
                    'Tenant Down': formatCurrency(tenantDownPayment)
                },
                explanation: explanation
            });
        }

        // 3. WRAP AROUND MORTGAGE
        if (mortgageBalance > 0 && equityGap > 35000 && termsAvailable) {
            let wrapExplanation = '';
            if (equityGap <= 50000) {
                wrapExplanation = `Equity gap of ${formatCurrency(equityGap)} puts this just over the $35k Subject-To threshold, making it a Wrap deal. Structure <strong>two mortgages</strong>: keep paying the ${formatCurrency(monthlyPiti)} to the bank, then negotiate monthly payments to seller for their ${formatCurrency(equityGap)} equity. Seller gets their retail price (${formatCurrency(askingPrice)}) with your terms. Collect ${formatCurrency(monthlyRent)} from tenant to cover both payments.`;
            } else if (equityGap <= 80000) {
                wrapExplanation = `Good Wrap opportunity. Equity gap of ${formatCurrency(equityGap)} is substantial, so seller has real skin in the game. You'll make <strong>two mortgage payments</strong>: ${formatCurrency(monthlyPiti)} to the bank (Mortgage 1) and negotiate terms with seller for their ${formatCurrency(equityGap)} equity (Mortgage 2). Total purchase: ${formatCurrency(askingPrice)} at retail, but with your payment terms. This is how you buy retail without being a retail buyer.`;
            } else {
                wrapExplanation = `Significant Wrap deal - equity gap of ${formatCurrency(equityGap)} means seller has major equity position. Structure it as <strong>two mortgages</strong>: ${formatCurrency(monthlyPiti)} to the bank, plus negotiate attractive terms to seller for their ${formatCurrency(equityGap)}. At ${formatCurrency(askingPrice)} total, seller gets retail price with your terms. With ${formatCurrency(tenantDownPayment)} from your tenant-buyer, you're positioning for a strong backend profit.`;
            }
            deals.push({
                type: 'Wrap Around Mortgage',
                viable: true,
                recommended: true,
                priority: true,
                numbers: {
                    'Mortgage 1 (Bank)': formatCurrency(mortgageBalance),
                    'Mortgage 2 (Seller)': formatCurrency(equityGap),
                    'Total Purchase': formatCurrency(askingPrice),
                    'Tenant Down': formatCurrency(tenantDownPayment)
                },
                explanation: wrapExplanation
            });
        }

        // 4. WHOLESALE
        const mao = (arv * 0.70) - repairs;
        const wholesaleProfit = mao - askingPrice;
        let wholesaleExplanation = '';
        if (wholesaleProfit >= assignmentFee * 2) {
            wholesaleExplanation = `<strong>EXCELLENT</strong> wholesale opportunity! Huge spread between MAO (${formatCurrency(mao)}) and asking price (${formatCurrency(askingPrice)}). Offer around <strong>${formatCurrency(mao - assignmentFee)}</strong> and lock in your ${formatCurrency(assignmentFee)} assignment fee with room to spare. Quick money with minimal risk. Remember: we wholesale for assignments, NOT fix and flips - dollar for dollar, ROI on wholesale beats the logistical nightmare of rehabs every time.`;
        } else if (wholesaleProfit >= assignmentFee * 1.5) {
            wholesaleExplanation = `Solid wholesale numbers. MAO of ${formatCurrency(mao)} gives you good room to work. Offer <strong>${formatCurrency(mao - assignmentFee)}</strong> to secure your ${formatCurrency(assignmentFee)} fee. Fast cash with low risk. We focus on wholesale assignments, not fix and flips - better ROI with way less headache.`;
        } else if (wholesaleProfit >= assignmentFee) {
            wholesaleExplanation = `Workable wholesale deal but you'll need to negotiate. Target offer around <strong>${formatCurrency(mao - assignmentFee)}</strong> to make your ${formatCurrency(assignmentFee)} assignment fee. Margins are tight, so your negotiation skills matter here. Wholesale assignments only - we don't touch fix and flips due to risk and time investment.`;
        } else if (mao > askingPrice) {
            const gapNeeded = askingPrice - (mao - assignmentFee);
            wholesaleExplanation = `Tight wholesale margins. MAO is ${formatCurrency(mao)} but asking is ${formatCurrency(askingPrice)}. You'd need to negotiate them down by ${formatCurrency(gapNeeded)} to make this work at <strong>${formatCurrency(mao - assignmentFee)}</strong>. Possible, but will require strong negotiation. Focus on creative financing if seller won't budge.`;
        } else {
            const shortfall = askingPrice - mao;
            wholesaleExplanation = `Wholesale numbers don't work here. Asking price (${formatCurrency(askingPrice)}) is ${formatCurrency(shortfall)} over MAO (${formatCurrency(mao)}). Even at asking price, you'd lose money on an assignment. This property needs creative financing, not wholesale. Move to Subject-To or Wrap if the numbers support it.`;
        }
        deals.push({
            type: 'Wholesale',
            viable: mao > 0,
            recommended: wholesaleProfit >= assignmentFee,
            numbers: {
                'MAO': formatCurrency(mao),
                'Assignment Fee': formatCurrency(assignmentFee),
                'Offer Price': formatCurrency(mao - assignmentFee)
            },
            explanation: wholesaleExplanation
        });

        // NOT AVAILABLE DEALS
        if (mortgageBalance === 0 && !termsAvailable) {
            let notYourBuyerMsg = '';
            if (askingPrice >= 200000) {
                notYourBuyerMsg = `Seller wants ${formatCurrency(askingPrice)} all cash with no terms? <strong>Hard pass.</strong> You don't pay retail prices without seller financing. This is not your buyer - they need to understand that cash buyers will lowball them, or they give you terms and get their price. Move on to the next deal.`;
            } else if (askingPrice >= 100000) {
                notYourBuyerMsg = `Seller wants ${formatCurrency(askingPrice)} cash with no flexibility on terms. <strong>This is not your buyer.</strong> You pay retail prices only when seller gives you creative financing. Let them chase cash buyers who'll offer 60-70 cents on the dollar. Next deal.`;
            } else {
                notYourBuyerMsg = `Wants ${formatCurrency(askingPrice)} cash, no terms. <strong>Not your buyer.</strong> They can sell to a cash buyer at a discount or give you terms and get their price. Don't waste time negotiating with sellers who want retail + all cash. Next.`;
            }
            deals.push({
                type: 'Seller Financing',
                viable: false,
                recommended: false,
                notAvailable: true,
                explanation: notYourBuyerMsg
            });
        }

        if (mortgageBalance > 0 && equityGap > 35000 && !termsAvailable) {
            let wrapNotYourBuyerMsg = '';
            if (equityGap >= 100000) {
                wrapNotYourBuyerMsg = `Equity gap is ${formatCurrency(equityGap)} - that's serious money. Seller wants it all NOW but won't give terms? <strong>Not happening.</strong> You're not writing a ${formatCurrency(equityGap)} check for retail price. They need to understand: all cash means wholesale pricing, or they take retail with terms. This is not your buyer.`;
            } else if (equityGap >= 60000) {
                wrapNotYourBuyerMsg = `With ${formatCurrency(equityGap)} in equity, this needs to be a Wrap deal - but seller wants all cash. <strong>Not your buyer.</strong> You don't pay ${formatCurrency(askingPrice)} retail with no financing flexibility. They can either take less cash now or their full price over time. Walk away.`;
            } else {
                wrapNotYourBuyerMsg = `Equity gap of ${formatCurrency(equityGap)} is over the $35k Subject-To limit, so this needs seller financing as a Wrap. But they want all cash? <strong>This is not your buyer.</strong> You pay retail only with terms. Let them find a retail buyer or come back when they're ready for creative financing.`;
            }
            deals.push({
                type: 'Wrap Around Mortgage',
                viable: false,
                recommended: false,
                notAvailable: true,
                explanation: wrapNotYourBuyerMsg
            });
        }

        if (mortgageBalance > 0 && equityGap > 35000 && termsAvailable) {
            deals.push({
                type: 'Subject-To',
                viable: false,
                recommended: false,
                notAvailable: true,
                explanation: `Equity gap is ${formatCurrency(equityGap)} (over $35k). Subject-To only works when equity is $35k or less. Use Wrap Around Mortgage instead to pay the seller their equity over time.`
            });
        } else if (mortgageBalance > 0 && equityGap <= 35000) {
            deals.push({
                type: 'Wrap Around Mortgage',
                viable: false,
                recommended: false,
                notAvailable: true,
                explanation: `Equity gap is ${formatCurrency(equityGap)} (within $35k). No need for a Wrap - use Subject-To instead. Seller gets nothing now, you solve their problem and capture equity on the backend.`
            });
        }

        if (mortgageBalance === 0) {
            deals.push({
                type: 'Subject-To',
                viable: false,
                recommended: false,
                notAvailable: true,
                explanation: 'No existing mortgage to take over. Subject-To requires an existing loan to assume.'
            });
        }

        deals.sort((a, b) => {
            if (a.priority && !b.priority) return -1;
            if (b.priority && !a.priority) return 1;
            if (a.recommended && !b.recommended) return -1;
            if (b.recommended && !a.recommended) return 1;
            if (a.notAvailable && !b.notAvailable) return 1;
            if (b.notAvailable && !a.notAvailable) return -1;
            return 0;
        });

        renderResults(deals);
    }

    function renderResults(deals) {
        const container = document.getElementById('resultsCards');
        const resultsContainer = document.getElementById('resultsContainer');
        container.innerHTML = '';

        let recommendedCount = 0;

        deals.forEach((deal, index) => {
            const card = document.createElement('div');
            card.className = 'deal-card';

            let rankBadge = '';
            let rankClass = '';

            if (deal.notAvailable) {
                rankBadge = '<span class="rank-badge not-rec">Not Available</span>';
                rankClass = 'not-recommended';
            } else if (deal.priority || (deal.recommended && recommendedCount === 0)) {
                rankBadge = '<span class="rank-badge best">#1 Best Option</span>';
                rankClass = 'rank-1';
                recommendedCount++;
            } else if (deal.recommended && recommendedCount === 1) {
                rankBadge = '<span class="rank-badge alternative">#2 Alternative</span>';
                rankClass = 'rank-2';
                recommendedCount++;
            } else if (deal.recommended) {
                rankBadge = '<span class="rank-badge option">#' + (recommendedCount + 1) + ' Option</span>';
                rankClass = 'rank-3';
                recommendedCount++;
            } else {
                rankBadge = '<span class="rank-badge not-rec">Not Recommended</span>';
                rankClass = 'not-recommended';
            }

            card.classList.add(rankClass);

            let numbersHTML = '';
            if (deal.numbers) {
                numbersHTML = '<div class="deal-numbers">';
                for (const [label, value] of Object.entries(deal.numbers)) {
                    const valueClass = value.includes('-') ? 'negative' : '';
                    numbersHTML += `
                        <div class="deal-number-item">
                            <div class="deal-number-label">${label}</div>
                            <div class="deal-number-value ${valueClass}">${value}</div>
                        </div>
                    `;
                }
                numbersHTML += '</div>';
            }

            const dealTypeMap = {
                'Subject-To': 'subject-to',
                'Wrap Around Mortgage': 'wrap',
                'Wholesale': 'wholesale',
                'Seller Financing': 'seller-financing'
            };

            const scriptDealType = dealTypeMap[deal.type] || null;
            let scriptButtonHTML = '';
            if ((deal.priority || (deal.recommended && recommendedCount === 1)) && scriptDealType && !deal.notAvailable) {
                const buttonLabel = `Show ${deal.type} Script`;
                scriptButtonHTML = `
                    <button class="show-script-btn" data-deal-type="${scriptDealType}">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        ${buttonLabel}
                    </button>
                `;
            }

            card.innerHTML = `
                <div class="deal-card-header">
                    ${rankBadge}
                    <span class="deal-type-name">${deal.type}</span>
                </div>
                ${numbersHTML}
                <div class="deal-explanation">${deal.explanation}</div>
                ${scriptButtonHTML}
            `;

            if (scriptButtonHTML) {
                setTimeout(() => {
                    const btn = card.querySelector('.show-script-btn');
                    if (btn) {
                        btn.addEventListener('click', function() {
                            const dealType = this.getAttribute('data-deal-type');
                            window.parent.postMessage({
                                action: 'openScript',
                                dealType: dealType
                            }, 'https://app.gohighlevel.com');
                        });
                    }
                }, 0);
            }

            container.appendChild(card);

            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 100);
        });

        resultsContainer.classList.add('visible');
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }
</script>

</body>
</html>  // V3: Track comps escape handler for cleanup
  var compsEscHandler = null;

  // ═══════════════════════════════════════════════════════════════════════
  // V3: DEBUG LOGGING
  // ═══════════════════════════════════════════════════════════════════════

  function log(message) {
    if (window.OT_DEBUG) {
      console.log(message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  function isOnContactPage() {
    return window.location.pathname.includes('/contacts/detail/');
  }

  function getFieldValue(selector) {
    var el = document.querySelector(selector);
    if (!el) return '';
    var val = el.value || '';
    return val.replace(/[<>]/g, '').trim();
  }

  // V3: XSS protection helper
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Fallback alert helper
  function showFallbackAlert(message) {
    alert(message);
  }

  function checkSectionStatus() {
    var contactField = document.querySelector('input[name="contact.first_name"]');
    var contactOpen = false;
    if (contactField) {
      var rect = contactField.getBoundingClientRect();
      contactOpen = rect.height > 0 && rect.width > 0;
    }
    
    var propertyField = document.querySelector('input[name="contact.number_of_bedrooms"]');
    var propertyOpen = false;
    if (propertyField) {
      var rect = propertyField.getBoundingClientRect();
      propertyOpen = rect.height > 0 && rect.width > 0;
    }
    
    return {
      contactOpen: contactOpen,
      propertyOpen: propertyOpen,
      allOpen: contactOpen && propertyOpen
    };
  }

  function isValidState(state) {
    if (!state) return false;
    var upper = state.toUpperCase();
    return US_STATES[upper] || Object.values(US_STATES).some(function(s) { 
      return s.toUpperCase() === upper; 
    });
  }

  // Fixed ZIP validation to accept ZIP+4 format
  function isValidZipCode(zip) {
    if (!zip) return false;
    return /^\d{5}(-\d{4})?$/.test(zip.trim());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FIELD DATA COLLECTION
  // ═══════════════════════════════════════════════════════════════════════

  function collectFieldData() {
    var termsSelect = document.querySelector('select[name="contact.will_they_sell_on_termz"]');
    var termsValue = termsSelect ? termsSelect.value : '';
    var termsAvailable = termsValue.toLowerCase() === 'yes' || termsValue === 'true' || termsValue === '1';
    
    return {
      askingPrice: getFieldValue('input[placeholder="Asking Price"]'),
      arv: getFieldValue('input[placeholder="After Repair Value (ARV)"]'),
      repairs: getFieldValue('input[placeholder="Repairs cost will be about...."]'),
      mortgageBalance: getFieldValue('input[placeholder="Current mortgage balance?"]'),
      monthlyPiti: getFieldValue('input[placeholder="Monthly payment to the bank? (PITI)"]'),
      termsAvailable: termsAvailable
    };
  }

  function getPropertyAddress() {
    return {
      street: getFieldValue('input[name="contact.address1"]'),
      city: getFieldValue('input[name="contact.city"]'),
      state: getFieldValue('input[name="contact.state"]'),
      postal: getFieldValue('input[name="contact.postal_code"]')
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // URL BUILDERS
  // ═══════════════════════════════════════════════════════════════════════

  function buildCalculatorURL(fieldData) {
    var params = [];
    
    function cleanNumber(val) {
      if (!val) return '';
      return val.replace(/[^0-9.]/g, '');
    }
    
    if (fieldData.askingPrice) params.push('askingPrice=' + encodeURIComponent(cleanNumber(fieldData.askingPrice)));
    if (fieldData.arv) params.push('arv=' + encodeURIComponent(cleanNumber(fieldData.arv)));
    if (fieldData.repairs) params.push('repairs=' + encodeURIComponent(cleanNumber(fieldData.repairs)));
    if (fieldData.mortgageBalance) params.push('mortgageBalance=' + encodeURIComponent(cleanNumber(fieldData.mortgageBalance)));
    if (fieldData.monthlyPiti) params.push('monthlyPiti=' + encodeURIComponent(cleanNumber(fieldData.monthlyPiti)));
    if (fieldData.termsAvailable) params.push('termsAvailable=yes');
    
    return params.length > 0 ? CALCULATOR_URL + '?' + params.join('&') : CALCULATOR_URL;
  }

  function buildZillowURL(address) {
    var query = address.street + ', ' + address.city + ', ' + address.state + ' ' + address.postal;
    return 'https://www.zillow.com/homes/' + encodeURIComponent(query) + '_rb/';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCRIPT PANEL
  // ═══════════════════════════════════════════════════════════════════════

  function createScriptPanel(url) {
    var panel = document.getElementById('ot-script-panel');
    if (panel) {
      var iframe = panel.querySelector('.ot-panel-iframe');
      if (iframe && url && iframe.src !== url) {
        iframe.src = url;
      }
      return;
    }
    panel = document.createElement('div');
    panel.id = 'ot-script-panel';
    panel.className = 'ot-panel ot-panel-right';
    panel.innerHTML = 
      '<div class="ot-panel-header">' +
        '<span>Sales Script</span>' +
        '<button class="ot-panel-close" id="ot-script-close">✕</button>' +
      '</div>' +
      '<iframe src="' + (url || SCRIPT_DOC_BASE_URL) + '" class="ot-panel-iframe"></iframe>';
    document.body.appendChild(panel);
    document.getElementById('ot-script-close').onclick = function() {
      closeScriptPanel();
    };
  }

  function closeScriptPanel() {
    var panel = document.getElementById('ot-script-panel');
    var btn = document.getElementById('ot-script-btn');
    if (panel) {
      panel.classList.remove('ot-panel-visible');
    }
    if (btn) {
      btn.textContent = 'Show Script';
    }
    currentScriptDealType = null;
  }

  window.otToggleScriptPanel = function(dealType) {
    var panel = document.getElementById('ot-script-panel');
    var btn = document.getElementById('ot-script-btn');
    
    if (panel && panel.classList.contains('ot-panel-visible')) {
      if (!dealType || dealType === currentScriptDealType) {
        closeScriptPanel();
        return;
      } else {
        var newURL = SCRIPT_DOC_BASE_URL;
        if (SCRIPT_TABS[dealType]) {
          newURL = SCRIPT_DOC_BASE_URL + '?tab=' + SCRIPT_TABS[dealType];
        }
        var iframe = panel.querySelector('.ot-panel-iframe');
        if (iframe) {
          iframe.src = newURL;
        }
        currentScriptDealType = dealType;
        return;
      }
    }
    
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Show Script');
      } else {
        showFallbackAlert('Please open a contact record first to use Show Script.');
      }
      return;
    }
    
    var scriptURL = SCRIPT_DOC_BASE_URL;
    if (dealType && SCRIPT_TABS[dealType]) {
      scriptURL = SCRIPT_DOC_BASE_URL + '?tab=' + SCRIPT_TABS[dealType];
    }
    
    createScriptPanel(scriptURL);
    panel = document.getElementById('ot-script-panel');
    panel.classList.add('ot-panel-visible');
    if (btn) btn.textContent = 'Hide Script';
    currentScriptDealType = dealType || null;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CALCULATOR PANEL
  // ═══════════════════════════════════════════════════════════════════════

  function createCalculatorPanel(url) {
    if (document.getElementById('ot-calculator-panel')) return;
    var panel = document.createElement('div');
    panel.id = 'ot-calculator-panel';
    panel.className = 'ot-panel ot-panel-left';
    panel.innerHTML = 
      '<div class="ot-panel-header">' +
        '<span>Deal Analyzer</span>' +
        '<button class="ot-panel-close" id="ot-calculator-close">✕</button>' +
      '</div>' +
      '<iframe src="' + (url || CALCULATOR_URL) + '" class="ot-panel-iframe"></iframe>';
    document.body.appendChild(panel);
    document.getElementById('ot-calculator-close').onclick = function() {
      closeCalculatorPanel();
    };
  }

  function closeCalculatorPanel() {
    var panel = document.getElementById('ot-calculator-panel');
    var btn = document.getElementById('ot-calculator-btn');
    if (panel) {
      panel.classList.remove('ot-panel-visible');
    }
    if (btn) {
      btn.textContent = 'Deal Analyzer';
    }
  }

  window.otToggleCalculatorPanel = function() {
    var panel = document.getElementById('ot-calculator-panel');
    var btn = document.getElementById('ot-calculator-btn');
    
    if (panel && panel.classList.contains('ot-panel-visible')) {
      closeCalculatorPanel();
      return;
    }
    
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Deal Analyzer');
      } else {
        showFallbackAlert('Please open a contact record first to use Deal Analyzer.');
      }
      return;
    }
    
    var sectionStatus = checkSectionStatus();
    if (!sectionStatus.contactOpen) {
      if (window.OT_Modals) {
        window.OT_Modals.showSectionInstructionModal(
          { contactOpen: false, propertyOpen: true, allOpen: false }, 
          function() { window.otToggleCalculatorPanel(); }, 
          null, 
          'Deal Analyzer'
        );
      } else {
        showFallbackAlert('Please expand the "Contact" tab first, then click Deal Analyzer again.');
      }
      return;
    }
    
    var fieldData = collectFieldData();
    var calcURL = buildCalculatorURL(fieldData);
    
    createCalculatorPanel(calcURL);
    panel = document.getElementById('ot-calculator-panel');
    panel.classList.add('ot-panel-visible');
    if (btn) btn.textContent = 'Hide Analyzer';
  };

  // ═══════════════════════════════════════════════════════════════════════
  // COMPS PANEL (V3: Added escape key, XSS protection)
  // ═══════════════════════════════════════════════════════════════════════

  // V3: Function to remove comps overlay with proper cleanup
  function removeCompsOverlay() {
    var overlay = document.getElementById('ot-comps-overlay');
    if (overlay) overlay.remove();
    
    if (compsEscHandler) {
      document.removeEventListener('keydown', compsEscHandler);
      compsEscHandler = null;
    }
  }

  function createCompsOverlay() {
    var existing = document.getElementById('ot-comps-overlay');
    if (existing) existing.remove();
    
    var overlay = document.createElement('div');
    overlay.id = 'ot-comps-overlay';
    overlay.className = 'ot-sam-overlay';
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">🤖</div>' +
          '<div class="ot-sam-title">SAM is checking the address...</div>' +
          '<div class="ot-sam-subtitle">Making sure we have what we need for Zillow</div>' +
        '</div>' +
        '<div class="ot-sam-fields" id="ot-comps-fields"></div>' +
        '<div class="ot-sam-progress">' +
          '<div class="ot-sam-progress-fill" id="ot-comps-progress-fill"></div>' +
        '</div>' +
        '<div class="ot-sam-progress-text" id="ot-comps-progress-text">0% done</div>' +
      '</div>';
    
    document.body.appendChild(overlay);
    
    // V3: Add escape key handler
    if (compsEscHandler) {
      document.removeEventListener('keydown', compsEscHandler);
    }
    compsEscHandler = function(e) {
      if (e.key === 'Escape') {
        removeCompsOverlay();
      }
    };
    document.addEventListener('keydown', compsEscHandler);
  }

  function updateCompsProgress(percent) {
    var fill = document.getElementById('ot-comps-progress-fill');
    var text = document.getElementById('ot-comps-progress-text');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = percent + '% done';
  }

  // V3: XSS-safe field display using DOM methods
  function addCompsField(fieldName, status, value) {
    var container = document.getElementById('ot-comps-fields');
    if (!container) return null;
    
    var fieldDiv = document.createElement('div');
    fieldDiv.className = 'ot-sam-field ot-sam-field-waiting';
    container.appendChild(fieldDiv);
    
    var icon = '⏳';
    var statusClass = 'ot-sam-field-waiting';
    
    if (status === 'reading') {
      icon = '📖';
      statusClass = 'ot-sam-field-reading';
    } else if (status === 'done') {
      icon = '✅';
      statusClass = 'ot-sam-field-done';
    } else if (status === 'error') {
      icon = '❌';
      statusClass = 'ot-sam-field-done';
    }
    
    fieldDiv.className = 'ot-sam-field ' + statusClass;
    
    // V3: Build content safely using DOM methods (XSS protection)
    var iconSpan = document.createElement('span');
    iconSpan.className = 'ot-sam-field-icon';
    iconSpan.textContent = icon;
    
    var nameSpan = document.createElement('span');
    nameSpan.className = 'ot-sam-field-name';
    nameSpan.textContent = fieldName;
    
    if (status === 'done' && value) {
      var valueSpan = document.createElement('span');
      valueSpan.style.color = '#059669';
      valueSpan.textContent = ' → ' + value;
      nameSpan.appendChild(valueSpan);
    } else if (status === 'error') {
      var errorSpan = document.createElement('span');
      errorSpan.style.color = '#dc2626';
      errorSpan.textContent = ' → Missing';
      nameSpan.appendChild(errorSpan);
    }
    
    fieldDiv.appendChild(iconSpan);
    fieldDiv.appendChild(nameSpan);
    
    return fieldDiv;
  }

  // V3: Update field display safely
  function updateCompsField(fieldDiv, fieldName, status, value) {
    if (!fieldDiv) return;
    
    var icon = '✅';
    var statusClass = 'ot-sam-field-done';
    
    if (status === 'error') {
      icon = '❌';
    }
    
    fieldDiv.className = 'ot-sam-field ' + statusClass;
    fieldDiv.innerHTML = ''; // Clear existing
    
    var iconSpan = document.createElement('span');
    iconSpan.className = 'ot-sam-field-icon';
    iconSpan.textContent = icon;
    
    var nameSpan = document.createElement('span');
    nameSpan.className = 'ot-sam-field-name';
    nameSpan.textContent = fieldName;
    
    if (status === 'done' && value) {
      var valueSpan = document.createElement('span');
      valueSpan.style.color = '#059669';
      valueSpan.textContent = ' → ' + value;
      nameSpan.appendChild(valueSpan);
    } else if (status === 'error') {
      var errorSpan = document.createElement('span');
      errorSpan.style.color = '#dc2626';
      errorSpan.textContent = ' → Missing';
      nameSpan.appendChild(errorSpan);
    }
    
    fieldDiv.appendChild(iconSpan);
    fieldDiv.appendChild(nameSpan);
  }

  function showCompsErrorResult(errors, address) {
    var overlay = document.getElementById('ot-comps-overlay');
    if (!overlay) return;
    
    // V3: Build error list safely
    var errorListItems = errors.map(function(e) {
      return '• ' + escapeHtml(e);
    }).join('<br>');
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">😕</div>' +
          '<div class="ot-sam-title" style="color: #dc2626;">Missing Address Info</div>' +
          '<div class="ot-sam-subtitle">I need these fields to find comps:</div>' +
        '</div>' +
        '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 30px; text-align: left; color: #991b1b; font-size: 15px; line-height: 2;">' +
          errorListItems +
        '</div>' +
        '<div style="padding: 0 30px 30px;">' +
          '<button id="ot-comps-error-btn" style="background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%); color: white; border: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(249,96,58,0.3);">Got It</button>' +
        '</div>' +
      '</div>';
    
    document.getElementById('ot-comps-error-btn').onclick = removeCompsOverlay;
  }

  function showCompsSuccessResult(address) {
    var overlay = document.getElementById('ot-comps-overlay');
    if (!overlay) return;
    
    var zillowURL = buildZillowURL(address);
    // V3: Escape address parts for safe display
    var fullAddress = [
      escapeHtml(address.street), 
      escapeHtml(address.city), 
      escapeHtml(address.state), 
      escapeHtml(address.postal)
    ].filter(Boolean).join(', ');
    
    overlay.innerHTML = 
      '<div class="ot-sam-modal">' +
        '<div class="ot-sam-header">' +
          '<div class="ot-sam-avatar">🎯</div>' +
          '<div class="ot-sam-title" style="color: #059669;">Address Verified!</div>' +
          '<div class="ot-sam-subtitle">' + fullAddress + '</div>' +
        '</div>' +
        '<div style="padding: 20px 30px 30px; text-align: center;">' +
          '<a id="ot-comps-zillow-link" href="' + zillowURL + '" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(249,96,58,0.3);">Open Zillow Comps →</a>' +
          '<div style="margin-top: 16px;">' +
            '<button id="ot-comps-cancel-btn" style="background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer;">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    document.getElementById('ot-comps-zillow-link').onclick = function() {
      setTimeout(removeCompsOverlay, 100);
    };
    document.getElementById('ot-comps-cancel-btn').onclick = removeCompsOverlay;
  }

  function startCompsReading() {
    var address = getPropertyAddress();
    
    var fields = [
      { name: 'Street Address', value: address.street },
      { name: 'City', value: address.city },
      { name: 'State', value: address.state, validate: isValidState },
      { name: 'Zip Code', value: address.postal, validate: isValidZipCode }
    ];
    
    var errors = [];
    var currentIndex = 0;
    var totalFields = fields.length;
    var fieldDivs = [];
    
    function processNextField() {
      if (currentIndex >= totalFields) {
        updateCompsProgress(100);
        setTimeout(function() {
          if (errors.length > 0) {
            showCompsErrorResult(errors, address);
          } else {
            showCompsSuccessResult(address);
          }
        }, 600);
        return;
      }
      
      var field = fields[currentIndex];
      var fieldDiv = addCompsField(field.name, 'reading', null);
      fieldDivs.push({ div: fieldDiv, field: field });
      
      setTimeout(function() {
        var isValid = !!field.value;
        
        if (field.validate && field.value && !field.validate(field.value)) {
          isValid = false;
        }
        
        if (isValid) {
          updateCompsField(fieldDiv, field.name, 'done', field.value);
        } else {
          updateCompsField(fieldDiv, field.name, 'error', null);
          errors.push(field.name);
        }
        
        currentIndex++;
        var progress = Math.round((currentIndex / totalFields) * 83);
        updateCompsProgress(progress);
        
        setTimeout(processNextField, 400);
      }, 600);
    }
    
    processNextField();
  }

  window.otToggleCompsPanel = function() {
    if (!isOnContactPage()) {
      if (window.OT_Modals) {
        window.OT_Modals.showNotOnContactAlert('Get Comps');
      } else {
        showFallbackAlert('Please open a contact record first to use Get Comps.');
      }
      return;
    }
    
    var sectionStatus = checkSectionStatus();
    if (!sectionStatus.propertyOpen) {
      if (window.OT_Modals) {
        window.OT_Modals.showSectionInstructionModal(
          { contactOpen: true, propertyOpen: false, allOpen: false }, 
          function() { window.otToggleCompsPanel(); }, 
          null, 
          'Get Comps'
        );
      } else {
        showFallbackAlert('Please expand the "Property Information Sheet" tab first, then click Get Comps again.');
      }
      return;
    }
    
    createCompsOverlay();
    setTimeout(function() {
      startCompsReading();
    }, 400);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // LISTEN FOR MESSAGES FROM CALCULATOR IFRAME
  // ═══════════════════════════════════════════════════════════════════════

  window.addEventListener('message', function(event) {
    if (event.origin !== 'https://offertermz.com') return;
    if (event.data && event.data.action === 'openScript') {
      window.otToggleScriptPanel(event.data.dealType);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // EXPOSE FUNCTIONS GLOBALLY
  // ═══════════════════════════════════════════════════════════════════════

  window.OT_Panels = {
    toggleCalculator: window.otToggleCalculatorPanel,
    toggleScript: window.otToggleScriptPanel,
    toggleComps: window.otToggleCompsPanel,
    collectFieldData: collectFieldData,
    getPropertyAddress: getPropertyAddress,
    closeCalculator: closeCalculatorPanel,
    closeScript: closeScriptPanel,
    closeComps: removeCompsOverlay  // V3: Expose comps close
  };

  log('✅ ot-panels.js v3 loaded');

})();
