import { withAuth } from '../middleware/withAuth';
import { AssemblyAI } from 'assemblyai';

const aaiClient = new AssemblyAI({ 
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY 
});

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await aaiClient.realtime.createTemporaryToken({ expires_in: 3600 });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ error: error.message });
  }
}

export default withAuth(handler); 