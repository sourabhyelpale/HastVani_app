'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CustomHeader from '../../components/CustomHeader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { gestureApi, signApi } from '@/lib/api';

type PracticeMode = 'identify' | 'perform';

interface GestureChallenge {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
}

export default function PracticePage() {
  const router = useRouter();
  const [mode, setMode] = useState<PracticeMode>('identify');
  const [currentChallenge, setCurrentChallenge] = useState<GestureChallenge | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [supportedGestures, setSupportedGestures] = useState<string[]>([]);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [gestureResult, setGestureResult] = useState<{ gesture: string; confidence: number } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load supported gestures
  useEffect(() => {
    const loadGestures = async () => {
      try {
        const response = await gestureApi.getSupportedGestures();
        setSupportedGestures(response.data.gestures || ['Ok', 'ThankYou']);
      } catch {
        setSupportedGestures(['Ok', 'ThankYou']);
      }
      setLoading(false);
    };
    loadGestures();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Generate new challenge
  const generateChallenge = useCallback(() => {
    if (supportedGestures.length === 0) return;

    const randomGesture = supportedGestures[Math.floor(Math.random() * supportedGestures.length)];

    // Generate wrong options
    const wrongOptions = supportedGestures
      .filter(g => g !== randomGesture)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [...wrongOptions, randomGesture].sort(() => Math.random() - 0.5);

    setCurrentChallenge({
      id: Date.now().toString(),
      name: randomGesture,
      description: `Perform the ${randomGesture} gesture`
    });
    setOptions(allOptions);
    setSelected(null);
    setShowResult(false);
    setGestureResult(null);
  }, [supportedGestures]);

  useEffect(() => {
    if (!loading && supportedGestures.length > 0) {
      generateChallenge();
    }
  }, [loading, supportedGestures, generateChallenge]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setRecognizing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const response = await gestureApi.recognize(imageData);
      const result = response.data;

      if (result.success) {
        setGestureResult({
          gesture: result.gesture || 'Unknown',
          confidence: result.confidence || 0
        });

        // Check if correct
        const correct = result.gesture === currentChallenge?.name && result.confidence >= 0.7;
        handleResult(correct, result.gesture);
      } else {
        setGestureResult({ gesture: 'No hand detected', confidence: 0 });
      }
    } catch (error) {
      console.error('Recognition failed:', error);
      setGestureResult({ gesture: 'Error', confidence: 0 });
    } finally {
      setRecognizing(false);
    }
  };

  const startCountdownCapture = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          captureAndRecognize();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleIdentifyAnswer = (answer: string) => {
    if (showResult) return;

    setSelected(answer);
    const correct = answer === currentChallenge?.name;
    handleResult(correct, answer);
  };

  const handleResult = (correct: boolean, answer: string) => {
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + 10 + streak * 2);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      setHearts(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (hearts <= 0) {
      alert('Out of hearts! Your final score: ' + score);
      setHearts(5);
      setScore(0);
      setStreak(0);
      setQuestionNum(1);
    } else if (questionNum >= totalQuestions) {
      alert('Practice complete! Your score: ' + score);
      setScore(0);
      setStreak(0);
      setQuestionNum(1);
    } else {
      setQuestionNum(prev => prev + 1);
    }
    generateChallenge();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 pb-24">
        <CustomHeader title="Practice" />

        {/* Mode Selector */}
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 mt-4 shadow-sm">
          <button
            onClick={() => { setMode('identify'); generateChallenge(); }}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === 'identify'
                ? 'bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Identify Sign
          </button>
          <button
            onClick={() => { setMode('perform'); generateChallenge(); }}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              mode === 'perform'
                ? 'bg-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Perform Gesture
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-orange-500">{streak}</span>
          </div>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xl ${i < hearts ? 'opacity-100' : 'opacity-30'}`}>
                ❤️
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-yellow-500">{score}</span>
          </div>
        </div>

        {/* Main Challenge Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-4">
          {mode === 'identify' ? (
            <>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">
                What does this sign mean?
              </h3>

              {/* Sign Display */}
              <div className="w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {currentChallenge?.imageUrl ? (
                  <img
                    src={currentChallenge.imageUrl}
                    alt={currentChallenge.name}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                ) : (
                  <span className="text-6xl">🤟</span>
                )}
              </div>

              {/* Hint */}
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                Sign: <span className="font-semibold text-indigo-600">{currentChallenge?.name}</span>
              </p>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleIdentifyAnswer(opt)}
                    disabled={showResult}
                    className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      showResult
                        ? opt === currentChallenge?.name
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                          : selected === opt
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400'
                        : selected === opt
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 text-center">
                Perform this gesture
              </h3>
              <p className="text-center text-2xl font-bold text-indigo-600 mb-4">
                {currentChallenge?.name}
              </p>

              {/* Camera View */}
              <div className="relative aspect-[4/3] max-w-md mx-auto bg-gray-900 rounded-2xl overflow-hidden">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-8xl font-bold text-white animate-pulse">{countdown}</span>
                      </div>
                    )}

                    {/* Result Overlay */}
                    {gestureResult && showResult && (
                      <div className={`absolute inset-x-0 bottom-0 p-4 ${
                        isCorrect ? 'bg-green-500/90' : 'bg-yellow-500/90'
                      }`}>
                        <p className="text-white font-bold text-center">
                          {gestureResult.gesture} ({Math.round(gestureResult.confidence * 100)}%)
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <span className="text-6xl mb-4">📷</span>
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center space-x-3 mt-4">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Camera
                  </button>
                ) : !showResult ? (
                  <>
                    <button
                      onClick={startCountdownCapture}
                      disabled={recognizing || countdown !== null}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {recognizing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Recognizing...
                        </>
                      ) : countdown !== null ? (
                        `Get Ready... ${countdown}`
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Capture
                        </>
                      )}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                    >
                      Stop
                    </button>
                  </>
                ) : null}
              </div>
            </>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className={`mt-6 p-4 rounded-xl text-center ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <span className="text-4xl mb-2 block">{isCorrect ? '🎉' : '😕'}</span>
              <p className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Correct! +' + (10 + (streak - 1) * 2) + ' points' : 'Not quite right'}
              </p>
              {!isCorrect && (
                <p className="text-gray-500 text-sm mt-1">
                  The correct answer is: <strong>{currentChallenge?.name}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {questionNum} of {totalQuestions}</span>
            <span>Streak: {streak} 🔥</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
              style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Next Button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {questionNum >= totalQuestions ? 'See Results' : hearts <= 0 ? 'Try Again' : 'Next Question'}
          </button>
        )}

        {/* Supported Gestures Info */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <span className="font-medium">Available gestures:</span>{' '}
            {supportedGestures.join(', ')}
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
