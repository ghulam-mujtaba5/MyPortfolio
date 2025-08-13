import dbConnect from '../../../lib/mongoose';
import Note from '../../../models/Note';
import withAdminAuth from '../../../lib/withAdminAuth';
import User from '../../../models/User'; // Assuming you have a User model to get the user ID

const handler = async (req, res) => {
  const { method } = req;
  await dbConnect();

  // For now, we'll use a hardcoded user ID. In a real app, you'd get this from the session.
  // const { userId } = req.user; 
  const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
  const userId = adminUser._id;

  switch (method) {
    case 'GET':
      try {
        const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: notes });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to fetch notes' });
      }
      break;

    case 'POST':
      try {
        const note = await Note.create({ ...req.body, userId });
        res.status(201).json({ success: true, data: note });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to create note', errors: error.errors });
      }
      break;

    case 'PUT':
      try {
        const { id, ...data } = req.body;
        const note = await Note.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });
        if (!note) {
          return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.status(200).json({ success: true, data: note });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update note' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;
        const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
        if (!deletedNote) {
          return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to delete note' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAdminAuth(handler);
