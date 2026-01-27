import { NextRequest, NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const { result } = await ogs({ url });

    return NextResponse.json({
      success: 1,
      meta: {
        title: result.ogTitle || result.twitterTitle,
        description: result.ogDescription || result.twitterDescription,
        image: {
          url: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
        },
        icon: result.favicon,
        url: result.ogUrl || url,
      },
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
