import { UserRole } from './index'; // Import the enum

// Define the structure for the User object used in authentication contexts
export interface AuthUser { // Renaming to avoid conflict with the main User interface
  id: string;
  name?: string | null; // Use optional name from the main User interface
  email: string; // Email is the primary identifier
  role: UserRole; // Use the UserRole enum
  // Add other fields relevant for auth context if needed, e.g., permissions, tokens
}

// Update login credentials to use email
export interface LoginCredentials {
  email: string;
  password?: string; // Password might not always be needed in the frontend type
}
