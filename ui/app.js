/* ========================================================
   NeuroScan AI — App Logic
   ======================================================== */
(() => {
    "use strict";

    // ── DOM References ──
    const $ = (s) => document.querySelector(s);
    const dropzone    = $("#dropzone");
    const fileInput   = $("#file-input");
    const uploadIdle  = $("#upload-idle");
    const uploadPrev  = $("#upload-preview");
    const previewImg  = $("#preview-image");
    const removeBtn   = $("#remove-btn");
    const fileMeta    = $("#file-meta");
    const fileName    = $("#file-name");
    const fileSize    = $("#file-size");

    const ageSlider   = $("#age-slider");
    const ageValue    = $("#age-value");
    const mmseSlider  = $("#mmse-slider");
    const mmseValue   = $("#mmse-value");
    const cdrSelect   = $("#cdr-select");
    const cdrBadges   = document.querySelectorAll(".cdr-badge");

    const runBtn      = $("#run-btn");
    const resultsEl   = $("#results-section");

    let uploadedFile  = null;

    // ── Slider Updates ──
    ageSlider.addEventListener("input", () => {
        ageValue.textContent = ageSlider.value;
        updateSliderTrack(ageSlider);
    });

    mmseSlider.addEventListener("input", () => {
        mmseValue.textContent = mmseSlider.value;
        updateSliderTrack(mmseSlider);
    });

    function updateSliderTrack(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(90deg, rgba(0,212,170,0.5) ${pct}%, rgba(56,189,248,0.12) ${pct}%)`;
    }
    updateSliderTrack(ageSlider);
    updateSliderTrack(mmseSlider);

    // ── CDR Badge + Select Sync ──
    cdrBadges.forEach((badge) => {
        badge.addEventListener("click", () => {
            cdrSelect.value = badge.dataset.cdr;
            syncCDR();
        });
    });
    cdrSelect.addEventListener("change", syncCDR);

    function syncCDR() {
        cdrBadges.forEach((b) => b.classList.toggle("cdr-badge--active", b.dataset.cdr === cdrSelect.value));
    }

    // ── File Upload (Click + Drag & Drop) ──
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fileInput.click(); });

    fileInput.addEventListener("change", (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });

    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file && /\.(png|jpe?g)$/i.test(file.name)) handleFile(file);
    });

    function handleFile(file) {
        uploadedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadIdle.hidden = true;
            uploadPrev.hidden = false;
            fileMeta.hidden = false;
            fileName.textContent = file.name;
            fileSize.textContent = formatBytes(file.size);
        };
        reader.readAsDataURL(file);
    }

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        uploadedFile = null;
        fileInput.value = "";
        previewImg.src = "";
        uploadIdle.hidden = false;
        uploadPrev.hidden = true;
        fileMeta.hidden = true;
    });

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    }

    // ── Run Diagnosis (Simulated) ──
    runBtn.addEventListener("click", runDiagnosis);

    function runDiagnosis() {
        // Simulate AI pipeline (in production, this sends data to a backend)
        runBtn.classList.add("action__btn--loading");
        const btnLabel = runBtn.querySelector(".action__btn-label");
        btnLabel.textContent = "Analyzing…";
        resultsEl.hidden = true;

        setTimeout(() => {
            const result = simulatePrediction();
            renderResults(result);
            runBtn.classList.remove("action__btn--loading");
            btnLabel.textContent = "Run AI Diagnosis";
            resultsEl.hidden = false;
            resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 2200);
    }

    function simulatePrediction() {
        const cdr = parseFloat(cdrSelect.value);
        const mmse = parseInt(mmseSlider.value);
        const age = parseInt(ageSlider.value);

        // Heuristic simulation based on clinical inputs
        let probs;
        if (cdr === 0 && mmse >= 27) {
            probs = { healthy: 0.88, vmild: 0.08, mild: 0.03, moderate: 0.01 };
        } else if (cdr <= 0.5 && mmse >= 23) {
            probs = { healthy: 0.18, vmild: 0.62, mild: 0.15, moderate: 0.05 };
        } else if (cdr <= 1 && mmse >= 18) {
            probs = { healthy: 0.05, vmild: 0.15, mild: 0.65, moderate: 0.15 };
        } else {
            probs = { healthy: 0.02, vmild: 0.06, mild: 0.22, moderate: 0.70 };
        }

        // Add slight randomness
        const keys = Object.keys(probs);
        let total = 0;
        keys.forEach((k) => {
            probs[k] += (Math.random() - 0.5) * 0.06;
            probs[k] = Math.max(0.01, probs[k]);
            total += probs[k];
        });
        keys.forEach((k) => (probs[k] = probs[k] / total));

        // Determine top class
        let topClass = keys[0];
        keys.forEach((k) => { if (probs[k] > probs[topClass]) topClass = k; });

        return { probs, topClass, confidence: probs[topClass] };
    }

    const CLASS_META = {
        healthy:  { label: "Non-Demented",       css: "healthy",  desc: "No significant cognitive impairment detected." },
        vmild:    { label: "Very Mild Dementia",  css: "vmild",    desc: "Early-stage indicators present. Monitoring recommended." },
        mild:     { label: "Mild Dementia",       css: "mild",     desc: "Notable cognitive decline. Clinical follow-up advised." },
        moderate: { label: "Moderate Dementia",   css: "moderate", desc: "Significant impairment detected. Urgent evaluation recommended." },
    };

    function renderResults({ probs, topClass, confidence }) {
        const meta = CLASS_META[topClass];

        // Classification
        const classEl = $("#result-class");
        classEl.textContent = meta.label;
        classEl.className = "result-card__value result-card__value--" + meta.css;
        $("#result-class-desc").textContent = meta.desc;

        // Confidence
        const pctStr = (confidence * 100).toFixed(1) + "%";
        $("#result-conf-pct").textContent = pctStr;
        const bar = $("#result-conf-bar");
        bar.style.width = "0%";
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { bar.style.width = (confidence * 100).toFixed(1) + "%"; });
        });

        // Breakdown bars
        const brkContainer = $("#breakdown-bars");
        brkContainer.innerHTML = "";
        const order = ["healthy", "vmild", "mild", "moderate"];
        order.forEach((key) => {
            const pct = (probs[key] * 100).toFixed(1);
            const row = document.createElement("div");
            row.className = "breakdown__row";
            row.innerHTML = `
                <span class="breakdown__label">${CLASS_META[key].label}</span>
                <div class="breakdown__track">
                    <div class="breakdown__fill breakdown__fill--${CLASS_META[key].css}" style="width:0%"></div>
                </div>
                <span class="breakdown__pct">${pct}%</span>
            `;
            brkContainer.appendChild(row);
            // Animate
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    row.querySelector(".breakdown__fill").style.width = pct + "%";
                });
            });
        });

        // Timestamp
        const now = new Date();
        $("#results-time").textContent = now.toLocaleString("en-US", {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            year: "numeric", month: "short", day: "numeric",
        });
    }
})();
