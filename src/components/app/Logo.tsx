import { cn } from "@/lib/utils";

export function LogoMark({ className, inverted = false }: { className?: string, inverted?: boolean }) {
  return (
    <img 
      src="/logo.png" 
      alt="SUKSHMA-AI Logo" 
      className={cn("size-8 object-contain", className)}
    />
  );
}

export function Logo({ subtitle = true, inverted = false, className }: { subtitle?: boolean, inverted?: boolean, className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="/logo.png" 
        alt="SUKSHMA-AI Logo" 
        className="h-10 object-contain"
      />
    </div>
  );
}
