import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { text } = req.body;
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ message: 'Text must be at least 10 characters long.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', 'auto'); // Auto-detect language
    
    // Using the free, public API endpoint
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('LanguageTool API Error:', errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error in grammar-check API:', error);
    res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
  }
}
