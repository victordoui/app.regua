import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { SVGProps } from "react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  companyName?: string;
  message?: string;
  floating?: boolean;
  className?: string;
}

export const WhatsAppButton = ({
  phoneNumber,
  companyName = "o negócio",
  message,
  floating = true,
  className = "",
}: WhatsAppButtonProps) => {
  // Clean phone number (remove special characters)
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  
  // Add country code if not present
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  
  // Default message
  const defaultMessage = `Olá! Gostaria de mais informações sobre ${companyName}.`;
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.04 3C8.86 3 3.02 8.8 3.02 15.94c0 2.28.6 4.5 1.73 6.45L3 29l6.82-1.78a13.1 13.1 0 0 0 6.21 1.58h.01c7.17 0 13.01-5.8 13.01-12.94C29.05 8.8 23.21 3 16.04 3Zm0 23.62h-.01a10.9 10.9 0 0 1-5.56-1.52l-.4-.24-4.05 1.06 1.08-3.93-.26-.4a10.7 10.7 0 0 1-1.65-5.65c0-5.94 4.87-10.77 10.86-10.77 5.98 0 10.85 4.83 10.85 10.77 0 5.94-4.87 10.77-10.86 10.77Zm5.95-8.06c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.74.16-.22.33-.85 1.06-1.04 1.28-.19.22-.38.25-.7.09-.33-.16-1.38-.5-2.63-1.6a9.82 9.82 0 0 1-1.82-2.25c-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.77-1.01-2.42-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.22 2.3 3.49 5.57 4.9.78.33 1.38.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.42.19-1.55-.08-.14-.3-.22-.63-.38Z" />
    </svg>
  );

  if (floating) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className={`fixed bottom-24 right-4 z-40 ${className}`}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild size="lg" className="h-12 rounded-full px-4 font-bold text-white shadow-lg hover:brightness-95" style={{ backgroundColor: '#25D366', backgroundImage: 'none' }}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Conversar com o estabelecimento pelo WhatsApp">
              <WhatsAppIcon className="mr-2 h-6 w-6" />
              WhatsApp
            </a>
          </Button>
        </motion.div>
        
        {/* Pulse animation */}
        <span className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-20" />
      </motion.div>
    );
  }

  return (
    <Button asChild className={`gap-2 font-bold text-white hover:brightness-95 ${className}`} style={{ backgroundColor: '#25D366', backgroundImage: 'none' }}>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="h-5 w-5" />
        Chamar no WhatsApp
      </a>
    </Button>
  );
};
