const Situationship = require("../models/Situationship");
const Interaction = require("../models/Interaction");
const NudgeLog = require("../models/NudgeLog");
const { refreshWarmthScores, calculateInteractionImpact, getStatusFromScore } = require("../services/warmthEngine");

// Create new situationship
exports.createSituationship = async (req, res) => {
  try {
    const { person } = req.body;
    
    if (!person || !person.name) {
      return res.status(400).json({ success: false, message: "Person name is required" });
    }

    const newShip = await Situationship.create({
      owner: req.user._id,
      person,
      warmthScore: 50,
      status: "cooling"
    });

    res.status(201).json({ success: true, data: newShip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all situationships for a user
exports.getSituationships = async (req, res) => {
  try {
    // Lazy update warmth scores before returning
    await refreshWarmthScores(req.user._id);

    const match = { owner: req.user._id, isArchived: false };
    if (req.query.status) {
      match.status = req.query.status;
    }

    const sortOption = req.query.sort === 'warmth' ? { warmthScore: -1 } : { lastInteractionAt: -1 };

    const ships = await Situationship.find(match).sort(sortOption);
    
    res.status(200).json({ success: true, data: ships });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    await refreshWarmthScores(req.user._id);

    const ships = await Situationship.find({ owner: req.user._id, isArchived: false }).sort({ lastInteractionAt: -1 });
    
    const totalPeople = ships.length;
    const hotConnections = ships.filter(s => s.status === 'warm').length;
    
    // Simplistic logic for "Due for nudge" (e.g. cold or cooling, or nextNudgeAt passed)
    const now = new Date();
    const dueForNudge = ships.filter(s => (s.nextNudgeAt && s.nextNudgeAt <= now) || s.status === 'cold').length;

    res.status(200).json({
      success: true,
      data: {
        totalPeople,
        hotConnections,
        dueForNudge,
        recentShips: ships.slice(0, 10) // Return top 10 most recently interacted or created
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single situationship with history
exports.getSituationship = async (req, res) => {
  try {
    const ship = await Situationship.findOne({ _id: req.params.id, owner: req.user._id });
    if (!ship) {
      return res.status(404).json({ success: false, message: "Situationship not found" });
    }

    const interactions = await Interaction.find({ situationship: ship._id }).sort({ date: -1 });

    res.status(200).json({ success: true, data: { ...ship.toObject(), interactions } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update situationship Details
exports.updateSituationship = async (req, res) => {
  try {
    const ship = await Situationship.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!ship) {
      return res.status(404).json({ success: false, message: "Situationship not found" });
    }

    res.status(200).json({ success: true, data: ship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Archive situationship
exports.deleteSituationship = async (req, res) => {
  try {
    const ship = await Situationship.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isArchived: true },
      { new: true }
    );
    
    if (!ship) {
      return res.status(404).json({ success: false, message: "Situationship not found" });
    }

    res.status(200).json({ success: true, message: "Archived successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Log a new interaction
exports.logInteraction = async (req, res) => {
  try {
    const { type, platform, note, sentiment } = req.body;
    
    const ship = await Situationship.findOne({ _id: req.params.id, owner: req.user._id });
    if (!ship) {
      return res.status(404).json({ success: false, message: "Situationship not found" });
    }

    const currentSentiment = sentiment || "neutral";
    
    // Create interaction
    const interaction = await Interaction.create({
      situationship: ship._id,
      owner: req.user._id,
      type,
      platform,
      note,
      sentiment: currentSentiment,
    });

    // Update warmth score
    const impact = calculateInteractionImpact(currentSentiment);
    let newScore = ship.warmthScore + impact;
    if (newScore > 100) newScore = 100;

    ship.warmthScore = newScore;
    ship.status = getStatusFromScore(newScore);
    ship.lastInteractionAt = Date.now();
    ship.interactionCount += 1;
    
    // Simple heuristic: set next nudge for 14 days from now
    const nextNudge = new Date();
    nextNudge.setDate(nextNudge.getDate() + 14);
    ship.nextNudgeAt = nextNudge;

    await ship.save();

    res.status(201).json({ success: true, data: { interaction, ship } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get interaction history
exports.getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find({
      situationship: req.params.id,
      owner: req.user._id
    }).sort({ date: -1 });

    res.status(200).json({ success: true, data: interactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mute/unmute
exports.toggleMute = async (req, res) => {
  try {
    const ship = await Situationship.findOne({ _id: req.params.id, owner: req.user._id });
    if (!ship) return res.status(404).json({ success: false, message: "Not found" });

    ship.isMuted = !ship.isMuted;
    await ship.save();

    res.status(200).json({ success: true, data: ship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Generate AI Nudge using Anthropic
exports.generateNudge = async (req, res) => {
  try {
    const ship = await Situationship.findOne({ _id: req.params.id, owner: req.user._id });
    if (!ship) {
      return res.status(404).json({ success: false, message: "Situationship not found" });
    }

    const lastInteraction = await Interaction.findOne({ situationship: ship._id }).sort({ date: -1 });
    const daysSince = Math.floor((Date.now() - new Date(ship.lastInteractionAt || ship.createdAt).getTime()) / (1000 * 3600 * 24));
    
    let messageText = "";

    // If API key is available, use Claude, else standard template
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229', // updated model name for testing
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `You are a Gen Z social intelligence assistant. Generate a casual, non-cringe re-engagement message for this situation:
            
  Person: ${ship.person.name} (${ship.person.platform})
  Last interaction: ${daysSince} days ago
  Context/notes about them: ${ship.person.notes || 'None'}
  Tags: ${ship.person.tags.join(', ')}
  Last interaction type: ${lastInteraction ? lastInteraction.type : 'None'}
  
  Write ONE short, natural message (2-3 sentences max) that feels human, not salesy. 
  Match the energy of someone who genuinely wants to reconnect, not someone running a CRM.
  Output only the message text, nothing else.`
          }]
        })
      });
      
      const aiData = await response.json();
      if (aiData.content && aiData.content.length > 0) {
        messageText = aiData.content[0].text;
      } else {
        messageText = `Hey ${ship.person.name}, it's been a while! How have you been?`;
      }
    } else {
      // Fallback
      messageText = `Hey ${ship.person.name}, it's been a while since we connected on ${ship.person.platform || 'here'}. Hope things are going well!`;
    }

    const nudge = await NudgeLog.create({
      situationship: ship._id,
      owner: req.user._id,
      message: messageText.replace(/^["']|["']$/g, ''), // trim quotes if generated
      context: `Generated because it has been ${daysSince} days since last interaction.`,
      status: "pending"
    });

    res.status(201).json({ success: true, data: nudge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
