import { toast } from "@/components/ui/use-toast";

interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
  status?: number;
  message?: string;
}

export const handleApiError = (error: unknown) => {
  const errorMessage = error && typeof error === "object" 
    ? (error as ApiError).data?.message ||
      (error as ApiError).data?.error ||
      (error as ApiError).message ||
      "An unexpected error occurred"
    : "An unexpected error occurred";

  toast({
    variant: "destructive",
    title: "Error",
    description: errorMessage,
  });
};

export const showSuccessToast = (message: string) => {
  toast({
    title: "Success",
    description: message,
  });
}; 