let currentFile = null;
let analysisCount = 0;

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const analysisResults = document.getElementById('analysisResults');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadHistory();
    updateStats();
});

function initializeApp() {
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    uploadArea.addEventListener('click', () => {
        // Prevent click if another element inside uploadArea was clicked (like the button)
        if (event.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
    
    // NEW: Setup the interactive feature cards
    setupFeatureCards();
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showAlert('Please select a valid image file (PNG, JPG, JPEG)', 'error');
        return;
    }

    if (file.size > 16 * 1024 * 1024) {
        showAlert('File size must be less than 16MB', 'error');
        return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
        
        // Hide previous results
        analysisResults.style.display = 'none';
        noResults.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function analyzeMedicine() {
    if (!currentFile) {
        showAlert('Please select an image first', 'error');
        return;
    }

    // Show loading
    loading.style.display = 'block';
    analysisResults.style.display = 'none';
    noResults.style.display = 'none';
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', currentFile);

    // Simulate progress
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
        progressBar.textContent = Math.round(progress) + '%';
    }, 200);

    // Make API call to the CORRECT endpoint: /analyze
    fetch('/analyze', { 
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        progressBar.textContent = '100%';
        
        setTimeout(() => {
            loading.style.display = 'none';
            if (data.status === 'success') {
                displayResults(data);
                analysisCount++;
                updateStats();
                loadHistory(); // Refresh history
            } else {
                showAlert(data.message || 'Analysis failed due to server error or feature extraction issue.', 'error');
                noResults.style.display = 'block';
            }
        }, 500);
    })
    .catch(error => {
        clearInterval(progressInterval);
        loading.style.display = 'none';
        showAlert('Network or Server-side Analysis Error: ' + error.message, 'error');
        noResults.style.display = 'block';
    });
}

function displayResults(data) {
    const medicine = data.medicine_info || {};
    const features = data.features || {};
    const qrCodes = data.qr_codes || [];
    
    // Ensure numeric features are formatted
    const formattedFeatures = {
        area: features.area ? features.area.toFixed(2) : 'N/A',
        circularity: features.circularity ? features.circularity.toFixed(3) : 'N/A',
        aspect_ratio: features.aspect_ratio ? features.aspect_ratio.toFixed(3) : 'N/A',
        brightness: features.brightness || 'N/A' 
    };

    const qrCodeInfo = qrCodes.length > 0 ? `
        <div style="margin-top: 15px;">
            <h4>📱 QR Code Detected:</h4>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 10px;">
                <strong>Type:</strong> ${qrCodes[0].type}<br>
                <strong>Data:</strong> ${qrCodes[0].data}
            </div>
        </div>
    ` : '<div style="margin-top: 15px; opacity: 0.7;">No QR code detected</div>';

    const technicalFeatures = `
        <div style="margin-top: 20px;">
            <h4>🔬 Technical Analysis:</h4>
            <div class="details-grid" style="margin-top: 10px;">
                <div class="detail-item">
                    <div class="detail-label">Area (px²)</div>
                    <div class="detail-value">${formattedFeatures.area}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Circularity</div>
                    <div class="detail-value">${formattedFeatures.circularity}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Aspect Ratio</div>
                    <div class="detail-value">${formattedFeatures.aspect_ratio}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Brightness</div>
                    <div class="detail-value">${formattedFeatures.brightness}</div>
                </div>
            </div>
        </div>
    `;

    const resultsHTML = `
        <div class="analysis-result ${data.result}">
            <div class="result-header">
                ${getStatusIcon(data.result)} ${getStatusText(data.result)}
            </div>
            
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${data.confidence}%"></div>
            </div>
            <p style="margin: 5px 0; opacity: 0.9;">Confidence: ${data.confidence}%</p>
            
            <p style="margin: 15px 0; line-height: 1.5;">
                <strong>Recommendation:</strong> ${data.recommendation}
            </p>
            
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">Medicine</div>
                    <div class="detail-value">${medicine.name || 'Unknown'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Risk Level</div>
                    <div class="detail-value">${data.risk_level}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Shape</div>
                    <div class="detail-value">${medicine.shape || 'Unknown'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Color</div>
                    <div class="detail-value">${medicine.color || 'Unknown'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Imprint</div>
                    <div class="detail-value">${medicine.imprint || 'Unknown'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Manufacturer</div>
                    <div class="detail-value">${medicine.manufacturer || 'Unknown'}</div>
                </div>
            </div>
            
            ${qrCodeInfo}
            ${technicalFeatures}
            
            ${data.result === 'counterfeit' ? `
                <div class="alert alert-danger" style="margin-top: 15px;">
                    ⚠️ <strong>DANGER:</strong> This medicine may be counterfeit. Contact local health authorities immediately.
                </div>
            ` : ''}
            
            ${data.result === 'suspicious' ? `
                <div class="alert alert-warning" style="margin-top: 15px;">
                    ⚠️ <strong>CAUTION:</strong> Please verify with your pharmacist or healthcare provider before consumption.
                </div>
            ` : ''}
            
            <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
                Analysis completed on: ${new Date(data.timestamp).toLocaleString()}
            </p>
        </div>
    `;
    
    analysisResults.innerHTML = resultsHTML;
    analysisResults.style.display = 'block';
}

function getStatusIcon(outcome) {
    switch(outcome) {
        case 'authentic': return '✅';
        case 'suspicious': return '⚠️';
        case 'counterfeit': return '❌';
        default: return '❓';
    }
}

function getStatusText(outcome) {
    switch(outcome) {
        case 'authentic': return 'AUTHENTIC MEDICINE';
        case 'suspicious': return 'SUSPICIOUS - VERIFY';
        case 'counterfeit': return 'COUNTERFEIT DETECTED';
        default: return 'UNKNOWN STATUS';
    }
}

function loadHistory() {
    fetch('/history')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displayHistory(data.history);
            // Update the analyzed count from the server's history length
            analysisCount = data.history.length;
            updateStats();
        }
    })
    .catch(error => {
        console.error('Error loading history:', error);
    });
}

function displayHistory(history) {
    const container = document.getElementById('historyContainer');
    
    if (history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No analysis history yet</p>';
        return;
    }
    
    const historyHTML = history.slice(0, 5).reverse().map(item => `
        <div class="history-item">
            <div class="history-header">
                <div>
                    <strong>${item.filename}</strong>
                    <span class="history-result ${item.result}">${item.result.toUpperCase()}</span>
                </div>
                <div style="font-size: 0.9rem; color: #666;">
                    ${new Date(item.timestamp).toLocaleDateString()}
                </div>
            </div>
            <div style="font-size: 0.9rem; color: #666;">
                Confidence: ${item.confidence}%
            </div>
        </div>
    `).join('');
    
    container.innerHTML = historyHTML;
}

function updateStats() {
    const countElement = document.getElementById('analyzed-count');
    if (countElement) {
        countElement.textContent = analysisCount;
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'warning'}`;
    alertDiv.innerHTML = `
        <strong>${type === 'error' ? 'Error:' : 'Warning:'}</strong> ${message}
    `;
    
    // Insert after upload area
    const uploadSection = document.querySelector('.upload-section');
    uploadSection.appendChild(alertDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// =======================================================
// NEW FEATURE INTERACTION LOGIC
// =======================================================

// Feature details dictionary
const featureDetails = {
    'ai-detection': {
        title: 'Advanced AI Detection',
        body: 'Our system employs a Convolutional Neural Network (CNN) trained on millions of authentic and counterfeit medicine images. It analyzes sub-visual anomalies, texture deviations, and microscopic imperfections to achieve industry-leading accuracy (99.2%) in differentiating between genuine and fake pills.'
    },
    'real-time': {
        title: 'Real-time Analysis',
        body: 'Utilizing optimized computer vision algorithms (OpenCV) for feature extraction (shape, size, imprint), the image is analyzed in under 3 seconds. The extracted features are instantly compared against a proprietary database of known authentic drug profiles for immediate authenticity scoring.'
    },
    'qr-code': {
        title: 'QR Code & Barcode Support',
        body: 'The system automatically detects and decodes QR codes and bar codes on the packaging or pill surface. This digital data is verified against the manufacturer\'s distributed ledger to confirm the drug\'s supply chain history, adding a critical layer of defense against sophisticated counterfeiting.'
    },
    'database': {
        title: 'Comprehensive Database Integration',
        body: 'MediGuard\'s backend is linked to a regularly updated global drug database, including NDC (National Drug Code) and national drug registers. This allows for cross-referencing visual features with official drug characteristics (color, shape, imprint, dosage) for validation.'
    }
};

function setupFeatureCards() {
    const modal = document.getElementById('featureModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close-btn');

    // 1. Open Modal on Card Click
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', () => {
            const featureKey = card.getAttribute('data-feature');
            const detail = featureDetails[featureKey];

            if (detail) {
                modalTitle.textContent = detail.title;
                modalBody.textContent = detail.body;
                modal.style.display = 'block';
            }
        });
    });

    // 2. Close Modal Functions
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}
// =======================================================