import { getAvatarProps } from "./getAvatarProps";
import { useNavigate } from "react-router-dom";

const ProfileAvatar = ({
  name,
  height = "35px", 
  width = "35px", 
  smHeight = "40px", 
  smWidth = "40px",
  text = "12px",
  smText = "10px"
}) => {
  const { initials, bgColor } = getAvatarProps(name);
  const navigate = useNavigate();

  return (
    <div
      className="rounded-full cursor-pointer font-inter flex justify-center items-center text-textDark font-semibold"
      style={{
        backgroundColor: bgColor,
        height,
        width,
        "--sm-height": smHeight,
        "--sm-width": smWidth,
        fontSize: text,
        "--sm-text": smText,
      }}
      onClick={() => navigate("/profile")}
    >
      {initials}
      <style jsx>{`
        @media (min-width: 640px) {
          div {
            height: var(--sm-height);
            width: var(--sm-width);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileAvatar;
