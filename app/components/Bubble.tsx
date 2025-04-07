import { Paper, Typography, Box } from "@mui/material";

const Bubble = ({ message }) => {
  const { content, role } = message;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: role === "user" ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "0.75rem 1rem",
          backgroundColor: role === "user" ? "#1976d2" : "#e0f7fa",
          color: role === "user" ? "#fff" : "#333",
          borderRadius: "15px",
          maxWidth: { xs: "85%", sm: "75%" },
          wordWrap: "break-word",
          marginBottom: "0.75rem",
          fontSize: "1rem",
        }}
        className={`bubble ${role}`}
      >
        <Typography variant="body1">{content}</Typography>
      </Paper>
    </Box>
  );
};

export default Bubble;
