// utils/getAvatarProps.js
export const getAvatarProps = (rawText) => {
  const text = (rawText && String(rawText).trim()) || "Guest";
  const colors = [
    "#FEE2E2", // red-50
    "#FEF3C7", // amber-50
    "#D1FAE5", // green-50
    "#DBEAFE", // blue-50
    "#E9D5FF", // purple-50
    "#FFE4E6", // rose-50
    "#F3E8FF", // lavender
    "#DCFCE7", // mint
  ];

  // Extract initials (max 2 letters)
  const initials = text
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  // Create a simple hash from the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Map hash to color array index
  const index = Math.abs(hash % colors.length);
  const bgColor = colors[index];

  return { initials, bgColor };
};
