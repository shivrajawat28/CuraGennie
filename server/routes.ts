import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ------ Schemas ------

const symptomAnalysisSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  duration: z.string().optional(),
  vitals: z
    .object({
      temperature: z.string().nullable().optional(),
      pulse: z.string().nullable().optional(),
      spo2: z.string().nullable().optional(),
      bp: z.string().nullable().optional(),
    })
    .optional(),
});

const medicineSearchSchema = z.object({
  query: z.string().min(1, "Medicine name is required"),
});

const medicineImageSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
});

// ------ Google AI client (optional) ------

const genAI =
  process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim().length > 0
    ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    : null;

/**
 * Helper: build a rich condition object
 */
function makeCondition(
  name: string,
  probability: number,
  description: string,
  severity: "low" | "moderate" | "high",
  extra?: Partial<{
    prevention: string[];
    selfCare: string[];
    whenToSeeDoctor: string[];
    commonApproaches: string[];
    exercises: string[];
    dietTips: string[];
    howOthersCanHelp: string[];
  }>
) {
  return {
    name,
    probability,
    description,
    severity,
    detailedInfo: {
      prevention: extra?.prevention ?? [],
      selfCare: extra?.selfCare ?? [],
      whenToSeeDoctor: extra?.whenToSeeDoctor ?? [],
      commonApproaches: extra?.commonApproaches ?? [],
      exercises: extra?.exercises ?? [],
      dietTips: extra?.dietTips ?? [],
      howOthersCanHelp: extra?.howOthersCanHelp ?? [],
    },
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // =========================
  //   /api/analyze-symptoms
  // =========================
  app.post("/api/analyze-symptoms", async (req, res) => {
    try {
      const parsed = symptomAnalysisSchema.parse(req.body);
      const { symptoms, age, gender, duration, vitals } = parsed;

      // ---------- 1) Try Gemini / available Google model if API key available ----------
      if (genAI) {
        try {
          // Safe model discovery (non-fatal)
          let chosenModelId = "gemini-1.5-flash";
          try {
            const maybeListFn = (genAI as any)?.listModels;
            const modelsResp =
              typeof maybeListFn === "function"
                ? await (genAI as any).listModels()
                : null;
            if (modelsResp && Array.isArray(modelsResp.models)) {
              const modelsArr: any[] = modelsResp.models;
              const findPrefer = (preds: string[]) =>
                modelsArr.find((m) =>
                  preds.some((p) =>
                    ((m.name || m.modelId || "") as string)
                      .toString()
                      .toLowerCase()
                      .includes(p)
                  )
                );
              const gem = findPrefer(["gemini"]);
              const bison = findPrefer(["bison", "text-bison"]);
              const simple = findPrefer(["text", "gpt"]);
              if (gem) chosenModelId = (gem.name || gem.modelId) as string;
              else if (bison)
                chosenModelId = (bison.name || bison.modelId) as string;
              else if (simple)
                chosenModelId = (simple.name || simple.modelId) as string;
              else if (modelsArr.length > 0)
                chosenModelId = (modelsArr[0].name ||
                  modelsArr[0].modelId) as string;
              console.log(
                "Selected Google model id for generation:",
                chosenModelId
              );
            } else {
              console.warn(
                "No model list available from SDK (will try default model id)."
              );
            }
          } catch (chooseErr) {
            console.warn(
              "Model discovery error (non-fatal), will try default model id:",
              chooseErr
            );
          }

          const extraContextParts: string[] = [];
          if (age) extraContextParts.push(`Age: ${age}`);
          if (gender) extraContextParts.push(`Gender: ${gender}`);
          if (duration) extraContextParts.push(`Duration: ${duration}`);
          if (vitals)
            extraContextParts.push(`Vitals: ${JSON.stringify(vitals)}`);
          const extraContext =
            extraContextParts.length > 0
              ? `\nPatient context: ${extraContextParts.join(", ")}`
              : "";

          const prompt = `You are a medical information assistant for a symptom checker app called "Cura Gennie".

User symptoms: ${symptoms.join(", ")}${extraContext}

IMPORTANT SAFETY RULES:
- This is for awareness only, NOT a diagnosis.
- Do NOT provide medicine names, dosages, or treatment plans.
- Always recommend consulting a qualified doctor.
- Be conservative and safe in all assessments.

Return ONLY valid JSON in this exact shape (no extra text):

{
  "conditions": [
    {
      "name": "Condition name",
      "probability": 0-100,
      "description": "Brief, layman-friendly explanation",
      "severity": "low" | "moderate" | "high"
    }
  ],
  "guidance": ["..."],
  "lifestyleTips": ["..."],
  "recommendedSpecialist": "..."
}`;

          try {
            const model = (genAI as any).getGenerativeModel
              ? (genAI as any).getGenerativeModel({ model: chosenModelId })
              : null;

            if (!model || typeof model.generateContent !== "function") {
              throw new Error(
                "Generative model not available on this SDK instance"
              );
            }

            const result = await model.generateContent(prompt);
            const text =
              (result as any)?.response?.text?.() ||
              (result as any)?.response?.output?.[0]?.content?.[0]?.text?.() ||
              "";

            const analysis = JSON.parse(text || "{}");

            if (!analysis || !Array.isArray(analysis.conditions)) {
              throw new Error(
                "Invalid AI response: missing or invalid 'conditions' array"
              );
            }

            const spec: string =
              analysis.recommendedSpecialist || "General Physician";
            let doctors: any[] = [];
            try {
              doctors =
                (await storage.getDoctorsBySpecialty(spec)) ??
                (await storage.getAllDoctors());
            } catch {
              doctors = [];
            }
            const nearbyDoctors = Array.isArray(doctors)
              ? doctors.slice(0, 3)
              : [];

            const payload = {
              ...analysis,
              recommendedSpecialist: spec,
              input: {
                symptoms,
                age: age ?? null,
                gender: gender ?? "",
                duration: duration ?? "",
                vitals: vitals ?? null,
              },
              doctors: nearbyDoctors,
              nearbyDoctors,
            };

            return res.json(payload);
          } catch (aiErr) {
            console.error(
              "AI generation attempt failed, falling back to rule-based logic:",
              aiErr
            );
            // fallthrough to fallback logic
          }
        } catch (outerErr) {
          console.error(
            "Gemini attempt outer error, falling back to rule-based logic:",
            outerErr
          );
          // fallthrough to fallback logic
        }
      }

      // ---------- 2) Fallback RULE-BASED LOGIC (multiple rich clusters) ----------
      const lower = symptoms.map((s) => s.toLowerCase());
      const hasAny = (keys: string[]) =>
        lower.some((s) => keys.some((k) => s.includes(k)));

      // Candidate conditions container
      const candidates: Array<ReturnType<typeof makeCondition>> = [];

      // 1) Respiratory cluster
      if (
        hasAny([
          "fever",
          "cough",
          "cold",
          "sore throat",
          "congestion",
          "runny nose",
        ])
      ) {
        candidates.push(
          makeCondition(
            "Viral upper respiratory infection",
            75,
            "A common viral infection affecting nose/throat/airways — causes fever, cough, sore throat and body ache. Often improves with rest and fluids.",
            "moderate",
            {
              prevention: [
                "Wash hands frequently and avoid close contact when sick",
                "Cover mouth while coughing or sneezing",
              ],
              selfCare: [
                "Rest, hydrate well; use salt-water gargles for sore throat",
                "Use any medicine only as per doctor’s advice (avoid self-prescribing antibiotics)",
              ],
              whenToSeeDoctor: [
                "High or persistent fever",
                "Shortness of breath, chest pain, or symptoms lasting more than a week",
              ],
              commonApproaches: [
                "Symptomatic treatment, monitoring; clinician may order tests if needed",
              ],
              exercises: [
                "Avoid heavy exercise; light walking only if you feel stable",
              ],
              dietTips: [
                "Light, warm fluids (soups, herbal tea) and bland food if appetite is low",
              ],
              howOthersCanHelp: [
                "Provide fluids, help with basic tasks, and keep the patient away from vulnerable people (elderly, small kids)",
              ],
            }
          )
        );
      }

      // 2) GI cluster (stomach / loose motions)
      if (
        hasAny([
          "loose motion",
          "loose motions",
          "diarrhea",
          "vomit",
          "vomiting",
          "stomach pain",
          "abdominal pain",
        ])
      ) {
        candidates.push(
          makeCondition(
            "Acute gastroenteritis / food-related infection",
            70,
            "Symptoms suggest irritation or infection of the gut, often due to contaminated food or water. This can cause diarrhea, vomiting and stomach cramps.",
            "moderate",
            {
              prevention: [
                "Drink clean, safe water",
                "Avoid unhygienic street food or undercooked food",
              ],
              selfCare: [
                "Take small, frequent sips of water or ORS",
                "Rest and avoid heavy meals until you feel better",
              ],
              whenToSeeDoctor: [
                "Blood in stool or vomit",
                "Very less urine, extreme weakness, confusion, or very high fever",
              ],
              commonApproaches: [
                "Fluid replacement and symptomatic care; clinician may suggest tests or specific medicines",
              ],
              exercises: ["Rest until symptoms ease and strength improves"],
              dietTips: [
                "Start with light foods like khichdi, toast, banana",
                "Avoid milk, oily, spicy or very heavy food initially",
              ],
              howOthersCanHelp: [
                "Provide ORS/water, keep toilet and surroundings clean",
                "Help monitor urine output and general condition",
              ],
            }
          )
        );
      }

      // 3) Headache / migraine cluster
      if (
        hasAny(["headache", "migraine", "sensitivity to light", "throbbing"])
      ) {
        candidates.push(
          makeCondition(
            "Tension-type headache / migraine (likely)",
            65,
            "Headache can be due to tension, migraine, posture, screen-time or lifestyle factors. Serious causes are less common but must be ruled out if symptoms are unusual.",
            "moderate",
            {
              prevention: [
                "Maintain regular sleep and meal timings",
                "Limit screen-time and ensure good posture",
              ],
              selfCare: [
                "Rest in a dark, quiet room during strong headaches",
                "Hydrate and avoid strong smells or loud noise",
              ],
              whenToSeeDoctor: [
                "Sudden severe ‘worst headache of life’",
                "Weakness, confusion, trouble speaking, or change in vision",
              ],
              commonApproaches: [
                "Lifestyle changes, trigger identification; clinician may suggest medicines or tests if needed",
              ],
              exercises: [
                "Neck and shoulder stretching and relaxation techniques",
              ],
              dietTips: [
                "Avoid known trigger foods if you have identified any",
                "Eat small, regular balanced meals",
              ],
              howOthersCanHelp: [
                "Reduce noise/light around the person",
                "Help track frequency and patterns of headache",
              ],
            }
          )
        );
      }

      // 4) Chest pain / breathlessness — high risk
      if (
        hasAny(["chest pain", "pressure in chest", "tightness in chest"]) ||
        hasAny(["shortness of breath", "breathless"])
      ) {
        const spo2Val = vitals?.spo2 ? parseInt(String(vitals.spo2)) : null;
        const chestSeverity: "low" | "moderate" | "high" =
          spo2Val !== null && spo2Val < 94 ? "high" : "high";

        candidates.push(
          makeCondition(
            "Potential cardiac or respiratory emergency",
            chestSeverity === "high" ? 90 : 80,
            "Chest pain or significant breathlessness can sometimes indicate a serious heart or lung problem. This should never be ignored.",
            chestSeverity,
            {
              prevention: [
                "Avoid smoking and manage risk factors like diabetes, BP, cholesterol",
                "Do not push yourself in heavy exercise if you get chest discomfort",
              ],
              selfCare: [
                "If you have severe chest pain or breathlessness, seek emergency care instead of waiting at home",
              ],
              whenToSeeDoctor: [
                "Severe chest pain, pain spreading to arm, jaw or back",
                "Sweating, nausea, fainting, or very low oxygen readings",
              ],
              commonApproaches: [
                "Immediate clinical assessment; ECG, oxygen and emergency protocols if necessary",
              ],
              exercises: ["No exercise until cleared by a doctor"],
              dietTips: [
                "In emergency, focus on reaching hospital; diet advice comes later from your doctor",
              ],
              howOthersCanHelp: [
                "Call emergency services, keep the person calm and seated",
                "Share any known medical history and medicines with doctors",
              ],
            }
          )
        );
      }

      // 5) Musculoskeletal (back / joint pain)
      if (
        hasAny(["back pain", "joint pain", "knee pain", "shoulder pain", "neck pain"])
      ) {
        candidates.push(
          makeCondition(
            "Musculoskeletal pain / strain",
            60,
            "Pain likely related to muscles, joints or posture. Often mechanical or from overuse; severe or persistent pain needs medical opinion.",
            "low",
            {
              prevention: [
                "Use proper posture while sitting, studying, or working",
                "Avoid sudden heavy lifting without support",
              ],
              selfCare: [
                "Short-term rest and gentle stretching as tolerated",
                "Use hot or cold packs as comfortable (avoid strong medicines without advice)",
              ],
              whenToSeeDoctor: [
                "Severe pain, weakness, numbness, or difficulty in walking",
                "Back pain with fever, weight loss, or loss of bladder/bowel control",
              ],
              commonApproaches: [
                "Physiotherapy, pain management and posture correction under guidance",
              ],
              exercises: [
                "Core strengthening and stretching exercises taught by physiotherapist",
              ],
              dietTips: [
                "Balanced diet with adequate protein and calcium",
                "Avoid heavy alcohol and smoking which slow recovery",
              ],
              howOthersCanHelp: [
                "Help with physical tasks, encourage breaks and correct posture",
              ],
            }
          )
        );
      }

      // 6) Skin / allergy cluster
      if (
        hasAny([
          "rash",
          "rashes",
          "itching",
          "itchy",
          "red spots",
          "pimples",
          "acne",
          "hives",
          "allergy",
          "eczema",
          "skin peeling",
        ])
      ) {
        candidates.push(
          makeCondition(
            "Skin rash / allergic reaction (likely)",
            65,
            "Your symptoms suggest a skin irritation or allergic reaction. Many are mild but some can be more serious, especially with swelling or breathing issues.",
            "moderate",
            {
              prevention: [
                "Avoid known triggers like certain soaps, cosmetics, or foods",
                "Use mild, fragrance-free skin products",
              ],
              selfCare: [
                "Keep the area clean and dry; avoid scratching",
                "Do not apply random creams or steroids without medical advice",
              ],
              whenToSeeDoctor: [
                "Rash with fever or feeling very unwell",
                "Swelling of lips/tongue or difficulty in breathing (medical emergency)",
              ],
              commonApproaches: [
                "Allergen avoidance and soothing creams; doctor may prescribe specific medicines if needed",
              ],
              exercises: ["No specific restriction unless advised otherwise"],
              dietTips: [
                "Stay hydrated, avoid foods that repeatedly worsen your rash",
              ],
              howOthersCanHelp: [
                "Help the person avoid scratching and keep them comfortable",
              ],
            }
          )
        );
      }

      // 7) Urinary / UTI-like cluster
      if (
        hasAny([
          "burning urine",
          "burning while urinating",
          "burning while peeing",
          "burning in urine",
          "pain while urinating",
          "pee again and again",
          "frequent urination",
          "urine pain",
          "uti",
        ])
      ) {
        candidates.push(
          makeCondition(
            "Urinary tract infection or irritation (possible)",
            70,
            "Burning or pain during urination and frequent urge to pass urine can be due to a urinary tract infection or irritation.",
            "moderate",
            {
              prevention: [
                "Drink enough water regularly",
                "Maintain good personal hygiene around private areas",
              ],
              selfCare: [
                "Do not hold urine for very long",
                "Avoid self-medicating with antibiotics; take only if doctor prescribes",
              ],
              whenToSeeDoctor: [
                "Fever with urinary symptoms",
                "Flank/back pain, nausea, or blood in urine",
              ],
              commonApproaches: [
                "Urine test, doctor-prescribed antibiotics if infection confirmed",
              ],
              exercises: ["No specific restriction; rest if feeling weak"],
              dietTips: [
                "Drink plenty of water unless doctor has restricted fluids",
              ],
              howOthersCanHelp: [
                "Encourage medical check-up rather than home remedies only",
              ],
            }
          )
        );
      }

      // 8) Genital / sexually transmitted infection–like cluster
      if (
        hasAny([
          "penis",
          "vagina",
          "vaginal",
          "private part",
          "private parts",
          "genital",
          "genitals",
          "discharge",
          "penile discharge",
          "vaginal discharge",
          "itching in private",
          "itchy private",
          "std",
          "sti",
          "sexually transmitted",
        ])
      ) {
        candidates.push(
          makeCondition(
            "Possible genital or sexually transmitted infection (needs confidential evaluation)",
            70,
            "Your symptoms may relate to a genital infection or sexually transmitted infection. Only a doctor and proper tests can confirm the exact cause.",
            "moderate",
            {
              prevention: [
                "Practice safer sex, including condom use",
                "Avoid multiple or unprotected partners",
              ],
              selfCare: [
                "Do not use harsh soaps or irritant products on private parts",
                "Avoid self-medicating with random antibiotics",
              ],
              whenToSeeDoctor: [
                "Any discharge, ulcers, severe pain, or swelling in genital area",
                "If you suspect exposure to an STI/STD",
              ],
              commonApproaches: [
                "Confidential consultation, examination and lab tests; treatment depends on exact diagnosis",
              ],
              exercises: ["No direct restriction but avoid discomfort-causing activities"],
              dietTips: [
                "General healthy diet; no specific dietary cure for infections",
              ],
              howOthersCanHelp: [
                "Support without judgement, and encourage medical evaluation",
              ],
            }
          )
        );
      }

      // 9) Mental health / stress / anxiety cluster
      if (
        hasAny([
          "anxiety",
          "panic",
          "panic attack",
          "overthinking",
          "can’t sleep",
          "cant sleep",
          "insomnia",
          "stress",
          "stressed",
          "depressed",
          "low mood",
          "sad",
          "hopeless",
        ])
      ) {
        candidates.push(
          makeCondition(
            "Stress / anxiety-related symptoms (possible)",
            65,
            "Some of your symptoms suggest stress, anxiety or mood-related issues. These are common and treatable but still important to address.",
            "moderate",
            {
              prevention: [
                "Maintain routine with sleep, meals and some physical activity",
                "Reduce constant screen/social media overload where possible",
              ],
              selfCare: [
                "Talk to someone you trust about how you feel",
                "Practice relaxation (deep breathing, walks, journaling)",
              ],
              whenToSeeDoctor: [
                "Persistent sadness, loss of interest, or panic attacks",
                "Any thoughts of self-harm or feeling like life is not worth living (this needs urgent professional help)",
              ],
              commonApproaches: [
                "Counselling/therapy and, when needed, medical treatment from a psychiatrist",
              ],
              exercises: [
                "Regular light exercise like walking or yoga can help mood (as tolerated)",
              ],
              dietTips: [
                "Regular meals; limit excessive caffeine and junk food",
              ],
              howOthersCanHelp: [
                "Listen without judging, encourage professional help, and stay connected regularly",
              ],
            }
          )
        );
      }

      // If no candidates added (rare), add general non-specific
      if (candidates.length === 0) {
        candidates.push(
          makeCondition(
            "Non-specific mild illness",
            60,
            "Symptoms may be due to a mild, self-limiting condition. Monitor symptoms and consult a doctor if they worsen.",
            "low",
            {
              prevention: ["Good hygiene, proper rest"],
              selfCare: ["Hydration, rest, and symptom monitoring"],
              whenToSeeDoctor: [
                "Worsening or prolonged symptoms, very high fever, or any alarming new symptom",
              ],
              commonApproaches: ["Symptomatic care under medical guidance"],
              exercises: ["Rest until feeling better"],
              dietTips: ["Light, hydrating foods and regular water intake"],
              howOthersCanHelp: [
                "Help with daily tasks and keep a watch on symptom changes",
              ],
            }
          )
        );
      }

      // Deduplicate by name and limit to top 3 by priority (probability)
      const uniqueByName: Record<string, ReturnType<typeof makeCondition>> = {};
      for (const c of candidates) {
        if (!uniqueByName[c.name]) uniqueByName[c.name] = c;
        else {
          // pick higher probability if duplicate
          if ((c.probability || 0) > (uniqueByName[c.name].probability || 0)) {
            uniqueByName[c.name] = c;
          }
        }
      }

      let finalConditions = Object.values(uniqueByName)
        .sort((a, b) => (b.probability || 0) - (a.probability || 0))
        .slice(0, 3);

      // Add a lower-priority "Other possible causes" if not present
      if (!finalConditions.some((f) => f.name === "Other possible causes")) {
        finalConditions.push(
          makeCondition(
            "Other possible causes",
            35,
            "There may be other infections, allergies or non-serious causes producing similar symptoms. A physical exam and tests can confirm.",
            "moderate",
            {
              prevention: ["General hygiene", "Avoid known triggers where possible"],
              selfCare: [
                "Observe and monitor symptoms; do not ignore if they keep getting worse",
              ],
              whenToSeeDoctor: [
                "Persisting, worsening, or very unusual symptoms",
              ],
              commonApproaches: [
                "Doctor’s evaluation and targeted testing if needed",
              ],
              exercises: ["Rest or light activity based on how you feel"],
              dietTips: ["Regular hydration and simple balanced meals"],
              howOthersCanHelp: [
                "Help track symptoms and support doctor visits if needed",
              ],
            }
          )
        );
      }

      // Build guidance and lifestyle tips (aggregate)
      const guidance: string[] = [
        "This analysis is only for awareness and does NOT replace a doctor's check-up.",
        "If your symptoms suddenly worsen, you feel very unwell, or you are worried, seek medical help immediately.",
      ];

      if (hasAny(["fever", "cough", "cold", "sore throat"])) {
        guidance.push(
          "Monitor your temperature regularly and track how you feel over time."
        );
        guidance.push(
          "Avoid self-medication with antibiotics without a doctor's advice."
        );
      }
      if (
        hasAny(["loose motion", "diarrhea", "vomit", "vomiting"])
      ) {
        guidance.push(
          "Watch for signs of dehydration and seek help if you cannot keep fluids down."
        );
      }
      if (hasAny(["chest pain", "shortness of breath", "breathless"])) {
        guidance.push(
          "Do NOT ignore chest pain or severe breathlessness. These can be signs of a heart or lung emergency."
        );
      }
      if (
        hasAny([
          "anxiety",
          "panic",
          "panic attack",
          "overthinking",
          "depressed",
          "low mood",
          "sad",
          "hopeless",
        ])
      ) {
        guidance.push(
          "Mental health symptoms are real and important; talking to a professional can help."
        );
      }

      const lifestyleTips: string[] = [];
      if (hasAny(["fever", "cough", "cold", "sore throat"])) {
        lifestyleTips.push(
          "Drink warm fluids, stay well hydrated, and take adequate rest."
        );
        lifestyleTips.push(
          "Avoid close contact with vulnerable people (elderly, very young, or those with chronic illnesses)."
        );
      }
      if (hasAny(["back pain", "joint pain", "neck pain", "knee pain"])) {
        lifestyleTips.push(
          "Take regular breaks from sitting and maintain good posture."
        );
      }
      if (
        hasAny([
          "anxiety",
          "panic",
          "stress",
          "depressed",
          "low mood",
          "insomnia",
        ])
      ) {
        lifestyleTips.push(
          "Try to maintain a routine with fixed sleep and wake times."
        );
        lifestyleTips.push(
          "Regular light exercise like walking or stretching can support mental well-being."
        );
      }
      if (lifestyleTips.length === 0) {
        lifestyleTips.push(
          "Maintain a regular sleep schedule and stay hydrated. Eat light, balanced meals."
        );
      }

      // Decide recommended specialist based on top condition
      const topConditionName =
        finalConditions[0]?.name || "General health concern";
      let recommendedSpecialist = "General Physician";

      const n = topConditionName.toLowerCase();
      if (n.includes("respiratory") || n.includes("upper respiratory")) {
        recommendedSpecialist = "General Physician / Pulmonologist";
      } else if (n.includes("gastro") || n.includes("gut")) {
        recommendedSpecialist = "Gastroenterologist";
      } else if (n.includes("headache") || n.includes("migraine")) {
        recommendedSpecialist = "Neurologist / General Physician";
      } else if (
        n.includes("cardiac") ||
        n.includes("chest") ||
        n.includes("emergency")
      ) {
        recommendedSpecialist = "Cardiologist / Emergency";
      } else if (
        n.includes("musculoskeletal") ||
        n.includes("strain") ||
        n.includes("joint")
      ) {
        recommendedSpecialist = "Orthopedic / Physiotherapist";
      } else if (n.includes("skin") || n.includes("allergic") || n.includes("rash")) {
        recommendedSpecialist = "Dermatologist / Allergist";
      } else if (
        n.includes("urinary") ||
        n.includes("uti") ||
        n.includes("genital") ||
        n.includes("sexually transmitted")
      ) {
        recommendedSpecialist = "General Physician / Urologist / Gynecologist";
      } else if (
        n.includes("stress") ||
        n.includes("anxiety") ||
        n.includes("mental")
      ) {
        recommendedSpecialist = "Psychiatrist / Psychologist";
      }

      // doctors lookup (best-effort)
      let doctors: any[] = [];
      try {
        doctors =
          (await storage.getDoctorsBySpecialty(recommendedSpecialist)) ??
          (await storage.getAllDoctors());
      } catch {
        doctors = [];
      }
      const nearbyDoctors = Array.isArray(doctors) ? doctors.slice(0, 3) : [];

      const payload = {
        conditions: finalConditions,
        guidance,
        lifestyleTips,
        recommendedSpecialist,
        input: {
          symptoms,
          age: age ?? null,
          gender: gender ?? "",
          duration: duration ?? "",
          vitals: vitals ?? null,
        },
        doctors: nearbyDoctors,
        nearbyDoctors,
      };

      return res.json(payload);
    } catch (error: any) {
      console.error("Symptom analysis error:", error);
      res.status(500).json({
        error: "Failed to analyze symptoms",
        message: error?.message ?? String(error),
      });
    }
  });

  // =========================
  //   /api/medicine-info  (MOCK)
  // =========================
  app.post("/api/medicine-info", async (req, res) => {
    try {
      const { query } = medicineSearchSchema.parse(req.body);

      const lower = query.toLowerCase();

      let category = "General medicine";
      if (lower.includes("paracetamol"))
        category = "Analgesic / Antipyretic";
      if (lower.includes("ibuprofen")) category = "NSAID / Pain relief";

      const response = {
        name: query,
        generic_name:
          lower.includes("paracetamol") || lower.includes("pcm")
            ? "Paracetamol"
            : query,
        uses: [
          "Symptomatic relief based on doctor's advice.",
          "Exact use depends on the prescription and patient condition.",
        ],
        warnings: [
          "Do not take any medicine regularly without medical supervision.",
          "People with liver, kidney, or chronic illness should be extra careful.",
        ],
        sideEffects: [
          "Mild side effects can occur with almost any medicine.",
          "Serious side effects should be discussed with a doctor immediately.",
        ],
        category,
        general_precautions: [
          "Always inform your doctor about all other medicines you are taking.",
          "Avoid self-medicating for long periods without review.",
        ],
        important_warnings: [
          "This information is for awareness only. It is NOT a prescription.",
          "Never start, stop, or change dose of any medicine without consulting a doctor.",
        ],
        equivalent_medicines: [],
        disclaimer:
          "This app does not provide dosage or timing. Always follow your doctor and the medicine label.",
        pharmacy_links: [
          {
            label: "View on example pharmacy",
            url: `https://example-pharmacy.com/search?query=${encodeURIComponent(
              query
            )}`,
          },
        ],
      };

      res.json(response);
    } catch (error: any) {
      console.error("Medicine info error:", error);
      res.status(500).json({
        error: "Failed to fetch medicine information",
        message: error.message,
      });
    }
  });

  // =========================
  //   /api/medicine-info-image (MOCK)
  // =========================
  app.post("/api/medicine-info-image", async (req, res) => {
    try {
      const { imageBase64 } = medicineImageSchema.parse(req.body);
      if (!imageBase64) {
        throw new Error("No image data provided");
      }

      const response = {
        name: "Identified medicine (approximate)",
        generic_name: "Unknown / depends on actual strip",
        uses: [
          "This is a generic awareness-only placeholder.",
          "Real identification should be done by a pharmacist or doctor.",
        ],
        warnings: [
          "Do not rely on app or image-based identification to start medicines.",
          "Wrong medicine or wrong dose can be dangerous.",
        ],
        sideEffects: [
          "Almost all medicines have some side effects.",
          "Discuss any unusual symptoms with a healthcare professional.",
        ],
        category: "Unknown (image-based mock)",
        general_precautions: [
          "Always read the label carefully.",
          "Check expiry date and packaging quality before use.",
        ],
        important_warnings: [
          "This is a MOCK response for demo purposes.",
          "Always confirm medicine name and use with a qualified doctor or pharmacist.",
        ],
        equivalent_medicines: [],
        disclaimer:
          "This app does not provide dosage or timing. Always follow your doctor and the medicine label.",
        pharmacy_links: [],
      };

      res.json(response);
    } catch (error: any) {
      console.error("Medicine image analysis error:", error);
      res.status(500).json({
        error: "Failed to analyze medicine image",
        message: error.message,
      });
    }
  });

  // =========================
  //   Doctor endpoints
  // =========================
  app.get("/api/doctors", async (req, res) => {
    try {
      const { specialty } = req.query;

      let doctors: any[] = [];
      if (specialty && typeof specialty === "string") {
        doctors = await storage.getDoctorsBySpecialty(specialty);
      } else {
        doctors = await storage.getAllDoctors();
      }

      res.json(doctors);
    } catch (error: any) {
      console.error("Get doctors error:", error);
      res.status(500).json({
        error: "Failed to fetch doctors",
        message: error.message,
      });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctorById(id);

      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      res.json(doctor);
    } catch (error: any) {
      console.error("Get doctor error:", error);
      res.status(500).json({
        error: "Failed to fetch doctor",
        message: error.message,
      });
    }
  });

  // =========================
  //   Articles endpoints
  // =========================
  app.get("/api/articles", async (req, res) => {
    try {
      const { category } = req.query;

      let articles;
      if (category && typeof category === "string") {
        articles = await storage.getArticlesByCategory(category);
      } else {
        articles = await storage.getAllArticles();
      }

      res.json(articles);
    } catch (error: any) {
      console.error("Get articles error:", error);
      res.status(500).json({
        error: "Failed to fetch articles",
        message: error.message,
      });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      res.json(article);
    } catch (error: any) {
      console.error("Get article error:", error);
      res.status(500).json({
        error: "Failed to fetch article",
        message: error.message,
      });
    }
  });

  return httpServer;
}
