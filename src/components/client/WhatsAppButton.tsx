import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WhatsAppButtonProps {
  phoneNumber: string;
  companyName?: string;
  message?: string;
  floating?: boolean;
  className?: string;
}

export const WhatsAppButton = ({
  phoneNumber,
  companyName = "a barbearia",
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

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (floating) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className={`fixed bottom-20 right-4 z-50 ${className}`}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleClick}
            size="lg"
            className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
        </motion.div>
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      </motion.div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Falar no WhatsApp
    </Button>
  );
};
