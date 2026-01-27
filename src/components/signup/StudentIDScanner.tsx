'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, RefreshCw, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

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
        <div className="space-y-6 py-4">
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Camera className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">학생증 인증</h2>
                <p className="mt-2 text-muted-foreground">
                    학생증을 촬영하여 학교 정보를 인증해 주세요.
                </p>
            </div>

            <Card className="overflow-hidden border-border/40 shadow-sm">
                {!imgSrc ? (
                    <div className="relative flex h-[440px] w-full flex-col items-center justify-center bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="h-full w-full object-cover"
                            forceScreenshotSourceSize={true}
                        />

                        {/* Overlay Guide */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                            <div className="h-[240px] w-[85%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
                            <p className="mt-8 text-sm font-medium text-white drop-shadow-md">
                                사각형 안에 학생증을 정렬해주세요
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-8">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full border-white/30 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:text-white"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="h-6 w-6" />
                            </Button>

                            <button
                                onClick={capture}
                                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/30 backdrop-blur-sm transition-transform active:scale-95"
                            >
                                <div className="h-16 w-16 rounded-full bg-white"></div>
                            </button>

                            <div className="w-12"></div> {/* Spacer */}
                        </div>
                    </div>
                ) : (
                    <div className="relative h-[440px] w-full bg-black">
                        <NextImage src={imgSrc} alt="Scanned ID" fill className="object-cover" />

                        {isScanning && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 p-6 text-center">
                                <div className="h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-white">인공지능 분석 중... {progress}%</p>
                                <p className="mt-1 text-xs text-white/60">글자를 읽어오고 있습니다</p>
                            </div>
                        )}
                    </div>
                )}

                {scannedData && !isScanning && (
                    <CardContent className="space-y-6 pt-6 bg-background">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">인식 결과 확인</h3>
                            <span className="text-xs font-medium text-primary">잘못된 정보는 수정 가능합니다</span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="school">학교명</Label>
                                <Input
                                    id="school"
                                    value={scannedData.schoolName}
                                    onChange={(e) => setScannedData({ ...scannedData, schoolName: e.target.value })}
                                    placeholder="인식되지 않음 (직접 입력)"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">성명</Label>
                                <Input
                                    id="name"
                                    value={scannedData.studentName}
                                    onChange={(e) => setScannedData({ ...scannedData, studentName: e.target.value })}
                                    placeholder="인식되지 않음 (직접 입력)"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={handleRetake}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                다시 찍기
                            </Button>
                            <Button className="flex-1" onClick={handleConfirm}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                확인 완료
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
