// Define the structure for the User object
export interface User {
  id: string;
  username: string; // Keep username if it's used elsewhere, e.g., display name fallback
  name: string;
  email: string; // Make email required as it's the login identifier
  role: string; // Add role property
  // Add other relevant user fields as needed
}

// Update login credentials to use email
export interface LoginCredentials {
  email: string;
  password?: string; // Password might not always be needed in the frontend type
}
