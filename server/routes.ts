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
            const modelsResp = typeof maybeListFn === "function" ? await (genAI as any).listModels() : null;
            if (modelsResp && Array.isArray(modelsResp.models)) {
              const modelsArr: any[] = modelsResp.models;
              const findPrefer = (preds: string[]) =>
                modelsArr.find((m) =>
                  preds.some((p) =>
                    ((m.name || m.modelId || "") as string).toString().toLowerCase().includes(p)
                  )
                );
              const gem = findPrefer(["gemini"]);
              const bison = findPrefer(["bison", "text-bison"]);
              const simple = findPrefer(["text", "gpt"]);
              if (gem) chosenModelId = (gem.name || gem.modelId) as string;
              else if (bison) chosenModelId = (bison.name || bison.modelId) as string;
              else if (simple) chosenModelId = (simple.name || simple.modelId) as string;
              else if (modelsArr.length > 0) chosenModelId = (modelsArr[0].name || modelsArr[0].modelId) as string;
              console.log("Selected Google model id for generation:", chosenModelId);
            } else {
              console.warn("No model list available from SDK (will try default model id).");
            }
          } catch (chooseErr) {
            console.warn("Model discovery error (non-fatal), will try default model id:", chooseErr);
          }

          const extraContextParts: string[] = [];
          if (age) extraContextParts.push(`Age: ${age}`);
          if (gender) extraContextParts.push(`Gender: ${gender}`);
          if (duration) extraContextParts.push(`Duration: ${duration}`);
          if (vitals) extraContextParts.push(`Vitals: ${JSON.stringify(vitals)}`);
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
              throw new Error("Generative model not available on this SDK instance");
            }

            const result = await model.generateContent(prompt);
            const text =
              (result as any)?.response?.text?.() ||
              (result as any)?.response?.output?.[0]?.content?.[0]?.text?.() ||
              "";

            const analysis = JSON.parse(text || "{}");

            if (!analysis || !Array.isArray(analysis.conditions)) {
              throw new Error("Invalid AI response: missing or invalid 'conditions' array");
            }

            const spec: string = analysis.recommendedSpecialist || "General Physician";
            let doctors: any[] = [];
            try {
              doctors = (await storage.getDoctorsBySpecialty(spec)) ?? (await storage.getAllDoctors());
            } catch {
              doctors = [];
            }
            const nearbyDoctors = Array.isArray(doctors) ? doctors.slice(0, 3) : [];

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
            console.error("AI generation attempt failed, falling back to rule-based logic:", aiErr);
            // fallthrough to fallback logic
          }
        } catch (outerErr) {
          console.error("Gemini attempt outer error, falling back to rule-based logic:", outerErr);
          // fallthrough to fallback logic
        }
      }

      // ---------- 2) Fallback RULE-BASED LOGIC (improved: multiple, rich conditions) ----------
      const lower = symptoms.map((s) => s.toLowerCase());
      const hasAny = (keys: string[]) =>
        lower.some((s) => keys.some((k) => s.includes(k)));

      // Candidate conditions container
      const candidates: Array<ReturnType<typeof makeCondition>> = [];

      // Respiratory cluster
      if (
        hasAny(["fever", "cough", "cold", "sore throat", "congestion", "runny nose"])
      ) {
        candidates.push(
          makeCondition(
            "Viral upper respiratory infection",
            75,
            "A common viral infection affecting nose/throat/airways — causes fever, cough, sore throat and body ache. Often improves with rest and fluids.",
            "moderate",
            {
              prevention: ["Wash hands, avoid close contact when sick", "Cover mouth while coughing/sneezing"],
              selfCare: ["Rest, hydrate, paracetamol/ibuprofen only if doctor/advice allows (do not self-prescribe)", "Warm fluids, salt-water gargle for sore throat"],
              whenToSeeDoctor: ["High fever, shortness of breath, severe or worsening symptoms", "Symptoms persisting > 1 week"],
              commonApproaches: ["Symptomatic treatment, monitoring; clinician may order tests if needed"],
              exercises: ["Avoid strenuous exercise until recovery; light walks only if feeling stable"],
              dietTips: ["Light, warm fluids, bland diet if appetite low"],
              howOthersCanHelp: ["Provide fluids, monitor temperature, keep patient isolated from vulnerable people"],
            }
          )
        );
      }

      // GI cluster
      if (hasAny(["loose motion", "diarrhea", "vomit", "vomiting", "stomach pain", "abdominal pain"])) {
        candidates.push(
          makeCondition(
            "Acute gastroenteritis / food-related infection",
            70,
            "Symptoms suggest an infection or irritation of the gut often caused by contaminated food/water — includes diarrhea, vomiting, abdominal cramps.",
            "moderate",
            {
              prevention: ["Safe food practices, clean water", "Avoid street/unsafe foods if hygiene uncertain"],
              selfCare: ["Hydration (small frequent sips), oral rehydration solutions if available", "BRAT-like diet when tolerating (banana, rice, toast)"],
              whenToSeeDoctor: ["Blood in stool, signs of severe dehydration, very high fever, severe abdominal pain"],
              commonApproaches: ["Fluid replacement, symptomatic care; clinician may recommend tests or medications"],
              exercises: ["Rest until symptoms ease"],
              dietTips: ["Avoid dairy and greasy foods until recovery", "Gradually reintroduce normal diet"],
              howOthersCanHelp: ["Provide ORS/water, help with food and hygiene", "Monitor urine output and alert if worsening"],
            }
          )
        );
      }

      // Headache-dominant cluster
      if (hasAny(["headache", "migraine", "sensitivity to light", "throbbing"])) {
        // Add both tension-type / migraine and secondary causes if present
        candidates.push(
          makeCondition(
            "Tension-type headache / migraine (likely)",
            65,
            "Headache can be primary (tension, migraine) caused by stress, sleep, posture or triggers. Serious causes are less common but should be considered if unusual features present.",
            "moderate",
            {
              prevention: ["Regular sleep, hydration, manage screen-time and posture", "Identify and avoid headache triggers"],
              selfCare: ["Rest in a dark quiet room for migraines, hydrate, avoid strong smells", "Simple pain-relief if allowed by doctor (do not self-prescribe)"],
              whenToSeeDoctor: ["Very sudden severe headache, neurological signs (weakness, vision change), worsening pattern"],
              commonApproaches: ["Lifestyle measures, trigger avoidance; clinician may suggest imaging or preventives for recurrent migraines"],
              exercises: ["Relaxation, neck stretching, posture exercises"],
              dietTips: ["Regular meals, avoid foods that trigger (if known)"],
              howOthersCanHelp: ["Provide quiet environment, help monitor severity and any worrying signs"],
            }
          )
        );
      }

      // Chest pain / breathlessness — high risk
      if (hasAny(["chest pain", "pressure in chest", "shortness of breath", "breathless"])) {
        const spo2Val = vitals?.spo2 ? parseInt(String(vitals.spo2)) : null;
        const chestSeverity: "low" | "moderate" | "high" = spo2Val !== null && spo2Val < 94 ? "high" : "high";
        candidates.push(
          makeCondition(
            "Potential cardiac or respiratory emergency",
            chestSeverity === "high" ? 90 : 80,
            "Chest pain or breathlessness can sometimes indicate a serious heart or lung problem and needs urgent assessment.",
            chestSeverity,
            {
              prevention: ["Avoid heavy exertion if chest pain occurs", "Manage risk factors (smoking, known heart disease)"],
              selfCare: ["Do not ignore severe chest pain or severe breathlessness; sit upright and seek help immediately"],
              whenToSeeDoctor: ["Severe chest pain, fainting, sweating, severe breathlessness, or low oxygen readings"],
              commonApproaches: ["Immediate clinical assessment; oxygen and emergency protocols if necessary"],
              exercises: ["None recommended until medically cleared"],
              dietTips: ["N/A in emergency scenarios — focus on urgent care"],
              howOthersCanHelp: ["Call emergency services, keep patient calm and supported, relay symptom history to responders"],
            }
          )
        );
      }

      // Musculoskeletal
      if (hasAny(["back pain", "joint pain", "knee pain", "shoulder pain"])) {
        candidates.push(
          makeCondition(
            "Musculoskeletal pain / strain",
            60,
            "Pain likely related to muscles, joints or posture. Often mechanical or from overuse; severe signs need medical opinion.",
            "low",
            {
              prevention: ["Good posture, ergonomic setup, avoid sudden heavy lifting"],
              selfCare: ["Rest, gentle stretching, hot/cold packs as comfortable (no self-injection/strong meds)"],
              whenToSeeDoctor: ["Severe loss of function, numbness/weakness, high fever with pain"],
              commonApproaches: ["Physio, analgesics with medical advice, imaging if red flags present"],
              exercises: ["Stretching, core strengthening under guidance"],
              dietTips: ["Balanced diet to support recovery; avoid heavy alcohol"],
              howOthersCanHelp: ["Assist with tasks, help maintain comfortable environment and mobility support"],
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
              prevention: ["Good hygiene, rest"],
              selfCare: ["Hydration, rest, monitor symptoms"],
              whenToSeeDoctor: ["Worsening or prolonged symptoms, high fever"],
              commonApproaches: ["Symptomatic care"],
              exercises: ["Rest"],
              dietTips: ["Light, hydrating foods"],
              howOthersCanHelp: ["Monitor and assist with basic needs"],
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
        // sort by probability desc
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
              prevention: ["General hygiene", "Avoid exposure to known triggers"],
              selfCare: ["Observe and monitor, seek medical evaluation if not improving"],
              whenToSeeDoctor: ["Persisting/worsening symptoms or new worrying signs"],
              commonApproaches: ["Clinical evaluation and targeted testing if needed"],
              exercises: ["Rest"],
              dietTips: ["Regular hydration and light meals"],
              howOthersCanHelp: ["Help monitor changes, keep records of symptoms"],
            }
          )
        );
      }

      // Build guidance and lifestyle tips (aggregate)
      const guidance: string[] = [
        "This analysis is only for awareness and does NOT replace a doctor's check-up.",
        "If your symptoms suddenly worsen, you feel very unwell, or you are worried, seek medical help immediately.",
      ];

      // add condition-specific guidance bullets
      if (hasAny(["fever", "cough", "cold", "sore throat"])) {
        guidance.push("Monitor your temperature regularly and track how you feel over time.");
        guidance.push("Avoid self-medication with antibiotics without a doctor's advice.");
      }
      if (hasAny(["loose motion", "diarrhea", "vomit", "vomiting"])) {
        guidance.push("Watch for signs of dehydration and seek help if you cannot keep fluids down.");
      }
      if (hasAny(["chest pain", "shortness of breath"])) {
        guidance.push("Do NOT ignore chest pain or severe breathlessness. These can be signs of a heart or lung emergency.");
      }

      const lifestyleTips: string[] = [];
      if (hasAny(["fever", "cough", "cold", "sore throat"])) {
        lifestyleTips.push("Drink warm fluids, stay well hydrated, and take adequate rest.");
        lifestyleTips.push("Avoid close contact with vulnerable people (elderly, very young, or those with chronic illnesses).");
      }
      if (lifestyleTips.length === 0) {
        lifestyleTips.push("Maintain a regular sleep schedule and stay hydrated. Eat light, balanced meals.");
      }

      // doctors lookup (best-effort)
      let doctors: any[] = [];
      try {
        doctors = (await storage.getDoctorsBySpecialty(finalConditions[0].name)) ?? (await storage.getAllDoctors());
      } catch {
        doctors = [];
      }
      const nearbyDoctors = Array.isArray(doctors) ? doctors.slice(0, 3) : [];

      const payload = {
        conditions: finalConditions,
        guidance,
        lifestyleTips,
        recommendedSpecialist: finalConditions[0]?.name ? finalConditions[0].name : "General Physician",
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
      if (lower.includes("paracetamol")) category = "Analgesic / Antipyretic";
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
            url: `https://example-pharmacy.com/search?query=${encodeURIComponent(query)}`,
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
