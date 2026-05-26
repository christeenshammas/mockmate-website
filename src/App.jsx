import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const N8N_WEBHOOK_URL = "https://aicoachju.site/proxy";

const hrQuestions = [
  "Tell me about yourself.",
  "What is your biggest weakness, and what are you doing to improve it?",
  "What is your greatest strength, and how did you use it in a real situation?",
  "Why should we hire you?",
  "Why do you want this position?",
  "Why do you want to work with our company?",
  "Where do you see yourself in five years?",
  "Tell me about a challenge you faced and how you solved it.",
  "Tell me about a time you made a mistake and what you learned from it.",
  "Can you work well within a team? Give an example.",
  "Tell me about a time you had a conflict with a teammate and how you handled it.",
  "How do you handle pressure or tight deadlines?",
  "Describe a time when you had to learn something quickly.",
  "Tell me about a time you showed leadership.",
  "How do you organize your tasks when you have multiple priorities?",
  "Describe a time when you received negative feedback. How did you respond?",
  "What motivates you to do your best work?",
  "How do you handle failure?",
  "Tell me about a time you solved a difficult problem.",
  "Describe a situation where you had to communicate with a difficult person.",
  "What would you do if you disagreed with your manager?",
  "How do you adapt to change? Give an example.",
  "Tell me about a time you helped someone else succeed.",
  "What makes you different from other candidates?",
  "Describe your ideal work environment.",
  "How do you deal with repetitive or boring tasks?",
  "Tell me about a time you took responsibility for something important.",
  "What are your career goals, and how does this role fit them?",
  "Describe a time when you had to make a decision without having all the information.",
  "If you were given a task you did not know how to do, what would you do first?",
];

const prepInstructions = [
  { icon: "camera", title: "Distance", text: "Sit around 20 to 30 cm from the camera so your face and upper body are clear." },
  { icon: "clock", title: "Duration", text: "Keep your video short. Maximum duration is 1 minute and 30 seconds." },
  { icon: "lightbulb", title: "Lighting", text: "Use good front lighting. Avoid strong backlight or sitting in a dark room." },
  { icon: "mic", title: "Audio", text: "Make sure your voice is clear and the background is quiet." },
  { icon: "shirt", title: "Appearance", text: "Dress professionally, sit confidently, and look into the camera." },
  { icon: "fileVideo", title: "File Format", text: "Upload or record a video in MP4 or MOV format." },
];

const interviewTips = [
  {
    label: "Did you know?",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "clock",
    tips: [
      "Recruiters form their first impression in just 7 seconds — before you've answered a single question.",
      "55% of communication is body language, 38% is tone of voice, and only 7% is the actual words you say.",
      "Interviewers often decide within the first minute whether they're excited about a candidate — the rest is just confirmation.",
    ],
  },
  {
    label: "Quick tip",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "check",
    tips: [
      "A firm, 2–3 second handshake has been shown to measurably increase your odds of getting hired. There's literally a study on it.",
      "Maintain eye contact for about 60–70% of the conversation — enough to feel engaged, not enough to feel intense.",
      "Sit with your back straight and shoulders open. It signals confidence before you've said a word.",
    ],
  },
  {
    label: "Brain fact",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "sparkles",
    tips: [
      "A real smile — one that reaches your eyes — triggers mirror neurons in the interviewer's brain, creating instant connection.",
      "Your brain releases oxytocin (the trust chemical) when someone holds genuine eye contact with you.",
      "Nodding once while the interviewer speaks signals you're listening. Double nods rush them. Triple nods confuse them.",
    ],
  },
  {
    label: "Psychology trick",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "message",
    tips: [
      "Subtly mirroring the interviewer's posture and gestures makes them feel unconsciously drawn to you.",
      "People tend to favor candidates who reflect their energy back — calm with calm, animated with animated.",
      "When you nod slightly while answering, you pull the interviewer emotionally into what you're saying.",
    ],
  },
  {
    label: "Body language",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "video",
    tips: [
      "Your legs reveal what your mind is thinking — if they point at the exit, the interviewer notices. Face them squarely.",
      "Crossed arms signal resistance or disinterest — even if you're just cold. Keep them open or resting on the table.",
      "Touching your face while answering can read as deception to a recruiter, even if you're just nervous.",
    ],
  },
  {
    label: "Hire secret",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "mic",
    tips: [
      "Skills can be taught. Personality can't. Most recruiters today are choosing who you are over what you know.",
      "Traits like reliability and curiosity are weighted more heavily than GPA or years of experience in many industries.",
      "Being genuinely interested in the role matters more than having a perfect answer — enthusiasm is contagious.",
    ],
  },
];

const allTips = interviewTips.flatMap((cat) =>
  cat.tips.map((tip) => ({ label: cat.label, color: cat.color, bg: cat.bg, icon: cat.icon, tip }))
);

function getRandomHrQuestion(previousQuestion = "") {
  if (hrQuestions.length === 0) return "Tell me about yourself.";
  if (hrQuestions.length === 1) return hrQuestions[0];
  let nextQuestion = hrQuestions[Math.floor(Math.random() * hrQuestions.length)];
  while (nextQuestion === previousQuestion) {
    nextQuestion = hrQuestions[Math.floor(Math.random() * hrQuestions.length)];
  }
  return nextQuestion;
}

function validateVideoFile(file) {
  if (!file) return { valid: false, message: "Please select a video file." };
  const validMimeTypes = ["video/mp4", "video/quicktime", "video/webm"];
  const validExtensions = [".mp4", ".mov", ".webm"];
  const fileName = file.name?.toLowerCase() || "";
  const hasValidType = validMimeTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
  if (!hasValidType && !hasValidExtension) {
    return { valid: false, message: "Please upload a valid MP4 or MOV video file." };
  }
  return { valid: true, message: "" };
}

function normalizeEvaluationResponse(data) {
  const raw = Array.isArray(data) ? data[0]?.output : data?.output;
  const cleaned = raw?.replace(/```json\n?|\n?```/g, "").trim();
  const parsed = cleaned ? JSON.parse(cleaned) : data;
  return {
    score: parsed?.final_score ? `${parsed.final_score} / 10` : "N/A",
    summary: parsed?.hr_recommendation ?? "No summary available.",
    strengths: Array.isArray(parsed?.top_strengths) && parsed.top_strengths.length > 0
      ? parsed.top_strengths
      : ["No strengths data available."],
    improvements: Array.isArray(parsed?.priority_areas) && parsed.priority_areas.length > 0
      ? parsed.priority_areas
      : ["No improvement data available."],
  };
}

function runComponentSelfTests() {
  try {
    const tests = [
      { name: "accepts MP4 by MIME type", passed: validateVideoFile({ name: "answer.any", type: "video/mp4" }).valid === true },
      { name: "accepts MOV by extension when MIME type is missing", passed: validateVideoFile({ name: "answer.MOV", type: "" }).valid === true },
      { name: "rejects unsupported video formats", passed: validateVideoFile({ name: "answer.avi", type: "video/avi" }).valid === false },
      { name: "normalizes empty n8n evaluation response", passed: normalizeEvaluationResponse({}).score === "N/A" },
      { name: "has 30 HR questions", passed: hrQuestions.length === 30 },
      { name: "random HR question returns a real question", passed: hrQuestions.includes(getRandomHrQuestion()) },
    ];
    const failedTests = tests.filter((t) => !t.passed);
    if (failedTests.length > 0) console.warn("MockMate component self-tests failed:", failedTests);
  } catch (err) {
    console.warn("Self-test error:", err.message);
  }
}

if (typeof window !== "undefined") runComponentSelfTests();

function Icon({ name, size = 22, className = "" }) {
  const sharedProps = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, "aria-hidden": "true" };
  const icons = {
    camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" /><circle cx="12" cy="13" r="4" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    loader: <><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93 7.76 7.76" /><path d="M16.24 16.24 19.07 19.07" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07 7.76 16.24" /><path d="M16.24 7.76 19.07 4.93" /></>,
    message: <path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.5-5A8 8 0 1 1 21 12Z" />,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 20h16" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
    lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8 14a6 6 0 1 1 8 0c-.8.7-1 1.4-1 2H9c0-.6-.2-1.3-1-2Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shirt: <path d="M8 4 4 6l2 5 2-1v10h8V10l2 1 2-5-4-2a4 4 0 0 1-8 0Z" />,
    fileVideo: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="m10 13 4-2.5v5L10 13Z" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.8 2.8 0 0 1 5 1.7c0 2-2.5 2.3-2.5 4" /><path d="M12 18h.01" /></>,
    interview: <><circle cx="5" cy="4.5" r="1.6" /><line x1="5" y1="6.1" x2="5" y2="11" /><line x1="2.5" y1="8.5" x2="7.5" y2="8.5" /><line x1="3" y1="11" x2="3" y2="14" /><line x1="7" y1="11" x2="7" y2="14" /><circle cx="19" cy="4.5" r="1.6" /><line x1="19" y1="6.1" x2="19" y2="11" /><line x1="16.5" y1="8.5" x2="21.5" y2="8.5" /><line x1="17" y1="11" x2="17" y2="14" /><line x1="21" y1="11" x2="21" y2="14" /><line x1="1" y1="11" x2="23" y2="11" /><rect x="9" y="1" width="9" height="6" rx="1.2" /><line x1="10.5" y1="3" x2="16.5" y2="3" /><line x1="10.5" y1="5" x2="15" y2="5" /><path d="M9 7 L7.5 9.5 L10 9.5" /></>,
    sparkles: <><path d="M12 3 10.5 8.5 5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" /></>,
  };
  return <svg {...sharedProps}>{icons[name] || icons.sparkles}</svg>;
}

function StepPill({ number, label, active }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${active ? "bg-sky-600 text-white shadow-md shadow-sky-200" : "border border-sky-100 bg-white/70 text-slate-500"}`}>
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? "bg-white/20" : "bg-sky-50 text-sky-600"}`}>{number}</span>
      {label}
    </div>
  );
}

function InstructionCard({ icon, title, text }) {
  return (
    <Card className="border-sky-100 bg-white/80 shadow-sm backdrop-blur">
      <CardContent className="p-5">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Icon name={icon} size={22} /></div>
        <h3 className="mb-1 text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}

function PracticeTypeCard({ title, description, icon, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`group w-full rounded-3xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${selected ? "border-sky-500 bg-sky-50 shadow-lg shadow-sky-100" : "border-sky-100 bg-white/80 shadow-sm"}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition-transform group-hover:scale-105"><Icon name={icon} size={28} /></div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </button>
  );
}

function TipsLoader() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % allTips.length);
        setVisible(true);
      }, 400);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const t = allTips[idx];

  return (
    <div className="mx-auto mt-5 w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div
        className="w-full rounded-3xl p-7 shadow-md"
        style={{ borderLeft: `4px solid ${t.color}`, background: t.bg }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70" style={{ color: t.color }}>
            <Icon name={t.icon} size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.color }}>{t.label}</span>
        </div>
        <p className="text-[15px] font-medium leading-7 text-slate-800">{t.tip}</p>
        <div className="mt-5 flex gap-1.5">
          {allTips.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: i === idx ? "20px" : "6px", background: i === idx ? t.color : "#CBD5E1" }} />
          ))}
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [step, setStep] = useState("welcome");
  const [practiceType, setPracticeType] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [recordMode, setRecordMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoPreviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const activeStep = useMemo(() => {
    if (step === "welcome") return 1;
    if (step === "instructions" || step === "practice") return 2;
    if (step === "upload") return 3;
    return 4;
  }, [step]);

  const isBusy = isProcessing || isEvaluating;

  const chooseSelfIntroduction = () => {
    setPracticeType("self");
    setSelectedQuestion("");
  };

  const chooseHrQuestion = () => {
    setPracticeType("hr");
    setSelectedQuestion((currentQuestion) => getRandomHrQuestion(currentQuestion));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.message);
      setVideoFile(null);
      return;
    }
    setError(null);
    setVideoFile(file);
  };

  const openRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setRecordMode(true);
      setVideoFile(null);
      setError(null);
      setTimeout(() => { if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream; }, 100);
    } catch (err) {
      setError("Camera access denied. Please allow camera and microphone permissions and try again.");
    }
  };

  const startRecording = () => {
    chunksRef.current = [];
    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : {});
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], "recorded-interview.webm", { type: "video/webm" });
      setVideoFile(file);
      closeRecorder();
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const closeRecorder = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
    setRecordMode(false);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const submitVideo = async () => {
    if (!videoFile || !practiceType) {
      setError("Please select a practice type and upload a video first.");
      return;
    }
    if (practiceType === "hr" && !selectedQuestion) {
      setError("Please generate an HR question before uploading your video.");
      return;
    }
    if (videoFile.size > 50 * 1024 * 1024) {
      setError("Video file is too large. Please upload a video under 50MB or trim it shorter.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    setIsEvaluating(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("practiceType", practiceType);
      formData.append("practiceTypeLabel", practiceType === "hr" ? "HR Question" : "Self Introduction");
      formData.append("question", practiceType === "hr" ? selectedQuestion : "Self-introduction");
      formData.append("hrQuestion", practiceType === "hr" ? selectedQuestion : "");
      const response = await fetch(N8N_WEBHOOK_URL, { method: "POST", body: formData });
      const result = await response.json();
      console.log("RAW RESULT:", JSON.stringify(result));
      const normalized = normalizeEvaluationResponse(result);
      console.log("NORMALIZED:", JSON.stringify(normalized));
      setEvaluationResult(normalized);
      setStep("result");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit video. Please try again.");
    } finally {
      setIsProcessing(false);
      setIsEvaluating(false);
    }
  };

  const resetForMorePractice = () => {
    closeRecorder();
    setVideoFile(null);
    setEvaluationResult(null);
    setError(null);
    setPracticeType("hr");
    setSelectedQuestion((currentQuestion) => getRandomHrQuestion(currentQuestion));
    setStep("practice");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100 text-slate-900">
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-200/50 blur-3xl" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200">
  <svg viewBox="0 0 40 44" width="24" height="28" fill="currentColor" aria-hidden="true">
    <path d="M6 0h22a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H16l-4 6-2-6H6a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"/>
    <path d="M26 3h6a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-1l-2 3-1-3h-2a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" opacity="0.55"/>
    <circle cx="17" cy="30" r="6"/>
    <path d="M7 37c-4 1-5 4-5 6h30c0-2-1-5-5-6l-4 2H11z"/>
  </svg>
</div>
            <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">MockMate</p><p className="text-sm text-slate-500">Multi-Agent AI Interview Practice</p></div>
          </div>
          <div className="flex flex-wrap gap-3"><StepPill number="1" label="Start" active={activeStep === 1} /><StepPill number="2" label="Prepare" active={activeStep === 2} /><StepPill number="3" label="Upload" active={activeStep === 3} /><StepPill number="4" label="Result" active={activeStep === 4} /></div>
        </header>

        {step === "welcome" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm">AI-powered interview answer evaluation and feedback</div>
              <h1 className="mb-5 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">Welcome to MockMate</h1>
              <p className="mb-4 text-3xl font-bold text-sky-700 sm:text-4xl">Would you like to start?</p>
              <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">Practice personal interviews with a multi-agent AI system that reviews your video, evaluates your answer, and gives useful feedback to improve your next attempt.</p>
              <Button type="button" onClick={() => setStep("instructions")} className="rounded-2xl bg-sky-600 px-8 py-6 text-lg font-bold text-white shadow-xl shadow-sky-200 transition-all hover:-translate-y-1 hover:bg-sky-700">Let&apos;s go</Button>
            </div>
            <Card className="border-sky-100 bg-white/70 shadow-2xl shadow-sky-100 backdrop-blur"><CardContent className="p-8"><div className="mb-6 rounded-3xl bg-sky-600 p-6 text-white shadow-lg shadow-sky-200"><Icon name="video" className="mb-12" size={42} /><h2 className="mb-2 text-2xl font-bold">Your interview coach is ready</h2><p className="text-sky-50">Record, upload, evaluate, and improve your confidence.</p></div><div className="grid gap-3">{["Video quality check", "Interview answer review", "Answer improvement feedback", "Next-step practice suggestions"].map((item) => (<div key={item} className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm font-medium text-slate-700"><Icon name="check" className="text-sky-600" size={20} />{item}</div>))}</div></CardContent></Card>
          </motion.div>
        )}

        {step === "instructions" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex-1"><div className="mx-auto mb-9 max-w-3xl text-center"><h2 className="mb-3 text-4xl font-black text-slate-950">Prepare your video</h2><p className="text-lg leading-8 text-slate-600">Follow these quick instructions before recording or uploading your practice video.</p></div><div className="mb-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{prepInstructions.map((item) => (<InstructionCard key={item.title} {...item} />))}</div><div className="flex justify-center"><Button type="button" onClick={() => setStep("practice")} className="rounded-2xl bg-sky-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700">Continue to practice type</Button></div></motion.div>
        )}

        {step === "practice" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex-1"><div className="mx-auto mb-9 max-w-3xl text-center"><h2 className="mb-3 text-4xl font-black text-slate-950">Choose your practice type</h2><p className="text-lg leading-8 text-slate-600">Select the type of interview practice you want, then record or upload your answer.</p></div><div className="mb-8 grid gap-6 md:grid-cols-2"><PracticeTypeCard title="Self-introduction" icon="message" selected={practiceType === "self"} onClick={chooseSelfIntroduction} description="Record a brief one-minute video about your background, skills, goals, and personal pitch." /><PracticeTypeCard title="HR questions" icon="help" selected={practiceType === "hr"} onClick={chooseHrQuestion} description="The website will randomly choose one HR question for you. Answer it in your video as if you are in a real interview." /></div>{practiceType === "self" && (<Card className="mb-8 border-sky-100 bg-white/80 shadow-sm"><CardContent className="p-6"><h3 className="mb-2 text-xl font-bold text-slate-900">Self-introduction task</h3><p className="leading-7 text-slate-600">Record a short one-minute video introducing yourself. Talk about your background, main skills, career goals, and why you are a strong candidate.</p></CardContent></Card>)}{practiceType === "hr" && (<Card className="mb-8 border-sky-100 bg-white/80 shadow-sm"><CardContent className="p-6"><h3 className="mb-3 text-xl font-bold text-slate-900">Your random HR question</h3><div className="rounded-3xl border border-sky-200 bg-sky-50 p-6"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Answer this in your video</p><p className="text-2xl font-bold leading-9 text-slate-950">{selectedQuestion}</p></div><div className="mt-5 flex justify-end"><Button type="button" variant="outline" onClick={() => setSelectedQuestion((currentQuestion) => getRandomHrQuestion(currentQuestion))} className="rounded-2xl border-sky-300 bg-white px-5 py-4 font-semibold text-sky-700 hover:bg-sky-50">Give me another question</Button></div></CardContent></Card>)}<div className="flex justify-center"><Button type="button" disabled={!practiceType} onClick={() => setStep("upload")} className="rounded-2xl bg-sky-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">Continue to upload video</Button></div></motion.div>
        )}

        {step === "upload" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
            <Card className="w-full border-sky-100 bg-white/80 shadow-2xl shadow-sky-100 backdrop-blur">
              <CardContent className="p-8">
                {isBusy ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
                      <Icon name="loader" className="animate-spin" size={32} />
                    </div>
                    <h2 className="mb-2 text-2xl font-black text-slate-950">Analysing your video</h2>
                    <p className="text-sm text-slate-400">This may take a moment — sit tight</p>
                    <p className="mt-8 text-sm font-semibold text-slate-500">Good to know while you wait:</p>
                    <span className="mt-1 text-slate-400">•</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-7 text-center">
                      <h2 className="mb-3 text-4xl font-black text-slate-950">Upload your practice video</h2>
                      <p className="text-slate-600">Your video will be sent to our AI system with the selected practice type and, when relevant, the random HR question.</p>
                    </div>
                    <div className="mb-6 rounded-3xl border border-sky-200 bg-white p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Selected practice</p>
                      <p className="mt-2 text-lg font-bold text-slate-950">{practiceType === "hr" ? "HR Question" : "Self Introduction"}</p>
                      {practiceType === "hr" && (<p className="mt-2 text-slate-600">Question sent with video: {selectedQuestion}</p>)}
                    </div>
                    <div className="mb-6 rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/70 p-6 text-center">
                      <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" onChange={handleFileChange} className="hidden" />
                      {recordMode ? (
                        <div className="flex flex-col items-center gap-4">
                          <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full max-w-md rounded-2xl bg-black" style={{ maxHeight: "260px" }} />
                          <div className="flex items-center gap-3">
                            {isRecording ? (
                              <>
                                <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm font-semibold text-slate-700">{formatTime(recordingTime)}</span>
                                <Button type="button" onClick={stopRecording} className="rounded-2xl bg-red-500 px-6 py-4 font-semibold text-white hover:bg-red-600">Stop recording</Button>
                              </>
                            ) : (
                              <Button type="button" onClick={startRecording} className="rounded-2xl bg-sky-600 px-6 py-4 font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700">Start recording</Button>
                            )}
                            <Button type="button" variant="outline" onClick={closeRecorder} className="rounded-2xl border-slate-300 px-5 py-4 text-slate-600 hover:bg-slate-50">Cancel</Button>
                          </div>
                          <p className="text-xs text-slate-400">Max 1 min 30 sec — click stop when done</p>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-sky-700 shadow-sm"><Icon name="upload" size={30} /></div>
                          <h3 className="mb-2 text-xl font-bold text-slate-900">Select or record a video</h3>
                          <p className="mb-5 text-sm text-slate-500">Maximum recommended length: 1 minute and 30 seconds.</p>
                          <div className="flex flex-wrap justify-center gap-3">
                            <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-2xl border-sky-300 bg-white px-6 py-5 font-semibold text-sky-700 hover:bg-sky-50"><Icon name="upload" className="mr-2" size={18} />Import file</Button>
                            <Button type="button" onClick={openRecorder} className="rounded-2xl bg-sky-600 px-6 py-5 font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700"><Icon name="camera" className="mr-2" size={18} />Record a video</Button>
                          </div>
                          {videoFile && <p className="mt-4 text-sm font-semibold text-sky-700">Selected: {videoFile.name}</p>}
                        </>
                      )}
                    </div>
                    {error && <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">{error}</p>}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <Button type="button" variant="ghost" onClick={() => setStep("practice")} className="rounded-2xl px-6 py-5 text-slate-600">Back</Button>
                      <Button type="button" onClick={submitVideo} disabled={!videoFile} className="rounded-2xl bg-sky-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">Send file for evaluation</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {isBusy && <TipsLoader />}
          </motion.div>
        )}

        {step === "result" && evaluationResult && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-full max-w-6xl flex-1 items-center">
            <Card className="w-full border-sky-100 bg-white/85 shadow-2xl shadow-sky-100 backdrop-blur">
              <CardContent className="p-8">
                <div>
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700"><Icon name="check" size={34} /></div>
                    <h2 className="mb-2 text-4xl font-black text-slate-950">Your evaluation is ready</h2>
                    <p className="text-lg font-bold text-sky-700">Score: {evaluationResult.score}</p>
                  </div>
                  <div className="mb-7 rounded-3xl bg-sky-50 p-6">
                    <h3 className="mb-2 text-xl font-bold text-slate-900">Evaluation result</h3>
                    <p className="leading-8 text-slate-600">{evaluationResult.summary}</p>
                  </div>
                  <div className="mb-8 grid gap-5 md:grid-cols-2">
                    <div className="rounded-3xl border border-sky-100 bg-white p-6">
                      <h3 className="mb-4 text-lg font-bold text-slate-900">Strengths</h3>
                      <div className="grid gap-3">{evaluationResult.strengths?.map((item) => (<div key={item} className="flex items-center gap-3 text-sm text-slate-600"><Icon name="check" className="text-sky-600" size={18} />{item}</div>))}</div>
                    </div>
                    <div className="rounded-3xl border border-sky-100 bg-white p-6">
                      <h3 className="mb-4 text-lg font-bold text-slate-900">Improvements</h3>
                      <div className="grid gap-3">{evaluationResult.improvements?.map((item) => (<div key={item} className="flex items-center gap-3 text-sm text-slate-600"><Icon name="sparkles" className="text-sky-600" size={18} />{item}</div>))}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button type="button" onClick={() => alert("Connect this button to your chat model.")} className="rounded-2xl bg-sky-600 px-6 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700">Continue with chat model<Icon name="message" className="ml-2" size={20} /></Button>
                    <Button type="button" onClick={resetForMorePractice} variant="outline" className="rounded-2xl border-sky-300 bg-white px-6 py-6 text-base font-bold text-sky-700 hover:bg-sky-50">Practice more HR questions<Icon name="help" className="ml-2" size={20} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </section>
    </main>
  );
}
