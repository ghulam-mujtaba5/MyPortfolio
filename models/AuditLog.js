import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  userName: { // Denormalize for easier display
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'bulk_delete', 'login_success', 'login_fail'],
  },
  entity: {
    type: String,
    required: true,
    enum: ['Article', 'Project', 'User', 'Auth'],
  },
  entityId: {
    type: String, // Can be ObjectId or other identifiers
  },
  details: {
    type: String, // e.g., "Deleted 5 articles"
  },
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
