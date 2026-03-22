'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { lessonApi, gestureApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Lesson, ContentBlock, Question } from '@/types';

interface QuestionAnswer {
  questionIndex: number;
  answer: string | number;
  isCorrect?: boolean;
}

type LessonStage = 'content' | 'questions' | 'results';

export default function LessonPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<LessonStage>('content');
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Camera state for gesture recognition
  const [cameraActive, setCameraActive] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [gestureResult, setGestureResult] = useState<{ gesture: string; confidence: number } | null>(null);
  const [autoRecognizing, setAutoRecognizing] = useState(false);
  const [gestureConfirmed, setGestureConfirmed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveMatchRef = useRef(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await lessonApi.getById(lessonId);
        setLesson(response.data.data);

        // Start the lesson
        await lessonApi.start(lessonId);
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();

    return () => {
      // Cleanup camera and interval on unmount
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [lessonId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        setCameraActive(true);
        setGestureConfirmed(false);
        consecutiveMatchRef.current = 0;
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopRecognitionLoop = useCallback(() => {
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    setAutoRecognizing(false);
  }, []);

  const stopCamera = useCallback(() => {
    stopRecognitionLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setGestureResult(null);
    setGestureConfirmed(false);
    consecutiveMatchRef.current = 0;
  }, [stopRecognitionLoop]);

  const captureAndRecognize = useCallback(async (expectedGesture?: string): Promise<boolean | null> => {
    if (!videoRef.current || !canvasRef.current) return null;
    if (videoRef.current.readyState < 2) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      if (expectedGesture) {
        const response = await gestureApi.validateGesture(imageData, expectedGesture);
        const result = response.data;
        setGestureResult({
          gesture: result.detected || 'Unknown',
          confidence: result.confidence || 0
        });
        return result.valid;
      } else {
        const response = await gestureApi.recognize(imageData);
        const result = response.data;
        setGestureResult({
          gesture: result.gesture || 'Unknown',
          confidence: result.confidence || 0
        });
        return result.success && result.confidence >= 0.7;
      }
    } catch (error) {
      console.error('Gesture recognition failed:', error);
      return null;
    }
  }, []);

  // Start automatic recognition loop when camera is active on a gesture question
  const startRecognitionLoop = useCallback((expectedGesture: string) => {
    stopRecognitionLoop();
    setAutoRecognizing(true);
    setGestureConfirmed(false);
    consecutiveMatchRef.current = 0;

    const INTERVAL_MS = 800;
    const REQUIRED_CONSECUTIVE = 2; // need 2 consecutive matches to confirm

    let isProcessing = false;

    recognitionIntervalRef.current = setInterval(async () => {
      if (isProcessing) return;
      isProcessing = true;
      setRecognizing(true);

      try {
        const valid = await captureAndRecognize(expectedGesture);

        if (valid) {
          consecutiveMatchRef.current += 1;
          if (consecutiveMatchRef.current >= REQUIRED_CONSECUTIVE) {
            // Gesture confirmed! Stop loop and auto-submit
            stopRecognitionLoop();
            setGestureConfirmed(true);
            setRecognizing(false);
          }
        } else {
          consecutiveMatchRef.current = 0;
        }
      } catch {
        // ignore errors in loop, keep trying
      } finally {
        isProcessing = false;
        setRecognizing(false);
      }
    }, INTERVAL_MS);
  }, [captureAndRecognize, stopRecognitionLoop]);

  const handleNextContent = () => {
    if (!lesson) return;

    if (currentContentIndex < lesson.content.length - 1) {
      setCurrentContentIndex(prev => prev + 1);
    } else if (lesson.questions.length > 0) {
      setStage('questions');
      setCurrentQuestionIndex(0);
    } else {
      handleComplete();
    }
  };

  const handlePrevContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (answer: string | number) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!lesson || selectedAnswer === null) return;

    const question = lesson.questions[currentQuestionIndex];
    const correct = selectedAnswer === question.correctAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + question.points);
    }

    setAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      answer: selectedAnswer,
      isCorrect: correct
    }]);

    // Submit answer to backend
    try {
      await lessonApi.submitAnswer(lessonId, {
        questionIndex: currentQuestionIndex,
        answer: selectedAnswer
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  // When gesture is confirmed by the auto-recognition loop, submit the answer
  useEffect(() => {
    if (!gestureConfirmed || !lesson) return;

    const question = lesson.questions[currentQuestionIndex];

    setIsCorrect(true);
    setShowFeedback(true);
    setScore(prev => prev + question.points);

    setAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      answer: gestureResult?.gesture || question.gestureName || question.correctAnswer as string,
      isCorrect: true
    }]);

    // Submit to backend
    lessonApi.submitAnswer(lessonId, {
      questionIndex: currentQuestionIndex,
      answer: gestureResult?.gesture || question.correctAnswer as string
    }).catch(err => console.error('Failed to submit answer:', err));

    // Auto-advance after 1.5 seconds
    const timer = setTimeout(() => {
      handleNextQuestion();
      setGestureConfirmed(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [gestureConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  // When camera becomes active on a gesture question, start the recognition loop
  useEffect(() => {
    if (!cameraActive || !lesson || stage !== 'questions') return;

    const question = lesson.questions[currentQuestionIndex];
    if (question?.type !== 'gesture_recognition') return;

    const expectedGesture = question.gestureName || question.correctAnswer as string;
    startRecognitionLoop(expectedGesture);

    return () => stopRecognitionLoop();
  }, [cameraActive, currentQuestionIndex, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNextQuestion = () => {
    if (!lesson) return;

    stopRecognitionLoop();
    setShowFeedback(false);
    setSelectedAnswer(null);
    setGestureResult(null);
    setGestureConfirmed(false);
    consecutiveMatchRef.current = 0;

    if (currentQuestionIndex < lesson.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!lesson || submitting) return;

    setSubmitting(true);
    stopCamera();

    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes

    try {
      const response = await lessonApi.complete(lessonId, {
        timeSpent,
        answers: answers.map(a => ({
          questionIndex: a.questionIndex,
          answer: a.answer
        }))
      });

      setXpEarned(response.data.data?.xpEarned || lesson.xpReward);
      setStage('results');
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      setStage('results');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContentBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {block.content}
            </p>
          </div>
        );
      case 'video':
        return (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <video
              src={block.mediaUrl}
              controls
              className="w-full h-full object-contain"
              poster={block.mediaUrl?.replace('.mp4', '.jpg')}
            >
              Your browser does not support video playback.
            </video>
          </div>
        );
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={block.mediaUrl}
              alt={block.content}
              className="max-w-full h-auto rounded-xl shadow-lg"
            />
            {block.content && (
              <p className="text-center text-gray-500 mt-2 text-sm">{block.content}</p>
            )}
          </div>
        );
      case 'gesture_demo':
        return (
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <span className="text-6xl mb-4 block">🤟</span>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {block.gestureName || 'ISL Gesture'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{block.content}</p>
            {block.mediaUrl && (
              <img
                src={block.mediaUrl}
                alt={block.gestureName}
                className="mx-auto mt-4 max-w-xs rounded-lg"
              />
            )}
          </div>
        );
      case 'practice':
        return (
          <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <span className="text-6xl mb-4 block">👋</span>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Practice Time!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{block.content}</p>
            <p className="text-sm text-gray-500">Try performing the gesture shown above</p>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p>{block.content}</p>
          </div>
        );
    }
  };

  const renderQuestion = (question: Question) => {
    if (question.type === 'gesture_recognition') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {question.question}
            </h3>
            <p className="text-gray-500">
              Show the gesture: <span className="font-semibold text-blue-600 text-2xl">{question.gestureName || question.correctAnswer}</span>
            </p>
          </div>

          {/* Camera View */}
          <div className="relative aspect-video max-w-lg mx-auto bg-gray-900 rounded-xl overflow-hidden">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Live Recognition Overlay */}
                {gestureResult && (
                  <div className={`absolute top-4 left-4 right-4 px-4 py-3 rounded-xl backdrop-blur-sm ${
                    gestureConfirmed ? 'bg-green-500/90' : 'bg-black/60'
                  } text-white font-medium text-center transition-all`}>
                    <div className="flex items-center justify-center gap-2">
                      {recognizing && !gestureConfirmed && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      )}
                      {gestureConfirmed && <span className="text-xl">&#10003;</span>}
                      <span className="text-lg">
                        {gestureResult.gesture} - {Math.round(gestureResult.confidence * 100)}%
                      </span>
                    </div>
                    {gestureConfirmed && (
                      <p className="text-sm mt-1 text-green-100">Correct! Moving to next...</p>
                    )}
                  </div>
                )}

                {/* Scanning indicator */}
                {autoRecognizing && !gestureConfirmed && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-center gap-2 text-white text-sm bg-black/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>Scanning your gesture...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <span className="text-6xl mb-4">📷</span>
                <p className="text-gray-400">Press the button below to start</p>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex justify-center space-x-4">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Camera
              </button>
            ) : !gestureConfirmed ? (
              <button
                onClick={stopCamera}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Stop Camera
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    // Multiple choice question
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => !showFeedback && handleAnswerSelect(index)}
              disabled={showFeedback}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                showFeedback
                  ? index === question.correctAnswer
                    ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                    : selectedAnswer === index
                    ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                  : selectedAnswer === index
                  ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium ${
                  showFeedback
                    ? index === question.correctAnswer
                      ? 'bg-green-500 text-white'
                      : selectedAnswer === index
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600'
                    : selectedAnswer === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-gray-800 dark:text-white">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {!showFeedback && (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
          >
            Check Answer
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading lesson...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!lesson) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <span className="text-6xl">📚</span>
            <p className="text-gray-500 mt-4">Lesson not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Results screen
  if (stage === 'results') {
    const totalQuestions = lesson.questions.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
            </div>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {percentage >= 80 ? 'Excellent!' : percentage >= 50 ? 'Good Job!' : 'Keep Practicing!'}
            </h1>

            <p className="text-gray-500 mb-6">You completed the lesson!</p>

            {/* Score Circle */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${percentage * 3.52} 352`}
                  className={percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-500">{correctAnswers}/{totalQuestions}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-2xl font-bold text-yellow-500">+{xpEarned || lesson.xpReward}</p>
                <p className="text-sm text-gray-500">XP Earned</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Continue
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${stage === 'content'
                      ? ((currentContentIndex + 1) / (lesson.content.length || 1)) * (lesson.questions.length > 0 ? 50 : 100)
                      : 50 + ((currentQuestionIndex + 1) / (lesson.questions.length || 1)) * 50
                    }%`
                  }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-yellow-500 text-xl">⭐</span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">{score}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-4 pb-32">
          {stage === 'content' && lesson.content.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="mb-4 text-sm text-gray-500">
                {currentContentIndex + 1} / {lesson.content.length}
              </div>
              {renderContentBlock(lesson.content[currentContentIndex])}
            </div>
          )}

          {stage === 'questions' && lesson.questions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="mb-4 text-sm text-gray-500 text-center">
                Question {currentQuestionIndex + 1} of {lesson.questions.length}
              </div>

              {renderQuestion(lesson.questions[currentQuestionIndex])}

              {/* Feedback */}
              {showFeedback && (
                <div className={`mt-6 p-4 rounded-xl ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center mb-2">
                    {isCorrect ? (
                      <>
                        <span className="text-2xl mr-2">✅</span>
                        <span className="font-semibold text-green-700 dark:text-green-300">Correct!</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mr-2">❌</span>
                        <span className="font-semibold text-red-700 dark:text-red-300">Not quite right</span>
                      </>
                    )}
                  </div>
                  {lesson.questions[currentQuestionIndex].explanation && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {lesson.questions[currentQuestionIndex].explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty content/questions */}
          {stage === 'content' && lesson.content.length === 0 && lesson.questions.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">This lesson has only questions. Let&apos;s begin!</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex justify-between">
            {stage === 'content' && (
              <>
                <button
                  onClick={handlePrevContent}
                  disabled={currentContentIndex === 0}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 font-medium disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextContent}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  {currentContentIndex < lesson.content.length - 1
                    ? 'Next'
                    : lesson.questions.length > 0
                    ? 'Start Quiz'
                    : 'Complete'}
                </button>
              </>
            )}

            {stage === 'questions' && showFeedback && (
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                {currentQuestionIndex < lesson.questions.length - 1 ? 'Next Question' : 'See Results'}
              </button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
