"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { SHOW_TUTOR_VIDEO_PROMOTION } from "@/lib/promotionFlags";

export type RoleType = "tutor" | "vendor";

interface RoleUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleType: RoleType;
  featureName?: string;
}

const ROLE_CONFIG = {
  tutor: {
    title: "Become a Tutor",
    description:
      "To create courses and teach students, you need to apply as a tutor.",
    features: [
      "Create and publish courses",
      "Upload video lessons",
      "Host live sessions",
      "Earn from your courses",
      "Build your student community",
    ],
    rewards: [
      "LKR 300 for an existing YouTube teaching video that is 20 minutes or longer",
      "LKR 500 for each eligible video you upload to UniHub",
    ],
    route: "/student/become-tutor",
    buttonText: "Apply as Tutor",
    requiresApproval: true,
  },
  vendor: {
    title: "Become a Vendor",
    description:
      "To sell products or list boarding places, you need to create a vendor profile.",
    features: [
      "Sell marketplace items",
      "List boarding places",
      "Manage your shop",
      "Track sales and revenue",
      "Build your customer base",
    ],
    rewards: [],
    route: "/student/become-vendor",
    buttonText: "Become a Vendor",
    requiresApproval: false,
  },
};

export const RoleUpgradeModal: React.FC<RoleUpgradeModalProps> = ({
  isOpen,
  onClose,
  roleType,
  featureName,
}) => {
  const router = useRouter();
  const config = ROLE_CONFIG[roleType];

  const handleContinue = () => {
    onClose();
    router.push(config.route);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-ocean-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
          {featureName && (
            <p className="text-sm text-gray-500 mb-3">
              This feature requires {roleType} access
            </p>
          )}
          <p className="text-gray-600">{config.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="font-semibold text-gray-700 mb-3">
            What you'll be able to do:
          </p>
          <ul className="space-y-2">
            {config.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-sm text-gray-600"
              >
                <svg
                  className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {roleType === "tutor" && SHOW_TUTOR_VIDEO_PROMOTION && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-emerald-900 mb-2">
              Tutor video rewards — until further notice
            </p>
            <ul className="space-y-2">
              {config.rewards.map((reward) => (
                <li key={reward} className="flex items-start gap-2 text-sm text-emerald-800">
                  <span className="font-bold">•</span>
                  <span>{reward}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-emerald-800">
              Rewards are paid after UniHub reviews and approves the video.
            </p>
          </div>
        )}

        {config.requiresApproval && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Tutor applications require admin approval.
              You'll be notified once your application is reviewed.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors font-medium"
          >
            {config.buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
