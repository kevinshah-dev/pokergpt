import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { gptStringContent } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a very strong poker player. All pot sizes and bet sizes are in big blinds. You will analyze this hand and give me a recommendation on what to do. Be concise." },
        { role: "user", content: gptStringContent },
      ],
    });

    const advice = completion.choices[0].message.content;
    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get advice' }, { status: 500 });
  }
}