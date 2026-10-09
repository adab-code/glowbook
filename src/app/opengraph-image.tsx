import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt =
  "GlowBook — appointment and client management for beauty studios";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "linear-gradient(135deg, #fdf2f7 0%, #fae6ef 100%)",
        color: "#5f213d",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 24,
          marginBottom: 12,
          marginTop: 48,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#b4346a",
          }}
        >
          GlowBook
        </span>
      </div>
      <p
        style={{
          fontSize: 44,
          letterSpacing: "0.02em",
          color: "#574e4b",
          margin: 0,
        }}
      >
        Appointment and client care for beauty studios
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          marginTop: 24,
          marginBottom: 48,
        }}
      >
        {["#b4346a", "#c9861f", "#ce4c81"].map((fill) => (
          <div
            key={fill}
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: fill,
            }}
          />
        ))}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
