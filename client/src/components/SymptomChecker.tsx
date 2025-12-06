import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2, ArrowRight, Activity, Thermometer, Heart, Droplets, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { SymptomInput } from "@/components/SymptomInput";

const formSchema = z.object({
  symptoms: z.array(z.string()).min(1, {
    message: "Please select at least one symptom.",
  }),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid age.",
  }),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  duration: z.string().min(1, {
    message: "Please select duration.",
  }),
  temperature: z.string().optional(),
  pulse: z.string().optional(),
  spo2: z.string().optional(),
  bp: z.string().optional(),
});

interface SymptomCheckerProps {
  onAnalyze?: (data: z.infer<typeof formSchema>) => void;
}

export function SymptomChecker({ onAnalyze }: SymptomCheckerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [medicalFiles, setMedicalFiles] = useState<File[]>([]);
  const [showMedicalUpload, setShowMedicalUpload] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: [],
      age: "",
      gender: "",
      duration: "",
      temperature: "",
      pulse: "",
      spo2: "",
      bp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      
      if (onAnalyze) {
        onAnalyze(values);
        return;
      }

      
      const payload = {
        symptoms: values.symptoms,
        age: Number(values.age),
        gender: values.gender,
        duration: values.duration,
        vitals: {
          temperature: values.temperature || null,
          pulse: values.pulse || null,
          spo2: values.spo2 || null,
          bp: values.bp || null,
        },
        // future: medicalFiles 
      };

      const res = await fetch("/api/analyze-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze symptoms");
      }

      const data = await res.json();

      
      if (typeof window !== "undefined") {
        localStorage.setItem("cg_last_analysis", JSON.stringify(data));
      }

      
      setLocation("/results");
    } catch (err) {
      console.error(err);
      
      alert("Sorry, something went wrong while analyzing your symptoms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="relative">
      {/* Animated shimmer background */}
      <div 
        className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(0, 200, 180, 0.2) 0%, rgba(100, 220, 200, 0.2) 25%, rgba(0, 200, 180, 0.2) 50%, rgba(100, 220, 200, 0.2) 75%, rgba(0, 200, 180, 0.2) 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 15s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    <Card className="w-full border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm relative z-10">
      <CardHeader className="space-y-1 pb-6 border-b border-border/50">
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Check Symptoms
        </CardTitle>
        <CardDescription>
          Tell us how you're feeling, and we'll help you understand what might be going on.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Main Symptom Input */}
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are your symptoms?</FormLabel>
                  <FormControl>
                    <SymptomInput 
                      value={field.value} 
                      onChange={field.onChange}
                      error={form.formState.errors.symptoms?.message}
                    />
                  </FormControl>
                  <FormDescription>
                    Type to search common symptoms or add your own.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input placeholder="Years" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How long?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="less_than_1">Less than 1 day</SelectItem>
                        <SelectItem value="1_to_3">1-3 days</SelectItem>
                        <SelectItem value="3_to_7">3-7 days</SelectItem>
                        <SelectItem value="more_than_week">More than a week</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Vitals Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Vitals (Optional)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Thermometer className="w-3 h-3" /> Temp (°C)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="37.0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pulse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Activity className="w-3 h-3" /> Pulse (bpm)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="72" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spo2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Droplets className="w-3 h-3" /> SpO₂ (%)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="98" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-3 h-3" /> BP (mmHg)
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="120/80" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medical History Upload Toggle */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Upload Medical History <span className="text-xs text-muted-foreground/70">(Optional)</span>
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full px-4 text-xs font-semibold"
                onClick={() => setShowMedicalUpload(!showMedicalUpload)}
              >
                {showMedicalUpload ? "Hide" : "Add Records"}
              </Button>
            </div>

            {/* Medical Upload Box - Conditional */}
            {showMedicalUpload && (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div 
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-lg p-6 text-center cursor-pointer transition-all duration-200"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-900/20');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-900/20');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-900/20');
                    const files = Array.from(e.dataTransfer.files);
                    setMedicalFiles([...medicalFiles, ...files]);
                  }}
                  onClick={() => document.getElementById('medical-file-input')?.click()}
                >
                  <Upload className="w-8 h-8 text-emerald-600/60 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload or drag & drop medical records
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Valid formats: Images / PDFs
                  </p>
                  <input 
                    id="medical-file-input"
                    type="file" 
                    multiple 
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setMedicalFiles([...medicalFiles, ...Array.from(e.target.files)]);
                      }
                    }}
                  />
                </div>
                {medicalFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{medicalFiles.length} file(s) selected</p>
                    <div className="flex flex-wrap gap-2">
                      {medicalFiles.map((file, idx) => (
                        <div key={idx} className="bg-emerald-100 dark:bg-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1">
                          {file.name}
                          <button 
                            type="button"
                            onClick={() => setMedicalFiles(medicalFiles.filter((_, i) => i !== idx))}
                            className="ml-1 hover:text-emerald-600 dark:hover:text-emerald-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Symptoms <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
}
