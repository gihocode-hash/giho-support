import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function callChatGPT(prompt: string, fileData?: { base64: string, mimeType: string }, fileType?: 'image' | 'video') {
  if (!openai) {
    throw new Error('OpenAI API key is not configured');
  }

  // ChatGPT supports vision for images
  if (fileData && fileType === 'image') {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 with vision
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${fileData.mimeType};base64,${fileData.base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || '';
  } else {
    // Text-only or video (ChatGPT doesn't support video yet, so we use text prompt)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Faster, cheaper for text-only
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || '';
  }
}
