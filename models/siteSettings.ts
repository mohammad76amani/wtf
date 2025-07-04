import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  heroImage: {
    type: String,
    default: ''
  },
  galleryImages: [{
    id: String,
    src: String,
    alt: String
  }],
  // Add other site-wide settings here
}, { timestamps: true });

const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
