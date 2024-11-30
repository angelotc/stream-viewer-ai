import { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import prisma from '../../../lib/prisma';
import { sessionConfig } from '../../../lib/session-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('API Route Hit: /api/user/settings');
    console.log('Method:', req.method);
    
    const session = await getIronSession(req, res, sessionConfig);
  
    if (!session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({
                user,
                settings: {
                    isBotEnabled: user.isBotEnabled
                }
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Failed to fetch settings' });
        }
    } else if (req.method === 'POST') {
        try {
            const { isBotEnabled } = req.body;

            const updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: { isBotEnabled }
            });

            res.status(200).json({
                user: updatedUser,
                settings: { isBotEnabled: updatedUser.isBotEnabled }
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 