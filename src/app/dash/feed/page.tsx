'use client';

import { useState, useEffect } from 'react';
import { JobRecord } from '../../../lib/classes';
import { collectJobsFeed, recordJFUpdate } from '@/lib/firebase';
import JobsFeed from "../../components/jobsfeed";

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState('Jobs');
    const [jobsFeed, setJobsFeed] = useState<JobRecord[]>([]);

    /* Load data */
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobs: JobRecord[] = await collectJobsFeed();
                setJobsFeed(jobs);
            } catch (error) {
                console.error('Failed to fetch jobs feed:', error);
            }
        };

        fetchJobs();
    }, []);

    // Define Callback
    const handleJobAction = async (record: JobRecord, action: string): Promise<void> => {
        try {
            // Step 1: Update the database
            await recordJFUpdate(record, action);
    
            // Step 2: Remove the job from the local state
            setJobsFeed((prevJobsFeed) => 
                prevJobsFeed.filter(job => job.uuid !== record.uuid)
            );
    
            // Optionally, you can log or handle actions here (like feedback to the user)
            console.log(`Job with ID ${record.uuid} has been marked as ${action}`);
        } catch (error) {
            console.error('Error updating job action:', error);
        }
    };

    // Function to render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Jobs':
                return <JobsFeed jobs={jobsFeed} onAction={handleJobAction}/>;
            case 'PDX':
                return <div>PDX content goes here.</div>;
            case 'YC':
                return <div>YC content goes here.</div>;
            case 'Active Apps':
                return <div>Active Apps content goes here.</div>;
            case 'Thought Leaders':
                return <div>Thought Leaders content goes here.</div>;
            default:
                return null;
        }
    };

    function switchTabToCount(tab: string) {
        switch (tab) {
            case 'Jobs':
                return jobsFeed.length;
            case 'PDX':
                return 0;
            case 'YC':
                return 0;
            case 'Active Apps':
                return 0;
            case 'Thought Leaders':
                return 0;
            default:
                return 0;
        }
    }

    return (
        <div className="container">
            <div className="tabs-container">
                <div className="tabs">
                    {['Jobs', 'PDX', 'YC', 'Active Apps', 'Thought Leaders'].map((tab) => (
                        <button
                            key={tab}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab} ({switchTabToCount(tab)})
                        </button>
                    ))}
                </div>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
            <style jsx>{`
                .container {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100vh; /* Take full viewport height */
                    overflow: hidden; /* Prevent body scrolling */
                }
                .tabs-container {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    background: white; /* Ensure it doesn't overlap content */
                    padding: 10px 0;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .tabs {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    padding: 10px;
                }
                .tab-button {
                    padding: 10px 20px;
                    border: 1px solid #ccc;
                    background: #f9f9f9;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .tab-button.active {
                    background: #0070f3;
                    color: white;
                    border-color: #0070f3;
                }
                .tab-content {
                    flex: 1; /* Allow content to grow and take remaining space */
                    padding: 20px;
                    overflow-y: auto; /* Enable scrolling for overflowing content */
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background: #fff;
                }
            `}</style>
        </div>
    );
}
