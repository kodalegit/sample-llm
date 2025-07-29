const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function login(email: string, password: string) {
  // Use URLSearchParams for form data as expected by OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function getChats(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/chats/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function getChat(chatId: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch chat");
  return res.json();
}

export async function createChat(initialQuery: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/chats/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ initial_query: initialQuery }),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function sendMessage(
  chatId: string,
  message: string,
  token: string
) {
  const res = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: message, role: "user" }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

/**
 * Send a message and stream the response
 * Processes chunks of data as they arrive from the server
 */
export async function sendMessageStream(
  chatId: string,
  message: string,
  token: string,
  onChunk: (chunk: any) => void
) {
  const response = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content: message, role: "user" }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || response.statusText);
  }

  // Process the streaming response
  if (response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            try {
              const chunk = JSON.parse(buffer);
              onChunk(chunk);
            } catch (e) {
              console.error(
                "Error parsing JSON from remaining buffer:",
                e
              );
            }
          }
          break;
        }

        // Decode the chunk and add it to our buffer
        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // Split by newlines to handle multiple JSON objects
        const lines = buffer.split("\n");

        // Process all complete lines except the last one (which might be incomplete)
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const chunk = JSON.parse(line);
              onChunk(chunk);
            } catch (e) {
              console.error("Error parsing JSON:", e, "Line:", line);
            }
          }
        }

        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      console.error("Error reading stream:", error);
      throw error;
    }
  }

  return null;
}
