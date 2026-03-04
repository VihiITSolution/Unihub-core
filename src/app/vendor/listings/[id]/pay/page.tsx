"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { marketplaceService } from "@/services/marketplace.service";
import type { PaymentInfo } from "@/services/marketplace.service";

export default function PaymentPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const itemId = parseInt(params.id as string);
  const formRef = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'payhere' | 'helapay' | 'bank_transfer'>('payhere');
  const [bankTransferProof, setBankTransferProof] = useState({
    proofImage: "",
    transactionDate: "",
    transactionReference: ""
  });
  const [paymentFormData, setPaymentFormData] = useState<any>(null);

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push("/student/become-vendor");
      return;
    }
    loadPaymentInfo();
  }, [user, itemId]);

  // Auto-submit PayHere form when formData is set
  useEffect(() => {
    if (paymentFormData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentFormData]);

  const loadPaymentInfo = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await marketplaceService.getPaymentInfo(itemId, token);
      if (response.success && response.data) {
        setPaymentInfo(response.data);
        
        // If doesn't require payment, redirect back
        if (!response.data.requiresPayment) {
          router.push("/vendor/listings");
          return;
        }

        // Auto-select first available payment method
        if (response.data.paymentMethods.payhere) {
          setSelectedMethod('payhere');
        } else if (response.data.paymentMethods.helapay) {
          setSelectedMethod('helapay');
        } else if (response.data.paymentMethods.bankTransfer) {
          setSelectedMethod('bank_transfer');
        }
      }
    } catch (error: any) {
      console.error("Failed to load payment info:", error);
      setError(error.message || "Failed to load payment information");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      if (selectedMethod === 'bank_transfer') {
        // Handle bank transfer proof submission
        if (!bankTransferProof.proofImage || !bankTransferProof.transactionDate) {
          setError("Please provide proof of payment and transaction date");
          setSubmitting(false);
          return;
        }

        const response = await marketplaceService.submitBankTransferProof(
          itemId,
          bankTransferProof,
          token
        );

        if (response.success) {
          alert("Bank transfer proof submitted successfully! Your payment will be verified by an admin.");
          router.push("/vendor/listings");
        } else {
          setError(response.error || "Failed to submit bank transfer proof");
        }
      } else {
        // Handle online payment (PayHere/HelaPay)
        const returnUrl = `${window.location.origin}/vendor/listings`;
        const cancelUrl = `${window.location.origin}/vendor/listings/${itemId}/pay`;

        const response = await marketplaceService.initiatePayment(
          itemId,
          {
            method: selectedMethod,
            returnUrl,
            cancelUrl
          },
          token
        );

        if (response.success && response.data) {
          if (selectedMethod === 'payhere' && response.data.formData) {
            // For PayHere, set the form data to trigger auto-submit
            setPaymentFormData(response.data.formData);
          } else if (selectedMethod === 'helapay' && response.data.paymentUrl) {
            // For HelaPay, redirect to payment URL
            window.location.href = response.data.paymentUrl;
          }
        } else {
          setError(response.error || "Failed to initiate payment");
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setBankTransferProof({
        ...bankTransferProof,
        proofImage: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-pulse">Loading payment information...</div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-red-600">Failed to load payment information</div>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Complete Payment</h1>
        <p className="text-gray-600">Pay the listing fee to publish your ad</p>
      </div>

      {/* Payment Info Card */}
      <div className="card mb-6 bg-blue-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Listing Fee</h3>
            <p className="text-sm text-blue-700">One-time payment to publish your listing</p>
          </div>
          <div className="text-3xl font-bold text-blue-900">
            ${paymentInfo.adFee?.toFixed(2)}
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
        
        <div className="space-y-3">
          {paymentInfo.paymentMethods.payhere && (
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="payhere"
                checked={selectedMethod === 'payhere'}
                onChange={(e) => setSelectedMethod(e.target.value as any)}
                className="w-4 h-4 text-primary-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-semibold">PayHere</div>
                <div className="text-sm text-gray-600">Pay with credit/debit card via PayHere</div>
              </div>
              <div className="text-2xl">💳</div>
            </label>
          )}

          {paymentInfo.paymentMethods.helapay && (
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="helapay"
                checked={selectedMethod === 'helapay'}
                onChange={(e) => setSelectedMethod(e.target.value as any)}
                className="w-4 h-4 text-primary-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-semibold">HelaPay</div>
                <div className="text-sm text-gray-600">Pay with HelaPay digital wallet</div>
              </div>
              <div className="text-2xl">🏦</div>
            </label>
          )}

          {paymentInfo.paymentMethods.bankTransfer && (
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={selectedMethod === 'bank_transfer'}
                onChange={(e) => setSelectedMethod(e.target.value as any)}
                className="w-4 h-4 text-primary-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-semibold">Bank Transfer</div>
                <div className="text-sm text-gray-600">Transfer directly to our bank account</div>
              </div>
              <div className="text-2xl">🏛️</div>
            </label>
          )}
        </div>
      </div>

      {/* Bank Transfer Details */}
      {selectedMethod === 'bank_transfer' && paymentInfo.bankDetails && (
        <div className="card mb-6 bg-yellow-50 border border-yellow-200">
          <h3 className="text-lg font-semibold mb-4 text-yellow-900">Bank Transfer Details</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="font-medium">Bank Name:</span>
              <span>{paymentInfo.bankDetails.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Name:</span>
              <span>{paymentInfo.bankDetails.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Number:</span>
              <span className="font-mono">{paymentInfo.bankDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Branch:</span>
              <span>{paymentInfo.bankDetails.branch}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-bold">Amount to Transfer:</span>
              <span className="font-bold text-lg">${paymentInfo.adFee?.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-sm text-yellow-800 mb-4">
            After making the transfer, please upload proof of payment below. Your listing will be published after admin verification.
          </p>

          {/* Bank Transfer Proof Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Proof of Payment <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="input"
              />
              <p className="text-xs text-gray-600 mt-1">
                Upload a screenshot or photo of your bank transfer receipt
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={bankTransferProof.transactionDate}
                onChange={(e) => setBankTransferProof({
                  ...bankTransferProof,
                  transactionDate: e.target.value
                })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={bankTransferProof.transactionReference}
                onChange={(e) => setBankTransferProof({
                  ...bankTransferProof,
                  transactionReference: e.target.value
                })}
                placeholder="e.g., TRX123456789"
                className="input"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? "Submitting..." : "Submit Proof"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/vendor/listings")}
                className="btn-outline flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Online Payment Button */}
      {selectedMethod !== 'bank_transfer' && (
        <div className="card">
          <div className="flex gap-4">
            <button
              onClick={handlePaymentSubmit}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? "Processing..." : `Pay $${paymentInfo.adFee?.toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={() => router.push("/vendor/listings")}
              className="btn-outline flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden PayHere Form */}
      {paymentFormData && (
        <form
          ref={formRef}
          method="POST"
          action="https://sandbox.payhere.lk/pay/checkout"
          style={{ display: 'none' }}
        >
          {Object.entries(paymentFormData).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value as string} />
          ))}
        </form>
      )}
    </div>
  );
}
