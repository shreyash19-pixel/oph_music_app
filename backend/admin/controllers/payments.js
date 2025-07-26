const payment_details = require("../model/payments");


const updateStatus = async (req,res) =>{
    try{
        const {ophId, transactionId, status ,reject_reason} = req.body;

        if (!ophId || !transactionId || !status) {
        return res.status(400).json({ message: 'ophId, transactionId, and status are required' });
        }

        
        const result = await payment_details.updateStatus(ophId, transactionId, status,reject_reason);

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No record found to update' });
        }

        res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {updateStatus}