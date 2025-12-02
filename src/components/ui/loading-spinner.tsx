import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
}

export const LoadingSpinner = ({ size = 24, className, ...props }: LoadingSpinnerProps) => {
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <Loader2 className="animate-spin text-primary" size={size} />
        </div>
    );
};
