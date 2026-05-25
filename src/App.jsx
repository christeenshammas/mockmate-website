import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  const validMimeTypes = ["video/mp4", "video/quicktime"];
  const validExtensions = [".mp4", ".mov"];
  const fileName = file.name?.toLowerCase() || "";
  const hasValidType = validMimeTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((extension) => fileName.endsWith(extension));
  if (!hasValidType && !hasValidExtension) {
    return { valid: false, message: "Please upload a valid MP4 or MOV video file." };
  }
  return { valid: true, message: "" };
}

function normalizeEvaluationResponse(data) {
  return {
    score: data?.final_score ? `${data.final_score} / 10` : "N/A",
    summary: data?.hr_recommendation ?? "No summary available.",
    strengths: Array.isArray(data?.top_strengths) && data.top_strengths.length > 0
      ? data.top_strengths
      : ["No strengths data available."],
    improvements: Array.isArray(data?.priority_areas) && data.priority_areas.length > 0
      ? data.priority_areas
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
    const failedTests = tests.filter((test) => !test.passed);
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
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-700 transition-transform group-hover:scale-105"><Icon name={icon} size={28} /></div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </button>
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
      const normalized = normalizeEvaluationResponse(result);
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200"><Icon name="sparkles" size={24} /></div>
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
              <Button type="button" onClick={() => setStep("instructions")} className="rounded-2xl bg-sky-600 px-8 py-6 text-lg font-bold text-white shadow-xl shadow-sky-200 transition-all hover:-translate-y-1 hover:bg-sky-700">Let&apos;s go<Icon name="sparkles" className="ml-2" size={20} /></Button>
            </div>
            <Card className="border-sky-100 bg-white/70 shadow-2xl shadow-sky-100 backdrop-blur"><CardContent className="p-8"><div className="mb-6 rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 p-6 text-white shadow-lg"><Icon name="video" className="mb-12" size={42} /><h2 className="mb-2 text-2xl font-bold">Your interview coach is ready</h2><p className="text-sky-50">Record, upload, evaluate, and improve your confidence.</p></div><div className="grid gap-3">{["Video quality check", "Interview answer review", "Answer improvement feedback", "Next-step practice suggestions"].map((item) => (<div key={item} className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm font-medium text-slate-700"><Icon name="check" className="text-sky-600" size={20} />{item}</div>))}</div></CardContent></Card>
          </motion.div>
        )}

        {step === "instructions" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex-1"><div className="mx-auto mb-9 max-w-3xl text-center"><h2 className="mb-3 text-4xl font-black text-slate-950">Prepare your video</h2><p className="text-lg leading-8 text-slate-600">Follow these quick instructions before recording or uploading your practice video.</p></div><div className="mb-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{prepInstructions.map((item) => (<InstructionCard key={item.title} {...item} />))}</div><div className="flex justify-center"><Button type="button" onClick={() => setStep("practice")} className="rounded-2xl bg-sky-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700">Continue to practice type</Button></div></motion.div>
        )}

        {step === "practice" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex-1"><div className="mx-auto mb-9 max-w-3xl text-center"><h2 className="mb-3 text-4xl font-black text-slate-950">Choose your practice type</h2><p className="text-lg leading-8 text-slate-600">Select the type of interview practice you want, then record or upload your answer.</p></div><div className="mb-8 grid gap-6 md:grid-cols-2"><PracticeTypeCard title="Self-introduction" icon="message" selected={practiceType === "self"} onClick={chooseSelfIntroduction} description="Record a brief one-minute video about your background, skills, goals, and personal pitch." /><PracticeTypeCard title="HR questions" icon="help" selected={practiceType === "hr"} onClick={chooseHrQuestion} description="The website will randomly choose one HR question for you. Answer it in your video as if you are in a real interview." /></div>{practiceType === "self" && (<Card className="mb-8 border-sky-100 bg-white/80 shadow-sm"><CardContent className="p-6"><h3 className="mb-2 text-xl font-bold text-slate-900">Self-introduction task</h3><p className="leading-7 text-slate-600">Record a short one-minute video introducing yourself. Talk about your background, main skills, career goals, and why you are a strong candidate.</p></CardContent></Card>)}{practiceType === "hr" && (<Card className="mb-8 border-sky-100 bg-white/80 shadow-sm"><CardContent className="p-6"><h3 className="mb-3 text-xl font-bold text-slate-900">Your random HR question</h3><div className="rounded-3xl border border-sky-200 bg-sky-50 p-6"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Answer this in your video</p><p className="text-2xl font-bold leading-9 text-slate-950">{selectedQuestion}</p></div><div className="mt-5 flex justify-end"><Button type="button" variant="outline" onClick={() => setSelectedQuestion((currentQuestion) => getRandomHrQuestion(currentQuestion))} className="rounded-2xl border-sky-300 bg-white px-5 py-4 font-semibold text-sky-700 hover:bg-sky-50">Give me another question</Button></div></CardContent></Card>)}<div className="flex justify-center"><Button type="button" disabled={!practiceType} onClick={() => setStep("upload")} className="rounded-2xl bg-sky-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">Continue to upload video</Button></div></motion.div>
        )}

        {step === "upload" && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-full max-w-4xl flex-1 items-center"><Card className="w-full border-sky-100 bg-white/80 shadow-2xl shadow-sky-100 backdrop-blur"><CardContent className="p-8"><div className="mb-7 text-center"><h2 className="mb-3 text-4xl font-black text-slate-950">Upload your practice video</h2><p className="text-slate-600">Your video will be sent to our AI system with the selected practice type and, when relevant, the random HR question.</p></div><div className="mb-6 rounded-3xl border border-sky-200 bg-white p-5"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Selected practice</p><p className="mt-2 text-lg font-bold text-slate-950">{practiceType === "hr" ? "HR Question" : "Self Introduction"}</p>{practiceType === "hr" && (<p className="mt-2 text-slate-600">Question sent with video: {selectedQuestion}</p>)}</div><div className="mb-6 rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/70 p-8 text-center"><input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" onChange={handleFileChange} className="hidden" /><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-sky-700 shadow-sm"><Icon name="upload" size={30} /></div><h3 className="mb-2 text-xl font-bold text-slate-900">Select MP4 or MOV file</h3><p className="mb-5 text-sm text-slate-500">Maximum recommended length: 1 minute and 30 seconds.</p><Button type="button" disabled={isBusy} onClick={() => fileInputRef.current?.click()} variant="outline" className="rounded-2xl border-sky-300 bg-white px-6 py-5 font-semibold text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60">Import file</Button>{videoFile && <p className="mt-4 text-sm font-semibold text-sky-700">Selected: {videoFile.name}</p>}</div>{error && <p className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">{error}</p>}<div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" onClick={() => setStep("practice")} disabled={isBusy} className="rounded-2xl px-6 py-5 text-slate-600">Back</Button><Button type="button" onClick={submitVideo} disabled={!videoFile || isBusy} className="rounded-2xl bg-sky-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">{isBusy && <Icon name="loader" className="mr-2 animate-spin" size={20} />}{isBusy ? "Uploading and submitting..." : "Send file for evaluation"}</Button></div></CardContent></Card></motion.div>
        )}

        {step === "result" && evaluationResult && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-full max-w-5xl flex-1 items-center">
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
                      <div className="grid gap-3">{evaluationResult.improvements?.map((item) => (<div key={item} className="flex items-center gap-3 text-sm text-slate-600"><Icon name="sparkles" className="text-cyan-600" size={18} />{item}</div>))}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button type="button" onClick={() => alert("Connect this button to your chat model.")} className="rounded-2xl bg-cyan-600 px-6 py-6 text-base font-bold text-white shadow-lg shadow-cyan-100 hover:bg-cyan-700">Continue with chat model<Icon name="message" className="ml-2" size={20} /></Button>
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
