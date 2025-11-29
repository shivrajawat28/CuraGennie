export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  location: string;
  distance: string;
  image: string;
  availability: string;
}

export interface SymptomAnalysisResult {
  conditions: {
    name: string;
    probability: number;
    description: string;
    severity: "low" | "medium" | "high";
  }[];
  guidance: string[];
  lifestyleTips: string[];
  recommendedSpecialist: string;
  nearbyDoctors: Doctor[];
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "General Physician",
    rating: 4.9,
    location: "HealthFirst Clinic, Downtown",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
    availability: "Available Today",
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    specialty: "Cardiologist",
    rating: 4.8,
    location: "City Heart Center",
    distance: "3.5 km",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
    availability: "Next Available: Tomorrow",
  },
  {
    id: 3,
    name: "Dr. Emily Brooks",
    specialty: "General Physician",
    rating: 4.7,
    location: "Community Care Hospital",
    distance: "2.0 km",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop",
    availability: "Available Today",
  },
];

export const MOCK_ANALYSIS_RESULT: SymptomAnalysisResult = {
  conditions: [
    {
      name: "Viral Upper Respiratory Infection",
      probability: 85,
      description: "Commonly known as the common cold. It affects the nose, throat, and sinuses.",
      severity: "low",
    },
    {
      name: "Seasonal Allergies",
      probability: 45,
      description: "An immune response to substances in the environment like pollen or dust.",
      severity: "low",
    },
  ],
  guidance: [
    "Stay hydrated by drinking plenty of water and warm fluids.",
    "Rest as much as possible to help your body fight the infection.",
    "Monitor your temperature. If it exceeds 39°C, consult a doctor.",
  ],
  lifestyleTips: [
    "Avoid cold drinks and ice cream.",
    "Use a humidifier in your room to keep the air moist.",
    "Wash your hands frequently to prevent spreading.",
  ],
  recommendedSpecialist: "General Physician",
  nearbyDoctors: MOCK_DOCTORS.filter((d) => d.specialty === "General Physician"),
};

export interface EquivalentMedicine {
  brand: string;
  generic_name: string;
  approx_price: string;
}

export interface PharmacyLink {
  label: string;
  url: string;
}

export interface MedicineInfo {
  name: string;
  generic_name: string;
  uses: string[];
  warnings: string[];
  sideEffects: string[];
  category: string;
  general_precautions: string[];
  important_warnings: string[];
  equivalent_medicines: EquivalentMedicine[];
  pharmacy_links: PharmacyLink[];
  disclaimer: string;
}

export const MEDICINE_INFO: MedicineInfo[] = [
  {
    name: "Paracetamol (Acetaminophen)",
    generic_name: "Paracetamol",
    uses: ["Pain reliever", "Fever reducer"],
    warnings: ["Do not exceed recommended dose", "Can cause liver damage if overdosed"],
    sideEffects: ["Nausea", "Stomach pain", "Loss of appetite"],
    category: "Analgesic",
    general_precautions: [
      "Do not exceed the maximum daily dose on the label.",
      "People with liver or kidney problems should consult a doctor before use."
    ],
    important_warnings: [
      "Overdose can cause serious liver damage.",
      "Keep out of reach of children."
    ],
    equivalent_medicines: [
      { brand: "Calpol 650", generic_name: "Paracetamol", approx_price: "₹20–₹40 per strip" },
      { brand: "Crocin 650", generic_name: "Paracetamol", approx_price: "₹25–₹45 per strip" }
    ],
    pharmacy_links: [
      { label: "View on partner pharmacy", url: "https://example-pharmacy.com/search?query=Paracetamol" }
    ],
    disclaimer: "This app does not provide dosage or timing. Always follow your doctor and the medicine label."
  },
  {
    name: "Dolo 650",
    generic_name: "Paracetamol",
    uses: ["Fever", "Mild to moderate pain"],
    warnings: ["Do not exceed recommended dose", "Can cause liver damage if overdosed"],
    sideEffects: ["Nausea", "Stomach discomfort (in some users)"],
    category: "Analgesic and antipyretic",
    general_precautions: [
      "Do not exceed the maximum daily dose on the label.",
      "People with liver or kidney problems should consult a doctor before use."
    ],
    important_warnings: [
      "Overdose can cause serious liver damage.",
      "Keep out of reach of children."
    ],
    equivalent_medicines: [
      { brand: "Calpol 650", generic_name: "Paracetamol", approx_price: "₹20–₹40 per strip" },
      { brand: "Crocin 650", generic_name: "Paracetamol", approx_price: "₹25–₹45 per strip" }
    ],
    pharmacy_links: [
      { label: "View on partner pharmacy", url: "https://example-pharmacy.com/search?query=Dolo%20650" }
    ],
    disclaimer: "This app does not provide dosage or timing. Always follow your doctor and the medicine label."
  },
  {
    name: "Ibuprofen",
    generic_name: "Ibuprofen",
    uses: ["Reduces pain", "Inflammation", "Fever"],
    warnings: ["Take with food to avoid stomach upset", "Avoid if you have ulcers"],
    sideEffects: ["Heartburn", "Stomach pain", "Dizziness"],
    category: "NSAID",
    general_precautions: [
      "Take with food or milk to prevent stomach upset.",
      "Avoid if you have a history of stomach ulcers or bleeding."
    ],
    important_warnings: [
      "May increase risk of heart attack or stroke if used long-term.",
      "Can cause stomach bleeding."
    ],
    equivalent_medicines: [
      { brand: "Brufen 400", generic_name: "Ibuprofen", approx_price: "₹15–₹30 per strip" },
      { brand: "Ibugesic", generic_name: "Ibuprofen", approx_price: "₹20–₹35 per strip" }
    ],
    pharmacy_links: [
      { label: "View on partner pharmacy", url: "https://example-pharmacy.com/search?query=Ibuprofen" }
    ],
    disclaimer: "This app does not provide dosage or timing. Always follow your doctor and the medicine label."
  },
  {
    name: "Cetirizine",
    generic_name: "Cetirizine",
    uses: ["Relieves allergy symptoms", "Runny nose", "Sneezing"],
    warnings: ["May cause drowsiness", "Avoid alcohol"],
    sideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
    category: "Antihistamine",
    general_precautions: [
      "May cause drowsiness, do not drive if affected.",
      "Avoid alcohol consumption while taking this medicine."
    ],
    important_warnings: [
      "Tell your doctor if you are pregnant or breastfeeding.",
      "Do not take more than recommended."
    ],
    equivalent_medicines: [
      { brand: "Cetzine", generic_name: "Cetirizine", approx_price: "₹18–₹35 per strip" },
      { brand: "Zyrtec", generic_name: "Cetirizine", approx_price: "₹25–₹50 per strip" }
    ],
    pharmacy_links: [
      { label: "View on partner pharmacy", url: "https://example-pharmacy.com/search?query=Cetirizine" }
    ],
    disclaimer: "This app does not provide dosage or timing. Always follow your doctor and the medicine label."
  },
];
