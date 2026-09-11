import React from 'react';

/**
 * Zelvyn viewport overlays — denser mockup layout:
 *   top-left: stacked-layers glyph (mockup)
 *   top-right: W / L
 *   bottom-left: Slice n/m
 *   bottom-right: thickness mm
 * L/R markers remain ViewportOrientationMarkers (unchanged).
 *
 * Top-left omits inheritsFrom so contentF is rendered as React (SVG), not
 * stringified through ohif.overlayItem / formatValue.
 */
export default {
  'viewportOverlay.topLeft': [
    {
      id: 'ZelvynStackGlyph',
      title: 'Series stack',
      condition: () => true,
      contentF: () => (
        <div
          className="overlay-item zelvyn-stack-glyph flex items-center"
          title="Series stack"
          data-cy="zelvyn-stack-glyph"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="opacity-90"
          >
            {/* Three slanted stacked squares — mockup top-left cue */}
            <rect
              x="3.2"
              y="1.2"
              width="8.2"
              height="5.2"
              rx="0.6"
              transform="rotate(-12 3.2 1.2)"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <rect
              x="2.4"
              y="4.2"
              width="8.2"
              height="5.2"
              rx="0.6"
              transform="rotate(-12 2.4 4.2)"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <rect
              x="1.6"
              y="7.2"
              width="8.2"
              height="5.2"
              rx="0.6"
              transform="rotate(-12 1.6 7.2)"
              stroke="currentColor"
              strokeWidth="1.15"
            />
          </svg>
        </div>
      ),
    },
  ],
  'viewportOverlay.topRight': [
    {
      id: 'WindowLevel',
      inheritsFrom: 'ohif.overlayItem.windowLevel',
      title: 'Window Level',
    },
  ],
  'viewportOverlay.bottomLeft': [
    {
      id: 'SliceIndex',
      inheritsFrom: 'ohif.overlayItem',
      title: 'Slice',
      contentF: ({ imageSliceData }) => {
        const numberOfSlices = imageSliceData?.numberOfSlices;
        if (!numberOfSlices) {
          return null;
        }
        const imageIndex = imageSliceData.imageIndex ?? 0;
        return `Slice: ${imageIndex + 1}/${numberOfSlices}`;
      },
    },
  ],
  'viewportOverlay.bottomRight': [
    {
      id: 'SliceThickness',
      inheritsFrom: 'ohif.overlayItem',
      title: 'Slice thickness',
      contentF: ({ instance, referenceInstance, displaySet }) => {
        const raw =
          instance?.SliceThickness ??
          referenceInstance?.SliceThickness ??
          displaySet?.instance?.SliceThickness ??
          displaySet?.SliceThickness;
        if (raw === undefined || raw === null || raw === '') {
          return null;
        }
        const n = Number(raw);
        return Number.isFinite(n) ? `${n.toFixed(1)} mm` : `${raw} mm`;
      },
    },
  ],
};
