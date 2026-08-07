import { useState } from "react";
import { motion } from "framer-motion";
import cardAdd from "../assets/cards/cardAdd.png";
import cardAddHover from "../assets/cards/cardAddHover.png";

interface AddCardInputProps {
  onClick: () => void;
}

export default function AddCardInput({ onClick }: AddCardInputProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full"
      style={{ aspectRatio: "376 / 242", width: "100%" }}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: hovered ? 1 : 0.65 }}
      whileHover={{ scale: 1.02, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={hovered ? cardAddHover : cardAdd}
        alt="Adicionar card"
        className="h-full w-full object-fill rounded-md"
        draggable={false}
      />
    </motion.button>
  );
}
