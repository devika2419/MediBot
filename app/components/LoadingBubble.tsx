import { Box } from "@mui/material";
import Logo from "../assets/health-logo2.png";
import Image from "next/image";

const LoadingBubble = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Box
        className="logo-jump"
        component="img"
        src={Logo.src}
        alt="Loading..."
      />
    </Box>
  );
};

export default LoadingBubble;
