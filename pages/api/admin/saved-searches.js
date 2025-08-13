import dbConnect from '../../../lib/mongoose';
import SavedSearch from '../../../models/SavedSearch';
import withAdminAuth from '../../../lib/withAdminAuth';
import User from '../../../models/User';

const handler = async (req, res) => {
  const { method } = req;
  await dbConnect();

  const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
  const userId = adminUser._id;

  switch (method) {
    case 'GET':
      try {
        const { scope } = req.query;
        if (!scope) {
          return res.status(400).json({ success: false, message: 'Scope is required' });
        }
        const searches = await SavedSearch.find({ userId, scope }).sort({ name: 1 });
        res.status(200).json({ success: true, data: searches });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to fetch saved searches' });
      }
      break;

    case 'POST':
      try {
        const search = await SavedSearch.create({ ...req.body, userId });
        res.status(201).json({ success: true, data: search });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to save search', errors: error.errors });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const deletedSearch = await SavedSearch.findOneAndDelete({ _id: id, userId });
        if (!deletedSearch) {
          return res.status(404).json({ success: false, message: 'Saved search not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to delete saved search' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAdminAuth(handler);
