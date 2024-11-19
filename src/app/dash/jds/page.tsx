'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // assuming firebase is initialized here
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, addDoc, DocumentReference, Timestamp, where, getDocs } from 'firebase/firestore'; // Import onSnapshot
import { Tabs, Tab } from '@mui/material'; // For Tab functionality, you can use MUI or similar component libraries
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { InputLabel} from '@mui/material';


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
    status?: string;
    notes?: string;
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
    status: '',
    notes: ''
  });

  const [activeJobIndex, setActiveJobIndex] = useState<number | null>(null); // Track the active job index
  const [activeJobId, setActiveJobId] = useState<string | null>(null); // Track the active job ID

  const [target, setTarget] = useState('');
  const [targetEmail, setTargetEmail] = useState("")
  const [type, setType] = useState('LI connect'); // Default to 'LI connect'
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch job descriptions from Firebase Firestore
  useEffect(() => {
    // Reference to the collection
    const jobDescCollection = collection(db, 'jd-postings-summary');
  
    // Create a query that orders by timestamp in descending order (newest first)
    const jobDescQuery = query(jobDescCollection, orderBy('timestamp', 'desc'));
  
    // Real-time listener for the collection
    const unsubscribe = onSnapshot(jobDescQuery, async (snapshot) => {
      const jobDescList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const summaryData = doc.data() as JobDescription;
  
          console.log('summaryData', summaryData);
  
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
  
            // Fetch the HTML document
            const htmlDoc = await getDoc(htmlRef);
            const htmlData = htmlDoc.exists() ? htmlDoc.data() : { html: '' };
  
            // Combine the summary with the copy and HTML data
            return {
              ...summaryData,
              jd_copy: copyData.jd_copy || '', // Extract the copy
              jd_html: htmlData.html || '' // Extract the HTML
            };
          } catch (error) {
            console.error("Error fetching documents:", error);
            return { ...summaryData, jd_copy: '', jd_html: '' }; // Fallback
          }
        })
      );
  
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
      status: selectedJob.status || "Applied",
      notes: selectedJob.notes || ''
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

    // Function to log outreach event
    const logOutreachEvent = async () => {
      if (!activeJobId) {
        alert('No active job selected for outreach.');
        return;
      }

      const timestamp = new Date();

      try {
        // Add a new document to the 'outreach-events' collection
        await addDoc(collection(db, 'outreach-events'), {
          application_id: activeJobId, // Use the active job ID
          timestamp: timestamp,
          target: target,
          type: type,
          message: message,
          note: notes,
        });

        const profileRef = doc(db, 'li-profile', target);
        await updateDoc(profileRef, {
          email: targetEmail
        })

        alert('Outreach event logged successfully');
        // Optionally reset the form fields
        setTarget('');
        setType('LI connect');
        setMessage('');
        setNotes('');
      } catch (error) {
        console.error('Error logging outreach event: ', error);
        alert('Failed to log outreach event');
      }
    };

    const handleImportClick = async () => {
      console.log('handleImportClick')
      try {
        // Reference to the 'job-scan-html' collection in Firestore
        const jobScanCollection = collection(db, "job-scan-html");
    
        // Query Firestore for documents where 'job-id' equals 'activeJobId'
        const q = query(jobScanCollection, where("job-id", "==", activeJobId));
        const querySnapshot = await getDocs(q);
    
        // Check if any documents were found
        if (!querySnapshot.empty) {
          // Assuming only one match, or use querySnapshot.docs.map if multiple
          const jobData = querySnapshot.docs[0].data();
          setFormData(prevState => ({
            ...prevState,
            js_html: jobData.html  // Assuming the HTML field is named 'html'
          }));
        } else {
          console.log("No matching job description found.");
        }
      } catch (error) {
        console.error("Error fetching job description:", error);
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
          <Tab label="Outreach" />
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
              <InputLabel id="domain">Domain</InputLabel>
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
                <MenuItem value="Project Manager">Project Manager</MenuItem>
              </Select>

              <InputLabel id="level">Level</InputLabel>
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
                <MenuItem value="Technical">Technical</MenuItem>
              </Select>

              <InputLabel id="status">Application Status</InputLabel>
              <Select
                label="status"
                name="states"
                value={formData.status}
                onChange={handleSelectChange} // Use the new handler for Select
                fullWidth
              >
                <MenuItem value="Applied">Applied</MenuItem>
                <MenuItem value="Rejection">Rejection</MenuItem>
                <MenuItem value="Freeze">Freeze</MenuItem>
                <MenuItem value="Screening">Screening</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
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
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
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
              <button
                onClick={handleImportClick}  // Add the onClick event
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-300"
              >
                Import
              </button>
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
        {activeTab === 2 && (
        <div>
          {/* Outreach Tab Content */}
          <h3>Outreach</h3>

          {/* Input for Target */}
          <div>
            <label>Target:</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter target"
            />
          </div>

          {/* Input for email */}
          <div>
            <label htmlFor="">Email:</label>
            <input type="text" 
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="Enter email"
              />
          </div>

          {/* Select for Type */}
          <div>
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="LI connect">LinkedIn Connect</option>
              <option value="LI dm">LinkedIn DM</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Input for Message */}
          <div>
            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message"
            />
          </div>

          {/* Input for Notes */}
          <div>
            <label>Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
            />
          </div>

          {/* Log Button */}
          <button onClick={logOutreachEvent}>Log</button>
        </div>
      )}

      </div>
    </div>
  );
  
}
