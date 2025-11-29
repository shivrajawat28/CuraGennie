import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z" />
                  <path d="M12 12v.01" />
                  <path d="M17 21h-4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3z" />
                </svg>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                Cura Gennie
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Your friendly health buddy for symptom awareness and wellness guidance.
              We help you understand your health better, but we don't replace your doctor.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Home</Link>
              </li>
              <li>
                <Link href="/symptom-checker" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Symptom Checker</Link>
              </li>
              <li>
                <Link href="/doctors" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Find Doctors</Link>
              </li>
              <li>
                <Link href="/articles" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Health Articles</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">About Us</Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block max-w-3xl mx-auto mb-6">
            <p className="text-sm font-medium">
              Disclaimer: Cura Gennie is not a medical device, diagnosis, or treatment tool. 
              All information is for educational purposes only. Always consult a qualified healthcare professional.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cura Gennie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
