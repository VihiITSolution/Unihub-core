"use client";

import { useEffect, useState } from "react";
import { youtubeRightsService, type YouTubeRightsDeclarationStatus } from "@/services/youtube-rights.service";

/** Private profile status; signed records must not be exposed on public profiles. */
export default function VideoDeclarationStatus({ token }: { token: string }) {
  const [status, setStatus] = useState<YouTubeRightsDeclarationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStatus(null);
    youtubeRightsService.getStatus(token)
      .then((value) => { if (active) setStatus(value); })
      .catch(() => { /* Keep a failed request distinct from an unsigned declaration. */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, attempt]);

  const declaration = status?.declaration;
  return (
    <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4" aria-label="Video rights declaration status">
      <h3 className="font-semibold text-gray-900">Video rights declaration</h3>
      {loading ? <p className="mt-2 text-sm text-gray-600" role="status">Checking declaration…</p> : !status ? (
        <div className="mt-2 text-sm text-red-700" role="alert">
          Unable to check declaration status.
          <button type="button" className="ml-2 font-semibold underline" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
        </div>
      ) : (
        <>
          <p className={`mt-2 text-sm font-semibold ${declaration ? "text-green-700" : "text-amber-800"}`}>
            {declaration ? "Completed" : "Not completed"}
          </p>
          {declaration ? (
            <>
              <p className="mt-1 text-sm text-gray-600">Signed by {declaration.signatoryName} on {new Date(declaration.acceptedAt).toLocaleDateString()}.</p>
              <details className="mt-2 text-sm text-gray-600">
                <summary className="cursor-pointer font-medium">View signed declaration</summary>
                <p className="mt-2 whitespace-pre-line leading-6">{declaration.agreementText}</p>
                <p className="mt-2 text-xs">Version {declaration.agreementVersion}</p>
              </details>
            </>
          ) : <p className="mt-1 text-sm text-gray-600">You will be asked to sign once when you upload your first video or add a YouTube link.</p>}
        </>
      )}
    </section>
  );
}
