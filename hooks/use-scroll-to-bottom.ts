// hooks/use-scroll-to-bottom.ts

import { useEffect, useRef, useState } from "react";

export function useScrollToBottom(deps: any[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [instant, setInstant] = useState(false);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    };
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (isAtBottom) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight + 50,
        behavior: instant || streaming ? "instant" : "smooth",
      });
      setInstant(false);
    }
    // eslint-disable-next-line
  }, [...deps, isAtBottom]);

  return { ref, isAtBottom, setInstant, setStreaming };
}
