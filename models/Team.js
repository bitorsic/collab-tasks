const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a team name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add owner to members automatically
teamSchema.pre('save', function(next) {
  if (this.isNew && this.owner) {
    const ownerExists = this.members.some(
      member => member.user.toString() === this.owner.toString()
    );
    
    if (!ownerExists) {
      this.members.push({
        user: this.owner,
        role: 'owner',
        joinedAt: new Date()
      });
    }
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);
