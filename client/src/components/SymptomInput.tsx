import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMMON_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Cold",
  "Sore throat",
  "Chest pain",
  "Shortness of breath",
  "Fatigue",
  "Body ache",
  "Nausea",
  "Vomiting",
  "Loose motions",
  "Abdominal pain",
  "Dizziness",
  "Back pain",
  "Skin rash",
  "Itching",
  "Red eyes",
  "Burning urination"
];

interface SymptomInputProps {
  value: string[];
  onChange: (symptoms: string[]) => void;
  error?: string;
}

export function SymptomInput({ value, onChange, error }: SymptomInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.trim().length > 0) {
      const filtered = COMMON_SYMPTOMS.filter(
        s => s.toLowerCase().includes(val.toLowerCase()) && !value.includes(s)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addSymptom = (symptom: string) => {
    if (!value.includes(symptom)) {
      onChange([...value, symptom]);
    }
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSymptom = (symptomToRemove: string) => {
    onChange(value.filter(s => s !== symptomToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addSymptom(inputValue.trim());
      }
    }
  };

  return (
    <div className="space-y-3" ref={wrapperRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((symptom) => (
          <Badge 
            key={symptom} 
            variant="secondary" 
            className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            {symptom}
            <button
              type="button"
              onClick={() => removeSymptom(symptom)}
              className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
              <span className="sr-only">Remove {symptom}</span>
            </button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim().length > 0) setShowSuggestions(true);
            }}
            placeholder="Type a symptom (e.g. Fever, Headache)..."
            className={cn(error && "border-destructive")}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => inputValue.trim() && addSymptom(inputValue.trim())}
            disabled={!inputValue.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95">
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => addSymptom(suggestion)}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
    </div>
  );
}
