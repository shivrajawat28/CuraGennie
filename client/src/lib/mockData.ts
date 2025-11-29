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

export const MEDICINE_INFO = [
  {
    name: "Paracetamol (Acetaminophen)",
    uses: "Pain reliever and fever reducer.",
    warnings: "Do not exceed recommended dose. Can cause liver damage if overdosed.",
    sideEffects: "Nausea, stomach pain, loss of appetite.",
    category: "Analgesic",
  },
  {
    name: "Ibuprofen",
    uses: "Reduces pain, inflammation, and fever.",
    warnings: "Take with food to avoid stomach upset. Avoid if you have ulcers.",
    sideEffects: "Heartburn, stomach pain, dizziness.",
    category: "NSAID",
  },
  {
    name: "Cetirizine",
    uses: "Relieves allergy symptoms like runny nose and sneezing.",
    warnings: "May cause drowsiness. Avoid alcohol.",
    sideEffects: "Drowsiness, dry mouth, fatigue.",
    category: "Antihistamine",
  },
];
