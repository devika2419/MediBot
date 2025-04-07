import { Box, Button } from "@mui/material";
import "../global.css";

const PrompSuggestionRow = ({ onPromptClick }) => {
  const prompts = [
    "What are the symptoms of flu?",
    "How to lower blood pressure?",
    "Best exercises for back pain?",
    "How can I improve my sleep quality?",
    "What foods are good for boosting immunity?",
  ];

  return (
    <Box className="promptsuggestion-box">
      {prompts.map((prompt, index) => (
        <Button
          className="prompt-button"
          key={index}
          variant="contained"
          onClick={() => onPromptClick(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </Box>
  );
};

export default PrompSuggestionRow;
