"use client";

import Process from "./Process";

const steps = ["Preprocess", "Transcribing", "Translating", "Dubbing"];

export default function Loading() {
  return (
    <>
      <div className="relative">
        <div className="absolute h-full w-full flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-[var(--c1)] mb-3.5">{`Preprocess`}</p>
          <div className="flex">
            <Process process={100} active={true} />
            <Process process={0} active={false} />
            <Process process={0} active={false} />
            <Process process={0} active={false} />
          </div>
          <p className="pt-1.5 mt-7.5 border-t border-t-[var(--c2)] text-[var(--c2)] font-bold">{`Step ${1}/4`}</p>
          <p className="mb-3">{`Estimated: ${1}–${3} Minutes`}</p>
          <p>You can leave this page at any time</p>
          <p>
            It will appear in your{" "}
            <span className="text-[var(--p-blue)]">Library</span> once finished{" "}
          </p>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 105 105"
          preserveAspectRatio="xMidYMid meet"
          className="w-[31.25rem] h-[31.25rem]"
        >
          <defs>
            <linearGradient
              id="rotatingGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0ff" />
              <stop offset="50%" stopColor="#004FFF" />
              <stop offset="100%" stopColor="#5700FF" />
            </linearGradient>
            <linearGradient
              id="rotatingGradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#004FFF" />
              <stop offset="50%" stopColor="#5700FF" />
              <stop offset="100%" stopColor="#0ff" />
            </linearGradient>
            <filter
              id="blurFilter"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
            <mask id="ringMask">
              <path
                d="M114.38,152.33h-30a37.55,37.55,0,0,1-37.5-37.5v-30a37.55,37.55,0,0,1,37.5-37.5h30a37.55,37.55,0,0,1,37.5,37.5v30A37.54,37.54,0,0,1,114.38,152.33Zm-30-90a22.53,22.53,0,0,0-22.5,22.5v30a22.53,22.53,0,0,0,22.5,22.5h30a22.52,22.52,0,0,0,22.5-22.5v-30a22.53,22.53,0,0,0-22.5-22.5Z"
                transform="translate(-46.88 -47.33)"
                fill="white"
              />
            </mask>
          </defs>

          <g mask="url(#ringMask)">
            <circle
              cx="52.5"
              cy="105"
              r="52.5"
              fill="url(#rotatingGradient)"
              filter="url(#blurFilter)"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 39.375 39.375"
                to="360 39.375 39.375"
                dur="10s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.1 0.05 0.9 0.95"
                keyTimes="0;1"
              />
            </circle>
            <circle
              cx="52.5"
              cy="105"
              r="52.5"
              fill="url(#rotatingGradient2)"
              filter="url(#blurFilter)"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="180 39.375 39.375"
                to="540 39.375 39.375"
                dur="10s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.2 0.05 0.8 0.95"
                keyTimes="0;1"
              />
            </circle>
          </g>
        </svg>
      </div>

      <style jsx global>{`
        @keyframes glow-bounce {
          0% {
            transform: scale(1);
            box-shadow: inset 0 0 0 1px var(--p-purple),
              0 0 0 0 rgba(var(--p-purple-rgb), 1),
              0 1px 2px 0 rgba(var(--p-purple-rgb), 0.5);
          }
          40% {
            transform: scale(1.15);
            box-shadow: inset 0 0 0 1px var(--p-purple),
              0 0 4px 0 rgba(var(--p-purple-rgb), 0.5),
              0 0 2px 0 rgba(var(--p-purple-rgb), 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: inset 0 0 0 1px var(--p-purple),
              0 1px 2px 0 rgba(var(--p-purple-rgb), 0.5);
          }
        }

        .glow-bounce {
          animation: glow-bounce 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
