import React, { useEffect, useState } from "react";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import About from "./Components/About";
import Resume from "./Components/Resume";
import Contact from "./Components/Contact";
import Testimonials from "./Components/Testimonials";
import Portfolio from "./Components/Portfolio";

import { loadDynamicData } from "./utils/csvLoader";

const App = () => {
  const [resumeData, setResumeData] = useState({});

  useEffect(() => {
    fetch("/resumeData.json")
      .then((res) => res.json())
      .then((data) => {
        setResumeData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleRefreshData = async () => {
    try {
      const updatedData = await loadDynamicData(resumeData);
      setResumeData(updatedData);
      alert("Resume data updated from CSV files!");
    } catch (e) {
      console.error("Failed to refresh data", e);
      alert("Failed to update data. See console.");
    }
  };

  return (
    <div className="App">
      <Header data={resumeData.main} />
      <About data={resumeData.main} onRefresh={handleRefreshData} />
      <Resume data={resumeData.resume} />
      <Portfolio data={resumeData.portfolio} />
      <Testimonials data={resumeData.testimonials} />
      <Contact data={resumeData.main} />
      <Footer data={resumeData.main} />
    </div>
  );
};

export default App;
