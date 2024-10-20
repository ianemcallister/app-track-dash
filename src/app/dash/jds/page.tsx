'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // assuming firebase is initialized here
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'; // Import onSnapshot
import { Tabs, Tab } from '@mui/material'; // For Tab functionality, you can use MUI or similar component libraries
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// Define a type for job descriptions
interface JobDescription {
  uuid: string;
  companyName?: string;
  roleTitle?: string;
  jd_url?: string;
  is_pathrise?: boolean;
  is_pro?: boolean;
  jd_copy?: string; // comes from raw_copy
  reqs_copy?: string;
  resume_copy?: string;
  jd_html?: string; // listed 
  js_html?: string;
  domain?: string;
  level?: string;
}

export default function JobDescriptionsPage() {
  // State for job descriptions
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0); // Manage active tab
  const [formData, setFormData] = useState<JobDescription>({
    uuid: '',
    companyName: '',
    roleTitle: '',
    jd_url: "",
    is_pathrise: false,
    is_pro: false,
    jd_copy: '',
    reqs_copy: '',
    resume_copy: '',
    jd_html: '',
    js_html: '',
    domain: '',
    level: '',
  });

  const [activeJobIndex, setActiveJobIndex] = useState<number | null>(null); // Track the active job index
  const [activeJobId, setActiveJobId] = useState<string | null>(null); // Track the active job ID

  // Fetch job descriptions from Firebase Firestore
  useEffect(() => {
    const jobDescCollection = collection(db, 'job_descriptions');

    // Set up a real-time listener
    const unsubscribe = onSnapshot(jobDescCollection, (snapshot) => {
      const jobDescList = snapshot.docs.map((doc) => doc.data()) as JobDescription[];
      setJobDescriptions(jobDescList);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle input change for text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle selection change for dropdowns
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle job click
  const handleJobClick = (index: number) => {
    setActiveJobIndex(index); // Set the active job index
    const selectedJob = jobDescriptions[index];
    setActiveJobId(selectedJob.uuid); // Set the active job ID
    console.log(selectedJob);
    setFormData({
      uuid: selectedJob.uuid,
      companyName: selectedJob.companyName || '',
      roleTitle: selectedJob.roleTitle || '',
      jd_url: selectedJob.jd_url || '',
      is_pathrise: selectedJob.is_pathrise || false,
      is_pro: selectedJob.is_pro || false,
      jd_copy: selectedJob.jd_copy || '',
      reqs_copy: selectedJob.reqs_copy || '',
      resume_copy: selectedJob.resume_copy || '',
      jd_html: selectedJob.jd_html || '',
      js_html: selectedJob.js_html || '',
      domain: selectedJob.domain || '',
      level: selectedJob.level || '',
    });
  };

  // Save form data (Add Firebase functionality here)
  const handleSave = async () => {
    if (activeJobId) {
        const jobDocRef = doc(db, 'job_descriptions', activeJobId); // Reference to the document to update

        // Create an object containing only the fields you want to update
        const updateData = {
            companyName: formData.companyName,
            roleTitle: formData.roleTitle,
            jd_url: formData.jd_url,
            is_pathrise: formData.is_pathrise,
            is_pro: formData.is_pro,
            jd_copy: formData.jd_copy,
            reqs_copy: formData.reqs_copy,
            resume_copy: formData.resume_copy,
            domain: formData.domain,
            level: formData.level,
            // Add any other fields you want to update
        };

        try {
            await updateDoc(jobDocRef, updateData); // Update the document with the new data
            console.log('Document successfully updated!');
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    } else {
        console.log('No active job selected to update.');
    }
};

  return (
    <div style={{ display: 'flex', height: '100vh', padding: '20px' }}>
      {/* Left Column - Job Descriptions List */}
      <div style={{ width: '30%', paddingRight: '20px' }}>
        <h2>Job Descriptions</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          {jobDescriptions.map((job, index) => (
            <li
              key={index}
              onClick={() => handleJobClick(index)} // Set active job on click
              style={{
                backgroundColor: activeJobIndex === index ? '#f0f8ff' : index % 2 === 0 ? '#f9f9f9' : '#ffffff', // Alternating colors
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '4px',
              }}
            >
              {job.jd_url}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column - Tab Selection */}
      <div style={{ width: '70%', paddingLeft: '20px', borderLeft: '1px solid #ccc' }}>
        {/* Tabs for Details and Keywords */}
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Keywords" />
        </Tabs>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <div>
            {/* Details Form */}
            <h3>Details</h3>
            <form>
              <TextField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Role Title"
                name="roleTitle"
                value={formData.roleTitle}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Select
                label="Domain"
                name="domain"
                value={formData.domain}
                onChange={handleSelectChange} // Use the new handler for Select
                fullWidth
                //margin="normal"
              >
                <MenuItem value="Product">Product</MenuItem>
                <MenuItem value="Web Developer">Web Developer</MenuItem>
                <MenuItem value="AI Developer">AI Developer</MenuItem>
              </Select>
              <Select
                label="Level"
                name="level"
                value={formData.level}
                onChange={handleSelectChange} // Use the new handler for Select
                fullWidth
                //margin="normal"
              >
                <MenuItem value="Jr">Jr</MenuItem>
                <MenuItem value="Associate">Associate</MenuItem>
                <MenuItem value="Sr">Sr</MenuItem>
                <MenuItem value="Director">Director</MenuItem>
                <MenuItem value="Lead">Lead</MenuItem>
              </Select>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Checkbox
                  name="is_pathrise"
                  checked={formData.is_pathrise}
                  onChange={handleInputChange}
                />
                <label>Is Pathrise</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Checkbox
                  name="is_pro"
                  checked={formData.is_pro}
                  onChange={handleInputChange}
                />
                <label>Is Pro</label>
              </div>
              <TextField
                label="Posting Copy"
                name="jd_copy"
                value={formData.jd_copy}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={10}
                margin="normal"
              />
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </form>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            {/* Keywords Tab Content */}
            <h3>Keywords</h3>
            <p>Keywords will go here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
