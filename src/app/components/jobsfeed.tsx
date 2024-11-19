import React from 'react';
import { JobRecord } from '../../lib/classes';
import { TimeDisplay } from './timedisplay';

interface JobsFeedProps {
    jobs: JobRecord[];
    onAction: (record: JobRecord, action: string) => void;
}

const JobsFeed: React.FC<JobsFeedProps> = ({ jobs, onAction }) => {
    return (
        <div className="jobs-feed">
            {jobs.length > 0 ? (
                <ul className="job-list">
                    {jobs.map((job, index) => (
                        <li key={index} className="job-item">
                            <div className="job-details">
                                {/* Time */}
                                <p>
                                    <TimeDisplay epochTime={job.post_time as number} />
                                </p>

                                {/* Title & Company */}
                                <h3>
                                    <a href={job.jd_url as string} target="_blank" rel="noopener noreferrer">
                                        <strong>{job.title} ({job.department}) @ {job.employer}</strong>
                                    </a>
                                </h3>

                                {/* Location */}
                                <p style={{fontSize: '.8rem'}}>
                                    <strong>{job.location_tier}</strong> {job.description}
                                </p>

                                {/* Promoter */}
                                <p style={{fontSize: '.8rem'}}>by <a href={job.data_url as string} target="_blank" rel="noopener noreferrer">
                                        {job.promoter_name} ({job.proximity})
                                    </a>
                                </p>
                            </div>
                            <div className="job-actions">
                                <button className="archive-button"
                                        onClick={() => onAction(job, 'archived')} >
                                    Archive
                                </button>
                            </div>
                            <div className="job-actions">
                                <button className="engaged-button"
                                        onClick={() => onAction(job, 'engaged')}>
                                    Engaged
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No jobs available.</p>
            )}
            <style jsx>{`
                .jobs-feed {
                    width: 100%;
                }
                .job-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .job-item {
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #ddd;
                    padding: 10px 0;
                }
                .job-details {
                    flex: 3; /* 75% width */
                    padding-right: 10px;
                }
                .job-actions {
                    flex: 1; /* 25% width shared between two columns */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .archive-button,
                .engaged-button {
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    background: #0070f3;
                    color: white;
                    transition: background-color 0.3s ease;
                }
                .archive-button:hover {
                    background: #005bb5;
                }
                .engaged-button:hover {
                    background: #005bb5;
                }
            `}</style>
        </div>
    );
};

export default JobsFeed;
