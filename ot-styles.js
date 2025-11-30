/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OfferTermz Styles Module
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * *** VERSION 2 ***
 * UPDATES:
 * - Added .ot-btn-loading style for buttons while modules load
 * - Loading buttons show pulsing animation
 * 
 * FILE: ot-styles.js
 * PURPOSE: All CSS styles for the OfferTermz GHL UI
 * EDIT THIS WHEN: Changing colors, sizes, spacing, animations
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Prevent double-loading
  if (window.OT_STYLES_LOADED) return;
  window.OT_STYLES_LOADED = true;

  var styles = document.createElement('style');
  styles.id = 'ot-global-styles';
  styles.textContent = `

    /* ─────────────────────────────────────────────────────────────────────
       HEADER BUTTONS
       ───────────────────────────────────────────────────────────────────── */
    #ot-header-buttons {
      display: flex;
      gap: 8px;
      margin-right: 12px;
    }
    
    .ot-header-btn {
      background: linear-gradient(135deg, #34434a 0%, #2a3439 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .ot-header-btn:hover {
      background: linear-gradient(135deg, #3d4e56 0%, #34434a 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .ot-header-btn.ot-btn-disabled {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      opacity: 0.6;
      cursor: pointer;
    }
    
    .ot-header-btn.ot-btn-disabled:hover {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      transform: none;
      box-shadow: none;
    }
    
    /* V2: Loading state for buttons while modules load */
    .ot-header-btn.ot-btn-loading {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      cursor: wait;
      animation: ot-pulse 1.5s ease-in-out infinite;
    }
    
    .ot-header-btn.ot-btn-loading:hover {
      transform: none;
      box-shadow: none;
    }
    
    @keyframes ot-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    /* ─────────────────────────────────────────────────────────────────────
       SLIDE PANELS (Calculator, Script, Comps)
       ───────────────────────────────────────────────────────────────────── */
    .ot-panel {
      position: fixed;
      background: white;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 9999;
      transition: transform 0.3s ease;
    }
    
    .ot-panel-left {
      top: 0;
      left: 0;
      width: 450px;
      height: 100vh;
      transform: translateX(-100%);
    }
    
    .ot-panel-right {
      top: 0;
      right: 0;
      width: 450px;
      height: 100vh;
      transform: translateX(100%);
    }
    
    .ot-panel-top {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .ot-panel-top.ot-panel-visible {
      opacity: 1;
      visibility: visible;
    }
    
    .ot-panel-top .ot-panel-inner {
      background: white;
      border-radius: 16px;
      width: 550px;
      max-height: 80vh;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      transform: scale(0.95);
      transition: transform 0.3s ease;
    }
    
    .ot-panel-top.ot-panel-visible .ot-panel-inner {
      transform: scale(1);
    }
    
    .ot-panel-top .ot-panel-header {
      border-radius: 16px 16px 0 0;
    }
    
    .ot-panel-top .ot-panel-placeholder {
      padding: 40px 20px;
      text-align: center;
      color: #34434a;
      font-size: 16px;
    }
    
    .ot-panel-visible {
      transform: translateX(0) !important;
    }
    
    .ot-panel-header {
      background: linear-gradient(135deg, #34434a 0%, #2a3439 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
    }
    
    .ot-panel-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      transition: background 0.2s;
    }
    
    .ot-panel-close:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .ot-panel-iframe {
      width: 100%;
      height: calc(100% - 60px);
      border: none;
    }
    
    .ot-panel-placeholder {
      padding: 40px 20px;
      text-align: center;
      color: #34434a;
      font-size: 16px;
    }

    /* ─────────────────────────────────────────────────────────────────────
       MODALS
       ───────────────────────────────────────────────────────────────────── */
    .ot-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      animation: ot-fadeIn 0.2s ease;
    }
    
    .ot-modal.visible {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ot-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }
    
    .ot-modal-content {
      position: relative;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 700px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      animation: ot-slideUp 0.3s ease;
    }
    
    .ot-modal-body {
      padding: 32px;
    }
    
    .ot-modal-icon {
      font-size: 56px;
      text-align: center;
      margin-bottom: 16px;
    }
    
    .ot-modal-title {
      font-size: 24px;
      font-weight: 700;
      color: #34434a;
      text-align: center;
      margin-bottom: 12px;
    }
    
    .ot-modal-message {
      font-size: 17px;
      color: #555;
      line-height: 1.7;
      text-align: center;
    }
    
    .ot-modal-buttons {
      display: flex;
      gap: 12px;
      margin-top: 28px;
      justify-content: center;
    }
    
    .ot-modal-btn {
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      min-width: 140px;
    }
    
    .ot-modal-btn-primary {
      background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(249, 96, 58, 0.3);
    }
    
    .ot-modal-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(249, 96, 58, 0.4);
    }
    
    .ot-modal-btn-secondary {
      background: #f3f4f6;
      color: #34434a;
      border: 2px solid #e5e7eb;
    }
    
    .ot-modal-btn-secondary:hover {
      background: #e5e7eb;
    }

    /* ─────────────────────────────────────────────────────────────────────
       TAB HIGHLIGHT (Section Instructions)
       ───────────────────────────────────────────────────────────────────── */
    .ot-look-label {
      font-size: 13px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 20px;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .ot-tab-highlight {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px 28px;
      margin: 0 auto 16px auto;
      background: white;
      border: 3px solid #0ea5e9;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 600;
      color: #0ea5e9;
      animation: ot-pulse-border 2s ease-in-out infinite;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.25);
      max-width: 420px;
    }
    
    .ot-tab-chevron {
      color: #0ea5e9;
      font-size: 18px;
      font-weight: 400;
    }
    
    .ot-cursor-arrow {
      width: 24px;
      height: 24px;
      margin-left: 8px;
      animation: ot-click 1.5s ease-in-out infinite;
      flex-shrink: 0;
    }
    
    @keyframes ot-click {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(2px, 2px); }
    }
    
    .ot-instruction-small {
      background: #f9fafb;
      border-radius: 8px;
      padding: 14px 18px;
      margin-top: 24px;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      line-height: 1.5;
    }
    
    @keyframes ot-pulse-border {
      0%, 100% { border-color: #0ea5e9; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.25); }
      50% { border-color: #38bdf8; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4); }
    }

    /* ─────────────────────────────────────────────────────────────────────
       ERROR LIST
       ───────────────────────────────────────────────────────────────────── */
    .ot-error-list {
      background: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: left;
    }
    
    .ot-error-item {
      color: #991b1b;
      font-size: 15px;
      margin-bottom: 12px;
      padding-left: 28px;
      position: relative;
      line-height: 1.5;
    }
    
    .ot-error-item:before {
      content: "⚠️";
      position: absolute;
      left: 0;
    }
    
    .ot-error-item:last-child {
      margin-bottom: 0;
    }

    /* ─────────────────────────────────────────────────────────────────────
       SUCCESS CHECK
       ───────────────────────────────────────────────────────────────────── */
    .ot-success-check {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: ot-scaleIn 0.5s ease;
    }
    
    .ot-success-check:after {
      content: "✓";
      font-size: 40px;
      color: white;
    }

    /* ─────────────────────────────────────────────────────────────────────
       SAM READING OVERLAY
       ───────────────────────────────────────────────────────────────────── */
    .ot-sam-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .ot-sam-modal {
      background: white;
      border-radius: 20px;
      padding: 36px;
      max-width: 550px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
    }
    
    .ot-sam-header {
      text-align: center;
      margin-bottom: 28px;
    }
    
    .ot-sam-avatar {
      font-size: 60px;
      margin-bottom: 12px;
    }
    
    .ot-sam-title {
      font-size: 22px;
      font-weight: 700;
      color: #34434a;
      margin-bottom: 6px;
    }
    
    .ot-sam-subtitle {
      font-size: 15px;
      color: #6b7280;
    }
    
    .ot-sam-fields {
      background: #f9fafb;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .ot-sam-field {
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 15px;
      transition: all 0.3s ease;
    }
    
    .ot-sam-field:last-child {
      margin-bottom: 0;
    }
    
    .ot-sam-field-waiting {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .ot-sam-field-reading {
      background: #fef3c7;
      color: #92400e;
      animation: ot-pulse 1.5s ease-in-out infinite;
    }
    
    .ot-sam-field-done {
      background: #d1fae5;
      color: #065f46;
    }
    
    .ot-sam-field-icon {
      font-size: 22px;
      flex-shrink: 0;
    }
    
    .ot-sam-field-name {
      flex: 1;
      font-weight: 500;
    }
    
    .ot-sam-progress {
      background: #e5e7eb;
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
    }
    
    .ot-sam-progress-fill {
      background: linear-gradient(90deg, #f9603a 0%, #e54d2a 100%);
      height: 100%;
      width: 0%;
      transition: width 0.3s ease;
    }
    
    .ot-sam-progress-text {
      text-align: center;
      margin-top: 10px;
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
    }

    /* ─────────────────────────────────────────────────────────────────────
       SAM HELP ICONS
       ───────────────────────────────────────────────────────────────────── */
    .sam-info-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      margin-left: 6px;
      background: #64748b;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      vertical-align: middle;
      user-select: none;
      line-height: 1;
    }
    
    .sam-info-icon:hover {
      background: #f9603a;
      transform: scale(1.1);
    }
    
    .sam-help-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: sam-help-fadeIn 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .sam-help-popup {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 440px;
      width: 90%;
      overflow: hidden;
      animation: sam-help-slideUp 0.3s ease;
    }
    
    .sam-help-header {
      background: linear-gradient(135deg, #34434a 0%, #2a3439 100%);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .sam-help-avatar {
      font-size: 32px;
      line-height: 1;
    }
    
    .sam-help-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      flex: 1;
      color: #ffffff !important;
      -webkit-text-fill-color: #ffffff !important;
    }
    
    .sam-help-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .sam-help-close:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .sam-help-body {
      padding: 24px;
    }
    
    .sam-help-message {
      font-size: 15px;
      line-height: 1.8;
      color: #374151;
      margin: 0;
    }
    
    .sam-help-message strong {
      color: #1f2937;
      font-weight: 600;
    }
    
    .sam-help-message em {
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-style: normal;
    }
    
    .sam-help-footer {
      padding: 0 24px 24px;
    }
    
    .sam-help-btn {
      background: linear-gradient(135deg, #f9603a 0%, #e54d2a 100%);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(249, 96, 58, 0.3);
      width: 100%;
    }
    
    .sam-help-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(249, 96, 58, 0.4);
    }

    /* ─────────────────────────────────────────────────────────────────────
       ANIMATIONS
       ───────────────────────────────────────────────────────────────────── */
    @keyframes ot-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes ot-slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes ot-scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    
    @keyframes ot-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.01); }
    }
    
    @keyframes sam-help-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes sam-help-slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* ─────────────────────────────────────────────────────────────────────
       RESPONSIVE
       ───────────────────────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .ot-modal-content { width: 95%; margin: 16px; }
      .ot-modal-body { padding: 24px; }
      .ot-modal-buttons { flex-direction: column; }
      .ot-modal-btn { width: 100%; }
      .ot-panel-left, .ot-panel-right { width: 100%; }
    }

  `;

  document.head.appendChild(styles);
  console.log('✅ ot-styles.js v2 loaded');

})();
