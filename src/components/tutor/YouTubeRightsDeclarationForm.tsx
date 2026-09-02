import type { YouTubeRightsDeclarationStatus } from "@/services/youtube-rights.service";

interface Props {
  status: YouTubeRightsDeclarationStatus | null;
  isLoading: boolean;
  signature: string;
  confirmed: boolean;
  onSignatureChange: (value: string) => void;
  onConfirmedChange: (value: boolean) => void;
  idPrefix?: string;
}

export default function YouTubeRightsDeclarationForm({
  status,
  isLoading,
  signature,
  confirmed,
  onSignatureChange,
  onConfirmedChange,
  idPrefix = "youtubeRights",
}: Props) {
  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        Loading your YouTube rights declaration…
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
        The rights declaration could not be loaded. Please refresh before adding a YouTube link.
      </div>
    );
  }

  const declaration = status.declaration;

  return (
    <div className="space-y-3">
      <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg text-sm text-amber-950">
        <p className="font-bold mb-2">⚠ Important copyright and legal responsibility notice</p>
        <p className="leading-6">
          Only link a YouTube video that is your own original content, or that you
          have all required rights and permissions to use. You are responsible for
          copyright claims, takedown requests, and other legal issues caused by the
          content you submit.
        </p>
        <p className="mt-2 leading-6">
          If a video is found to be an unauthorized or unlawful upload belonging to
          another person, UniHub may remove it, suspend access, retain relevant
          records, and take action under its policies and applicable Sri Lankan law,
          including the Intellectual Property Act, No. 36 of 2003, as amended.
        </p>
      </div>

      {declaration ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
          <p className="font-semibold">✓ Signed declaration on file</p>
          <p className="mt-1">
            Signed by {declaration.signatoryName} on{" "}
            {new Date(declaration.acceptedAt).toLocaleString()} · Version {declaration.agreementVersion}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">View retained declaration</summary>
            <p className="mt-2 whitespace-pre-line leading-6">{declaration.agreementText}</p>
          </details>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-950">
          <p className="font-semibold mb-2">YouTube video ownership and rights declaration</p>
          <p className="whitespace-pre-line leading-6">{status.agreement.text}</p>
          <p className="mt-3 text-xs font-medium">Declaration version {status.agreement.version}</p>
          <label className="block mt-4 font-semibold" htmlFor={`${idPrefix}DeclarationSignature`}>
            Type your full account name to sign: {status.expectedSignatoryName}
          </label>
          <input
            id={`${idPrefix}DeclarationSignature`}
            type="text"
            value={signature}
            onChange={(event) => onSignatureChange(event.target.value)}
            autoComplete="name"
            placeholder={status.expectedSignatoryName}
            className="w-full mt-2 px-4 py-3 bg-white border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id={`${idPrefix}Confirmed`}
          checked={confirmed}
          onChange={(event) => onConfirmedChange(event.target.checked)}
          className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor={`${idPrefix}Confirmed`} className="text-sm font-semibold text-gray-700 cursor-pointer">
          {declaration
            ? "I confirm this YouTube video is mine or I have all permissions required to use it, and it is covered by my signed declaration."
            : "I have read and accept this declaration, confirm this video is mine or properly licensed, and understand that UniHub will retain my signed record for legal and administrative requirements."}
        </label>
      </div>
    </div>
  );
}
