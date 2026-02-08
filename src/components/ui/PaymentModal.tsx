"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: PaymentData) => void;
  course: {
    title: string;
    price: number | string;
  };
  isProcessing?: boolean;
}

export interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  paymentMethod: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  course,
  isProcessing = false,
}: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "credit_card",
  });

  // Convert price to number to handle string values from API
  const priceNumber =
    typeof course.price === "number"
      ? course.price
      : parseFloat(course.price.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(paymentData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Course Price:</span>
            <span className="text-2xl font-bold text-primary-600">
              ${priceNumber.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            name="cardName"
            value={paymentData.cardName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            name="cardNumber"
            value={paymentData.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              name="expiryDate"
              value={paymentData.expiryDate}
              onChange={handleChange}
              placeholder="MM/YY"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleChange}
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold"
          >
            {isProcessing ? "Processing..." : `Pay $${priceNumber.toFixed(2)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
