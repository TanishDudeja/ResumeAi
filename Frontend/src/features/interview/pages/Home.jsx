import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hook/useInterview.js'
import { useNavigate } from 'react-router'

const Home = () => {

    const { loading, generateReport, reports, getReports, deleteReport } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ selectedFile, setSelectedFile ] = useState(null)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    useEffect(() => {
        getReports()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[ 0 ]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Hero Section */}
            <header className='hero-section'>
                <div className="hero-section__content">
                    <div className="hero-badges">
                        <span className="pill-badge pill-yellow">A Career Strategy Studio</span>
                        <span className="pill-badge pill-blue">AI / Powered</span>
                    </div>
                    <h1>Profiles that<br/>mean something.</h1>
                    <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy that stands out from everyone else.</p>
                </div>
            </header>

            <main className='main-content'>
                {/* Generator Section */}
                <section className='generator-section'>
                    <div className='home-grid'>
                        {/* Left Panel - Job Description */}
                        <div className='panel card-brutal'>
                            <div className='panel__header'>
                                <h2>Target Job Description</h2>
                                <span className='pill-badge pill-pink'>Required</span>
                            </div>
                            <textarea
                                onChange={(e) => { setJobDescription(e.target.value) }}
                                className='panel__textarea'
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                                maxLength={5000}
                            />
                            <div className='char-counter'>0 / 5000 chars</div>
                        </div>

                        {/* Right Panel - Profile */}
                        <div className='panel card-brutal'>
                            <div className='panel__header'>
                                <h2>Your Profile</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <label className='section-label'>
                                    Upload Resume
                                    <span className='pill-badge pill-yellow'>Best Results</span>
                                </label>
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    <p className='dropzone__title'>
                                        {selectedFile ? 'Selected File:' : 'Click to upload or drag & drop'}
                                    </p>
                                    <p className='dropzone__subtitle'>
                                        {selectedFile ? selectedFile : 'PDF (Max 5MB)'}
                                    </p>
                                    <input 
                                        ref={resumeInputRef} 
                                        onChange={(e) => setSelectedFile(e.target.files[0]?.name)}
                                        hidden 
                                        type='file' 
                                        id='resume' 
                                        name='resume' 
                                        accept='.pdf' 
                                    />
                                </label>
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'><span>OR</span></div>

                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                                <textarea
                                    onChange={(e) => { setSelfDescription(e.target.value) }}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__textarea panel__textarea--short'
                                    placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                />
                            </div>

                            {/* Info Box */}
                            <div className='info-box'>
                                <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className='home-actions'>
                        <button
                            onClick={handleGenerateReport}
                            className='generate-btn-lg'>
                            Start a Brief
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </div>
                </section>

                {/* Recent Reports List */}
                {reports?.length > 0 && (
                    <section className='recent-reports'>
                        <h2>My Recent Interview Plans</h2>
                        <ul className='reports-list'>
                            {reports.map(report => (
                                <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                    <div className='report-item__content'>
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                        <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore ?? 'N/A'}{report.matchScore ? '%' : ''}</p>
                                    </div>
                                    <button 
                                        className='delete-btn' 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteReport(report._id);
                                        }}
                                        title="Delete Report"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>

            {/* Page Footer */}
            <footer className='site-footer'>
                <div className='site-footer__content'>
                    <div className='site-footer__brand'>ResumeAI</div>
                    <div className='site-footer__links'>
                        <a href='#'>Privacy Policy</a>
                        <a href='#'>Terms of Service</a>
                        <a href='#'>Help Center</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home