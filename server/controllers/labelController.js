const { Label } = require('../models/index');

exports.createLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await Label.create({
      name,
      color,
      project_id: req.params.pid
    });
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectLabels = async (req, res) => {
  try {
    const labels = await Label.findAll({
      where: { project_id: req.params.pid }
    });
    res.json(labels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLabel = async (req, res) => {
  try {
    const label = await Label.findByPk(req.params.lid);
    if (!label) return res.status(404).json({ message: 'Label not found' });

    const { name, color } = req.body;
    if (name) label.name = name;
    if (color) label.color = color;

    await label.save();
    res.json(label);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLabel = async (req, res) => {
  try {
    const label = await Label.findByPk(req.params.lid);
    if (!label) return res.status(404).json({ message: 'Label not found' });

    await label.destroy();
    res.json({ message: 'Label deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
