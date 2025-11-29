import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { MEDICINE_INFO, MedicineInfo } from "@/lib/mockData";
import { Search, Moon, Sun, Menu, Pill, Upload, ExternalLink, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResult, setMedicineResult] = useState<MedicineInfo | { error: string } | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 10);
    });
  }

  const handleMedicineSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Mock search logic
    const result = MEDICINE_INFO.find(
      (m) => m.name.toLowerCase().includes(medicineSearch.toLowerCase())
    );
    setMedicineResult(result || { error: "Medicine not found in database. Please try a different name." });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        // Simulate "analyzing" the image and finding a result
        setTimeout(() => {
          // For prototype, just return the first medicine result as a "match"
          setMedicineResult(MEDICINE_INFO[0]);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    // { href: "/symptom-checker", label: "Symptom Checker" }, // Removed as requested
    { href: "/articles", label: "Articles" },
    { href: "/doctors", label: "Doctors" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm border-border/40"
          : "bg-background"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z" />
                <path d="M12 12v.01" />
                <path d="M17 21h-4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg leading-tight text-foreground">
                Cura Gennie
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Your Health Buddy
              </span>
            </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
                  "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                  location === link.href
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}>
                {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 text-primary">
                <Pill className="w-4 h-4" />
                Medicine Info
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Pill className="w-5 h-5 text-primary" /> Medicine Information
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <Tabs defaultValue="name" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="name">Search by Name</TabsTrigger>
                    <TabsTrigger value="image">Upload Image</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="name" className="space-y-4">
                    <form onSubmit={handleMedicineSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter medicine name (e.g. Dolo 650)"
                          value={medicineSearch}
                          onChange={(e) => setMedicineSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button type="submit">Get Info</Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                      />
                      {uploadedImage ? (
                        <div className="relative w-full max-w-[200px] mx-auto aspect-video rounded-md overflow-hidden">
                           <img src={uploadedImage} alt="Uploaded medicine" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="p-4 bg-muted rounded-full">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="font-medium text-foreground">Click to upload medicine image</p>
                          <p className="text-xs">Supports JPG, PNG. Ensure name is visible.</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 p-3 rounded-md text-xs flex gap-2 items-start">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Please ensure the medicine strip/tablet image clearly shows the brand name and strength. This feature is for basic information only, not for prescriptions or dosage.</p>
                    </div>
                    {uploadedImage && !medicineResult && (
                       <div className="text-center text-sm text-muted-foreground animate-pulse">Analyzing image...</div>
                    )}
                  </TabsContent>
                </Tabs>

                {medicineResult && (
                  <div className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4">
                    {'error' in medicineResult ? (
                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center">
                        {medicineResult.error}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-border pb-4">
                          <div>
                            <h3 className="font-bold text-2xl text-primary">{medicineResult.name}</h3>
                            <p className="text-muted-foreground">Generic: {medicineResult.generic_name}</p>
                          </div>
                          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                            {medicineResult.category}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Used For
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {medicineResult.uses.map(use => (
                                <Badge key={use} variant="secondary">{use}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Side Effects
                            </h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {medicineResult.sideEffects.map(effect => (
                                <li key={effect}>{effect}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                           <h4 className="font-semibold text-sm flex items-center gap-2">
                             <Info className="w-4 h-4 text-blue-500" /> Precautions & Warnings
                           </h4>
                           <ul className="text-sm text-muted-foreground space-y-1">
                             {medicineResult.general_precautions.map((p, i) => (
                               <li key={i}>• {p}</li>
                             ))}
                             {medicineResult.important_warnings.map((w, i) => (
                               <li key={i} className="font-medium text-destructive/80">• {w}</li>
                             ))}
                           </ul>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Equivalent Medicines</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {medicineResult.equivalent_medicines.map((med, i) => (
                              <div key={i} className="border border-border rounded-md p-3 flex justify-between items-center text-sm">
                                <div>
                                  <p className="font-medium">{med.brand}</p>
                                  <p className="text-xs text-muted-foreground">{med.generic_name}</p>
                                </div>
                                <span className="bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                                  {med.approx_price}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {medicineResult.pharmacy_links.length > 0 && (
                           <Button variant="outline" className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/5" asChild>
                             <a href={medicineResult.pharmacy_links[0].url} target="_blank" rel="noopener noreferrer">
                               <ExternalLink className="w-4 h-4" /> {medicineResult.pharmacy_links[0].label}
                             </a>
                           </Button>
                        )}

                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-destructive font-medium flex gap-2 items-start bg-destructive/5 p-3 rounded-md">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            {medicineResult.disclaimer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button size="sm" className="rounded-full font-semibold px-6">
            Sign In
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
             <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
             <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-8">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={cn(
                          "text-lg font-medium transition-colors hover:text-primary cursor-pointer",
                          location === link.href
                            ? "text-primary font-semibold"
                            : "text-muted-foreground"
                        )}>
                        {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Pill className="w-4 h-4" /> Medicine Info
                  </Button>
                  <Button className="w-full">Sign In</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
