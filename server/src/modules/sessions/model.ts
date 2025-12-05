import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
   },
   token: {
      type: String,
      required: true,
      unique: true
   },
   ipAddress: String,
   userAgent: String,
   expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   lastActivity: {
      type: Date,
      default: Date.now
   },
   isActive: {
      type: Boolean,
      default: true
   }
});

// Índices para rendimiento
sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL automático

export default mongoose.model('Session', sessionSchema);
