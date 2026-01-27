'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import NextImage from 'next/image';

interface StudentIDScannerProps {
    onComplete: (data: { schoolName: string; studentName: string; rawText: string }) => void;
}

export default function StudentIDScanner({ onComplete }: StudentIDScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<{ schoolName: string; studentName: string } | null>(null);
    const [progress, setProgress] = useState(0);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: { ideal: "environment" }
    };

    // Preprocess image to improve OCR accuracy
    const preprocessImage = useCallback((imageSrc: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) {
                    resolve(imageSrc);
                    return;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(imageSrc);
                    return;
                }

                // Set canvas size to match image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Apply image processing: Grayscale and Contrast enhancement
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Grayscale
                    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                    // Simple contrast enhancement
                    const threshold = 128;
                    const factor = 1.5;
                    gray = threshold + factor * (gray - threshold);
                    gray = Math.min(255, Math.max(0, gray));

                    data[i] = data[i + 1] = data[i + 2] = gray;
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.src = imageSrc;
        });
    }, []);

    const processImage = useCallback(async (imageSrc: string) => {
        setIsScanning(true);
        setProgress(0);
        setImgSrc(imageSrc);

        try {
            // Preprocess for OCR
            const processedSrc = await preprocessImage(imageSrc);

            const result = await Tesseract.recognize(
                processedSrc,
                'kor+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            console.log('Processed OCR Result:', text);

            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);

            let detectedSchool = '';
            let detectedName = '';

            // Improved Heuristics for Korean Student IDs
            for (const line of lines) {
                // School name detection
                if (line.includes('고등학교') || line.includes('학교') || line.includes('School')) {
                    // Clean up the line: remove common ID prefixes
                    let cleaned = line.replace(/.*[:：]/, '').trim();
                    // Sanitize: School names shouldn't start with @ or other symbols
                    cleaned = cleaned.replace(/^[^가-힣a-zA-Z0-9]+/, '');
                    detectedSchool = cleaned;
                }

                // Name detection (Korean names are 3 chars usually, sometimes 2 or 4)
                // We look for lines that are ONLY Korean and 2-4 chars
                if (!detectedName && /^[가-힣]{2,4}$/.test(line)) {
                    const commonWords = ['학생증', '학교', '번호', '성명', '이름', '학년', '반'];
                    if (!commonWords.some(word => line.includes(word))) {
                        detectedName = line;
                    }
                }

                // Fallback name detection: "성명 : 홍길동" pattern
                if (line.includes('성명') || line.includes('이름') || line.includes('Name')) {
                    const parts = line.split(/[:：]/);
                    if (parts.length > 1) {
                        const potentialName = parts[1].trim();
                        if (/^[가-힣]{2,4}$/.test(potentialName)) {
                            detectedName = potentialName;
                        }
                    }
                }
            }

            setScannedData({
                schoolName: detectedSchool,
                studentName: detectedName
            });

        } catch (err) {
            console.error('OCR Error:', err);
            alert('스캔 중 오류가 발생했습니다. 다시 시도해주세요.');
            setImgSrc(null);
        } finally {
            setIsScanning(false);
        }
    }, [preprocessImage]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            processImage(imageSrc);
        }
    }, [webcamRef, processImage]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                processImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = () => {
        if (scannedData) {
            onComplete({
                ...scannedData,
                rawText: ''
            });
        }
    };

    const handleRetake = () => {
        setImgSrc(null);
        setScannedData(null);
        setProgress(0);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">학생증 인증</h2>
                <p className="text-gray-500 text-sm mt-2">안정적인 촬영을 위해 빛 번짐을 주의해주세요</p>
            </div>

            <div className="scanner-card glass-panel">
                {!imgSrc ? (
                    <div className="camera-container">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="webcam-view"
                            forceScreenshotSourceSize={true}
                        />
                        <div className="overlay-guide">
                            <div className="guide-box"></div>
                            <p className="guide-text">사각형 안에 학생증을 정렬해주세요</p>
                        </div>

                        <div className="camera-controls">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="gallery-btn"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </button>

                            <button onClick={capture} className="capture-btn">
                                <div className="inner-circle"></div>
                            </button>

                            <div className="w-12"></div> {/* Spacer to center capture btn */}
                        </div>
                    </div>
                ) : (
                    <div className="preview-container">
                        <NextImage src={imgSrc} alt="Scanned ID" fill className="scanned-image" style={{ objectFit: 'cover' }} />

                        {isScanning && (
                            <div className="scanning-overlay">
                                <div className="scanner-line"></div>
                                <div className="progress-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                </div>
                                <p className="scanning-text">인공지능 분석 중... {progress}%</p>
                                <p className="text-xs text-white/60 mt-2">글자를 읽어오고 있습니다</p>
                            </div>
                        )}
                    </div>
                )}

                {scannedData && !isScanning && (
                    <div className="result-form">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="result-title">인식 결과 확인</h3>
                            <p className="text-xs text-blue-500 font-medium">잘못된 정보는 수정 가능합니다</p>
                        </div>

                        <div className="form-group">
                            <label>학교명</label>
                            <input
                                type="text"
                                value={scannedData.schoolName}
                                onChange={(e) => setScannedData({ ...scannedData, schoolName: e.target.value })}
                                placeholder="인식되지 않음 (직접 입력)"
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>성명</label>
                            <input
                                type="text"
                                value={scannedData.studentName}
                                onChange={(e) => setScannedData({ ...scannedData, studentName: e.target.value })}
                                placeholder="인식되지 않음 (직접 입력)"
                                className="input-field"
                            />
                        </div>

                        <div className="action-buttons">
                            <button onClick={handleRetake} className="btn-secondary">다시 찍기</button>
                            <button onClick={handleConfirm} className="btn-primary">정보 확인 완료</button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .glass-panel {
                    background: #000000;
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                    min-height: 440px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .camera-container, .preview-container {
                    position: relative;
                    width: 100%;
                    height: 440px;
                    background: #000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .webcam-view, .scanned-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .overlay-guide {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    z-index: 10;
                }
                .guide-box {
                    width: 85%;
                    height: 240px;
                    border: 2px solid rgba(255,255,255,0.9);
                    border-radius: 16px;
                    box-shadow: 0 0 0 9999px rgba(0,0,0,0.6);
                }
                .guide-text {
                    color: white;
                    margin-top: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }
                
                .camera-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 20;
                    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                }
                
                .gallery-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .capture-btn {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    backdrop-filter: blur(4px);
                    border: 2px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                .capture-btn:active { transform: scale(0.92); }
                .inner-circle {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    background: white;
                }
                
                .scanning-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 30;
                }
                .scanner-line {
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(to right, transparent, #1F4EF5, transparent);
                    box-shadow: 0 0 15px #1F4EF5;
                    animation: scan 2s ease-in-out infinite;
                }
                @keyframes scan {
                    0% { transform: translateY(-120px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(120px); opacity: 0; }
                }
                
                .progress-container {
                    width: 60%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    margin-top: 32px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    background: #1F4EF5;
                    transition: width 0.3s ease;
                }
                .scanning-text {
                    color: #fff;
                    margin-top: 12px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .result-form {
                    padding: 24px;
                    background: #fff;
                    flex: 1;
                }
                .result-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1A1E27;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: #B1B8C0;
                    margin-bottom: 8px;
                }
                .input-field {
                    width: 100%;
                    padding: 14px;
                    border: 1px solid #D6DADF;
                    border-radius: 12px;
                    font-size: 16px;
                    background: #D6DADF;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #1F4EF5;
                    background: #fff;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 12px;
                    margin-top: 28px;
                }
                .btn-primary, .btn-secondary {
                    flex: 1;
                    padding: 16px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 15px;
                    border: none;
                    cursor: pointer;
                }
                .btn-primary { background: #1F4EF5; color: white; }
                .btn-secondary { background: #D6DADF; color: #1A1E27; }
                
                @media (prefers-color-scheme: dark) {
                    .result-form { background: #1A1E27; }
                    .result-title { color: #fff; }
                    .input-field { background: #2c2c2e; border-color: #64768C; color: #fff; }
                    .btn-secondary { background: #64768C; color: #fff; }
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
