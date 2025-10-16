// File contents excluded from context for conciseness
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useToast = () => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (props: ToastProps) => {
    setToast(props);
  };

  return { toast };
};

export { useToast };