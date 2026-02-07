export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  // RFC 5322 compliant email regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
  strength: "weak" | "medium" | "strong";
} {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required", strength: "weak" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters",
      strength: "weak",
    };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password is too long", strength: "weak" };
  }

  // Check password strength
  let strength: "weak" | "medium" | "strong" = "weak";
  let score = 0;

  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score >= 4) strength = "strong";
  else if (score >= 3) strength = "medium";

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "12345678",
    "qwerty123",
    "letmein",
    "welcome",
  ];
  if (commonPasswords.some((p) => password.toLowerCase().includes(p))) {
    return { valid: false, error: "Password is too common", strength: "weak" };
  }

  return { valid: true, strength };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML
    .substring(0, 1000); // Limit length
}
