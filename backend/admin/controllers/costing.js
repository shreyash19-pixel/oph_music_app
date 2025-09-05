const costingModel = require("../model/costing");
const { uploadToS3 } = require("../../utils");

const getCosting = async (req, res) => {
  try {
    const costing = await costingModel.getCosting();
    res.status(200).json({ success: true, data: costing });
  } catch (err) {
    console.error('Error fetching costing:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const insertCosting = async (req, res) => {
    const { name, cost } = req.body;
    const qr_image_path = req.file.path;  
    try {   
        if (!name || !cost || !req.file) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Upload file to S3
        const qr_image_path = await uploadToS3(req.file, "costing/qr-codes");
        console.log('File uploaded to S3:', qr_image_path);

        const costing = await costingModel.insertCosting(name, cost, qr_image_path);
        res.status(200).json({ success: true, data: costing });
    } catch (err) {
        console.error('Error inserting costing:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCosting = async (req, res) => {
    try {
        const { id } = req.params;
        const { cost } = req.body;
        
        if (!cost) {
            return res.status(400).json({ success: false, message: "Cost is required" });
        }

        let qr_image_path = null;
        
        // Only upload new QR image if file is provided
        if (req.file) {
            qr_image_path = await uploadToS3(req.file, "costing/qr-codes");
            console.log('New QR image uploaded to S3:', qr_image_path);
        }

        // Single model function handles both cases
        const costing = await costingModel.updateCosting(id, cost, qr_image_path);

        res.status(200).json({ success: true, data: costing });
    } catch (err) {
        console.error('Error updating costing:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


const getCostingById = async (req, res) => {
    try {
        const { id } = req.params;
        const costing = await costingModel.getCostingById(id);
        res.status(200).json({ success: true, data: costing });
    } catch (err) {
        console.error('Error getting costing by id:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = { getCosting, insertCosting, updateCosting, getCostingById };