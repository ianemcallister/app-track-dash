// src/lib/classes.ts

export enum WorkType {
    HYBRID = 'Hybrid',
    REMOTE = 'Remote',
    ON_SITE = 'On-site',
}

export interface JobRecord {
    uuid: string;
    title: string | null;
    department: string | null;
    subtitle: string | null;
    description: string | null;
    location_tier: number | null;
    employer: string | null;
    work_type: WorkType | null;
    jd_url: string | null;
    promoter_name: string | null;
    promoter_link: string | null;
    data_url: string | null;
    proximity: string | null;
    promoter_headline: string | null;
    status: string | null;
    freshness: string | null;
    fresh_min: string | null;
    post_time: number | null;
}
