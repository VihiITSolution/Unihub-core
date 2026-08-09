import { API_BASE_URL } from "@/lib/constants";

export interface YouTubeRightsDeclaration {
  id: number;
  signatoryName: string;
  agreementVersion: string;
  agreementText: string;
  acceptedAt: string;
  createdAt: string;
}

export interface YouTubeRightsDeclarationStatus {
  hasDeclaration: boolean;
  declaration: YouTubeRightsDeclaration | null;
  agreement: {
    version: string;
    text: string;
  };
  expectedSignatoryName: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.success) {
    throw new Error(body.message || "Unable to process the YouTube rights declaration.");
  }
  return body.data as T;
}

export const youtubeRightsService = {
  async getStatus(token: string): Promise<YouTubeRightsDeclarationStatus> {
    const response = await fetch(`${API_BASE_URL}/youtube-rights-declaration`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return readResponse<YouTubeRightsDeclarationStatus>(response);
  },

  async sign(token: string, signatoryName: string): Promise<YouTubeRightsDeclaration> {
    const response = await fetch(`${API_BASE_URL}/youtube-rights-declaration`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signatoryName, accepted: true }),
    });
    const data = await readResponse<{ declaration: YouTubeRightsDeclaration }>(response);
    return data.declaration;
  },
};
