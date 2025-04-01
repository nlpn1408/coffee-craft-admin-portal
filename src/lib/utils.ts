import axios, { AxiosError } from "axios"; // Import AxiosError
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { handleUnauthorized } from "@/contexts/AuthContext"; // Import the handler

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("en-US", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date));
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event);
    }
  };
}

export const newRequest = axios.create({
  withCredentials: true, // Important for session cookies
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add a response interceptor
newRequest.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error: AxiosError) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.error("Interceptor caught 401 Unauthorized error.");
      // Call the handler function from AuthContext
      handleUnauthorized();
    }
    // Do something with response error
    // It's important to reject the promise so downstream catches work
    return Promise.reject(error);
  }
);
