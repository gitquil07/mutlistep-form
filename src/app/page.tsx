"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { selectFurthestReachableStep } from "../store/formSlice";
import { useAppSelector } from "../store/hooks";

// Returning users continue from the first step that still needs work
const ResumePage = () => {
  const router = useRouter();
  const furthestReachable = useAppSelector(selectFurthestReachableStep);

  useEffect(() => {
    router.replace(`/step-${furthestReachable}`);
  }, [router, furthestReachable]);

  return null;
};

export default ResumePage;
