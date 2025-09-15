import { NextResponse } from 'next/server';
import { WOOCOMMERCE_CONFIG } from '@/lib/constants';

export async function GET() {
  try {
    console.log('Testing WooCommerce connection...');
    console.log('WooCommerce URL:', WOOCOMMERCE_CONFIG.url);
    console.log('Consumer Key:', WOOCOMMERCE_CONFIG.consumerKey ? 'Present' : 'Missing');
    console.log('Consumer Secret:', WOOCOMMERCE_CONFIG.consumerSecret ? 'Present' : 'Missing');

    // Check if credentials are configured
    if (!WOOCOMMERCE_CONFIG.url || !WOOCOMMERCE_CONFIG.consumerKey || !WOOCOMMERCE_CONFIG.consumerSecret) {
      return NextResponse.json({
        success: false,
        message: 'WooCommerce credentials not properly configured',
        details: {
          url: !!WOOCOMMERCE_CONFIG.url,
          consumerKey: !!WOOCOMMERCE_CONFIG.consumerKey,
          consumerSecret: !!WOOCOMMERCE_CONFIG.consumerSecret
        }
      });
    }

    // Test API connection by fetching products
    const apiUrl = `${WOOCOMMERCE_CONFIG.url}/wp-json/wc/v3/products?per_page=1`;
    const credentials = `${WOOCOMMERCE_CONFIG.consumerKey}:${WOOCOMMERCE_CONFIG.consumerSecret}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(credentials).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('WooCommerce API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'WooCommerce connection successful',
        data: {
          status: response.status,
          productCount: Array.isArray(data) ? data.length : 0,
          sampleProduct: Array.isArray(data) && data.length > 0 ? data[0] : null
        }
      });
    } else {
      const errorText = await response.text();
      console.error('WooCommerce API error:', errorText);

      let errorMessage = `WooCommerce API error: ${response.status} ${response.statusText}`;
      if (response.status === 401) {
        errorMessage = 'WooCommerce API authentication failed. Please check your Consumer Key and Consumer Secret permissions.';
      } else if (response.status === 403) {
        errorMessage = 'WooCommerce API access forbidden. Please check if your API keys have the correct permissions.';
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        }
      });
    }

  } catch (error) {
    console.error('WooCommerce test error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}
