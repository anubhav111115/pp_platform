import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, 
  FileText, 
  X, 
  Check, 
  X as XIcon, 
  Lightbulb,
  ArrowRight,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

function ResumeAnalyzer() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/resume/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setAnalysis(null);
      }
    }
  });

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Upload file
      const formData = new FormData();
      formData.append('resume', file);

      const uploadResponse = await fetch(`${API_URL}/api/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload resume');
      }

      const { resumeId } = await uploadResponse.json();
      setProgress(50);
      setUploading(false);
      setAnalyzing(true);

      // Analyze
      const analyzeResponse = await fetch(`${API_URL}/api/resume/analyze/${resumeId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze resume');
      }

      const analysisData = await analyzeResponse.json();
      setAnalysis(analysisData);
      setProgress(100);
      toast.success('Resume analyzed successfully!');
      fetchHistory();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score < 50) return 'text-red-500';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBgColor = (score) => {
    if (score < 50) return 'bg-red-100';
    if (score < 75) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <Layout title="Resume Analyzer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Upload & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            {!analysis && (
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Resume</h2>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {isDragActive ? 'Drop your PDF here' : 'Drag and drop your resume here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse (PDF only, max 5MB)</p>
                </div>

                {file && (
                  <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-gray-900 font-medium">{file.name}</span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!file || uploading || analyzing}
                  className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(uploading || analyzing) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {analyzing ? 'Analyzing with AI...' : 'Uploading...'}
                    </>
                  ) : (
                    'Analyze My Resume'
                  )}
                </button>

                {/* Progress bar */}
                {(uploading || analyzing) && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Section */}
            {analysis && (
              <div className="space-y-6 animate-fade-in">
                {/* ATS Score */}
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full ${getScoreBgColor(analysis.ats_score)} flex items-center justify-center mb-4`}>
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.ats_score)}`}>
                        {analysis.ats_score}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">ATS Score</p>
                  </div>
                </div>

                {/* Top Skills */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.top_skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                  <p className="text-gray-700 italic">{analysis.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 border-l-4 border-l-green-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
                    <ul className="space-y-2">
                      {analysis.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 border-l-4 border-l-red-500">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weaknesses</h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses?.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_keywords?.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>
                  <ol className="space-y-3">
                    {analysis.suggestions?.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{suggestion}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => navigate('/mock-interview')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-semibold"
                >
                  Generate Interview Questions
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Analyze Another Button */}
                <button
                  onClick={() => {
                    setAnalysis(null);
                    setFile(null);
                  }}
                  className="w-full bg-white text-gray-700 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                >
                  Analyze Another Resume
                </button>
              </div>
            )}
          </div>

          {/* Right column - History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Resumes</h3>
              <div className="space-y-3">
                {history.map((resume) => (
                  <div
                    key={resume._id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {resume.originalName}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          resume.atsScore >= 75 ? 'bg-green-100 text-green-700' :
                          resume.atsScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {resume.atsScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No resumes analyzed yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ResumeAnalyzer;
