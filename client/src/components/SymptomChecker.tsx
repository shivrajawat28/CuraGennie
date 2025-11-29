import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Loader2, ArrowRight, Activity, Thermometer, Heart, Droplets } from "lucide-react";
import { useLocation } from "wouter";

const formSchema = z.object({
  symptoms: z.string().min(2, {
    message: "Please describe your symptoms.",
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
      age: "",
      gender: "",
      duration: "",
      temperature: "",
      pulse: "",
      spo2: "",
      bp: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      if (onAnalyze) {
        onAnalyze(values);
      } else {
        // If no handler provided, navigate to results with query params (mock)
        // In a real app, we'd pass state or use a context
        setLocation("/results");
      }
    }, 2000);
  }

  return (
    <Card className="w-full border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
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
                    <Textarea 
                      placeholder="e.g., I have a headache, mild fever, and sore throat since yesterday..." 
                      className="resize-none min-h-[100px] text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Be as specific as possible. Mention pain levels or specific areas.
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
  );
}
