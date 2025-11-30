import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Request schemas for validation
const symptomAnalysisSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
});

const medicineSearchSchema = z.object({
  query: z.string().min(1, "Medicine name is required"),
});

const medicineImageSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Symptom Analysis endpoint
  app.post("/api/analyze-symptoms", async (req, res) => {
    try {
      const { symptoms } = symptomAnalysisSchema.parse(req.body);
      
      const prompt = `You are a medical information assistant. Based on the following symptoms: ${symptoms.join(", ")}, provide a detailed health analysis.

IMPORTANT SAFETY RULES:
- This is for awareness only, NOT a diagnosis
- Never provide specific dosages or treatment instructions
- Always recommend consulting a doctor
- Be cautious and conservative in assessments

Please respond in JSON format with:
{
  "conditions": [
    {
      "name": "Condition name",
      "probability": number (0-100),
      "description": "Brief description",
      "severity": "low" | "medium" | "high"
    }
  ],
  "guidance": ["General care tip 1", "General care tip 2"],
  "lifestyleTips": ["Lifestyle tip 1", "Lifestyle tip 2"],
  "recommendedSpecialist": "Type of doctor to consult"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a medical information assistant. Provide helpful health information while emphasizing safety disclaimers. Never provide dosages or specific treatment plans."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      // Get doctors matching the recommended specialist
      const doctors = await storage.getDoctorsBySpecialty(analysis.recommendedSpecialist || "General Physician");
      analysis.nearbyDoctors = doctors.slice(0, 3);
      
      res.json(analysis);
    } catch (error: any) {
      console.error("Symptom analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze symptoms", 
        message: error.message 
      });
    }
  });

  // Medicine Information by Name endpoint
  app.post("/api/medicine-info", async (req, res) => {
    try {
      const { query } = medicineSearchSchema.parse(req.body);
      
      const prompt = `Provide detailed information about the medicine: "${query}"

CRITICAL SAFETY RULES:
- DO NOT provide dosage information
- DO NOT provide timing or frequency instructions
- Always state this is for awareness only
- Emphasize consulting a doctor

Respond in JSON format:
{
  "name": "Medicine name",
  "generic_name": "Generic/chemical name",
  "uses": ["Use 1", "Use 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "sideEffects": ["Side effect 1", "Side effect 2"],
  "category": "Medicine category",
  "general_precautions": ["Precaution 1", "Precaution 2"],
  "important_warnings": ["Critical warning 1", "Critical warning 2"],
  "equivalent_medicines": [
    {"brand": "Brand name", "generic_name": "Generic name", "approx_price": "Price range"}
  ],
  "disclaimer": "This app does not provide dosage or timing. Always follow your doctor and the medicine label."
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a pharmaceutical information assistant. Provide medicine information for awareness only. NEVER provide dosage or specific treatment instructions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const medicineInfo = JSON.parse(response.choices[0].message.content || "{}");
      
      // Add pharmacy links (these would be real integrations in production)
      medicineInfo.pharmacy_links = [
        { 
          label: "View on partner pharmacy", 
          url: `https://example-pharmacy.com/search?query=${encodeURIComponent(query)}` 
        }
      ];
      
      res.json(medicineInfo);
    } catch (error: any) {
      console.error("Medicine info error:", error);
      res.status(500).json({ 
        error: "Failed to fetch medicine information", 
        message: error.message 
      });
    }
  });

  // Medicine Information by Image endpoint
  app.post("/api/medicine-info-image", async (req, res) => {
    try {
      const { imageBase64 } = medicineImageSchema.parse(req.body);
      
      // First, use vision to identify the medicine from the image
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this medicine package or pill image. Identify the medicine name, brand, and any visible text. Return ONLY the medicine name."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ],
          },
        ],
        max_completion_tokens: 500,
      });

      const identifiedMedicine = visionResponse.choices[0].message.content || "";
      
      // Now fetch detailed info using the identified medicine name
      const prompt = `Provide detailed information about the medicine: "${identifiedMedicine}"

CRITICAL SAFETY RULES:
- DO NOT provide dosage information
- DO NOT provide timing or frequency instructions
- Always state this is for awareness only
- Emphasize consulting a doctor

Respond in JSON format:
{
  "name": "Medicine name",
  "generic_name": "Generic/chemical name",
  "uses": ["Use 1", "Use 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "sideEffects": ["Side effect 1", "Side effect 2"],
  "category": "Medicine category",
  "general_precautions": ["Precaution 1", "Precaution 2"],
  "important_warnings": ["Critical warning 1", "Critical warning 2"],
  "equivalent_medicines": [
    {"brand": "Brand name", "generic_name": "Generic name", "approx_price": "Price range"}
  ],
  "disclaimer": "This app does not provide dosage or timing. Always follow your doctor and the medicine label."
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a pharmaceutical information assistant. Provide medicine information for awareness only. NEVER provide dosage or specific treatment instructions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const medicineInfo = JSON.parse(response.choices[0].message.content || "{}");
      
      medicineInfo.pharmacy_links = [
        { 
          label: "View on partner pharmacy", 
          url: `https://example-pharmacy.com/search?query=${encodeURIComponent(identifiedMedicine)}` 
        }
      ];
      
      res.json(medicineInfo);
    } catch (error: any) {
      console.error("Medicine image analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze medicine image", 
        message: error.message 
      });
    }
  });

  // Doctor endpoints
  app.get("/api/doctors", async (req, res) => {
    try {
      const { specialty } = req.query;
      
      let doctors;
      if (specialty && typeof specialty === 'string') {
        doctors = await storage.getDoctorsBySpecialty(specialty);
      } else {
        doctors = await storage.getAllDoctors();
      }
      
      res.json(doctors);
    } catch (error: any) {
      console.error("Get doctors error:", error);
      res.status(500).json({ 
        error: "Failed to fetch doctors", 
        message: error.message 
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
        message: error.message 
      });
    }
  });

  // Health Articles endpoints
  app.get("/api/articles", async (req, res) => {
    try {
      const { category } = req.query;
      
      let articles;
      if (category && typeof category === 'string') {
        articles = await storage.getArticlesByCategory(category);
      } else {
        articles = await storage.getAllArticles();
      }
      
      res.json(articles);
    } catch (error: any) {
      console.error("Get articles error:", error);
      res.status(500).json({ 
        error: "Failed to fetch articles", 
        message: error.message 
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
        message: error.message 
      });
    }
  });

  return httpServer;
}
