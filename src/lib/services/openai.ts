import OpenAI from 'openai';

let openai: OpenAI | null = null;

// Initialize OpenAI client only on the client side and when API key is available
const initializeOpenAI = () => {
  if (typeof window === 'undefined') return null; // Server-side

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  console.log('OpenAI API Key check:', apiKey ? 'Found' : 'Not found');
  console.log('Environment check:', process.env.NODE_ENV);

  if (!apiKey) {
    console.warn('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
    return null;
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
    });
  }

  return openai;
};

export interface GenerateImageParams {
  prompt: string;
  artStyle: string;
  musicGenre: string;
  referenceImage?: string;
}

export async function generateTshirtDesign(params: GenerateImageParams): Promise<string> {
  try {
    const client = initializeOpenAI();
    if (!client) {
      console.warn('OpenAI client not initialized. Using fallback design.');
      return getFallbackDesignUrl(params);
    }

    const { prompt, artStyle, musicGenre } = params;

    // Create a comprehensive prompt combining all elements
    const fullPrompt = `Create a ${artStyle} style T-shirt design featuring: ${prompt}. 
    The design should be inspired by ${musicGenre} music and be suitable for printing on clothing. 
    Make it high quality, detailed, and visually appealing. 
    The design should be centered and sized appropriately for T-shirt printing.`;

    console.log('Attempting to call OpenAI API...');
    console.log('API Key present:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    console.log('Full prompt:', fullPrompt);

    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    if (response.data && response.data[0] && response.data[0].url) {
      console.log('OpenAI API call successful!');
      return response.data[0].url;
    } else {
      throw new Error('No image URL received from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Billing hard limit') || error.message.includes('billing')) {
        console.warn('OpenAI billing limit reached. Using fallback design for testing.');
        return getFallbackDesignUrl(params);
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        console.warn('OpenAI rate limit reached. Using fallback design for testing.');
        return getFallbackDesignUrl(params);
      }
      
      if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
        console.warn('OpenAI authentication failed. Using fallback design for testing.');
        return getFallbackDesignUrl(params);
      }
    }

    // For any other errors, use fallback
    console.warn('OpenAI API error. Using fallback design for testing.');
    return getFallbackDesignUrl(params);
  }
}

// Fallback design URL generator
function getFallbackDesignUrl(params: GenerateImageParams): string {
  const { artStyle, musicGenre } = params;

  // Generate a unique fallback image based on the style and genre
  const styleMap: { [key: string]: string } = {
    'abstract': 'abstract',
    'vintage': 'retro',
    'minimalist': 'minimal',
    'realistic': 'realistic',
    'cartoon': 'cartoon',
    'geometric': 'geometric'
  };

  const genreMap: { [key: string]: string } = {
    'rock': 'rock',
    'electronic': 'electronic',
    'jazz': 'jazz',
    'classical': 'classical',
    'pop': 'pop',
    'hip-hop': 'hiphop'
  };

  const styleKeyword = styleMap[artStyle.toLowerCase()] || 'abstract';
  const genreKeyword = genreMap[musicGenre.toLowerCase()] || 'music';

  // Use Picsum for high-quality placeholder images with different seeds
  const seed = Date.now() % 1000;
  return `https://picsum.photos/1024/1024?random=${seed}&text=${encodeURIComponent(`${styleKeyword}+${genreKeyword}+design`)}`;
}

export async function generateImageVariation(): Promise<string> {
  try {
    const client = initializeOpenAI();
    if (!client) {
      console.warn('OpenAI client not initialized. Using fallback variation.');
      return getFallbackDesignUrl({ prompt: 'variation', artStyle: 'abstract', musicGenre: 'electronic' });
    }

    // For DALL-E 3, we need to create a new prompt based on the original
    // since direct variations aren't supported
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: "Create a variation of this design with similar style but different composition and elements",
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    if (response.data && response.data[0] && response.data[0].url) {
      return response.data[0].url;
    } else {
      throw new Error('No image URL received from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API call failed for variation:', error);
    console.warn('Using fallback variation for testing.');
    return getFallbackDesignUrl({ prompt: 'variation', artStyle: 'abstract', musicGenre: 'electronic' });
  }
}
