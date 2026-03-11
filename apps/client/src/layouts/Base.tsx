import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { Box } from "@mantine/core";
import { useRef } from "react";

const routeOrder = ["/", "/currency", "/appointments", "/userfinder", "/inbox"];

const Base = ({ children }) => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  const from = prevPath.current;
  const to = location.pathname;
  const fromIndex = routeOrder.indexOf(from);
  const toIndex = routeOrder.indexOf(to);

  const direction =
    fromIndex === -1 || toIndex === -1 ? 0 : toIndex > fromIndex ? 1 : -1;

  prevPath.current = location.pathname;

  const variants = {
    initial: (dir: number) => ({ y: dir === 0 ? 0 : dir * -40, opacity: 0 }),
    animate: { y: 0, opacity: 1 },
    exit:    (dir: number) => ({ y: dir === 0 ? 0 : dir * 40, opacity: 0 }),
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <Box visibleFrom="sm" style={{ padding: "0.5rem" }}>
        <Navbar />
      </Box>

      <Box style={{ position: "relative", overflow: "hidden", flex: 1 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box
        hiddenFrom="sm"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 100,
          padding: "0.5rem",
        }}
      >
        <Navbar />
      </Box>

    </div>
  );
};

export default Base;