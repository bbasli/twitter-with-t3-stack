import router from "next/router";
import React from "react";
import { FiArrowLeft } from "react-icons/fi";

export default function GoBackArrow() {
  return (
    <div
      onClick={() => {
        router.back();
      }}
      className="cursor-pointer px-4"
    >
      <FiArrowLeft size={24} />
    </div>
  );
}
