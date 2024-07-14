import React from "react";

const TestPage = () => {
  return (
    <div className="border border-red-500 w-full h-screen flex">
      <div className="bar border border-blue-400 w-16 hidden md:flex">Bar</div>
      <div className="content border border-yellow-400 w-full p-l-16">
        Content
      </div>
    </div>
  );
};

export default TestPage;
