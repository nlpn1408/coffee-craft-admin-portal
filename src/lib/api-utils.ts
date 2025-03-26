import { toast } from "@/components/ui/use-toast";
import { notification } from "antd";

interface ApiError {
  data?: {
    message?: string;
    error?: string;
  };
  status?: number;
  message?: string;
}

type NotificationType = "success" | "info" | "warning" | "error";

export const handleApiError = (error: unknown) => {
  const errorMessage =
    error && typeof error === "object"
      ? (error as ApiError).data?.message ||
        (error as ApiError).data?.error ||
        (error as ApiError).message ||
        "An unexpected error occurred"
      : "An unexpected error occurred";

  showNotification("error", "Error", errorMessage);
};

export const showSuccessToast = (message: string) => {
  toast({
    title: "Success",
    description: message,
  });
};

export const showNotification = (
  type: NotificationType,
  title?: string,
  message: string | React.ReactNode = ""
) => {
  notification.open({
    message: title || "Notification",
    type: type,
    description: message,
  });
};
