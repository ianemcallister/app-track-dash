'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // assuming firebase is initialized here
import { collection, onSnapshot, doc, updateDoc, getDoc, DocumentReference, Timestamp } from 'firebase/firestore'; // Import onSnapshot
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
    timestamp: Timestamp | null;
    jd_url?: string;
    is_pathrise?: boolean;
    is_pro?: boolean;
    jd_copy?: string; // Copy fetched from jd-postings-copy
    jd_html?: string; // HTML fetched from jd-postings-html
    reqs_copy?: string;
    resume_copy?: string;
    js_html?: string;
    domain?: string;
    level?: string;
    jd_copy_ref?: DocumentReference; // Reference to the jd-copy document
    jd_html_ref?: DocumentReference; // Reference to the jd-html document
}

export default function JobDescriptionsPage() {
  // State for job descriptions
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0); // Manage active tab
  const [formData, setFormData] = useState<JobDescription>({
    uuid: '',
    companyName: '',
    roleTitle: '',
    timestamp: null,
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
    const jobDescCollection = collection(db, 'jd-postings-summary');

    const unsubscribe = onSnapshot(jobDescCollection, async (snapshot) => {
      const jobDescList = await Promise.all(snapshot.docs.map(async (doc) => {
        const summaryData = doc.data() as JobDescription;

        console.log('summaryData', summaryData)

        // Fetching references
        const copyRef = summaryData.jd_copy_ref;
        const htmlRef = summaryData.jd_html_ref;

        if (!copyRef || !htmlRef) {
          console.error("Document references are missing:", { copyRef, htmlRef });
          return { ...summaryData, jd_copy: '', jd_html: '' }; // Fallback
        }

        try {
          // Fetch the copy document
          const copyDoc = await getDoc(copyRef);
          const copyData = copyDoc.exists() ? copyDoc.data() : { jd_copy: '' };

          // Fetch the html document
          const htmlDoc = await getDoc(htmlRef);
          const htmlData = htmlDoc.exists() ? htmlDoc.data() : { html: '' };

          // Combine the summary with the copy and html data
          return {
            ...summaryData,
            jd_copy: copyData.jd_copy || '', // Extract the copy
            jd_html: htmlData.html || '' // Extract the html
          };
        } catch (error) {
          console.error("Error fetching documents:", error);
          return { ...summaryData, jd_copy: '', jd_html: '' }; // Fallback
        }
      }));

      setJobDescriptions(jobDescList.filter(Boolean)); // Filter out null entries
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
      timestamp: selectedJob.timestamp || null,
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
      // Fetch the current job description based on activeJobId
      const jobDescRef = doc(db, 'jd-postings-summary', activeJobId);
      
      try {
        const jobDoc = await getDoc(jobDescRef);
        if (jobDoc.exists()) {
          const jobData = jobDoc.data() as JobDescription;
          
          // Update the summary document in jd-postings-summary
          const summaryUpdateData = {
            companyName: formData.companyName, // Update company name
            roleTitle: formData.roleTitle, // Update role title
            domain: formData.domain, // Update domain
            level: formData.level, // Update level
            is_pathrise: formData.is_pathrise, // Update is_pathrise
            is_pro: formData.is_pro, // Update is_pro
            reqs_copy: formData.reqs_copy,
            jd_copy: formData.jd_copy
          };
  
          // Update the summary document
          await updateDoc(jobDescRef, summaryUpdateData);
          console.log('Job description summary successfully updated!');
  
          // Update jd_copy in jd-postings-copy collection
          if (jobData.jd_copy_ref) {
            const copyDocRef = jobData.jd_copy_ref;
            const copyUpdateData = {
              jd_copy: formData.jd_copy, // Update the jd_copy field
            };
            
            // Update the copy document
            await updateDoc(copyDocRef, copyUpdateData);
            console.log('Posting copy successfully updated!');
          } else {
            console.log('No reference found for posting copy.');
          }
        } else {
          console.log('Job description document does not exist.');
        }
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
        <div style={{ width: '30%', paddingRight: '20px', overflow: 'auto' }}>
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
                overflow: 'hidden',  // Prevent overflow
                whiteSpace: 'nowrap', // Prevent text from wrapping
                textOverflow: 'ellipsis', // Show ellipsis if text overflows
                }}
            >
                {/* Add '*' for pro submissions */}
                {job.is_pro && '*'} 
                {/* Show company name if available, else show URL */}
                {job.companyName ? job.companyName : job.jd_url}
            </li>
            ))}
        </ul>
        </div>

  
      {/* Right Column - Tab Selection */}
      <div style={{ width: '70%', paddingLeft: '20px', borderLeft: '1px solid #ccc', position: 'relative' }}>
        {/* Save Button at the Top */}
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
  
        {/* Tabs for Details and Keywords */}
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Keywords" />
        </Tabs>
  
        {/* Tab Panels */}
        {activeTab === 0 && (
          <div>
    
            {/* Submission Date */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Submission Date: </strong></label>
              {formData.timestamp && formData.timestamp instanceof Timestamp ? (
                    formData.timestamp.toDate().toLocaleString() // Converts to date and formats it
                ) : (
                    'Loading...' // Placeholder while timestamp is loading or if it's null
                )}
            </div>

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
            </form>
          </div>
        )}
  
        {activeTab === 1 && (
          <div>
            {/* Keywords Tab Content */}
            <h3>Keywords</h3>
  
            {/* Job Description ID Row */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Job Description ID:</strong></label>
              <div>{formData.uuid}</div>
            </div>

            {/* Hard Skills */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Hard Skills:</strong></label>
              <div>{formData.uuid}</div>
            </div>

            {/* Soft Skills */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Soft Skills:</strong></label>
              <div>{formData.uuid}</div>
            </div>

            {/* Other Skills */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Other Skills:</strong></label>
              <div>{formData.uuid}</div>
            </div>
  
            {/* Role Requirements Row */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Role Requirements:</strong></label>
              <TextField
                name="reqs_copy"
                value={formData.reqs_copy}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={10}
                variant="outlined"
              />
            </div>
  
            {/* Job Scan HTML Row */}
            <div style={{ marginBottom: '16px' }}>
              <label><strong>Job Scan HTML:</strong></label>
              <TextField
                name="js_html"
                value={formData.js_html}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={10}
                variant="outlined"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
}
