import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DOCTORS } from "@/lib/mockData";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Video, Star, Calendar } from "lucide-react";

/**
 * Larger, clearer Doctor cards and layout tweaks for ConditionDetail
 * Replace your existing client/src/pages/ConditionDetail.tsx with this file.
 */

const glow = "ring-1 ring-primary/25 hover:ring-primary/60 transition-all";

function LargeSection({
  title,
  accent = "emerald",
  children,
}: {
  title: string;
  accent?: "emerald" | "teal" | "primary";
  children: React.ReactNode;
}) {
  const accentColor =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "teal"
      ? "text-teal-700"
      : "text-primary";
  return (
    <Card className={`p-6 rounded-2xl border border-border ${glow}`}>
      <div className="text-center mb-3">
        <h3 className={`text-lg font-semibold ${accentColor}`}>{title}</h3>
        <div className="mx-auto w-16 h-1 mt-2 rounded-full bg-muted/40" />
      </div>
      <CardContent className="p-0 text-sm">{children}</CardContent>
    </Card>
  );
}

export default function ConditionDetail() {
  const [, setLocation] = useLocation();
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    // Load last analysis saved by symptom checker
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cg_last_analysis") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setAnalysis(parsed);
        return;
      }
    } catch (e) {
      // ignore parse issues
    }

    // fallback demo
    setAnalysis({
      conditions: [
        {
          name: "Viral upper respiratory infection",
          probability: 75,
          description:
            "A common viral infection causing fever, cough, sore throat and body ache. Mostly self-limiting; supportive care is often enough.",
          severity: "moderate",
          detailedInfo: {
            howThisHappens: [
              "Exposure to respiratory viruses via droplets from coughs/sneezes.",
              "Close contact in crowded or poorly ventilated areas.",
              "Touching the face with contaminated hands.",
              "Lowered immunity after stress or recent illness.",
              "Seasonal peaks increase spread in some regions.",
            ],
            prevention: [
              "Wash hands frequently for 20 seconds with soap.",
              "Wear a mask if symptomatic in indoor public spaces.",
              "Keep distance from vulnerable people until recovered.",
              "Stay home if you have symptoms to reduce spread.",
              "Ventilate rooms by opening windows when possible.",
            ],
            bigDetails: [
              "Typical course: 3–7 days; symptoms usually improve with rest and fluids.",
              "Red flags: severe breathlessness, confusion, persistent high fever — seek emergency care.",
              "Diagnostics: usually clinical; tests if severe or for certain pathogens.",
              "At-risk groups: elderly, infants, people with chronic illnesses.",
            ],
            medicines: [
              { name: "Paracetamol", note: "For fever/pain (use only as advised by a doctor)." },
              { name: "Throat lozenges", note: "Symptomatic relief for sore throat." },
              { name: "Saline nasal drops", note: "Helps congestion in some people." },
            ],
            homeRemedies: [
              "Haldi (turmeric) milk — comforting if tolerated.",
              "Warm soups & broths to keep hydrated and nourished.",
              "Steam inhalation for congestion (careful with hot steam).",
              "Gargle with warm salt water for sore throat relief.",
            ],
            commonApproaches: [
              "Symptomatic management: rest, fluids, antipyretics if needed.",
              "Monitor symptoms and seek care for red flags.",
              "Medical review for high-risk people or if not improving.",
            ],
          },
        },
      ],
      recommendedSpecialist: "General Physician",
      doctors: MOCK_DOCTORS.slice(0, 3),
    });
  }, []);

  const primary = useMemo(() => {
    if (!analysis) return null;
    return (analysis.conditions && analysis.conditions[0]) || null;
  }, [analysis]);

  if (!analysis || !primary) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-28 text-center">
          <p className="text-muted-foreground">Loading details…</p>
        </main>
        <Footer />
      </div>
    );
  }

  const info = primary.detailedInfo || {};
  const doctors = (analysis.doctors && analysis.doctors.length ? analysis.doctors : MOCK_DOCTORS.slice(0, 3)) as any[];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" className="pl-0" onClick={() => setLocation("/symptom-checker")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Symptom Entry
          </Button>

          {/* Centered disease heading in soft green */}
          <section className="p-6 rounded-2xl border border-border bg-card/50 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-emerald-600 leading-tight">{primary.name}</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">{primary.description}</p>

            <div className="flex items-center gap-3 mt-4 justify-center">
              <Badge variant={primary.severity === "high" ? "destructive" : "secondary"} className="uppercase">
                {primary.severity} severity
              </Badge>
              <div className="text-sm text-muted-foreground">
                Match: <span className="font-medium text-foreground">{primary.probability}%</span>
              </div>
            </div>
          </section>

          {/* Two-column large blocks */}
          <div className="grid md:grid-cols-2 gap-6">
            <LargeSection title="How this happens" accent="teal">
              <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                {(info.howThisHappens && info.howThisHappens.slice(0, 5)) ||
                  [
                    "Respiratory viruses passed from person to person via droplets.",
                    "Being close in crowded spaces.",
                    "Touching face after contacting contaminated surfaces.",
                    "Lowered immunity increases susceptibility.",
                  ].map((s: string, i: number) => (
                    <li key={i} className="leading-relaxed">
                      {s}
                    </li>
                  ))}
              </ul>
            </LargeSection>

            <LargeSection title="Prevention & Daily Tips" accent="emerald">
              <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                {(info.prevention && info.prevention.slice(0, 5)) ||
                  [
                    "Wash hands regularly and avoid touching face.",
                    "Wear a mask in crowded indoor spaces if symptomatic.",
                    "Avoid contact with vulnerable people while ill.",
                    "Stay home until recovery to avoid spreading illness.",
                    "Ventilate indoor spaces when possible.",
                  ].map((s: string, i: number) => (
                    <li key={i} className="leading-relaxed">
                      {s}
                    </li>
                  ))}
              </ul>
            </LargeSection>
          </div>

          {/* Big detailed block */}
          <LargeSection title="Detailed points (what to expect & red flags)" accent="primary">
            <div className="space-y-3">
              {(info.bigDetails && info.bigDetails.length ? info.bigDetails : []).map((d: string, i: number) => (
                <div key={i} className="p-3 bg-muted/10 rounded-md">
                  <p className="text-base font-medium">{d}</p>
                </div>
              ))}
              {(!info.bigDetails || info.bigDetails.length === 0) && (
                <div className="p-3 bg-muted/10 rounded-md">
                  <p className="text-base font-medium">
                    Most cases are mild and resolve within a few days. Seek care for severe breathing difficulty, persistent high fever, confusion, or fainting.
                  </p>
                </div>
              )}
            </div>
          </LargeSection>

          {/* Prescription toggle + disclaimer */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowPrescription((s) => !s)}>{showPrescription ? "Hide Prescription" : "Show Prescription"}</Button>
              <div className="text-sm text-muted-foreground max-w-xl">
                <strong>Disclaimer:</strong> This is awareness-only information. Do not self-prescribe. Consult a doctor before taking any medicine.
              </div>
            </div>

            <div className="text-xs text-muted-foreground italic">Medicine Info can be accessed from the header for purchase details.</div>
          </div>

          {/* Medicines + Home Remedies (toggle visible) */}
          {showPrescription && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <LargeSection title="Medicines (general examples) — Awareness only">
                  <div className="mt-2 grid sm:grid-cols-2 gap-3">
                    {(info.medicines && info.medicines.length ? info.medicines.slice(0, 4) : [
                      { name: "Paracetamol", note: "Fever/pain — consult doctor" },
                      { name: "Throat lozenges", note: "Sore throat relief" },
                      { name: "Saline nasal drops", note: "Congestion relief" },
                    ]).map((m: any, i: number) => (
                      <Card key={i} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-foreground">{m.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{m.note || "Use under medical supervision"}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">Common</div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    <strong>Note:</strong> Please consult the below doctor before taking the medicines and can purchase these medicines from <strong>Medicine Info</strong> in the header.
                  </p>
                </LargeSection>

                <LargeSection title="Home Remedies (simple, common)">
                  <ul className="list-disc pl-5 space-y-2 mt-2 text-sm">
                    {(info.homeRemedies && info.homeRemedies.slice(0, 6)) ||
                      [
                        "Haldi (turmeric) milk — comforting if you tolerate dairy.",
                        "Warm soups & broths to stay hydrated.",
                        "Steam inhalation for congestion (careful with heat).",
                        "Salt-water gargles for sore throat relief.",
                      ].map((s: string, i: number) => (
                        <li key={i} className="leading-relaxed">
                          {s}
                        </li>
                      ))}
                  </ul>
                </LargeSection>
              </div>

              {/* Quick actions / contact */}
              <div className="space-y-4">
                <Card className={`p-4 ${glow}`}>
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    <Button className="w-full" onClick={() => setLocation("/symptom-checker")}>Re-run Symptom Check</Button>
                    <Button variant="outline" className="w-full" onClick={() => alert("Saved report (demo).")}>Save Report</Button>
                    <Button variant="ghost" className="w-full" onClick={() => alert("Share link copied (demo).")}>Share</Button>
                  </CardContent>
                </Card>

                <Card className={`p-4 ${glow}`}>
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-base font-semibold">Contact / Triage</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-2 text-sm">
                    <div className="text-muted-foreground">If severe, go to emergency. For non-urgent help, book a GP.</div>
                    <Button className="w-full" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>See Doctors Below</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Assessment Summary */}
          <LargeSection title="Assessment Summary">
            <div className="text-sm prose-sm">
              <p className="mb-3">
                <strong>Summary:</strong> {primary.name} — {primary.probability}% match. {primary.description}
              </p>
              <p className="text-muted-foreground">
                This is an awareness-level analysis. If symptoms worsen or red flags appear, get medical attention promptly.
              </p>
            </div>
          </LargeSection>

          {/* Recommended doctors — BIG CARDS */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-center">Recommended Doctors</h2>

            <div className="grid md:grid-cols-1 gap-6">
              {doctors.map((d: any) => (
                <motion.div
                  key={d.id || d.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-all">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* Big image */}
                      <div className="w-full md:w-48 shrink-0 rounded-lg overflow-hidden bg-muted/10">
                        <img
                          src={d.image || "/avatar-placeholder.png"}
                          alt={d.name}
                          className="w-full h-48 md:h-48 object-cover"
                        />
                      </div>

                      {/* Main details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-foreground">{d.name}</div>
                            <div className="text-xs text-primary font-medium mt-1">{d.specialty}</div>
                            <div className="text-sm text-muted-foreground mt-2 max-w-2xl">{d.brief || d.description || "Experienced practitioner. Provides both in-clinic and teleconsult services."}</div>
                          </div>

                          {/* Rating + fees */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-white/90 text-black backdrop-blur-sm">
                                <Star className="w-4 h-4 text-yellow-400" /> {d.rating ?? "4.8"}
                              </Badge>
                            </div>
                            <div className="text-sm font-semibold">₹{d.fees ?? "400"}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {d.availability || "Available Today"}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button className="min-w-[140px]" onClick={() => alert(`Booked appointment with ${d.name} (demo)`)}>Book Appointment</Button>
                            <Button variant="outline" size="icon" title="Video consult (demo)" onClick={() => alert(`Started video consult with ${d.name} (demo)` )}>
                              <Video className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex gap-2 items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" /> <span>{d.location || "Nearby clinic"}</span>
                          </div>
                        </div>

                        {/* Extra small details row */}
                        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                          <div>Exp: {d.experience ?? "8 yrs"}</div>
                          <div>Languages: {d.languages?.join(", ") ?? "English, Hindi"}</div>
                          <div>Consult: {d.consultType ?? "In-person & Teleconsult"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Optional footer */}
                    <CardFooter className="mt-3 p-0">
                      <div className="text-xs text-muted-foreground">Ratings based on patient feedback (demo data).</div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
