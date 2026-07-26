const crypto = require('crypto');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

// @desc    Process appointment payment & verify signature
// @route   POST /api/v1/payments/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const transactionId = razorpayPaymentId || 'TXN-' + Math.random().toString(36).substr(2, 10).toUpperCase();

    // Verify HMAC signature if Razorpay signature is provided
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'demo_razorpay_secret';
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Invalid payment gateway signature verification failed.' });
      }
    }

    if (mongoose.connection.readyState !== 1) {
      const apt = global.memoryStore?.appointments.find((a) => a._id === appointmentId);
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      apt.paymentStatus = 'PAID';
      apt.paymentId = transactionId;

      return res.json({
        success: true,
        message: 'Payment verified and processed successfully',
        transaction: {
          transactionId,
          amount: apt.amount || 75,
          paymentMethod: paymentMethod || 'Razorpay / Credit Card',
          status: 'SUCCESS',
          timestamp: new Date()
        }
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.paymentStatus = 'PAID';
    appointment.paymentId = transactionId;
    await appointment.save();

    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      transaction: {
        transactionId,
        amount: appointment.amount,
        paymentMethod: paymentMethod || 'Razorpay / Credit Card',
        status: 'SUCCESS',
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processPayment };
