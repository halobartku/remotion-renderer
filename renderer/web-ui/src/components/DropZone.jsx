import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DropZone() {
    const [file, setFile] = useState(null);
    const [uploadedPath, setUploadedPath] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [rendering, setRendering] = useState(false);
    const [renderResult, setRenderResult] = useState(null);
    const [error, setError] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setRenderResult(null);
            setError(null);
            setUploadedPath(null);
            handleUpload(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/javascript': ['.tsx', '.ts', '.js', '.jsx']
        },
        multiple: false
    });

    const handleUpload = async (fileToUpload) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.filepath) {
                setUploadedPath(data.filepath);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRender = async () => {
        if (!uploadedPath) return;

        setRendering(true);
        setRenderResult(null);
        setError(null);

        try {
            const response = await fetch('/api/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filepath: uploadedPath })
            });

            const data = await response.json();

            if (data.success) {
                setRenderResult(data);
            } else {
                throw new Error(data.error || 'Render failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setRendering(false);
        }
    };

    return (
        <div className="renderer-container fade-in">
            <div
                {...getRootProps()}
                className={`card dropzone ${isDragActive ? 'active' : ''}`}
                style={{
                    border: '2px dashed var(--border-color)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? 'rgba(139, 92, 246, 0.1)' : 'var(--card-bg)',
                    borderColor: isDragActive ? 'var(--accent-color)' : 'var(--border-color)'
                }}
            >
                <input {...getInputProps()} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Upload size={48} color={isDragActive ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    {isDragActive ? (
                        <p style={{ color: 'var(--text-primary)' }}>Drop the TSX file here...</p>
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 500 }}>
                                Drag & drop your Remotion TSX file
                            </p>
                            <p style={{ fontSize: '0.9rem' }}>or click to select file</p>
                        </div>
                    )}
                </div>
            </div>

            {file && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <FileVideo size={32} color="var(--accent-color)" />
                        <div>
                            <h3 style={{ fontWeight: 600 }}>{file.name}</h3>
                            <p style={{ fontSize: '0.9rem' }}>{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        {uploading && <Loader2 className="spinner" />}
                        {!uploading && uploadedPath && <CheckCircle size={20} color="var(--success-color)" />}
                    </div>

                    {error && (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn"
                            onClick={handleRender}
                            disabled={!uploadedPath || rendering || uploading}
                            style={{ width: '100%' }}
                        >
                            {rendering ? (
                                <>
                                    <Loader2 className="spinner" size={18} /> Rendering...
                                </>
                            ) : (
                                'Start Render'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {renderResult && (
                <div className="card fade-in" style={{ marginTop: '2rem', borderColor: 'var(--success-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <CheckCircle size={32} color="var(--success-color)" />
                        <div>
                            <h3 style={{ color: 'var(--success-color)' }}>Render Complete!</h3>
                            <p>Your video is ready.</p>
                        </div>
                    </div>

                    <video
                        controls
                        style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000' }}
                        src={renderResult.videoUrl}
                    />

                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <a href={renderResult.videoUrl} download className="btn btn-secondary">
                            Download MP4
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
