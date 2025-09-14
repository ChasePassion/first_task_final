'use client';

import React, { useState } from 'react';
import './globals.css';

interface Idea {
    title: string;
    thesis: string;
    why_now: string;
    audience: string;
    goal: string;
    key_messages?: string[];
    outline?: string[];
    seo?: {
        primary: string;
        secondary?: string[];
    };
    tone: string;
    cta: string;
    status?: 'pending' | 'generating' | 'completed' | 'error'; // Add status field
}

// 简化类型定义来匹配实际的后端数据结构
interface DataItem {
    output: Array<{
        output: {
            ideas: Idea[];
        };
    }>;
}

type BackendResponse = { data: DataItem[] };

interface Status {
    message: string;
    type: string;
    hidden: boolean;
}

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    ideaIndex?: number;
}

export default function Home() {
    // DOM elements
    const [configFile, setConfigFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<Status>({ message: '', type: '', hidden: true });
    const [resultStatus, setResultStatus] = useState<Status>({ message: '', type: '', hidden: true });
    const [loadingIndicatorHidden, setLoadingIndicatorHidden] = useState(true);
    const [articleSectionHidden, setArticleSectionHidden] = useState(true);
    const [articleStatus, setArticleStatus] = useState<Status>({ message: '', type: '', hidden: true });
    const [articleContent, setArticleContent] = useState('');
    const [isUploading, setIsUploading] = useState(false); // New state for upload button

    // Global variables
    const [currentConfigData, setCurrentConfigData] = useState<unknown>(null);
    const [currentArticleContent, setCurrentArticleContent] = useState('');
    const [ideaStore, setIdeaStore] = useState<Idea[]>([]);
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showStatus = (setter: React.Dispatch<React.SetStateAction<Status>>, message: string, type: string = 'info') => {
        setter({ message, type, hidden: false });
    };

    const hideStatus = (setter: React.Dispatch<React.SetStateAction<Status>>) => {
        setter(prev => ({ ...prev, hidden: true }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setConfigFile(event.target.files[0]);
        }
    };

    const handleUploadAndSend = () => {
        if (!configFile) {
            showStatus(setUploadStatus, 'Please select a configuration file.', 'error');
            return;
        }

        if (!configFile.name.endsWith('.json')) {
            showStatus(setUploadStatus, 'Please select a JSON file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData: unknown = JSON.parse(e.target!.result as string);
                setCurrentConfigData(jsonData);
                showStatus(setUploadStatus, 'Sending configuration file to backend...', 'info');
                setIsUploading(true); // Disable button
                sendToBackend(jsonData);
            } catch (error: unknown) {
                let errorMessage = 'Unknown error';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                showStatus(setUploadStatus, 'Configuration file parsing failed: ' + errorMessage, 'error');
                setIsUploading(false); // Re-enable button on error
            }
        };
        reader.readAsText(configFile);
    };

    const sendToBackend = (data: unknown) => {
        showStatus(setUploadStatus, 'Sending configuration file to backend...', 'info');
        setLoadingIndicatorHidden(false);
        setIdeaStore([]); // Clear previous content

        fetch('http://115.190.109.17:5678/webhook/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((result: BackendResponse) => {
            showStatus(setUploadStatus, 'Configuration file successfully sent to backend.', 'success');
            handleBackendResult(result);
            setIsUploading(false); // Re-enable button on success
        })
        .catch((error: unknown) => {
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            showStatus(setUploadStatus, 'Error sending to backend: ' + errorMessage, 'error');
            setLoadingIndicatorHidden(true);
            setIsUploading(false); // Re-enable button on error
        });
    };

    const handleBackendResult = (result: BackendResponse) => {
        setLoadingIndicatorHidden(true);
        showStatus(setResultStatus, 'Data successfully received.', 'success');
        displayAllIdeas(result);
        // setIsUploading(false); // This was already handled in sendToBackend's .then() block
    };

    const displayAllIdeas = (data: BackendResponse) => {
        let totalIdeas = 0;
        try {
            // Check if data is an object with data property
            if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
                showStatus(setResultStatus, 'Backend returned incorrect or empty data format.', 'error');
                displayRawData(data);
                return;
            }

            const newIdeaStore: Idea[] = [];
            
            // Process the actual data structure from backend
            data.data.forEach((item: DataItem) => {
                if (item && item.output && Array.isArray(item.output) && item.output.length > 0) {
                    const firstOutput = item.output[0];
                    if (firstOutput.output && firstOutput.output.ideas && Array.isArray(firstOutput.output.ideas)) {
                        firstOutput.output.ideas.forEach((idea: Idea) => {
                            newIdeaStore.push({ ...idea, status: 'pending' }); // Initialize status
                            totalIdeas++;
                        });
                    }
                }
            });
            
            setIdeaStore(newIdeaStore);
            showStatus(setResultStatus, `Successfully displayed ${totalIdeas} ideas.`, 'success');
        } catch (error: unknown) {
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('Error processing returned data:', error);
            showStatus(setResultStatus, 'Error processing returned data: ' + errorMessage, 'error');
            displayRawData(data);
        }
    };

    const displayRawData = (data: unknown) => {
        setIdeaStore([]); // Clear ideas
        let rawDataString;
        try {
            rawDataString = JSON.stringify(data, null, 2);
        } catch { // Fix: Remove unused 'e' parameter
            rawDataString = String(data);
        }
        setArticleContent(rawDataString); // Using articleContent to display raw data for simplicity
        showStatus(setResultStatus, 'Incorrect data format, raw data displayed.', 'error');
    };

    const generateContent = async (ideaIndex: number) => {
        console.log('generateContent called with idea index:', ideaIndex);

        if (!currentConfigData) {
            console.error('No configuration data available');
            showStatus(setArticleStatus, 'Please upload a configuration file first.', 'error');
            return;
        }

        // Update the status of the specific idea to 'generating'
        setIdeaStore(prevStore =>
            prevStore.map((idea, idx) =>
                idx === ideaIndex ? { ...idea, status: 'generating' } : idea
            )
        );

        try {
            console.log('Retrieving idea data from store...');
            const ideaData = ideaStore[ideaIndex];
            if (!ideaData) {
                throw new Error('Idea data not found for index: ' + ideaIndex);
            }
            console.log('Idea data retrieved successfully:', ideaData);

            const requestData = {
                config: currentConfigData,
                ideas: ideaData,
                idea_title: ideaData.title // 添加idea的title到请求中
            };

            console.log('Request data prepared:', requestData);

            showStatus(setArticleStatus, 'Generating content...', 'info');
            setArticleSectionHidden(false);
            setArticleContent('<p>Generating content, please wait...</p>');

    const urls = ['http://115.190.109.17:5678/webhook/content1'];
    let success = false;
    let lastError: string | null = null;

    for (let i = 0; i < urls.length; i++) {
        try {
            console.log(`Attempting to fetch from ${urls[i]}...`);

            const response = await fetch(urls[i], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log(`Response from ${urls[i]}:`, response.status, response.statusText);

            if (response.ok) {
                console.log('Response successful, reading text...');
                const result = await response.text();
                console.log('Content received, length:', result.length);
                
                // 检查后端返回内容是否为空
                if (!result || result.trim().length === 0) {
                    lastError = 'Backend returned empty content';
                    console.warn(`Backend returned empty content from ${urls[i]}`);
                    continue; // 继续尝试下一个URL
                }
                
                setCurrentArticleContent(result);
                displayArticle(result);
                success = true;
                break;
            } else {
                lastError = `HTTP ${response.status}: ${response.statusText}`;
                console.warn(`Failed to generate content from ${urls[i]}: ${lastError}`);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                lastError = error.message;
            } else {
                lastError = String(error);
            }
            console.error(`Error trying ${urls[i]}:`, error);
        }
    }

    if (success) {
        showStatus(setArticleStatus, 'Content generated successfully!', 'success');
        // On success, update the status of the specific idea to 'completed'
        setIdeaStore(prevStore =>
            prevStore.map((idea, idx) =>
                idx === ideaIndex ? { ...idea, status: 'completed' } : idea
            )
        );
        // 显示成功弹窗
        showModal('执行成功', `Idea "${ideaData.title}" 的内容生成成功！`, 'success');
    } else {
        console.error('URL attempt failed. Last error:', lastError);
        showStatus(setArticleStatus, `Failed to generate content: ${lastError}`, 'error');
        setArticleContent('<p>Failed to generate content.</p>');
        // On failure, update the status of the specific idea to 'error'
        setIdeaStore(prevStore =>
            prevStore.map((idea, idx) =>
                idx === ideaIndex ? { ...idea, status: 'error' } : idea
            )
        );
        // 显示失败弹窗
        showModal('执行失败', `Idea "${ideaData.title}" 的内容生成失败：${lastError}`, 'error', ideaIndex);
    }

        } catch (error: unknown) {
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error('Error in generateContent:', error);
            showStatus(setArticleStatus, 'Error processing idea data: ' + errorMessage, 'error');
            setArticleContent('<p>Error processing idea data.</p>');
            // On error, update the status of the specific idea to 'error'
            setIdeaStore(prevStore =>
                prevStore.map((idea, idx) =>
                    idx === ideaIndex ? { ...idea, status: 'error' } : idea
                )
            );
        }
    };

    const parseMarkdownWithImages = (content: string) => {
        console.log('Parsing content for images, content length:', content.length);
        
        let processedContent = content.replace(/^(data:image\/[^;]+;base64,[A-Za-z0-9+/=\s\\r\\n]+?)(?=\\n[A-Za-z]|$)/gm, (match) => {
            console.log('Found standalone base64 image, converting to img tag');
            const cleanImageData = match.replace(/\s+/g, '');
            return `<img src="${cleanImageData}" alt="Generated Image" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" />`;
        });

        processedContent = processedContent.replace(/!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+)\)/g, (match, altText, imageData) => {
            console.log('Found markdown base64 image, converting to img tag');
            return `<img src="${imageData}" alt="${altText}" title="${altText}" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);" />`;
        });

        processedContent = processedContent.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        processedContent = processedContent.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        processedContent = processedContent.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        processedContent = processedContent.replace(/\*\*(.+)\*\*/g, '<strong>$1</strong>');
        processedContent = processedContent.replace(/\*(.+)\*/g, '<em>$1</em>');
        processedContent = processedContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');
        processedContent = processedContent.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        processedContent = processedContent.split('\\n\\n').map(paragraph => {
            if (paragraph.trim() && !paragraph.startsWith('<')) {
                return `<p>${paragraph.trim()}</p>`;
            }
            return paragraph;
        }).join('');
        processedContent = processedContent.replace(/\\n/g, '<br>');

        console.log('Content parsing completed');
        return processedContent;
    };


    const displayArticle = (content: string) => {
        const renderedContent = parseMarkdownWithImages(content);
        setArticleContent(renderedContent);
    };


    const closeArticleSection = () => {
        setArticleSectionHidden(true);
        setArticleContent('');
        setCurrentArticleContent('');
        hideStatus(setArticleStatus);
    };

    const showModal = (title: string, message: string, type: 'success' | 'error' | 'info', ideaIndex?: number) => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            ideaIndex
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            title: '',
            message: '',
            type: 'info'
        });
    };

    const retryGenerateContent = (ideaIndex: number) => {
        closeModal();
        generateContent(ideaIndex);
    };

    // 修改按钮disabled逻辑，允许所有状态的idea都可以重试
    const isButtonDisabled = (idea: Idea) => {
        return idea.status === 'generating';
    };

    return (
        <div className="container">
            <h1>Social Media Content Generation Workflow</h1>

            <div className="section">
                <h2>Upload Configuration File</h2>
                <div className="form-group">
                    <label htmlFor="configFile">Select Configuration File (JSON format):</label>
                    <input type="file" id="configFile" accept=".json" onChange={handleFileChange} />
                </div>
                <div className="form-group">
                    <button onClick={handleUploadAndSend} disabled={!configFile || isUploading}>Upload and Send to Backend</button>
                </div>
                {!uploadStatus.hidden && (
                    <div className={`status-message status-${uploadStatus.type}`}>
                        {uploadStatus.message}
                    </div>
                )}
            </div>

            <div className="section">
                <h2>Idea/Topic Generation Results</h2>
                {!resultStatus.hidden && (
                    <div className={`status-message status-${resultStatus.type}`}>
                        {resultStatus.message}
                    </div>
                )}
                <div className="ideas-grid">
                    {ideaStore.length > 0 ? (
                        ideaStore.map((idea, index) => (
                            <div className="idea-card" key={index}>
                                <h3>{idea.title || 'No Title'}</h3>
                                <div><strong>Thesis:</strong><p>{idea.thesis || 'N/A'}</p></div>
                                <div><strong>Why Now:</strong><p>{idea.why_now || 'N/A'}</p></div>
                                <div><strong>Audience:</strong><p>{idea.audience || 'N/A'}</p></div>
                                <div><strong>Goal:</strong><p>{idea.goal || 'N/A'}</p></div>
                                {idea.key_messages && idea.key_messages.length > 0 && (
                                    <div>
                                        <strong>Key Messages:</strong>
                                        <ul>
                                            {idea.key_messages.map((msg, i) => <li key={i}>{msg}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {idea.outline && idea.outline.length > 0 && (
                                    <div>
                                        <strong>Outline:</strong>
                                        <ol>
                                            {idea.outline.map((item, i) => <li key={i}>{item}</li>)}
                                        </ol>
                                    </div>
                                )}
                                <div>
                                    <strong>SEO Keywords:</strong>
                                    <p>Primary: {idea.seo && idea.seo.primary ? idea.seo.primary : 'N/A'}</p>
                                    {idea.seo && idea.seo.secondary && idea.seo.secondary.length > 0 && (
                                        <p>Secondary: {idea.seo.secondary.join(', ')}</p>
                                    )}
                                </div>
                                <div><strong>Tone:</strong><p>{idea.tone || 'N/A'}</p></div>
                                <div className="cta">{idea.cta || 'Learn More'}</div>
                                <div className="card-actions">
                                    <button
                                        className="generate-btn"
                                        onClick={() => generateContent(index)}
                                        disabled={isButtonDisabled(idea)}
                                    >
                                        {idea.status === 'generating' ? 'Generating...' : 'Retry'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loadingIndicatorHidden ? (
                            <div className="status-message status-info">
                                Waiting for backend data...
                            </div>
                        ) : (
                            // Only show if there's no ideas and not loading, meaning raw data might be displayed in articleContent or an error occurred
                            resultStatus.hidden && articleContent === '' && <p>Upload a configuration file to generate ideas.</p>
                        )
                    )}
                </div>
                {/* For displaying raw data when ideasContainer is empty */}
                {ideaStore.length === 0 && articleContent !== '' && resultStatus.type === 'error' && (
                    <pre className="result-container">
                        {articleContent}
                    </pre>
                )}
            </div>

            <div id="articleSection" className={`section ${articleSectionHidden ? 'hidden' : ''}`}>
                <h2>Generated Article</h2>
                {!articleStatus.hidden && (
                    <div className={`status-message status-${articleStatus.type}`}>
                        {articleStatus.message}
                    </div>
                )}
                <div className="article-controls">
                    <div className="article-title">Generated Content</div>
                    <div className="article-actions">
                        <button className="generate-btn" onClick={closeArticleSection}>Close</button>
                    </div>
                </div>
                <div id="articleContent" className="article-content" dangerouslySetInnerHTML={{ __html: articleContent }}>
                </div>
            </div>

            {/* Modal Dialog */}
            {modalState.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        maxWidth: '500px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            color: modalState.type === 'success' ? '#28a745' : modalState.type === 'error' ? '#dc3545' : '#17a2b8',
                            marginTop: 0,
                            marginBottom: '20px'
                        }}>
                            {modalState.title}
                        </h3>
                        <p style={{
                            marginBottom: '15px',
                            lineHeight: '1.6',
                            color: '#495057'
                        }}>
                            {modalState.message}
                        </p>
                        {modalState.type === 'success' && (
                            <p style={{
                                fontSize: '12px',
                                color: '#6c757d',
                                fontStyle: 'italic',
                                marginBottom: '25px',
                                lineHeight: '1.4'
                            }}>
                                sometimes backend may return 200 but no content,please try again
                            </p>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '15px'
                        }}>
                            {(modalState.type === 'error' || modalState.type === 'success') && modalState.ideaIndex !== undefined ? (
                                <>
                                    <button
                                        className="generate-btn"
                                        onClick={() => retryGenerateContent(modalState.ideaIndex!)}
                                        style={{ margin: 0 }}
                                    >
                                        重试
                                    </button>
                                    <button
                                        className="copy-btn"
                                        onClick={closeModal}
                                        style={{ margin: 0 }}
                                    >
                                        {modalState.type === 'success' ? '关闭' : '关闭'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="generate-btn"
                                    onClick={closeModal}
                                    style={{ margin: 0 }}
                                >
                                    确定
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
