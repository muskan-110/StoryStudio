const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://storystudio-backend.onrender.com';

export interface GenerateStoryRequest {
  prompt: string;
  genre: string;
  tone: string;
  audience: string;
  num_scenes: number;
}

export interface Scene {
  title: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
    seed?: string;
    model?: string;
  }>;
}

export interface GenerateStoryResponse {
  prompt: string;
  genre: string;
  tone: string;
  audience: string;
  num_scenes: number;
  scenes: Scene[];
}

export async function generateStory(request: GenerateStoryRequest): Promise<GenerateStoryResponse> {
  const response = await fetch(`${API_BASE_URL}/scene/generate-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate story');
  }

  return response.json();
}
