import React from "react";
import ExpandableSection from "./ExpandableSection";

const Resume = ({ data }) => {
  if (!data) return null;

  const { skillmessage, education, work, skills, certifications, honors, volunteering, courses } = data;

  return (
    <section id="resume">
      <div className="resume-section-wrapper">
        <div className="row education">
          <div className="three columns header-col">
            <h1>
              <span>Education</span>
            </h1>
          </div>

          <div className="nine columns main-col">
            <div className="row item">
              <div className="twelve columns">
                <ExpandableSection
                  items={education}
                  renderItem={(edu) => (
                    <div key={edu.school}>
                      <h3>{edu.school}</h3>
                      <p className="info">
                        {edu.degree} <span>&bull;</span>
                        <em className="date">{edu.graduated}</em>
                      </p>
                      <p>{edu.description}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="resume-section-wrapper">
        <div className="row work">
          <div className="three columns header-col">
            <h1>
              <span>Work</span>
            </h1>
          </div>

          <div className="nine columns main-col">
            <ExpandableSection
              items={work}
              renderItem={(job) => (
                <div key={job.company}>
                  <h3>{job.company}</h3>
                  <p className="info">
                    {job.title}
                    <span>&bull;</span> <em className="date">{job.years}</em>
                  </p>
                  <p>{job.description}</p>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      <div className="resume-section-wrapper">
        <div className="row skill">
          <div className="three columns header-col">
            <h1>
              <span>Skills</span>
            </h1>
          </div>

          <div className="nine columns main-col">
            <p>{skillmessage}</p>

            <div className="bars">
              <ExpandableSection
                items={skills}
                mode="list"
                className="skills"
                renderItem={(skill) => {
                  var className = "bar-expand " + (skill.name ? skill.name.toLowerCase() : '');
                  return (
                    <li key={skill.name}>
                      <span style={{ width: skill.level }} className={className}></span>
                      <em>{skill.name}</em>
                    </li>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="resume-section-wrapper">
        <div className="row certifications">
          <div className="three columns header-col">
            <h1>
              <span>Certifications</span>
            </h1>
          </div>
          <div className="nine columns main-col">
            <div className="row item">
              <div className="twelve columns">
                <ExpandableSection
                  items={certifications}
                  renderItem={(cert) => (
                    <div key={cert.name}>
                      <h3>{cert.name}</h3>
                      <p className="info">
                        {cert.authority}
                        <span>&bull;</span> <em className="date">{cert.date}</em>
                      </p>
                      <p>{cert.license}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="resume-section-wrapper">
        <div className="row honors">
          <div className="three columns header-col">
            <h1>
              <span>Honors</span>
            </h1>
          </div>
          <div className="nine columns main-col">
            <div className="row item">
              <div className="twelve columns">
                <ExpandableSection
                  items={honors}
                  renderItem={(honor) => (
                    <div key={honor.title}>
                      <h3>{honor.title}</h3>
                      <p className="info">
                        {honor.issuer}
                        <span>&bull;</span> <em className="date">{honor.date}</em>
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="resume-section-wrapper">
        <div className="row volunteering">
          <div className="three columns header-col">
            <h1>
              <span>Volunteering</span>
            </h1>
          </div>
          <div className="nine columns main-col">
            <div className="row item">
              <div className="twelve columns">
                <ExpandableSection
                  items={volunteering}
                  renderItem={(vol) => (
                    <div key={vol.organization}>
                      <h3>{vol.organization}</h3>
                      <p className="info">
                        {vol.role}
                        <span>&bull;</span> <em className="date">{vol.date}</em>
                      </p>
                      <p>{vol.description}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="resume-section-wrapper">
        <div className="row courses">
          <div className="three columns header-col">
            <h1>
              <span>Courses</span>
            </h1>
          </div>
          <div className="nine columns main-col">
            <ExpandableSection
              items={courses}
              mode="list"
              className="skills"
              renderItem={(course) => (
                <li key={course.name}>
                  <span className="bar-expand"></span>
                  <em>{course.name} - {course.number}</em>
                </li>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;
