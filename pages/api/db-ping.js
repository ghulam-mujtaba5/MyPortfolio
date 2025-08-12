import clientPromise, { pingMongo } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    await pingMongo();
    return res.status(200).json({ ok: true, message: 'Pinged your deployment. You successfully connected to MongoDB!' });
  } catch (err) {
    console.error('DB Ping Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
