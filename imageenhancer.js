import React, { useState, useRef, useEffect } from 'react';
import './ImageEnhancer.css';

const ImageEnhancer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [blur, setBlur] = useState(0);
  
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    const img = new Image();
    img.onload = () => {
      originalImageRef.current = img;
      drawImage();
    };
    img.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (originalImageRef.current) {
      drawImage();
    }
  }, [brightness, contrast, saturation, sharpness, blur]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      resetFilters();
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSharpness(0);
    setBlur(0);
  };

  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;

    if (!canvas || !ctx || !img) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
    `;

    ctx.drawImage(img, 0, 0);

    if (sharpness > 0) {
      applySharpness(ctx, canvas.width, canvas.height, sharpness);
    }
  };

  const applySharpness = (ctx, width, height, amount) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.globalAlpha = 1 + (amount / 100);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalAlpha = 1;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'enhanced-image.png';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="image-enhancer">
      <header className="header">
        <h1>Image Enhancer</h1>
        <p>Upload and enhance your images with powerful filters</p>
      </header>

      <div className="container">
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {selectedFile ? 'Change Image' : 'Upload Image'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {preview && (
          <>
            <div className="preview-section">
              <div className="image-container">
                <canvas ref={canvasRef} className="preview-canvas" />
              </div>
            </div>

            <div className="controls-section">
              <h2>Enhancement Options</h2>
              
              <div className="control-group">
                <label>
                  <span>Brightness</span>
                  <span className="value">{brightness}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label>
                  <span>Contrast</span>
                  <span className="value">{contrast}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label>
                  <span>Saturation</span>
                  <span className="value">{saturation}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label>
                  <span>Sharpness</span>
                  <span className="value">{sharpness}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="control-group">
                <label>
                  <span>Blur</span>
                  <span className="value">{blur}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="action-buttons">
                <button onClick={handleReset} className="btn btn-secondary">
                  Reset Filters
                </button>
                <button onClick={handleDownload} className="btn btn-primary">
                  Download Enhanced Image
                </button>
              </div>
            </div>
          </>
        )}

        {!preview && (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="21 15 16 10 5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No Image Selected</h3>
            <p>Upload an image to start enhancing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEnhancer;
