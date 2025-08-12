import AuditLog from '../models/AuditLog';
import dbConnect from './mongoose';
import User from '../models/User';

/**
 * Creates an audit log entry.
 * @param {object} options - The options for the audit log.
 * @param {object} options.req - The request object to get session from.
 * @param {string} options.action - The action performed (e.g., 'create', 'update').
 * @param {string} options.entity - The entity type (e.g., 'Article', 'Project').
 * @param {string} [options.entityId] - The ID of the affected entity.
 * @param {string} [options.details] - Additional details about the action.
 */
export const createAuditLog = async ({ session, action, entity, entityId, details, actorId, actorName }) => {
  try {
    await dbConnect();
    // Derive actor information
    let userId = null;
    let userName = null;

    // Support full session with user
    if (session?.user?.id) userId = session.user.id;
    if (session?.user?.name) userName = session.user.name;

    // Support token-like session (id, role)
    if (!userId && session?.id) userId = session.id;
    if (!userName && session?.name) userName = session.name;

    // Explicit overrides
    if (!userId && actorId) userId = actorId;
    if (!userName && actorName) userName = actorName;

    // Fetch name from DB if we have id but no name
    if (userId && !userName) {
      try {
        const u = await User.findById(userId).select('name');
        if (u) userName = u.name;
      } catch (_) {
        // ignore
      }
    }

    // Fallback to anonymous if still missing a display name
    if (!userName) userName = 'Unknown User';

    await AuditLog.create({
      user: userId || undefined,
      userName,
      action,
      entity,
      entityId,
      details,
    });

  } catch (error) {
    // Log the error but don't block the main operation
    console.error('Failed to create audit log:', error);
  }
};
