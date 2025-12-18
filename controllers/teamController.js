const Team = require('../models/Team');
const User = require('../models/User');

/**
 * @desc    Create a new team
 * @route   POST /api/teams
 * @access  Private
 */
exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user.id
    });

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id }
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTeam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all teams for logged in user
 * @route   GET /api/teams
 * @access  Private
 */
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user.id
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single team
 * @route   GET /api/teams/:id
 * @access  Private
 */
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is a member
    const isMember = team.members.some(
      member => member.user._id.toString() === req.user.id
    );

    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this team'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update team
 * @route   PUT /api/teams/:id
 * @access  Private
 */
exports.updateTeam = async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is owner or admin
    const isOwnerOrAdmin = team.members.some(
      member => 
        member.user.toString() === req.user.id && 
        (member.role === 'owner' || member.role === 'admin')
    );

    if (!isOwnerOrAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }

    team = await Team.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, description: req.body.description },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Add member to team
 * @route   POST /api/teams/:id/members
 * @access  Private
 */
exports.addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if requester is owner or admin
    const isOwnerOrAdmin = team.members.some(
      member => 
        member.user.toString() === req.user.id && 
        (member.role === 'owner' || member.role === 'admin')
    );

    if (!isOwnerOrAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members to this team'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const isMember = team.members.some(
      member => member.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Add member to team
    team.members.push({
      user: userId,
      role,
      joinedAt: Date.now()
    });

    await team.save();

    // Add team to user's teams
    await User.findByIdAndUpdate(userId, {
      $push: { teams: team._id }
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTeam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Remove member from team
 * @route   DELETE /api/teams/:id/members/:userId
 * @access  Private
 */
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if requester is owner or admin
    const isOwnerOrAdmin = team.members.some(
      member => 
        member.user.toString() === req.user.id && 
        (member.role === 'owner' || member.role === 'admin')
    );

    if (!isOwnerOrAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this team'
      });
    }

    // Can't remove owner
    if (team.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team owner'
      });
    }

    // Remove member
    team.members = team.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await team.save();

    // Remove team from user's teams
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { teams: team._id }
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTeam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete team
 * @route   DELETE /api/teams/:id
 * @access  Private
 */
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is owner
    if (team.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this team'
      });
    }

    // Remove team from all members
    await User.updateMany(
      { teams: team._id },
      { $pull: { teams: team._id } }
    );

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
