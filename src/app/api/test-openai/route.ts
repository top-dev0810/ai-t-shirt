import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'OpenAI API key not found in environment variables',
        error: 'MISSING_API_KEY'
      }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Test with a simple request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with 'OpenAI API is working correctly!' if you can see this message."
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const message = response.choices[0]?.message?.content || 'No response received';

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working correctly!',
      response: message,
      model: response.model,
      usage: response.usage,
      apiKeyPrefix: apiKey.substring(0, 20) + '...' // Show first 20 chars for verification
    });

  } catch (error: unknown) {
    console.error('OpenAI API test error:', error);

    let errorMessage = 'Unknown error occurred';
    let errorType = 'UNKNOWN_ERROR';

    if (error instanceof Error && error.message) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = 'Invalid API key - please check your OpenAI API key';
        errorType = 'INVALID_API_KEY';
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded - please try again later';
        errorType = 'RATE_LIMIT';
      } else if (error.message.includes('billing') || error.message.includes('quota')) {
        errorMessage = 'Billing/quota issue - please check your OpenAI account billing';
        errorType = 'BILLING_ISSUE';
      } else if (error.message.includes('403') || error.message.includes('Country') || error.message.includes('region') || error.message.includes('territory')) {
        errorMessage = 'OpenAI API is not available in your region. Consider using a VPN or alternative AI service.';
        errorType = 'GEOGRAPHIC_RESTRICTION';
      } else {
        errorMessage = error.message;
        errorType = 'API_ERROR';
      }
    }

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: errorType,
      details: error instanceof Error ? error.message : 'No additional details available'
    }, { status: 500 });
  }
}

