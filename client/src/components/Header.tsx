
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
import { useState } from "react";
import { MEDICINE_INFO } from "@/lib/mockData";
import { Search, Moon, Sun, Menu, X, Pill } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResult, setMedicineResult] = useState<any>(null);
  const { theme, setTheme } = useTheme();

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 10);
    });
  }

  const handleMedicineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock search logic
    const result = MEDICINE_INFO.find(
      (m) => m.name.toLowerCase().includes(medicineSearch.toLowerCase())
    );
    setMedicineResult(result || { error: "Medicine not found in database." });
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/symptom-checker", label: "Symptom Checker" },
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Medicine Information</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <form onSubmit={handleMedicineSearch} className="flex gap-2">
                  <Input
                    placeholder="Enter medicine name (e.g. Dolo 650)"
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                  />
                  <Button type="submit">Check</Button>
                </form>

                {medicineResult && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3 animate-in fade-in-50">
                    {medicineResult.error ? (
                      <p className="text-destructive text-sm">{medicineResult.error}</p>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg text-primary">
                            {medicineResult.name}
                          </h4>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {medicineResult.category}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong className="text-foreground">Uses:</strong> {medicineResult.uses}</p>
                          <p><strong className="text-foreground">Warnings:</strong> {medicineResult.warnings}</p>
                          <p><strong className="text-foreground">Side Effects:</strong> {medicineResult.sideEffects}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border">
                          <p className="text-xs text-destructive font-medium flex gap-1 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                            Disclaimer: Always follow doctor's dosage instructions.
                          </p>
                        </div>
                      </>
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
