import { withAuth } from '../middleware/withAuth';

async function handler(req, res) {
  // Your route logic here
  // req.session.user is guaranteed to exist
  const { user } = req.session;
  
  // ... rest of your code
}

export default withAuth(handler); 